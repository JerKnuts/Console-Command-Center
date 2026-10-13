import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const basePath = resolve(process.argv[2] || '.quest-records.json');
const shatteredSpacePath = resolve(process.argv[3] || '.quest-records-shattered-space.json');
const freeLanesPath = resolve(process.argv[4] || '.quest-records-free-lanes.json');
const terranArmadaPath = resolve(process.argv[5] || '.quest-records-terran-armada.json');
const outputPath = resolve(projectRoot, 'src/views/console.command-center/main/quest-browser.ts');

const [base, shatteredSpace, freeLanes, terranArmada] = await Promise.all([
  readFile(basePath, 'utf8').then(JSON.parse),
  readFile(shatteredSpacePath, 'utf8').then(JSON.parse),
  readFile(freeLanesPath, 'utf8').then(JSON.parse),
  readFile(terranArmadaPath, 'utf8').then(JSON.parse),
]);

// Retain reviewed localization/category corrections from the maintained catalog.
// New structural stages still come from the installed master extracts.
const maintainedText = await readFile(outputPath, 'utf8').catch(() => '');
const maintainedRecords = JSON.parse(maintainedText.match(/String\.raw`([\s\S]*?)`\)/)?.[1] ?? '[]');
const maintained = new Map(maintainedRecords.filter((entry) => entry.source === 'Base Game' || entry.source === 'Shattered Space')
  .map((entry) => [entry.source + ':' + (entry.localFormId ?? entry.questId.slice(-6)), entry]));

const SOURCE_METADATA = {
  'Base Game': { plugin: 'Starfield.esm', pluginKind: 'full', requirement: null },
  'Free Lanes': { plugin: 'SFBGS00D.esm', pluginKind: 'full', requirement: 'Included with the free Free Lanes update.' },
  'Shattered Space': { plugin: 'ShatteredSpace.esm', pluginKind: 'full', requirement: 'Requires Shattered Space DLC.' },
  'Terran Armada': { plugin: 'SFBGS050.esm', pluginKind: 'full', requirement: 'Requires Terran Armada DLC.' },
};

function isSupportQuest(editorID, name, hasLocalizedName) {
  if (!hasLocalizedName) return true;
  if (/^SFTER_/i.test(editorID) && /ActorConversations|AudioLogs/i.test(editorID)) return true;
  if (/^\s*\[[^\]]+\]\s*$/.test(name)) return true;
  const combined = `${editorID} ${name}`;
  if (/(?:^|[_\s-])(always[ _-]?on|support|holder|debug|patch|enabler|template|shell|spawn[ _-]?manager|tracker[ _-]?quest|showcase[ _-]?quest|master[ _-]?quest|scene|dialogue)(?:s|$|[_\s-])/i.test(combined)) return true;
  const normalized = editorID.replace(/^(?:SFBGS[0-9A-F]+_|SFTER_)/i, '');
  return /^(?:Dialogue|HV_|Council_)/i.test(normalized);
}

function categoryFor(editorID, name, hasLocalizedName) {
  const normalized = editorID.replace(/^(?:SFBGS[0-9A-F]+_|SFTER_)/i, '');
  if (isSupportQuest(editorID, name, hasLocalizedName)) return 'Internal / System';
  if (/^MQ/i.test(normalized)) return 'Main Quests';
  if (/^(UC|CF|FC|RI)\d|^(UC|CF|FC|RI)_/i.test(normalized)) return 'Faction Quests';
  if (/^(COM|CREW)_/i.test(normalized)) return 'Companion & Crew';
  if (/^(MB_|SE_|BE_|INC_|Radiant|MissionBoard)/i.test(normalized) || /<Alias=/i.test(name)) return 'Mission Board & Radiant';
  if (/^(Activity|Misc|Tutorial|MQ_Tutorial)/i.test(normalized)) return 'Activities & Tutorials';
  return 'Side Quests & Encounters';
}

function cleanName(record) {
  return record.name?.trim() || record.editorID.replaceAll('_', ' ');
}

function convert(records, source) {
  const metadata = SOURCE_METADATA[source];
  return records.quests
    .map((record) => {
      const reviewed = maintained.get(source + ':' + record.formID.slice(-6));
      const name = reviewed?.quest ?? cleanName(record);
      return {
        quest: name,
        editorId: record.editorID,
        questId: record.formID,
        stages: record.stages,
        source,
        requirement: metadata.requirement,
        category: reviewed?.category ?? categoryFor(record.editorID, name, Boolean(record.name)),
        internal: reviewed?.internal ?? isSupportQuest(record.editorID, name, Boolean(record.name)),
        plugin: metadata.plugin,
        pluginKind: metadata.pluginKind,
        localFormId: record.formID.slice(-6),
      };
    });
}

const categoryOrder = [
  'Main Quests',
  'Faction Quests',
  'Companion & Crew',
  'Side Quests & Encounters',
  'Activities & Tutorials',
  'Mission Board & Radiant',
  'Internal / System',
];

const quests = [
  ...convert(base, 'Base Game'),
  ...convert(freeLanes, 'Free Lanes'),
  ...convert(shatteredSpace, 'Shattered Space'),
  ...convert(terranArmada, 'Terran Armada'),
].sort((left, right) => {
  const sourceDifference = left.source.localeCompare(right.source);
  if (sourceDifference) return sourceDifference;
  const categoryDifference = categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category);
  if (categoryDifference) return categoryDifference;
  return left.quest.localeCompare(right.quest) || left.editorId.localeCompare(right.editorId);
});

const questJson = JSON.stringify(quests).replaceAll('`', '\\u0060').replaceAll('${', '\\u0024{');
const output = `export type QuestBrowserEntry = {
  quest: string;
  editorId: string;
  questId: string;
  stages: number[];
  source: 'Base Game' | 'Free Lanes' | 'Shattered Space' | 'Terran Armada';
  requirement: string | null;
  category: string;
  internal: boolean;
  plugin: string;
  pluginKind: 'full' | 'medium' | 'small';
  localFormId: string;
  available?: boolean;
};

// Generated from the installed Bethesda master files and their English
// localization archives. Stage indexes are structural data, not a guarantee
// that forcing a stage is safe for every save.
export const QUEST_BROWSER_ENTRIES = JSON.parse(String.raw\`${questJson}\`) as QuestBrowserEntry[];

export const QUEST_BROWSER_STAGE_COUNT = QUEST_BROWSER_ENTRIES.reduce((total, quest) => total + quest.stages.length, 0);
export const QUEST_BROWSER_CATEGORIES = ${JSON.stringify(categoryOrder)} as const;
`;

await writeFile(outputPath, output, 'utf8');
console.log(JSON.stringify({
  output: outputPath,
  quests: quests.length,
  stages: quests.reduce((total, quest) => total + quest.stages.length, 0),
  baseGame: quests.filter((quest) => quest.source === 'Base Game').length,
  shatteredSpace: quests.filter((quest) => quest.source === 'Shattered Space').length,
  freeLanes: quests.filter((quest) => quest.source === 'Free Lanes').length,
  terranArmada: quests.filter((quest) => quest.source === 'Terran Armada').length,
  internal: quests.filter((quest) => quest.internal).length,
}, null, 2));
