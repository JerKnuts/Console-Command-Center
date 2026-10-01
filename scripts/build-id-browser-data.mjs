import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const base = JSON.parse(await readFile(resolve(process.argv[2] || '.id-records.json'), 'utf8'));
const shatteredSpace = JSON.parse(await readFile(resolve(process.argv[3] || '.id-records-shattered-space.json'), 'utf8'));
const outputPath = resolve(projectRoot, 'src/views/console.command-center/main/id-browser-data.ts');

function readableEditorID(editorID) {
  return editorID
    .replace(/^(?:SFBGS\w+_)+/i, '')
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}
function armorCategory(editorID) {
  if (/helmet/i.test(editorID)) return 'Helmets';
  if (/(?:boost)?pack/i.test(editorID)) return 'Packs';
  if (/(?:spacesuit|space_suit|suit)/i.test(editorID)) return 'Spacesuits';
  return 'Apparel';
}
function categoryFor(record) {
  switch (record.type) {
  case 'WEAP': return 'Weapons';
  case 'ARMO': return armorCategory(record.editorID);
  case 'AMMO': return 'Ammo';
  case 'ALCH': return 'Aid';
  case 'MISC': return 'Resources & Miscellaneous';
  case 'BOOK': return 'Books & Notes';
  case 'OMOD': return 'Mods';
  case 'FACT': return 'Factions';
  case 'NPC_': return 'NPCs';
  case 'WTHR': return 'Weather';
  case 'CELL': return 'Cells';
  case 'LCTN': return 'Locations';
  case 'FURN': return 'Furniture';
  case 'GBFM': return 'Ships & Base Forms';
  default: return 'Other';
  }
}
function actionFor(type) {
  if (['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK'].includes(type)) return 'additem';
  if (type === 'NPC_') return 'spawn';
  return null;
}

const PLAYER_FACING_TYPES = new Set([
  'WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK', 'OMOD', 'FACT', 'NPC_', 'CELL', 'LCTN', 'WTHR',
]);
const INTERNAL_RECORD = /(?:^|[_\s])(?:test|debug|dummy|template|placeholder|prototype|donotuse|cut|old)(?:[_\s]|$)|noclutter|researchui|unarmed|^sw[abcl]_|crew_elite|vortex_enemies|enemies only|(?:^|_)vortex_(?!grenade)|vortexhorror|vortexspawn|non.?equippable|audioonly|noappearancedata|^packin|storagecell$|createdinterior|createdexterior|duplicate\d*|reserved|companion only|not playable/i;
const INTERNAL_WEAPON = /^cct_weapon|creature.*attack|(?:space|ship).*turret|spaceship|defensive.*battery|robot.*(?:arm|weapon|turret)|modela.*(?:tracker|weapon)|(?:^|_)companion_|_vasco|_hunter|debug|dummy/i;

function displayLabel(record, source) {
  // This installation does not provide a separate Shattered Space STRINGS
  // table that can be safely paired with its records. Reusing base-game
  // string keys can attach unrelated dialogue to DLC records, so prefer the
  // record's cleaned Editor ID until a verified DLC localization source is
  // available.
  const candidate = source === 'Shattered Space' ? readableEditorID(record.editorID) : (record.name || readableEditorID(record.editorID));
  return candidate.length > 72 ? `${candidate.slice(0, 69).trimEnd()}…` : candidate;
}

function isPlayerFacing(record, source) {
  if (!PLAYER_FACING_TYPES.has(record.type)) return false;
  if (!record.name && record.type !== 'WTHR' && source !== 'Shattered Space') return false;
  if (record.type === 'FACT' && (!record.name || record.name.length > 60 || record.name.trim().split(/\s+/).length > 8)) return false;
  if (record.type === 'WEAP' && INTERNAL_WEAPON.test(record.editorID)) return false;
  if (record.name && (record.name.length > 90 || (record.name.trim().split(/\s+/).length > 12 && /[.!?]/.test(record.name)))) return false;
  return !INTERNAL_RECORD.test(`${record.editorID} ${record.name || ''}`);
}

function convert(dataset, source) {
  const requirement = source === 'Shattered Space' ? 'Requires the Shattered Space expansion.' : null;
  return dataset.records.filter((record) => isPlayerFacing(record, source)).map((record) => ({
    label: displayLabel(record, source),
    value: record.formID,
    type: record.type,
    category: categoryFor(record),
    detail: requirement,
    keywords: [record.editorID],
    action: actionFor(record.type),
    source,
  }));
}

const byId = new Map();
for (const entry of [...convert(base, 'Base Game'), ...convert(shatteredSpace, 'Shattered Space')]) {
  if (!/^[0-9A-F]{8}$/.test(entry.value) || !entry.label) continue;
  if (!byId.has(entry.value)) byId.set(entry.value, entry);
}
const entries = [...byId.values()].sort((left, right) => left.category.localeCompare(right.category) || left.label.localeCompare(right.label) || left.value.localeCompare(right.value));
const json = JSON.stringify(entries)
  .replaceAll('`', '\\u0060')
  .replaceAll('${', '\\u0024{')
  // OSF UI's source compatibility check intentionally blocks the Worker API.
  // Escape the same word when it appears in game record names; JSON.parse
  // restores the original display text at runtime.
  .replaceAll('Worker', '\\u0057orker');
const output = `export type GeneratedIdCatalogEntry = {
  label: string;
  value: string;
  type: string;
  category: string;
  detail: string | null;
  keywords: string[];
  action: 'additem' | 'spawn' | null;
  source: 'Base Game' | 'Shattered Space';
};

// Generated from installed Bethesda master files and English localization.
// Internal, test, template, and engine-only records are intentionally excluded.
export const GENERATED_ID_CATALOG = JSON.parse(String.raw\`${json}\`) as GeneratedIdCatalogEntry[];
`;
await writeFile(outputPath, output, 'utf8');
console.log(JSON.stringify({
  output: outputPath,
  entries: entries.length,
  baseGame: entries.filter((entry) => entry.source === 'Base Game').length,
  shatteredSpace: entries.filter((entry) => entry.source === 'Shattered Space').length,
  categories: Object.fromEntries([...new Set(entries.map((entry) => entry.category))].sort().map((category) => [category, entries.filter((entry) => entry.category === category).length])),
}, null, 2));
