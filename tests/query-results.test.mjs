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
const styleSource = readFileSync(new URL('../src/views/console.command-center/main/style.css', import.meta.url), 'utf8');
const idCatalogSource = readFileSync(new URL('../src/views/console.command-center/main/id-catalog.ts', import.meta.url), 'utf8');
const referenceIdSource = readFileSync(new URL('../src/views/console.command-center/main/reference-ids.ts', import.meta.url), 'utf8');
const names = new Set(['executeConsole', 'executeCustomBatch', 'showResults', 'extractResultIds', 'parseInventoryResults', 'renderInventoryResults', 'describe', 'escapeHtml', 'renderActivityPanel', 'parseCustomCommands']);
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
    window: { osfui: { async call(route, payload) { calls.push(route); payloads.push(payload); if (rejection) throw new Error(rejection); return typeof reply === 'function' ? reply(route, payload, calls.length) : reply; } } },
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

test('Activity Log uses a compact header and reports native runtime state in the footer', () => {
  assert.doesNotMatch(source, /SESSION EXECUTIONS|LAST COMMAND|SAVED ENTRIES/);
  assert.doesNotMatch(source, /activity-stats|activity-stat/);
  assert.match(source, /id="footer-native-status">CHECKING/);
  assert.match(source, /footerNativeStatus\.textContent = 'READY'/);
  assert.match(source, /resultCount\.textContent = 'Command history'/);
});

test('Custom Command uses a multiline batch editor and the sidebar has no redundant heading', () => {
  assert.doesNotMatch(source, /COMMAND LIBRARY/);
  assert.match(source, /<textarea class="osf-input custom-command-input"/);
  assert.match(source, /if \(execution\?\.commands\) void executeCustomBatch\(execution\)/);
  assert.deepEqual([...harness(null).sandbox.parseCustomCommands(' tgm\r\n\n player.additem 0000ABF9 4 \n')], [
    'tgm',
    'player.additem 0000ABF9 4',
  ]);
});

test('Custom Command batches execute one line at a time', async () => {
  const h = harness((_route, payload) => ({ ok: true, command: payload.consoleCommand }));
  await h.sandbox.executeCustomBatch({ command: 'tgm\nplayer.additem 0000ABF9 4', commands: ['tgm', 'player.additem 0000ABF9 4'] });
  assert.deepEqual(h.payloads.map((payload) => payload.consoleCommand), ['tgm', 'player.additem 0000ABF9 4']);
  assert.equal(h.entries.length, 2);
  assert.equal(h.sandbox.status.kind, 'success');
  assert.match(source, /for \(let index = 0; index < commands\.length; index \+= 1\)/);
  assert.match(source, /MAX_CUSTOM_BATCH_COMMANDS = 100/);
  assert.match(source, /MAX_CUSTOM_COMMAND_LENGTH = 1024/);
});

test('Custom Command batches stop at the first reported error', async () => {
  const h = harness((_route, payload, callNumber) => {
    if (callNumber === 2) throw new Error('Rejected by game');
    return { ok: true, command: payload.consoleCommand };
  });
  await h.sandbox.executeCustomBatch({ command: 'first\nsecond\nthird', commands: ['first', 'second', 'third'] });
  assert.deepEqual(h.payloads.map((payload) => payload.consoleCommand), ['first', 'second']);
  assert.equal(h.entries.length, 2);
  assert.equal(h.entries[1].outcome, 'error');
  assert.match(h.sandbox.status.message, /Batch stopped at command 2 of 3: Rejected by game/);
});

test('controller support is visibly deferred without custom spatial navigation', () => {
  assert.doesNotMatch(source, /autocomplete="off" autofocus/);
  assert.doesNotMatch(source, /FocusDirection|moveDirectionalFocus|focusableElements/);
  assert.match(source, /Controller support is in development\./);
  assert.match(styleSource, /Compact mouse-and-keyboard controls/);
  assert.doesNotMatch(styleSource, /controller-friendly targets/);
});

test('all editable value inputs select their contents on click', () => {
  assert.match(source, /document\.addEventListener\('click',[\s\S]*?closest<HTMLInputElement>\('input\.osf-input'\)[\s\S]*?input\.select\(\)/);
  assert.match(source, /input\.type === 'number' \? 'text' : input\.type/);
  assert.match(source, /data-value-type=/);
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

test('ID Browser does not expose the unsafe native loaded-form search route', () => {
  assert.doesNotMatch(source, /console\.command-center\.searchForms/);
  assert.doesNotMatch(source, /help \"\$\{escapedSearch\}\"/);
  assert.doesNotMatch(nativeSource, /RegisterRequest\("console\.command-center\.searchForms"/);
  assert.match(idCatalogSource, /label: 'Med Pack'/);
});

test('expanded packaged catalog has normalized unique IDs and labeled expansion records', () => {
  const ids = [...idCatalogSource.matchAll(/value: '([0-9A-F]{8})'/g)].map((match) => match[1]);
  const pickerCatalog = referenceIdSource.slice(
    referenceIdSource.indexOf('export const BOUNTY_FACTION_PICKER'),
    referenceIdSource.length,
  );
  const pickerIds = [...pickerCatalog.matchAll(/value: '([0-9A-F]{8})'/g)].map((match) => match[1]);
  assert.equal(ids.length, 345);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(pickerIds.length, 25);
  assert.equal(new Set([...ids, ...pickerIds]).size, 370);
  assert.match(idCatalogSource, /label: 'Trauma Pack', value: '0029A847'/);
  assert.match(idCatalogSource, /label: 'Boxing', value: '002C59DF'/);
  assert.match(idCatalogSource, /label: 'Heavy Particle Fuse', value: '002B558B'/);
  assert.match(referenceIdSource, /Dazra Ship Services[\s\S]*?Shattered Space DLC bounty faction/);
  assert.match(referenceIdSource, /House Va'ruun — Shattered Space[\s\S]*?Shattered Space DLC bounty faction/);
});

test('perk, power, and effect commands use searchable packaged pickers', () => {
  assert.match(commandSource, /picker: PERK_SKILL_PICKER/g);
  assert.equal((commandSource.match(/picker: PERK_SKILL_PICKER/g) ?? []).length, 2);
  assert.match(commandSource, /picker: POWER_SPELL_PICKER/);
  assert.match(commandSource, /picker: SPELL_EFFECT_PICKER/);
  assert.equal((idCatalogSource.match(/category: 'Powers'/g) ?? []).length, 24);
  assert.equal((idCatalogSource.match(/category: 'Effects'/g) ?? []).length, 6);
  assert.match(idCatalogSource, /label: 'Anti-Gravity Field', value: '002BACBA'/);
  assert.match(idCatalogSource, /label: 'Poor Air Quality', value: '00163FE7'/);
  const effects = idCatalogSource.slice(
    idCatalogSource.indexOf('// ENVIRONMENTAL EFFECTS'),
    idCatalogSource.indexOf('// AMMO'),
  );
  assert.doesNotMatch(effects, /action: 'addspell'/);
});

test('ID Browser groups results in collapsed categories and opens matches while searching', () => {
  assert.match(source, /<details class="inventory-type-group id-browser-category-group"/);
  assert.match(source, /\$\{query \|\| idBrowserOpenCategories\.has\(category\) \? ' open' : ''\}/);
  assert.match(source, /group\.addEventListener\('toggle'/);
  assert.match(source, /idBrowserOpenCategories\.clear\(\)/);
});

test('ID Browser result buttons fill the category width', () => {
  assert.match(styleSource, /\.id-browser-row\s*\{[\s\S]*?width:\s*100%;/);
});

test('ID Browser keeps category labels inline with item names for compact rows', () => {
  assert.match(source, /class="id-browser-row-title"><strong>[\s\S]*?<small>\$\{escapeHtml\(entry\.category\)\}<\/small>/);
  assert.match(styleSource, /\.id-browser-row-title\s*\{[\s\S]*?display:\s*flex;/);
  assert.match(styleSource, /\.id-browser-row\s*\{[\s\S]*?min-height:\s*38px;/);
});

test('ID Browser item action accepts a validated quantity and defaults to one', () => {
  const quickActionFunctions = [...source.matchAll(/^(?:async )?function (\w+)\b[\s\S]*?^}/gm)]
    .filter((match) => ['idBrowserAction', 'requestIdBrowserQuickAction'].includes(match[1]))
    .map((match) => match[0]);
  assert.equal(quickActionFunctions.length, 2);
  let requested;
  const sandbox = { requestExecution(execution) { requested = execution; } };
  vm.createContext(sandbox);
  vm.runInContext(stripTypeScriptTypes(quickActionFunctions.join('\n')), sandbox);
  const medPack = { label: 'Med Pack', value: '0000ABF9', type: 'ALCH', category: 'Aid', action: 'additem' };
  sandbox.requestIdBrowserQuickAction(medPack);
  assert.equal(requested.command, 'player.additem 0000ABF9 1');
  sandbox.requestIdBrowserQuickAction(medPack, 4);
  assert.equal(requested.command, 'player.additem 0000ABF9 4');
  assert.match(requested.definition.description, /Add 4 Med Pack/);
  assert.match(source, /id="id-browser-quantity" type="text"/);
  assert.match(source, /Number\.isInteger\(quantity\) && quantity >= 1 && quantity <= 999999/);
});

test('known-broken command cards are unavailable at both render and execution boundaries', () => {
  assert.equal((commandSource.match(/unavailableReason:/g) ?? []).length, 9);
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
