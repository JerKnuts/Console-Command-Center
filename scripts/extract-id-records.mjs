import { open } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';

const argumentsList = process.argv.slice(2);
const positionalArguments = argumentsList.filter((argument) => !argument.startsWith('--'));
const esmPath = positionalArguments[0];
const localizationPath = positionalArguments[1];
const allowEditorNames = argumentsList.includes('--allow-editor-names');
if (!esmPath) throw new Error('Pass the path to a Bethesda ESM file.');

const INCLUDED_TYPES = new Set(['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK', 'OMOD', 'FACT', 'NPC_', 'WTHR', 'CELL', 'LCTN', 'FURN', 'GBFM']);
const REQUIRE_LOCALIZED_NAME = new Set(['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK', 'NPC_']);

function signature(buffer, offset = 0) { return buffer.toString('ascii', offset, offset + 4); }
const bethesdaTextDecoder = new TextDecoder('windows-1252');
function zString(data) {
  const end = data.indexOf(0);
  return bethesdaTextDecoder.decode(data.subarray(0, end < 0 ? data.length : end));
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
async function readEnglishLocalization(ba2Path) {
  if (!ba2Path) return new Map();
  const archive = await open(ba2Path, 'r');
  try {
    const header = Buffer.alloc(32);
    await archive.read(header, 0, header.length, 0);
    if (signature(header) !== 'BTDX' || signature(header, 8) !== 'GNRL') throw new Error('Unsupported localization BA2.');
    const fileCount = header.readUInt32LE(12);
    const nameTableOffset = Number(header.readBigUInt64LE(16));
    const recordTableOffset = header.readUInt32LE(4) >= 2 ? 32 : 24;
    const recordTable = Buffer.alloc(fileCount * 36);
    await archive.read(recordTable, 0, recordTable.length, recordTableOffset);
    const records = [];
    for (let index = 0; index < fileCount; index += 1) {
      const offset = index * 36;
      records.push({
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
    // FULL names used by catalog records resolve through the main STRINGS
    // table. DLSTRINGS and ILSTRINGS reuse numeric keys for dialogue and
    // interface text, so merging them can replace an item's name with an
    // unrelated subtitle.
    for (const record of records.filter((entry) => /(?:^|\/)[^/]+_en\.strings$/i.test(entry.name))) {
      const stored = Buffer.alloc(record.packedSize || record.unpackedSize);
      await archive.read(stored, 0, stored.length, record.dataOffset);
      const parsed = parseStringsFile(record.packedSize ? inflateSync(stored) : stored, !record.name.toLowerCase().endsWith('.strings'));
      for (const [id, value] of parsed) values.set(id, value);
    }
    return values;
  } finally {
    await archive.close();
  }
}

const localizedStrings = await readEnglishLocalization(localizationPath);
const file = await open(esmPath, 'r');
const records = [];
try {
  const stats = await file.stat();
  const header = Buffer.alloc(24);
  await file.read(header, 0, 24, 0);
  if (signature(header) !== 'TES4') throw new Error('The selected file is not a Bethesda plugin file.');
  const dataStart = 24 + header.readUInt32LE(4);

  async function scan(start, end) {
    let position = start;
    while (position + 24 <= end) {
      await file.read(header, 0, 24, position);
      const type = signature(header);
      const size = header.readUInt32LE(4);
      if (type === 'GRUP') {
        if (size < 24 || position + size > end) break;
        await scan(position + 24, position + size);
        position += size;
        continue;
      }
      if (position + 24 + size > end) break;
      if (INCLUDED_TYPES.has(type)) {
        const flags = header.readUInt32LE(8);
        const formID = header.readUInt32LE(12);
        if ((flags & 0x20) === 0) {
          const recordData = Buffer.alloc(size);
          await file.read(recordData, 0, size, position + 24);
          const data = (flags & 0x00040000) !== 0 ? inflateSync(recordData.subarray(4)) : recordData;
          const fields = subrecords(data);
          const editorID = zString(fields.find((field) => field.type === 'EDID')?.data ?? Buffer.alloc(0)).trim();
          const full = fields.find((field) => field.type === 'FULL')?.data;
          const fullToken = full && full.length >= 4 ? full.readUInt32LE(0) : null;
          const localizedName = fullToken === null ? null : localizedStrings.get(fullToken)?.trim() || null;
          if (editorID && (allowEditorNames || !REQUIRE_LOCALIZED_NAME.has(type) || localizedName)) {
            records.push({
              formID: formID.toString(16).toUpperCase().padStart(8, '0'),
              editorID,
              name: localizedName,
              type,
            });
          }
        }
      }
      position += 24 + size;
    }
  }
  await scan(dataStart, Number(stats.size));
} finally {
  await file.close();
}

console.log(JSON.stringify({ esm: esmPath, recordCount: records.length, records }));
