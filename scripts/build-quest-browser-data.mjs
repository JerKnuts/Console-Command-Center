import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const basePath = resolve(process.argv[2] || '.quest-records.json');
const shatteredSpacePath = resolve(process.argv[3] || '.quest-records-shattered-space.json');
const outputPath = resolve(projectRoot, 'src/views/console.command-center/main/quest-browser.ts');

const [base, shatteredSpace] = await Promise.all([
  readFile(basePath, 'utf8').then(JSON.parse),
  readFile(shatteredSpacePath, 'utf8').then(JSON.parse),
]);

function isSupportQuest(editorID, name, hasLocalizedName) {
  if (!hasLocalizedName) return true;
  if (/^\s*\[[^\]]+\]\s*$/.test(name)) return true;
  const combined = `${editorID} ${name}`;
  if (/(?:^|[_\s-])(always[ _-]?on|support|holder|debug|patch|enabler|template|shell|spawn[ _-]?manager|tracker[ _-]?quest|showcase[ _-]?quest|master[ _-]?quest|scene|dialogue)(?:s|$|[_\s-])/i.test(combined)) return true;
  const normalized = editorID.replace(/^SFBGS[0-9A-F]+_/i, '');
  return /^(?:Dialogue|HV_|Council_)/i.test(normalized);
}

function categoryFor(editorID, name, hasLocalizedName) {
  const normalized = editorID.replace(/^SFBGS[0-9A-F]+_/i, '');
  if (isSupportQuest(editorID, name, hasLocalizedName)) return 'Internal / System';
  if (/^MQ/i.test(normalized)) return 'Main Quests';
  if (/^(UC|CF|FC|RI)\d|^(UC|CF|FC|RI)_/i.test(normalized)) return 'Faction Quests';
  if (/^(COM|CREW)_/i.test(normalized)) return 'Companion & Crew';
  if (/^(MB_|SE_|BE_|Radiant|MissionBoard)/i.test(normalized) || /<Alias=/i.test(name)) return 'Mission Board & Radiant';
  if (/^(Activity|Misc|Tutorial|MQ_Tutorial)/i.test(normalized)) return 'Activities & Tutorials';
  return 'Side Quests & Encounters';
}

function cleanName(record) {
  return record.name?.trim() || record.editorID.replaceAll('_', ' ');
}

function convert(records, source, requirement) {
  return records.quests
    .map((record) => {
      const name = cleanName(record);
      return {
        quest: name,
        editorId: record.editorID,
        questId: record.formID,
        stages: record.stages,
        source,
        requirement,
        category: categoryFor(record.editorID, name, Boolean(record.name)),
        internal: isSupportQuest(record.editorID, name, Boolean(record.name)),
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
  ...convert(base, 'Base Game', null),
  ...convert(shatteredSpace, 'Shattered Space', 'Requires the Shattered Space expansion.'),
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
  source: 'Base Game' | 'Shattered Space';
  requirement: string | null;
  category: string;
  internal: boolean;
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
  internal: quests.filter((quest) => quest.internal).length,
}, null, 2));
