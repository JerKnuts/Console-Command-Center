import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

registerHooks({ resolve(s, c, next) { return next(s.startsWith('.') && !/\.[a-z]+$/i.test(s) ? s + '.ts' : s, c); } });
const { activityItemIsTeleport, activityItemFromRecord, readActivityItem, resolveActivityItem, sameActivityItem } = await import('../src/views/console.command-center/main/activity-items.ts');
const source = readFileSync(new URL('../src/views/console.command-center/main/main.ts', import.meta.url), 'utf8');
const functions = names => stripTypeScriptTypes([...source.matchAll(/^(?:async )?function (\w+)\b[\s\S]*?^}/gm)].filter(m => names.includes(m[1])).map(m => m[0]).join('\n'));
const mod = { label: 'Mod weapon', value: '05001234', type: 'WEAP', category: 'Weapons', source: 'mod', plugin: 'Weapon.esm', localFormId: '001234' };

test('log item snapshots contain explicit bounded identities, not live state or raw command guesses', () => {
  const item = activityItemFromRecord({ ...mod, available: true, keywords: ['extra'], arbitrary: 'not stored' });
  assert.equal(item.plugin, 'Weapon.esm');
  assert.equal(item.localFormId, '001234');
  assert.ok(!('available' in item) && !('keywords' in item) && !('arbitrary' in item));
  assert.equal(activityItemFromRecord({ ...mod, plugin: undefined }), undefined);
  assert.equal(activityItemFromRecord({ ...mod, localFormId: undefined }), undefined);
  assert.equal(activityItemFromRecord({ label: 'Credits', type: 'MISC', category: 'Inventory', value: '0000000F' }).localFormId, '00000F');
  for (const invalid of [null, {}, { ...item, plugin: '../Weapon.esm' }, { ...item, localFormId: '01001234' }, { ...item, value: 'tgm' }, { ...item, label: 'x'.repeat(513) }]) assert.equal(readActivityItem(invalid), undefined);
});

test('reopening resolves full, medium and small plugin slots and blocks missing owners', () => {
  for (const [kind, index, local, expected] of [['full', 9, '001234', '09001234'], ['medium', 6, '1234', 'FD061234'], ['small', 5, '234', 'FE005234']]) {
    const item = activityItemFromRecord({ ...mod, localFormId: local });
    const resolved = resolveActivityItem(item, [], { ok: true, plugins: [{ plugin: 'weapon.ESM', pluginKind: kind, index }] });
    assert.equal(resolved.value, expected); assert.equal(resolved.available, true);
    assert.equal(item.value, mod.value, 'historical ID remains unchanged');
    assert.equal(resolveActivityItem(item, [], { ok: true, plugins: [] }).available, false);
    assert.equal(resolveActivityItem(item, [], null).available, false);
  }
});

test('current record restrictions and labels replace saved metadata without confusing another plugin', () => {
  const current = { ...mod, label: 'Renamed weapon', referenceOnly: true };
  const other = { ...current, plugin: 'Other.esm', label: 'Wrong weapon' };
  const resolved = resolveActivityItem(activityItemFromRecord(mod), [other, current], { ok: true, plugins: [{ plugin: mod.plugin, pluginKind: 'full', index: 7 }] });
  assert.equal(resolved.label, 'Renamed weapon'); assert.equal(resolved.referenceOnly, true); assert.equal(resolved.value, '07001234');
  assert.equal(sameActivityItem(current, { ...mod, localFormId: '1234' }), true);
  assert.equal(sameActivityItem(other, mod), false);
});

test('actual log persistence preserves older entries and drops only invalid optional item data', () => {
  const old = { id: 'old', timestamp: 1, command: 'player.additem 05001234 1', label: 'Old action', category: 'Inventory', outcome: 'success', message: 'Command sent: old' };
  let saved = JSON.stringify([old, { ...old, id: 'bad', item: { ...mod, plugin: '../Weapon.esm' } }]);
  const c = vm.createContext({ readActivityItem, MAX_ACTIVITY: 100, STORAGE_ACTIVITY: 'log', localStorage: { getItem: () => saved }, activityLog: [], activeView: 'commands', writeActivityLog() {}, readActivityItem, Math, Date });
  vm.runInContext(functions(['readActivityLog', 'addActivitySummary', 'addActivity']), c);
  const entries = c.readActivityLog();
  assert.equal(entries.length, 2); assert.equal(entries[0].command, old.command); assert.equal(entries[0].item, undefined); assert.equal(entries[1].item, undefined);
  const item = activityItemFromRecord(mod);
  c.addActivity({ command: 'player.additem 05001234 4', definition: { title: 'Add weapon', category: 'Inventory' }, item }, 'success', 'Command sent: test');
  assert.equal(c.activityLog[0].item.plugin, mod.plugin); assert.equal(c.activityLog[0].command, 'player.additem 05001234 4');
  c.addActivity({ command: 'player.additem 05001234 1' }, 'success', 'Command sent: raw batch');
  assert.equal(c.activityLog[0].item, undefined, 'raw commands are not parsed into item links');
});

function navigationFixture(item = activityItemFromRecord(mod)) {
  const list = { scrollTop: 280 }; let focused = '', renders = 0, requests = 0;
  const c = vm.createContext({
    activityLog: [{ id: 'logged', item }], activeView: 'activity', activityItemContext: null, activityItemOpenToken: 0,
    idCatalog: [], customPanel: { querySelector(selector) { return selector === '.activity-list' ? list : { focus() { focused = selector; }, scrollIntoView() {} }; } },
    search: { value: '' }, query: '', selectedCommandId: null, idBrowserCategory: '', idBrowserRecordTypeFilter: '', modBrowserSort: 'mod', modBrowserCategory: '', modSearchScope: '', idBrowserSelected: null, idBrowserQuantity: 8,
    window: { osfui: { async request(name) { assert.equal(name, 'console.command-center.pluginLoadOrder'); requests++; return { ok: true, plugins: [{ plugin: mod.plugin, pluginKind: 'full', index: 7 }] }; } } },
    ensureIdCatalogLoaded: async () => {}, resolveActivityItem, activityItemIsTeleport, idBrowserAction: entry => entry.available !== false && !entry.referenceOnly && entry.type === 'CELL' ? 'teleport' : null, requestIdBrowserQuickAction: async () => {}, setStatus() {}, render() { renders++; }, CSS: { escape: value => value },
  });
  vm.runInContext(functions(['openActivityItem', 'returnToActivityItem']), c);
  return { c, list, focus: () => focused, renders: () => renders, requests: () => requests };
}

test('actual Open Item route opens unscanned mod details without execution and restores the log position', async () => {
  const f = navigationFixture(); await f.c.openActivityItem('logged');
  assert.equal(f.requests(), 1); assert.equal(f.c.activeView, 'mod-browser'); assert.equal(f.c.idBrowserSelected.value, '07001234');
  assert.equal(f.c.idCatalog.length, 0, 'opening does not invent scanned records'); assert.equal(f.c.idBrowserQuantity, 1);
  assert.equal(f.c.query, mod.label); assert.equal(f.c.modBrowserSort, 'category');
  f.list.scrollTop = 0; f.c.returnToActivityItem();
  assert.equal(f.c.activeView, 'activity'); assert.equal(f.list.scrollTop, 280); assert.match(f.focus(), /logged/);
});

test('old entries and navigation away during loading cannot open a stale item', async () => {
  const old = navigationFixture(); old.c.activityLog[0].item = undefined; await old.c.openActivityItem('logged'); assert.equal(old.requests(), 0);
  const f = navigationFixture(); let finish;
  f.c.ensureIdCatalogLoaded = () => new Promise(resolve => { finish = resolve; });
  const opening = f.c.openActivityItem('logged'); f.c.activeView = 'commands'; finish(); await opening;
  assert.equal(f.c.activeView, 'commands'); assert.equal(f.c.activityItemContext, null); assert.equal(f.renders(), 0);
});


test('teleport log entries use the existing reviewed teleport action instead of item navigation', async () => {
  const cell = activityItemFromRecord({ label: 'The Rock', value: '00016758', type: 'CELL', category: 'Cells', editorId: 'CityAkilaTheRock01' });
  assert.equal(activityItemIsTeleport(cell), true);
  assert.equal(activityItemIsTeleport(activityItemFromRecord(mod)), false);
  assert.equal(activityItemIsTeleport({ ...cell, editorId: 'CityAkilaTheRock01; tgm' }), false);
  const f = navigationFixture(cell), queued = [];
  f.c.window.osfui.request = async () => ({ ok: true, plugins: [{ plugin: 'Starfield.esm', pluginKind: 'full', index: 0 }] });
  f.c.requestIdBrowserQuickAction = async entry => queued.push(entry);
  await f.c.openActivityItem('logged');
  assert.equal(queued.length, 1); assert.equal(queued[0].editorId, 'CityAkilaTheRock01');
  assert.equal(f.c.activeView, 'activity'); assert.equal(f.c.activityItemContext, null); assert.equal(f.renders(), 0);
  f.c.window.osfui.request = async () => ({ ok: true, plugins: [] });
  f.c.activityLog[0].item = { ...cell, plugin: 'MissingDLC.esm', source: 'Shattered Space' };
  await f.c.openActivityItem('logged'); assert.equal(queued.length, 1, 'missing owners cannot replay a teleport');
  f.c.activityLog[0].item = { ...cell, referenceOnly: true };
  f.c.window.osfui.request = async () => ({ ok: true, plugins: [{ plugin: 'Starfield.esm', pluginKind: 'full', index: 0 }] });
  await f.c.openActivityItem('logged'); assert.equal(queued.length, 1, 'current action restrictions are retained');
});
