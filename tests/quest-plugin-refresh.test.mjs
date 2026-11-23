import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
registerHooks({ resolve(s, c, n) { return n(s.startsWith('.') && !/\.[a-z]+$/i.test(s) ? s + '.ts' : s, c); } });
const { QUEST_BROWSER_ENTRIES } = await import('../src/views/console.command-center/main/quest-browser.ts');
const { resolvePackagedQuestCatalog } = await import('../src/views/console.command-center/main/official-quest-catalog.ts');
const source = readFileSync(new URL('../src/views/console.command-center/main/main.ts', import.meta.url), 'utf8');
test('native full-load-order requests do not require optional diagnostic fields', () => {
  const native = readFileSync(new URL('../native/src/main.cpp', import.meta.url), 'utf8');
  const endpoint = native.slice(native.indexOf('    void OnPluginLoadOrder('), native.indexOf('    void OnModCatalogRecords('));
  // JsonRequest.Get rejects the request immediately when a key is absent;
  // value_or cannot undo that rejection. The browser sends only uiVersion.
  assert.doesNotMatch(endpoint, /request\.Get</);
  for (const field of ['plugin', 'uiVersion', 'localFormId', 'formId']) {
    assert.ok(endpoint.includes(`payload.value("${field}", std::string{})`), field);
  }
});
const functions = ['readOfficialPluginLoadOrder', 'refreshQuestAvailability'].map(name => stripTypeScriptTypes(source.match(new RegExp('^async function ' + name + '\\b[\\s\\S]*?^}', 'm'))[0])).join('\n');
const reply = { ok: true, plugins: [
  { plugin: 'Starfield.esm', pluginKind: 'full', index: 0 },
  { plugin: 'ShatteredSpace.esm', pluginKind: 'full', index: 6 },
  { plugin: 'SFBGS00D.esm', pluginKind: 'full', index: 7 },
  { plugin: 'SFBGS050.esm', pluginKind: 'full', index: 9 },
] };
function setup(request) {
  const context = vm.createContext({ window: { osfui: { request } }, CONSOLE_COMMAND_CENTER_VERSION: 'test', officialLoadOrderLoading: null,
    questBrowserEntries: resolvePackagedQuestCatalog(QUEST_BROWSER_ENTRIES, null), resolvePackagedQuestCatalog,
    describe: String, setStatus() {}, recordDiagnostic() {}, render() {}, rerenderKeepingPosition(fn) { fn(); } });
  vm.runInContext(functions, context);
  return context;
}
test('failed, absent, and empty startup lookups can retry after native connection', async () => {
  for (const request of [undefined, async () => { throw Error('not ready'); }, async () => ({ ok: true, plugins: [] })]) {
    const c = setup(request);
    assert.equal(await c.readOfficialPluginLoadOrder(), null);
    assert.equal(c.officialLoadOrderLoading, null);
    c.window.osfui.request = async () => reply;
    assert.equal(await c.readOfficialPluginLoadOrder(), reply);
  }
});
test('refresh recovers every installed DLC quest with live IDs and keeps missing DLC blocked', async () => {
  const c = setup(async () => reply);
  c.officialLoadOrderLoading = Promise.resolve({ ok: true, plugins: [] });
  await c.refreshQuestAvailability();
  for (const entry of c.questBrowserEntries) {
    assert.equal(entry.available, true, entry.editorId);
    const owner = reply.plugins.find(p => p.plugin === entry.plugin);
    assert.equal(entry.questId, owner.index.toString(16).padStart(2, '0').toUpperCase() + entry.localFormId.padStart(6, '0'));
  }
  c.window.osfui.request = async () => ({ ok: true, plugins: reply.plugins.slice(0, 2) });
  await c.refreshQuestAvailability();
  assert.ok(c.questBrowserEntries.filter(e => e.source === 'Terran Armada' || e.source === 'Free Lanes').every(e => e.available === false));
  assert.ok(c.questBrowserEntries.filter(e => e.source === 'Shattered Space').every(e => e.available));
});
