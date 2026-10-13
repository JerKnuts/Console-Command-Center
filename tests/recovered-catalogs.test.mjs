import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { return next(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? specifier + '.ts' : specifier, context); } });
const { runtimeFormId, resolvePackagedIdCatalog, mergeGeneratedIdCatalog, ID_BROWSER_CATEGORIES } = await import('../src/views/console.command-center/main/id-catalog.ts');
const { GENERATED_ID_CATALOG } = await import('../src/views/console.command-center/main/id-browser-data.ts');
const { REVIEWED_SHIP_CATALOG, REVIEWED_SHIP_GROUP_COUNT } = await import('../src/views/console.command-center/main/ship-catalog.ts');
const { REVIEWED_VEHICLE_CATALOG } = await import('../src/views/console.command-center/main/vehicle-catalog.ts');
const { QUEST_BROWSER_ENTRIES } = await import('../src/views/console.command-center/main/quest-browser.ts');
const { resolvePackagedQuestCatalog } = await import('../src/views/console.command-center/main/official-quest-catalog.ts');
const { ID_BROWSER_TOTAL, QUEST_BROWSER_TOTAL, QUEST_BROWSER_STAGE_TOTAL } = await import('../src/views/console.command-center/main/catalog-metadata.ts');
test('recovered ships include alternate IDs, deduplicate shared tiers, and leave modules reference-only', () => {
  assert.equal(REVIEWED_SHIP_GROUP_COUNT, 104);
  assert.equal(REVIEWED_SHIP_CATALOG.length, 152);
  assert.equal(new Set(REVIEWED_SHIP_CATALOG.map(x => x.value)).size, 152);
  assert.ok(REVIEWED_SHIP_CATALOG.every(x => x.action === 'spawn'));
  const parts = GENERATED_ID_CATALOG.filter(x => x.category === 'Ship Parts & Other Forms');
  const furniture = GENERATED_ID_CATALOG.filter(x => x.category === 'Workshop / Outpost Objects');
  assert.ok(parts.length > 2500 && parts.every(x => !x.action));
  assert.ok(furniture.length > 400 && furniture.every(x => !x.action));
});
test('official catalog entries remain in record categories without source-only sidebar groups', () => {
  assert.ok(ID_BROWSER_CATEGORIES.some(x => x.value === 'vehicles'));
  assert.ok(ID_BROWSER_CATEGORIES.some(x => x.value === 'workshop'));
  assert.ok(!ID_BROWSER_CATEGORIES.some(x => ['Free Lanes', 'Shattered Space', 'Terran Armada'].includes(x.label)));
  assert.ok(GENERATED_ID_CATALOG.some(x => x.source === 'Free Lanes' && x.plugin === 'SFBGS00D.esm'));
  assert.ok(GENERATED_ID_CATALOG.some(x => x.source === 'Terran Armada' && x.detail === 'Requires Terran Armada DLC.'));
});
test('vehicles resolve current small-master indexes and missing vehicle masters stay unavailable', () => {
  const entries = resolvePackagedIdCatalog(REVIEWED_VEHICLE_CATALOG, { ok: true, plugins: [{ plugin: 'SFBGS004.esm', pluginKind: 'small', index: 7 }] });
  assert.equal(entries.find(x => x.label === 'REV-8').value, 'FE007033');
  assert.equal(entries.find(x => x.label === 'Moonjumper').available, false);
  assert.equal(runtimeFormId('ABCDEF', 'full', 4), '04ABCDEF');
  assert.equal(runtimeFormId('ABCD', 'medium', 6), 'FD06ABCD');
  assert.equal(runtimeFormId('1000', 'small', 7), null);
  assert.equal(runtimeFormId('1', 'full', 255), null);
  assert.equal(runtimeFormId('1', 'small', -1), null);
});
test('official quest runtime IDs follow load order and inactive DLC is kept searchable but unavailable', () => {
  const entries = resolvePackagedQuestCatalog(QUEST_BROWSER_ENTRIES, { ok: true, plugins: [{ plugin: 'Starfield.esm', pluginKind: 'full', index: 0 }, { plugin: 'SFBGS050.esm', pluginKind: 'full', index: 9 }] });
  const quest = entries.find(x => x.source === 'Terran Armada' && x.category === 'Main Quests');
  assert.ok(quest && quest.available && quest.questId.startsWith('09'));
  assert.equal(quest.questId.slice(-6), quest.localFormId);
  assert.ok(entries.filter(x => x.source === 'Shattered Space').every(x => x.available === false));
  assert.equal(entries.length, QUEST_BROWSER_TOTAL);
});
test('catalog metadata matches actual merged item and four-source quest datasets', () => {
  const catalog = mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
  assert.equal(catalog.length, ID_BROWSER_TOTAL);
  assert.equal(QUEST_BROWSER_ENTRIES.length, QUEST_BROWSER_TOTAL);
  assert.equal(QUEST_BROWSER_ENTRIES.reduce((total, x) => total + x.stages.length, 0), QUEST_BROWSER_STAGE_TOTAL);
  for (const [source, expected] of [['Base Game', 2077], ['Shattered Space', 241], ['Free Lanes', 116], ['Terran Armada', 134]]) assert.equal(QUEST_BROWSER_ENTRIES.filter(x => x.source === source).length, expected);
  assert.equal(QUEST_BROWSER_ENTRIES.find(x => x.quest === 'Conflict in Conviction').source, 'Shattered Space');
});
