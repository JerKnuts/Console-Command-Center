import { open } from 'node:fs/promises';
import { basename } from 'node:path';
import { inflateSync } from 'node:zlib';

const esmPath = process.argv[2] || process.env.STARFIELD_ESM;
if (!esmPath) throw new Error('Pass the path to a Bethesda ESM file or set STARFIELD_ESM.');
const localizationPath = process.argv[3] || process.env.STARFIELD_LOCALIZATION_BA2;

function signature(buffer, offset = 0) {
  return buffer.toString('ascii', offset, offset + 4);
}

function subrecords(data) {
  const values = [];
  let offset = 0;
  let extendedSize = null;
  while (offset + 6 <= data.length) {
    const type = signature(data, offset);
    const smallSize = data.readUInt16LE(offset + 4);
    offset += 6;
    if (type === 'XXXX') {
      if (smallSize !== 4 || offset + 4 > data.length) break;
      extendedSize = data.readUInt32LE(offset);
      offset += 4;
      continue;
    }
    const size = extendedSize ?? smallSize;
    extendedSize = null;
    if (offset + size > data.length) break;
    values.push({ type, data: data.subarray(offset, offset + size) });
    offset += size;
  }
  return values;
}

function zString(data) {
  const end = data.indexOf(0);
  return data.subarray(0, end < 0 ? data.length : end).toString('utf8');
}

function parseStringsFile(data, lengthPrefixed) {
  const count = data.readUInt32LE(0);
  const dataStart = 8 + count * 8;
  const values = new Map();
  for (let index = 0; index < count; index += 1) {
    const entry = 8 + index * 8;
    const id = data.readUInt32LE(entry);
    const offset = dataStart + data.readUInt32LE(entry + 4);
    if (offset >= data.length) continue;
    if (lengthPrefixed) {
      const size = data.readUInt32LE(offset);
      values.set(id, zString(data.subarray(offset + 4, Math.min(offset + 4 + size, data.length))));
    } else {
      values.set(id, zString(data.subarray(offset)));
    }
  }
  return values;
}

async function readEnglishLocalization(ba2Path, pluginStem) {
  if (!ba2Path) return new Map();
  const archive = await open(ba2Path, 'r');
  try {
    const header = Buffer.alloc(32);
    await archive.read(header, 0, header.length, 0);
    if (signature(header) !== 'BTDX' || signature(header, 8) !== 'GNRL') {
      throw new Error('The localization archive is not a supported general BA2 file.');
    }
    const fileCount = header.readUInt32LE(12);
    const nameTableOffset = Number(header.readBigUInt64LE(16));
    const version = header.readUInt32LE(4);
    const recordTableOffset = version >= 2 ? 32 : 24;
    const recordTable = Buffer.alloc(fileCount * 36);
    await archive.read(recordTable, 0, recordTable.length, recordTableOffset);
    const records = [];
    for (let index = 0; index < fileCount; index += 1) {
      const offset = index * 36;
      records.push({
        extension: signature(recordTable, offset + 4).trim().toLowerCase(),
        dataOffset: Number(recordTable.readBigUInt64LE(offset + 16)),
        packedSize: recordTable.readUInt32LE(offset + 24),
        unpackedSize: recordTable.readUInt32LE(offset + 28),
      });
    }
    const stats = await archive.stat();
    const nameTable = Buffer.alloc(Number(stats.size) - nameTableOffset);
    await archive.read(nameTable, 0, nameTable.length, nameTableOffset);
    let nameOffset = 0;
    for (const record of records) {
      const size = nameTable.readUInt16LE(nameOffset);
      nameOffset += 2;
      record.name = nameTable.subarray(nameOffset, nameOffset + size).toString('utf8').replaceAll('\\', '/');
      nameOffset += size;
    }

    const values = new Map();
    const expectedNames = new Set(['strings', 'dlstrings', 'ilstrings'].map((extension) => `${pluginStem.toLowerCase()}_en.${extension}`));
    for (const record of records.filter((entry) => expectedNames.has(entry.name.toLowerCase().split('/').at(-1)))) {
      const storedSize = record.packedSize || record.unpackedSize;
      const stored = Buffer.alloc(storedSize);
      await archive.read(stored, 0, stored.length, record.dataOffset);
      const data = record.packedSize ? inflateSync(stored) : stored;
      const parsed = parseStringsFile(data, !record.name.toLowerCase().endsWith('.strings'));
      for (const [id, value] of parsed) values.set(id, value);
    }
    return values;
  } finally {
    await archive.close();
  }
}

const pluginStem = basename(esmPath).replace(/\.[^.]+$/, '');
const localizedStrings = await readEnglishLocalization(localizationPath, pluginStem);

const file = await open(esmPath, 'r');
try {
  const stats = await file.stat();
  const header = Buffer.alloc(24);
  await file.read(header, 0, 24, 0);
  if (signature(header) !== 'TES4') throw new Error('The selected file is not a Bethesda plugin file.');

  let position = 24 + header.readUInt32LE(4);
  let questGroup = null;
  while (position < stats.size) {
    await file.read(header, 0, 24, position);
    if (signature(header) !== 'GRUP') throw new Error(`Unexpected top-level record at offset ${position}.`);
    const groupSize = header.readUInt32LE(4);
    if (signature(header, 8) === 'QUST') {
      questGroup = { start: position + 24, end: position + groupSize };
      break;
    }
    position += groupSize;
  }
  if (!questGroup) throw new Error(`${esmPath} does not contain a top-level QUST group.`);

  const quests = [];
  position = questGroup.start;
  while (position + 24 <= questGroup.end) {
    await file.read(header, 0, 24, position);
    const type = signature(header);
    const dataSize = header.readUInt32LE(4);
    const flags = header.readUInt32LE(8);
    const formID = header.readUInt32LE(12);
    if (type === 'GRUP') {
      position += dataSize;
      continue;
    }
    if (type !== 'QUST') {
      position += 24 + dataSize;
      continue;
    }

    const recordData = Buffer.alloc(dataSize);
    await file.read(recordData, 0, dataSize, position + 24);
    const data = (flags & 0x00040000) !== 0 ? inflateSync(recordData.subarray(4)) : recordData;
    const fields = subrecords(data);
    const editorID = zString(fields.find((field) => field.type === 'EDID')?.data ?? Buffer.alloc(0));
    const stages = [...new Set(fields
      .filter((field) => field.type === 'INDX' && field.data.length >= 2)
      .map((field) => field.data.readUInt16LE(0)))]
      .sort((left, right) => left - right);
    const full = fields.find((field) => field.type === 'FULL')?.data;
    const fullNameToken = full && full.length >= 4 ? full.readUInt32LE(0) : null;
    quests.push({
      formID: formID.toString(16).toUpperCase().padStart(8, '0'),
      editorID,
      stages,
      name: fullNameToken === null ? null : localizedStrings.get(fullNameToken) ?? null,
      fullNameToken: fullNameToken === null ? null : fullNameToken.toString(16).toUpperCase().padStart(8, '0'),
    });
    position += 24 + dataSize;
  }

  console.log(JSON.stringify({ esm: esmPath, questCount: quests.length, quests }, null, 2));
} finally {
  await file.close();
}
