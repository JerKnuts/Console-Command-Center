import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const base = JSON.parse(await readFile(resolve(process.argv[2] || '.id-records.json'), 'utf8'));
const shatteredSpace = JSON.parse(await readFile(resolve(process.argv[3] || '.id-records-shattered-space.json'), 'utf8'));
const freeLanes = JSON.parse(await readFile(resolve(process.argv[4] || '.id-records-free-lanes.json'), 'utf8'));
const terranArmada = JSON.parse(await readFile(resolve(process.argv[5] || '.id-records-terran-armada.json'), 'utf8'));
const outputPath = resolve(projectRoot, 'src/views/console.command-center/main/id-browser-data.ts');

const SOURCES = {
  'Base Game': { plugin: 'Starfield.esm', pluginKind: 'full', requirement: null },
  'Shattered Space': { plugin: 'ShatteredSpace.esm', pluginKind: 'full', requirement: 'Requires Shattered Space DLC.' },
  'Free Lanes': { plugin: 'SFBGS00D.esm', pluginKind: 'full', requirement: 'Included with the free Free Lanes update.' },
  'Terran Armada': { plugin: 'SFBGS050.esm', pluginKind: 'full', requirement: 'Requires Terran Armada DLC.' },
};

function readableEditorID(editorID) {
  return editorID
    .replace(/^(?:SFBGS[A-Z0-9]+_)+/i, '')
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
  case 'FURN': return 'Workshop / Outpost Objects';
  case 'GBFM': return 'Ship Parts & Other Forms';
  case 'PERK': return 'Perks';
  case 'SPEL': return 'Effects';
  default: return 'Other';
  }
}
function actionFor(type) {
  if (['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK'].includes(type)) return 'additem';
  if (type === 'NPC_') return 'spawn';
  return null;
}

const PLAYER_FACING_TYPES = new Set([
  'WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK', 'OMOD', 'FACT', 'NPC_', 'CELL', 'LCTN', 'FURN', 'WTHR', 'GBFM', 'PERK', 'SPEL',
]);
const INTERNAL_RECORD = /(?:^|[_\s])(?:test|debug|dummy|template|placeholder|prototype|donotuse|cut|old)(?:[_\s]|$)|noclutter|researchui|unarmed|^sw[abcl]_|crew_elite|vortex_enemies|enemies only|(?:^|_)vortex_(?!grenade)|vortexhorror|vortexspawn|non.?equippable|audioonly|noappearancedata|^packin|storagecell$|createdinterior|createdexterior|duplicate\d*|reserved|companion only|not playable/i;
const INTERNAL_WEAPON = /^cct_weapon|creature.*attack|(?:space|ship).*turret|spaceship|defensive.*battery|robot.*(?:arm|weapon|turret)|modela.*(?:tracker|weapon)|(?:^|_)companion_|_vasco|_hunter|debug|dummy/i;
const INTERNAL_FURNITURE = /(?:furniture|idle|landing|interaction)marker|^(?:SFBGS\d+_)?(?:NPC|DefaultNPC)|(?:^|_)NPCOnly(?:_|$)|NoSit|NoActivate|NoFrontActivate|MustExit|ExitOnly|Scene/i;

function displayLabel(record, source) {
  // Only names extracted from this plugin's own STRINGS table are trusted.
  const candidate = record.name || readableEditorID(record.editorID);
  return candidate.length > 72 ? `${candidate.slice(0, 69).trimEnd()}â€¦` : candidate;
}

function isPlayerFacing(record, source) {
  if (!PLAYER_FACING_TYPES.has(record.type)) return false;
  if (!record.name && record.type !== 'WTHR' && source === 'Base Game') return false;
  if (record.type === 'FACT' && (!record.name || record.name.length > 60 || record.name.trim().split(/\s+/).length > 8)) return false;
  if (record.type === 'WEAP' && INTERNAL_WEAPON.test(record.editorID)) return false;
  if (record.type === 'FURN' && INTERNAL_FURNITURE.test(record.editorID)) return false;
  if (record.name && (record.name.length > 90 || (record.name.trim().split(/\s+/).length > 12 && /[.!?]/.test(record.name)))) return false;
  return !INTERNAL_RECORD.test(`${record.editorID} ${record.name || ''}`);
}

function convert(dataset, source) {
  const metadata = SOURCES[source];
  const completeDlc = source === 'Free Lanes' || source === 'Terran Armada';
  return dataset.records.filter((record) => completeDlc
    ? PLAYER_FACING_TYPES.has(record.type) && Boolean(record.editorID)
      && record.ownerPlugin?.toLowerCase() === metadata.plugin.toLowerCase()
    : isPlayerFacing(record, source)).map((record) => ({
    label: displayLabel(source === 'Base Game' || dataset.localizationPlugin?.toLowerCase() === metadata.plugin.toLowerCase() ? record : {...record, name: null}, source),
    value: record.formID,
    type: record.type,
    category: categoryFor(record),
    detail: completeDlc && !isPlayerFacing(record, source) ? `${metadata.requirement} Internal/test record; reference only.` : metadata.requirement,
    keywords: [record.editorID],
    action: completeDlc && !isPlayerFacing(record, source) ? null : actionFor(record.type),
    ...(completeDlc && !isPlayerFacing(record, source) ? { referenceOnly: true } : {}),
    source,
    plugin: metadata.plugin,
    pluginKind: metadata.pluginKind,
    localFormId: Number.parseInt(record.formID, 16).toString(16).toUpperCase().padStart(metadata.pluginKind === 'small' ? 3 : 6, '0').slice(metadata.pluginKind === 'small' ? -3 : -6),
  }));
}

const byId = new Map();
for (const entry of [
  ...convert(base, 'Base Game'),
  ...convert(shatteredSpace, 'Shattered Space'),
  ...convert(freeLanes, 'Free Lanes'),
  ...convert(terranArmada, 'Terran Armada'),
]) {
  if (!/^[0-9A-F]{8}$/.test(entry.value) || !entry.label) continue;
  const key = `${entry.plugin.toLowerCase()}:${entry.localFormId}:${entry.type}`;
  if (!byId.has(key)) byId.set(key, entry);
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
  referenceOnly?: boolean;
  source: 'Base Game' | 'Shattered Space' | 'Free Lanes' | 'Terran Armada';
  plugin: string;
  pluginKind: 'full' | 'medium' | 'small';
  localFormId: string;
};

// Generated from installed Bethesda master files and English localization.
// Base-game/Shattered Space internal records are filtered; complete named
// Free Lanes/Terran Armada records include internal entries as reference-only.
export const GENERATED_ID_CATALOG = JSON.parse(String.raw\`${json}\`) as GeneratedIdCatalogEntry[];
`;
await writeFile(outputPath, output, 'utf8');
console.log(JSON.stringify({
  output: outputPath,
  entries: entries.length,
  baseGame: entries.filter((entry) => entry.source === 'Base Game').length,
  shatteredSpace: entries.filter((entry) => entry.source === 'Shattered Space').length,
  freeLanes: entries.filter((entry) => entry.source === 'Free Lanes').length,
  terranArmada: entries.filter((entry) => entry.source === 'Terran Armada').length,
  categories: Object.fromEntries([...new Set(entries.map((entry) => entry.category))].sort().map((category) => [category, entries.filter((entry) => entry.category === category).length])),
}, null, 2));
