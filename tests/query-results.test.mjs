import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

// Exercise the actual response handler without a game or browser. DOM layout,
// engine values, focus trapping, and scrolling still need a browser/game test.
const source = readFileSync(new URL('../src/views/console.command-center/main/main.ts', import.meta.url), 'utf8');
const commandSource = readFileSync(new URL('../src/views/console.command-center/main/commands.ts', import.meta.url), 'utf8');
const nativeSource = readFileSync(new URL('../native/src/main.cpp', import.meta.url), 'utf8');
const names = new Set(['executeConsole', 'showResults', 'extractResultIds', 'parseInventoryResults', 'renderInventoryResults', 'describe', 'escapeHtml', 'renderActivityPanel']);
const functions = [...source.matchAll(/^(?:async )?function (\w+)\b[\s\S]*?^}/gm)]
  .filter(match => names.has(match[1])).map(match => match[0]);
assert.equal(functions.length, names.size, 'All production handlers must be included');
const js = stripTypeScriptTypes(functions.join('\n'));

function harness(reply, rejection) {
  const entries = [];
  const elements = {
    resultsTitle: {}, resultsCommand: {}, resultsStatus: { dataset: {} }, resultsOutput: {}, resultsIdActions: {},
    inventoryResultsToolbar: {}, inventoryResults: {}, resultsFooter: {},
    inventoryResultsSearch: { value: '' }, inventoryResultsSort: { value: 'type' },
  };
  const calls = [];
  const payloads = [];
  const sandbox = {
    ...elements, Error, console,
    resultsDialog: { open: false, showModal() { this.open = true; } },
    window: { osfui: { async call(route, payload) { calls.push(route); payloads.push(payload); if (rejection) throw new Error(rejection); return reply; } } },
    nativeBackendReady: true, executionCount: 0, lastCommand: '', activeView: 'Targets',
    inventoryResultRows: [],
    INVENTORY_TYPE_LABELS: {
      WEAP: 'Weapons', ARMO: 'Armor & Apparel', AMMO: 'Ammo', AID: 'Aid & Consumables',
      BOOK: 'Books', NOTE: 'Notes', KEY: 'Keys', MISC: 'Miscellaneous & Resources',
      INGR: 'Ingredients', SPEL: 'Spells & Powers', OTHER: 'Other',
    },
    addActivity(execution, outcome, message) { entries.push({ ...execution, outcome, message }); },
    setStatus(message, kind) { sandbox.status = { message, kind }; },
    addRecent() {}, render() {}, loadQuestStatus: async () => {},
  };
  vm.createContext(sandbox);
  vm.runInContext(js, sandbox);
  return { sandbox, entries, calls, payloads, async run(capture = true) {
    await sandbox.executeConsole({ command: 'player.showinventory', definition: { title: 'Inventory', captureOutput: capture } });
  } };
}

test('large inventory output stays intact in the window and saved entry, not status bar', async () => {
  const output = Array.from({ length: 2000 }, (_, i) => `Item ${i} <not-html>`).join('\n');
  const h = harness({ ok: true, command: 'player.showinventory', output });
  await h.run();
  assert.equal(h.sandbox.resultsOutput.textContent, output);
  assert.equal(h.entries[0].message, `Result: ${output}`);
  assert.ok(h.sandbox.status.message.length < 100);
  assert.equal(h.calls[0], 'console.command-center.query');
});

test('structured inventory is searchable data with normalized IDs and counts', () => {
  const h = harness(null);
  const output = [
    'CCC_INVENTORY_V1',
    'TYPE\tFORM_ID\tCOUNT\tNAME',
    'WEAP\t00ab12cd\t2\tBeowulf',
    'AID\t000055aa\t12\tMed Pack',
    'SUMMARY\t2 inventory entries.',
  ].join('\n');
  const rows = h.sandbox.parseInventoryResults(output);
  assert.equal(rows.length, 2);
  assert.deepEqual({ ...rows[0] }, { type: 'WEAP', id: '00AB12CD', count: 2, name: 'Beowulf' });
  assert.deepEqual({ ...rows[1] }, { type: 'AID', id: '000055AA', count: 12, name: 'Med Pack' });
});

test('inventory type categories start collapsed and search opens matching groups', () => {
  const h = harness(null);
  h.sandbox.inventoryResultRows = h.sandbox.parseInventoryResults([
    'CCC_INVENTORY_V1',
    'TYPE\tFORM_ID\tCOUNT\tNAME',
    'WEAP\t00AB12CD\t2\tBeowulf',
    'AID\t000055AA\t12\tMed Pack',
  ].join('\n'));
  h.sandbox.renderInventoryResults();
  assert.match(h.sandbox.inventoryResults.innerHTML, /<details class="inventory-type-group">/);
  assert.doesNotMatch(h.sandbox.inventoryResults.innerHTML, /inventory-type-group" open/);

  h.sandbox.inventoryResultsSearch.value = 'med';
  h.sandbox.renderInventoryResults();
  assert.match(h.sandbox.inventoryResults.innerHTML, /inventory-type-group" open/);
  assert.match(h.sandbox.inventoryResults.innerHTML, /Med Pack/);
  assert.doesNotMatch(h.sandbox.inventoryResults.innerHTML, /Beowulf/);
});

test('zero is a valid inspection result', async () => {
  const h = harness({ ok: true, output: '0' });
  await h.run();
  assert.equal(h.entries[0].outcome, 'success');
  assert.equal(h.sandbox.resultsOutput.textContent, '0');
});

test('ordinary inspection output exposes unique copy buttons for every Form ID', async () => {
  const h = harness({ ok: true, output: 'Current Spaceship Reference ID: ff1c8011\nRelated: 00ABCDEF and FF1C8011' });
  await h.run();
  assert.equal(h.sandbox.resultsIdActions.hidden, false);
  assert.match(h.sandbox.resultsIdActions.innerHTML, /data-copy-result-id="FF1C8011"/);
  assert.match(h.sandbox.resultsIdActions.innerHTML, /data-copy-result-id="00ABCDEF"/);
  assert.equal((h.sandbox.resultsIdActions.innerHTML.match(/FF1C8011/g) ?? []).length, 2);
});

test('empty capture is an error, not a successful empty inventory', async () => {
  const h = harness({ ok: true, output: '  ' });
  await h.run();
  assert.equal(h.entries[0].outcome, 'error');
  assert.equal(h.sandbox.executionCount, 0);
  assert.equal(h.sandbox.resultsStatus.dataset.state, 'error');
});

test('native errors are readable in the results window and retained', async () => {
  const h = harness(null, 'Reference not found');
  await h.run();
  assert.equal(h.entries[0].outcome, 'error');
  assert.equal(h.sandbox.resultsOutput.textContent, 'Reference not found');
});

test('ordinary commands retain the execution route and do not open results', async () => {
  const h = harness({ ok: true, command: 'player.resethealth' });
  await h.run(false);
  assert.equal(h.calls[0], 'console.command-center.execute');
  assert.equal(h.sandbox.resultsDialog.open, false);
  assert.equal(h.entries[0].outcome, 'success');
});

test('commands that need the game UI request close-before-execute handoff', async () => {
  const h = harness({ ok: true, command: 'showmenu sleepwaitmenu' });
  await h.sandbox.executeConsole({
    command: 'showmenu sleepwaitmenu',
    definition: { id: 'open-wait-menu', title: 'Open Wait Menu', closeBeforeExecute: true },
  });
  assert.equal(h.calls[0], 'console.command-center.execute');
  assert.equal(h.payloads[0].closeBeforeExecute, true);
});

test('saved output is reopened as text without repeating the game command', () => {
  const h = harness(null);
  let open;
  h.sandbox.activityLog = [{ id: 'one', timestamp: 0, command: 'test', label: '<title>', category: 'Test', outcome: 'success', message: 'Result: <script>bad()</script>' }];
  h.sandbox.formatActivityTime = () => 'now';
  h.sandbox.runtimeLabel = () => 'test';
  h.sandbox.HTMLButtonElement = class {};
  h.sandbox.document = { querySelector: () => null };
  h.sandbox.customPanel = { querySelectorAll: () => [{ dataset: { showResult: 'one' }, addEventListener: (_event, handler) => { open = handler; } }] };
  h.sandbox.renderActivityPanel();
  assert.ok(h.sandbox.customPanel.innerHTML.includes('Open Results'));
  assert.ok(!h.sandbox.customPanel.innerHTML.includes('<script>'));
  open();
  assert.equal(h.sandbox.resultsOutput.textContent, '<script>bad()</script>');
  assert.equal(h.calls.length, 0);
});

test('document-targeted native Escape closes only the Results window', () => {
  const body = source.match(/document.addEventListener\('keydown', \(event\) => \{([\s\S]*?)^\}\);/m)?.[1];
  assert.ok(body, 'Production document key handler must exist');
  let closed = 0;
  let prevented = false;
  let stopped = false;
  const sandbox = {
    resultsDialog: { open: true, close() { closed++; this.open = false; } },
    closeCurrentView() { assert.fail('Escape must not close CCC while Results is open'); },
  };
  vm.createContext(sandbox);
  vm.runInContext(stripTypeScriptTypes(`function handleKey(event: KeyboardEvent) {${body}}`), sandbox);
  sandbox.handleKey({ key: 'Escape', preventDefault() { prevented = true; }, stopPropagation() { stopped = true; } });
  assert.equal(closed, 1);
  assert.ok(prevented && stopped);
});

test('Search Game uses native loaded-form search instead of a help console query', () => {
  assert.match(source, /console\.command-center\.searchForms/);
  assert.doesNotMatch(source, /help \"\$\{escapedSearch\}\"/);
  assert.match(nativeSource, /RegisterRequest\("console\.command-center\.searchForms"/);
});

test('known-broken command cards are unavailable at both render and execution boundaries', () => {
  assert.equal((commandSource.match(/unavailableReason:/g) ?? []).length, 7);
  assert.match(source, /const unavailable = Boolean\(command\.unavailableReason\)/);
  assert.match(source, /if \(execution\.definition\?\.unavailableReason\)/);
});

test('effective-total commands use the native preview-and-apply route', () => {
  assert.equal((commandSource.match(/effectiveTotal: true/g) ?? []).length, 7);
  assert.match(source, /apply: false/);
  assert.match(source, /apply: true/);
  assert.match(source, /console\.command-center\.setEffectiveActorValue/);
  assert.match(nativeSource, /calculatedBase = \*desiredTotal - modifierContribution/);
});
