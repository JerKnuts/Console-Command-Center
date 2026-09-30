import { open, readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const datasetPath = resolve(projectRoot, 'src/views/console.command-center/main/quest-skips.ts');
const esmPath = process.argv[2] || process.env.STARFIELD_ESM;

if (!esmPath) {
  throw new Error('Pass the path to Starfield.esm or set STARFIELD_ESM.');
}

const source = await readFile(datasetPath, 'utf8');
const expected = new Map();
const entryPattern = /questId:\s*'([0-9A-Fa-f]{1,8})'[\s\S]*?stages:\s*\[([^\]]*)\]/g;
for (const match of source.matchAll(entryPattern)) {
  const id = Number.parseInt(match[1], 16);
  const stages = match[2].split(',').map((value) => Number(value.trim())).filter(Number.isInteger);
  const existing = expected.get(id) ?? new Set();
  stages.forEach((stage) => existing.add(stage));
  expected.set(id, existing);
}
if (expected.size === 0) throw new Error('No quest entries were parsed from quest-skips.ts.');

function signature(buffer, offset = 0) {
  return buffer.toString('ascii', offset, offset + 4);
}

function parseStageIndexes(data) {
  const stages = new Set();
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
    if (type === 'INDX' && size >= 2) stages.add(data.readUInt16LE(offset));
    offset += size;
  }
  return stages;
}

const file = await open(esmPath, 'r');
try {
  const header = Buffer.alloc(24);
  await file.read(header, 0, 24, 0);
  if (signature(header) !== 'TES4') throw new Error('The selected file is not a Bethesda plugin file.');
  let position = 24 + header.readUInt32LE(4);
  let questGroup = null;
  while (position < (await file.stat()).size) {
    await file.read(header, 0, 24, position);
    if (signature(header) !== 'GRUP') throw new Error(`Unexpected top-level record at offset ${position}.`);
    const groupSize = header.readUInt32LE(4);
    if (signature(header, 8) === 'QUST') {
      questGroup = { start: position + 24, end: position + groupSize };
      break;
    }
    position += groupSize;
  }
  if (!questGroup) throw new Error('Starfield.esm does not contain a top-level QUST group.');

  const found = new Map();
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
    if (expected.has(formID)) {
      const recordData = Buffer.alloc(dataSize);
      await file.read(recordData, 0, dataSize, position + 24);
      const data = (flags & 0x00040000) !== 0
        ? inflateSync(recordData.subarray(4))
        : recordData;
      found.set(formID, parseStageIndexes(data));
    }
    position += 24 + dataSize;
  }

  const missingQuests = [];
  const missingStages = [];
  let checkedStages = 0;
  for (const [questID, expectedStages] of expected) {
    const actualStages = found.get(questID);
    if (!actualStages) {
      missingQuests.push(questID.toString(16).toUpperCase().padStart(8, '0'));
      continue;
    }
    for (const stage of expectedStages) {
      checkedStages += 1;
      if (!actualStages.has(stage)) {
        missingStages.push({
          questId: questID.toString(16).toUpperCase().padStart(8, '0'),
          expectedStage: stage,
          availableStages: [...actualStages].sort((left, right) => left - right),
        });
      }
    }
  }

  console.log(JSON.stringify({
    esm: esmPath,
    questIdsChecked: expected.size,
    questIdsFound: found.size,
    uniqueStagesChecked: checkedStages,
    missingQuests,
    missingStages,
    valid: missingQuests.length === 0 && missingStages.length === 0,
  }, null, 2));
  if (missingQuests.length || missingStages.length) process.exitCode = 1;
} finally {
  await file.close();
}
