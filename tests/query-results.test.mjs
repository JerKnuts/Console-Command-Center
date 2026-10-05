import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

// Exercise the actual response handler without a game or browser. DOM layout,
// engine values, focus trapping, and scrolling still need a browser/game test.
const source = readFileSync(new URL('../src/views/console.command-center/main/main.ts', import.meta.url), 'utf8');
const commandSource = readFileSync(new URL('../src/views/console.command-center/main/commands.ts', import.meta.url), 'utf8');
const untestedCommandSource = readFileSync(new URL('../src/views/console.command-center/main/untested-commands.ts', import.meta.url), 'utf8');
const engineCommandSource = readFileSync(new URL('../src/views/console.command-center/main/engine-command-library.ts', import.meta.url), 'utf8');
const engineCommandGeneratorSource = readFileSync(new URL('../scripts/build-engine-command-library.mjs', import.meta.url), 'utf8');
const nativeSource = readFileSync(new URL('../native/src/main.cpp', import.meta.url), 'utf8');
const styleSource = readFileSync(new URL('../src/views/console.command-center/main/style.css', import.meta.url), 'utf8');
const idCatalogSource = readFileSync(new URL('../src/views/console.command-center/main/id-catalog.ts', import.meta.url), 'utf8');
const generatedIdSource = readFileSync(new URL('../src/views/console.command-center/main/id-browser-data.ts', import.meta.url), 'utf8');
const referenceIdSource = readFileSync(new URL('../src/views/console.command-center/main/reference-ids.ts', import.meta.url), 'utf8');
const questBrowserSource = readFileSync(new URL('../src/views/console.command-center/main/quest-browser.ts', import.meta.url), 'utf8');
const directQuerySource = readFileSync(new URL('../native/include/DirectQuery.h', import.meta.url), 'utf8');
const names = new Set(['executeConsole', 'executeCustomBatch', 'showResults', 'extractResultIds', 'parseInventoryResults', 'renderInventoryResults', 'describe', 'escapeHtml', 'renderActivityPanel', 'parseCustomCommands', 'readStringArray']);
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
    localStorage: { getItem() { return null; }, setItem() {} },
    resultsDialog: { open: false, showModal() { this.open = true; } },
    window: { osfui: { async request(route, payload) { calls.push(route); payloads.push(payload); if (rejection) throw new Error(rejection); return typeof reply === 'function' ? reply(route, payload, calls.length) : reply; } } },
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
  const h = harness({ ok: true, command: 'showmenu photomodemenu' });
  await h.sandbox.executeConsole({
    command: 'showmenu photomodemenu',
    definition: { id: 'open-photo-mode', title: 'Open Photo Mode', closeBeforeExecute: true },
  });
  assert.equal(h.calls[0], 'console.command-center.execute');
  assert.equal(h.payloads[0].closeBeforeExecute, true);
});

test('Wait Anywhere replaces the broken native wait-menu commands', () => {
  assert.match(commandSource, /id: 'pass-time',[\s\S]*?title: 'Wait Anywhere'[\s\S]*?command: 'passtime \{hours\}'[\s\S]*?max: 24/);
  assert.doesNotMatch(commandSource, /showmenu (?:sleepwaitmenu|sitwaitmenu)/i);
  assert.doesNotMatch(commandSource, /id: 'open-wait-menu'/);
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

test('Custom Command can persist, load, update, and delete up to 100 named entries', () => {
  assert.match(source, /STORAGE_CUSTOM_COMMANDS = 'consoleCommandCenter\.customCommands'/);
  assert.match(source, /MAX_SAVED_CUSTOM_COMMANDS = 100/);
  assert.match(source, /\$\{savedCustomCommands\.length\} \/ \$\{MAX_SAVED_CUSTOM_COMMANDS\}/);
  assert.match(source, /data-custom-load=/);
  assert.match(source, /data-custom-delete=/);
  assert.match(source, /input\.value = entry\.commands/);
  assert.match(source, /entry\.name\.toLowerCase\(\) === name\.toLowerCase\(\)/);
  assert.match(source, /writeSavedCustomCommands\(\)/);
  assert.match(source, /data-custom-delete-all/);
  assert.match(source, /deleteAllInput\.value !== 'Delete'/);
  assert.match(source, /savedCustomCommands = \[\]/);
  assert.match(styleSource, /\.custom-workspace \{ display: grid; grid-template-columns: minmax\(0, 3fr\) minmax\(320px, 2fr\);/);
  assert.match(styleSource, /\.custom-saved-entry-actions \{ display: flex;/);
  assert.doesNotMatch(source, /const preview = commands\[0\]/);
});

test('commands under investigation remain isolated in the user-facing WIP category', () => {
  assert.match(commandSource, /import \{ UNTESTED_COMMANDS \} from '\.\/untested-commands'/);
  assert.match(commandSource, /\| 'Untested'/);
  assert.match(commandSource, /\.\.\.UNTESTED_COMMANDS/);
  assert.match(commandSource, /'Ship',\s*'Untested'/);
  assert.match(source, /WORK IN PROGRESS/);
  assert.match(source, /label: category === 'Untested' \? 'WIP' : category/);
  assert.match(source, /if \(activeView === 'Untested'\) return 'Work in Progress'/);
  assert.match(source, /command\.testStatus === 'untested'/);
  assert.match(source, /command\.testStatus === 'inconclusive'/);
  assert.match(source, /command\.testStatus === 'needs-adjustment'[\s\S]*?ISSUE/);
  assert.match(source, /EFFECT UNCONFIRMED/);
  assert.match(source, /let openUntestedGroup: string \| null = null/);
  assert.match(styleSource, /\.command-test-tag/);
  assert.match(untestedCommandSource, /id: 'untested-start-all-quests'/);
  assert.match(untestedCommandSource, /id: 'untested-camera-fov'/);
  assert.match(untestedCommandSource, /id: 'untested-nearest-door'/);
  assert.match(untestedCommandSource, /id: 'untested-save-game'/);
  assert.doesNotMatch(untestedCommandSource, /id: 'toggle-game-pause'/);
  assert.equal((commandSource.match(/title: 'Toggle Game Pause'/g) ?? []).length, 1);
  assert.match(untestedCommandSource, /id: 'toggle-first-person-hands',[\s\S]*?category: 'Camera',[\s\S]*?testStatus: 'verified'/);
  assert.match(untestedCommandSource, /id: 'show-first-person-model',[\s\S]*?category: 'Camera',[\s\S]*?testStatus: 'verified'/);
  assert.match(untestedCommandSource, /id: 'toggle-all-animations',[\s\S]*?category: 'World',[\s\S]*?testStatus: 'verified'/);
  assert.match(untestedCommandSource, /id: 'select-next-actor',[\s\S]*?category: 'Targets',[\s\S]*?testStatus: 'verified'/);
  assert.match(untestedCommandSource, /id: 'select-next-reference',[\s\S]*?category: 'Targets',[\s\S]*?testStatus: 'verified'/);
  assert.match(untestedCommandSource, /id: 'untested-nearest-door',[\s\S]*?category: 'World',[\s\S]*?testStatus: 'verified'/);
  assert.match(untestedCommandSource, /id: 'untested-pick-ref',[\s\S]*?category: 'Targets',[\s\S]*?testStatus: 'verified'/);
  assert.match(untestedCommandSource, /testStatus: 'failed'/);
  assert.match(untestedCommandSource, /intakeGroup: 'Executed — Effect Unconfirmed'/);
  assert.match(untestedCommandSource, /id: 'untested-reload-climate'[\s\S]*?unavailableReason:[\s\S]*?intakeGroup: 'Blocked — Known Crash'/);
  assert.match(untestedCommandSource, /id: 'untested-save-game'[\s\S]*?testStatus: 'failed'[\s\S]*?unavailableReason:[\s\S]*?intakeGroup: 'Executed — Issues'/);
  assert.match(untestedCommandSource, /id: 'untested-load-game'[\s\S]*?testStatus: 'failed'[\s\S]*?unavailableReason:[\s\S]*?intakeGroup: 'Executed — Issues'/);
});

test('paired speech overrides share compact stacked-action cards', () => {
  assert.match(commandSource, /id: 'speech-success-on'[\s\S]*?title: 'Speech Challenge Success'[\s\S]*?executeLabel: 'Always Succeed'[\s\S]*?secondaryAction: \{[\s\S]*?label: 'Restore Normal'[\s\S]*?command: 'setforcespeechchallengealwayssucceed 0'/);
  assert.doesNotMatch(commandSource, /id: 'speech-success-off'/);
  assert.match(commandSource, /id: 'untested-force-speech-fail'[\s\S]*?title: 'Speech Challenge Failure'[\s\S]*?category: 'Gameplay'[\s\S]*?executeLabel: 'Always Fail'[\s\S]*?secondaryAction: \{[\s\S]*?label: 'Restore Normal'[\s\S]*?command: 'setforcespeechchallengealwaysfail 0'[\s\S]*?testStatus: 'verified'/);
  assert.doesNotMatch(untestedCommandSource, /id: 'untested-force-speech-fail'/);
  assert.doesNotMatch(untestedCommandSource, /id: 'untested-restore-speech-fail'/);
  assert.match(source, /command\.secondaryAction \? ' command-card--dual-action'/);
  assert.match(source, /data-command-action="secondary"/);
  assert.match(source, /executeButton\.dataset\.commandAction === 'secondary'/);
  assert.match(source, /secondaryAction: undefined/);
  assert.doesNotMatch(styleSource, /\.command-card--dual-action[\s\S]{0,160}?grid-column:\s*1 \/ -1/);
  assert.match(styleSource, /\.command-action-pair\s*\{[\s\S]*?grid-template-columns:\s*minmax\(138px, 1fr\)/);
});

test('established command views use a compact grid while Recent remains a row list', () => {
  assert.match(source, /commandList\.classList\.toggle\('is-command-grid', commandGridView\)/);
  assert.match(source, /&& activeView !== 'recent'/);
  assert.match(styleSource, /\.command-list\.is-command-grid \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(styleSource, /\.command-list\.is-command-grid > \.command-card/);
  assert.doesNotMatch(styleSource, /\.command-list\.is-command-grid[\s\S]{0,240}height: 100%/);
  assert.match(styleSource, /\.untested-group \{[\s\S]*?overflow: visible/);
  assert.match(styleSource, /@media \(max-width: 1180px\)[\s\S]*?\.command-list\.is-command-grid,[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(source, /data-clear-recent/);
  assert.match(source, /recent = \[\][\s\S]*?writeStringArray\(STORAGE_RECENT, recent\)/);
  assert.match(styleSource, /\.recent-toolbar/);
});

test('the complete engine command reference is lazy-loaded into grouped Untested pages', () => {
  const recordMatch = engineCommandSource.match(/const ENGINE_COMMAND_RECORDS = JSON\.parse\(String\.raw`([\s\S]*?)`\) as EngineCommandRecord\[\];/);
  assert.ok(recordMatch, 'generated engine command records must remain readable');
  const records = JSON.parse(recordMatch[1]);
  assert.equal(records.length, 1513);
  assert.equal(records.filter((entry) => entry.group === 'Console Commands').length, 565);
  assert.equal(records.filter((entry) => entry.group === 'Script Functions').length, 948);
  assert.equal(new Set(records.map((entry) => `${entry.group}:${entry.name.toLowerCase()}`)).size, 1513);

  assert.match(source, /const ENGINE_COMMAND_LIBRARY_TOTAL = 1505/);
  assert.match(source, /import\('\.\/engine-command-library'\)/);
  assert.match(source, /const UNTESTED_COMMAND_PAGE_SIZE = 100/);
  assert.match(source, /'Ready to Test'[\s\S]*'Executed — Effect Unconfirmed'[\s\S]*'Blocked — Known Crash'[\s\S]*'Engine Console Commands'[\s\S]*'Script Functions'/);
  assert.match(source, /ENGINE_COMMAND_LIBRARY_TOTAL/);
  assert.match(engineCommandSource, /category: 'Untested'/);
  assert.match(engineCommandSource, /const PROMOTED_ENGINE_COMMANDS = new Set\([\s\S]*?'picknextactor'[\s\S]*?'picknextref'[\s\S]*?'pickrefbyid'[\s\S]*?'show1stperson'[\s\S]*?'toggleanimations'[\s\S]*?'togglegamepause'[\s\S]*?'togglehandsculled'[\s\S]*?'usenearestteleportdoor'/);
  assert.match(engineCommandSource, /testStatus: knownCrashReason \? 'failed' : effectUnconfirmedReason \? 'inconclusive' : 'untested'/);
  assert.match(engineCommandSource, /toggleborders:[\s\S]*?togglematerialgeometry:[\s\S]*?togglevolumegeometry:/);
  assert.match(engineCommandSource, /label: 'Optional Arguments'/);
  assert.match(engineCommandSource, /label: 'Optional Target \/ Prefix'/);
  assert.match(engineCommandSource, /unavailableReason: knownCrashReason[\s\S]*?: requiresCredentials/);
  assert.match(engineCommandGeneratorSource, /section !== 'Console Commands' && section !== 'Script Functions'/);
  assert.doesNotMatch(commandSource, /from '\.\/engine-command-library'/);
});

test('main and Untested command searches are isolated from one another', () => {
  assert.match(source, /let untestedQuery = ''/);
  assert.match(source, /command\.category !== 'Untested' && commandMatches\(command\)/);
  assert.match(source, /command\.category === 'Untested'/);
  assert.match(source, /commandMatches\(command, untestedQuery\)/);
  assert.match(source, /if \(activeView === 'Untested'\) \{[\s\S]*?untestedQuery = search\.value/);
  assert.match(source, /search\.value = view === 'Untested' \? untestedQuery : ''/);
  assert.match(source, /activeView === 'Untested'[\s\S]*?'Search WIP name, command, or description\.\.\.'/);
  assert.doesNotMatch(source, /data-untested-search|data-clear-untested-search/);
  assert.doesNotMatch(source, /searchWrap\.hidden = [^;]*activeView === 'Untested'/);
  assert.match(source, /if \(activeView === 'Untested' && !engineCommandLibraryLoaded\)/);
  assert.match(source, /renderUntestedCommandGroups\(\[\]\) \+ emptyState/);
  assert.doesNotMatch(source, /\(activeView === 'Untested' \|\| query\) && !engineCommandLibraryLoaded/);
  assert.doesNotMatch(styleSource, /\.untested-search-wrap/);
});

test('optional engine arguments may be blank without leaving command placeholders', () => {
  assert.match(commandSource, /optional\?: boolean/);
  assert.match(source, /value \|\| \(input\.optional \? '' : `\{\$\{input\.key\}\}`\)/);
  assert.match(source, /return output\.replace\(\/\\s\+\/g, ' '\)\.trim\(\)/);
  assert.match(source, /if \(input\.optional\) continue/);
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

test('controller support installs spatial navigation and in-game text entry', () => {
  const controllerSource = readFileSync(new URL('../src/views/console.command-center/main/controller-support.ts', import.meta.url), 'utf8');
  assert.match(source, /installControllerSupport\(window\.osfui\)/);
  assert.match(source, /D-pad \/ left stick navigate, A select, B back, right stick scroll/);
  assert.match(controllerSource, /osfui\.gamepadRaw[\s\S]*?raw: true/);
  assert.match(controllerSource, /osfui\.handleBack/);
  assert.match(controllerSource, /ui\.gamepad/);
  assert.match(controllerSource, /controllerDirectionalScore/);
  assert.match(controllerSource, /BUTTON_A[\s\S]*?activateFocusedControl/);
  assert.match(controllerSource, /BUTTON_B[\s\S]*?controllerBack/);
  assert.match(controllerSource, /moveKeyboardGridFocus/);
  assert.match(controllerSource, /CONTROLLER TEXT ENTRY/);
  assert.match(controllerSource, /BUTTON_X[\s\S]*?backspace/);
  assert.match(controllerSource, /BUTTON_Y[\s\S]*?insertText\(' '\)/);
  assert.match(controllerSource, /data-controller-keyboard-newline[\s\S]*?insertText\('\\n'\)/);
  assert.match(controllerSource, /\[0-9A-Fa-f\\\]/);
  assert.match(controllerSource, /dispatchEvent\(new Event\('input'/);
  assert.match(styleSource, /\.controller-active[\s\S]*?outline:/);
  assert.match(styleSource, /\.controller-keyboard-backdrop/);
});

test('saved command lists discard duplicates and ID choosers support arrow-key navigation', () => {
  const h = harness(null);
  h.sandbox.localStorage.getItem = () => JSON.stringify(['inspect-health', 'inspect-health', 'show-inventory']);
  assert.deepEqual([...h.sandbox.readStringArray('recent')], ['inspect-health', 'show-inventory']);
  assert.match(source, /idPickerSearch\.addEventListener\('keydown'/);
  assert.match(source, /event\.key === 'ArrowDown' \? 'first' : 'last'/);
  assert.match(source, /if \(event\.key === 'Home'\) nextIndex = 0/);
  assert.match(source, /if \(event\.key === 'End'\) nextIndex = options\.length - 1/);
});

test('main view and popup surfaces are opaque', () => {
  assert.match(styleSource, /--ccc-surface: #0a0d12/);
  assert.match(styleSource, /body \{[\s\S]*?background: #05070a/);
  assert.match(styleSource, /\.command-center-shell \{[\s\S]*?background: linear-gradient\(90deg, #05070a 0, #0a0d12 38%, #0a0d12 100%\)/);
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
  assert.equal(ids.length, 355);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(pickerIds.length, 25);
  assert.equal(new Set([...ids, ...pickerIds]).size, 380);
  assert.match(idCatalogSource, /label: 'Trauma Pack', value: '0029A847'/);
  assert.match(idCatalogSource, /label: 'Boxing', value: '002C59DF'/);
  assert.match(idCatalogSource, /label: 'Heavy Particle Fuse', value: '002B558B'/);
  assert.match(referenceIdSource, /Dazra Ship Services[\s\S]*?Shattered Space DLC bounty faction/);
  assert.match(referenceIdSource, /House Va'ruun — Shattered Space[\s\S]*?Shattered Space DLC bounty faction/);
  assert.match(idCatalogSource, /label: 'Abyss Trekker', value: '000F31DB', type: 'GBFM'/);

  const generatedJson = generatedIdSource.match(/String\.raw`([\s\S]+)`\) as/)?.[1];
  assert.ok(generatedJson, 'Generated catalog payload must be present');
  const generated = JSON.parse(generatedJson);
  assert.equal(generated.length, 16358);
  assert.equal(new Set(generated.map((entry) => entry.value)).size, generated.length);
  assert.ok(generated.filter((entry) => entry.source === 'Shattered Space').length > 900);
  assert.ok(generated.every((entry) => /^[0-9A-F]{8}$/.test(entry.value)));
  assert.ok(generated.every((entry) => !/\b(?:pretentious|conversation|deep space and back|Getting Kaiser back)\b/i.test(entry.label)));
  assert.ok(generated.every((entry) => !entry.label.includes('�')));
  assert.ok(generated.every((entry) => entry.label.length <= 72));
  assert.ok(generated.every((entry) => !/creature.*attack|companion only|not playable/i.test(entry.label)));
  assert.ok(!generated.some((entry) => ['010CA4BE', '010CA4BC', '01007540'].includes(entry.value)));
  assert.match(idCatalogSource, /\.filter\(\(entry\) => !curatedIds\.has\(entry\.value\)\)/);
});

test('large browser datasets load only when their screens are opened', () => {
  assert.doesNotMatch(source, /^import \{[^\n]*GENERATED_ID_CATALOG/m);
  assert.doesNotMatch(source, /^import \{[^\n]*QUEST_BROWSER_ENTRIES/m);
  assert.match(source, /import\('\.\/id-browser-data'\)/);
  assert.match(source, /import\('\.\/quest-browser'\)/);
  assert.match(source, /function clearForDatasetLoad\(\): void/);
  assert.match(source, /commandList\.replaceChildren\(\)/);
  assert.doesNotMatch(source, /Loading \$\{escapeHtml\(label\)\}/);
});

test('command inputs and picker buttons use the same control height', () => {
  assert.match(styleSource, /\.input-field\s*\{[\s\S]*?grid-template-rows:\s*12px 36px auto;/);
  assert.match(styleSource, /\.input-field \.osf-input\s*\{[\s\S]*?height:\s*36px;/);
  assert.match(styleSource, /\.input-picker-button\s*\{[\s\S]*?height:\s*36px;/);
});

test('perk, power, and effect commands use filtered ID Browser selection', () => {
  assert.equal((commandSource.match(/buttonLabel: 'Browse Perks'/g) ?? []).length, 2);
  assert.match(commandSource, /buttonLabel: 'Browse Perks', allowedTypes: \['PERK'\], allowedCategories: \['Perks'\]/);
  assert.match(commandSource, /buttonLabel: 'Browse Powers', allowedTypes: \['SPEL'\], allowedCategories: \['Powers'\]/);
  assert.match(commandSource, /buttonLabel: 'Browse Effects', allowedTypes: \['SPEL'\], allowedCategories: \['Powers', 'Effects'\]/);
  assert.doesNotMatch(commandSource, /PERK_SKILL_PICKER|POWER_SPELL_PICKER|SPELL_EFFECT_PICKER/);
  assert.doesNotMatch(idCatalogSource, /PERK_SKILL_PICKER|POWER_SPELL_PICKER|SPELL_EFFECT_PICKER/);
  assert.match(source, /pickerCategories = activeCatalogPicker\?\.browser === 'id' \? activeCatalogPicker\.allowedCategories : \[\]/);
  assert.match(source, /pickerCategories\.includes\(entry\.category\)/);
  assert.match(source, /activeCatalogPicker\?\.browser === 'id' \|\| idBrowserOpenCategories\.has\(category\)/);
  assert.match(source, /id-browser-panel\$\{activeCatalogPicker\?\.browser === 'id' \? ' is-selecting' : ''\}/);
  assert.match(styleSource, /\.id-browser-panel\.is-selecting\s*\{[\s\S]*?grid-template-rows:\s*auto auto auto 2px minmax\(0, 1fr\);/);
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

test('command-specific browser filters never leak into the standalone ID Browser', () => {
  assert.match(source, /function finishCatalogPicker[\s\S]*?idBrowserCategory = 'all';[\s\S]*?idBrowserRecordTypeFilter = '';/);
  assert.match(source, /if \(view === 'id-browser'\) \{\s*idBrowserCategory = 'all';\s*idBrowserRecordTypeFilter = '';/);
});

test('ID Browser groups results in collapsed categories and opens matches while searching', () => {
  assert.match(source, /<details class="inventory-type-group id-browser-category-group"/);
  assert.match(source, /const open = Boolean\(query\) \|\| activeCatalogPicker\?\.browser === 'id' \|\| idBrowserOpenCategories\.has\(category\)/);
  assert.match(source, /group\.addEventListener\('toggle'/);
  assert.match(source, /idBrowserOpenCategories\.clear\(\)/);
  assert.match(source, /if \(previousQuery && !query\) \{[\s\S]*?idBrowserOpenCategories\.clear\(\);[\s\S]*?idBrowserCategory = 'all';[\s\S]*?idBrowserRecordTypeFilter = '';/);
  assert.match(source, /const leavingIdBrowserSearch = activeView === 'id-browser' && Boolean\(query\)/);
  assert.match(source, /const ID_BROWSER_PAGE_SIZE = 100/);
  assert.match(source, /entries\.slice\(0, visibleCount\)/);
  assert.match(source, /data-id-browser-more/);
  assert.match(source, /Copy Editor ID/);
  assert.match(source, /\['CELL', 'LCTN'\]\.includes/);
});

test('ID Browser categories act as an accordion and interactions preserve scroll', () => {
  assert.match(source, /idBrowserOpenCategories\.clear\(\);\s*idBrowserOpenCategories\.add\(category\);/);
  assert.match(source, /if \(otherGroup !== group\) otherGroup\.open = false;/);
  assert.match(source, /const scrollTop = resultsElement\.scrollTop;/);
  assert.equal((source.match(/replacement\.scrollTop = scrollTop/g) ?? []).length, 3);
});

test('ID Browser uses responsive compact tile grids', () => {
  assert.match(styleSource, /\.id-browser-category-contents\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\);/);
  assert.match(styleSource, /@media \(max-width: 1550px\)[\s\S]*?repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(styleSource, /@media \(max-width: 1180px\)[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(styleSource, /\.id-browser-row\s*\{[\s\S]*?min-height:\s*50px;/);
});

test('ID Browser tiles keep the name, type, detail, and Form ID visible', () => {
  assert.match(source, /<strong title="\$\{escapeHtml\(entry\.label\)\}">/);
  assert.match(source, /class="id-browser-row-detail"/);
  assert.match(source, /<code>\$\{escapeHtml\(entry\.value\)\}<\/code>/);
  assert.match(styleSource, /\.id-browser-row-main strong\s*\{[\s\S]*?text-overflow:\s*ellipsis;/);
});

test('search fields expose clear buttons and ID Browser relies on category accordions', () => {
  assert.equal((source.match(/class="search-clear"/g) ?? []).length, 3);
  assert.match(source, /function clearSearchInput\(input: HTMLInputElement\)/);
  assert.match(source, /input\.dispatchEvent\(new Event\('input', \{ bubbles: true \}\)\)/);
  assert.match(styleSource, /\.search-clear\[hidden\]\s*\{\s*display:\s*none;/);
  assert.match(source, /if \(!activeCatalogPicker\) \{\s*idBrowserCategory = 'all';\s*idBrowserRecordTypeFilter = '';/);
  assert.doesNotMatch(source, /id="id-browser-category"/);
  assert.doesNotMatch(styleSource, /\.id-browser-controls/);
});

test('main command cards hide raw syntax while review and history retain it', () => {
  assert.doesNotMatch(source, /command-heading-preview|data-preview=/);
  assert.doesNotMatch(source, /function updatePreview/);
  assert.match(source, /class="confirm-command"/);
  assert.match(source, /class="activity-command"/);
});

test('ID Browser quick actions build item, weather, and cell commands', () => {
  const quickActionFunctions = [...source.matchAll(/^(?:async )?function (\w+)\b[\s\S]*?^}/gm)]
    .filter((match) => ['idBrowserAction', 'requestIdBrowserQuickAction'].includes(match[1]))
    .map((match) => match[0]);
  assert.equal(quickActionFunctions.length, 2);
  let requested;
  const sandbox = { requestExecution(execution) { requested = execution; } };
  vm.createContext(sandbox);
  vm.runInContext(stripTypeScriptTypes(quickActionFunctions.join('\n')), sandbox);
  const medPack = { label: 'Med Pack', value: '0000ABF9', type: 'ALCH', category: 'Aid', action: 'additem' };
  const ship = { label: 'Abyss Trekker', value: '000F31DB', type: 'GBFM', category: 'Ships & Base Forms', action: 'spawn' };
  const weather = { label: 'Clear', value: '0002B07E', type: 'WTHR', category: 'Weather' };
  const cell = { label: 'The Rock', value: '00016758', type: 'CELL', category: 'Cells', keywords: ['CityAkilaTheRock01'] };
  const location = { label: 'Akila City', value: '00001226', type: 'LCTN', category: 'Locations', keywords: ['CityAkilaLocation'] };
  assert.equal(sandbox.idBrowserAction(ship), null);
  sandbox.requestIdBrowserQuickAction(medPack);
  assert.equal(requested.command, 'player.additem 0000ABF9 1');
  sandbox.requestIdBrowserQuickAction(medPack, 4);
  assert.equal(requested.command, 'player.additem 0000ABF9 4');
  assert.match(requested.definition.description, /Add 4 Med Pack/);
  sandbox.requestIdBrowserQuickAction(weather);
  assert.equal(requested.command, 'fw 0002B07E');
  assert.equal(requested.definition.category, 'World');
  assert.equal(requested.definition.testStatus, 'verified');
  assert.equal(sandbox.idBrowserAction(cell), 'teleport');
  sandbox.requestIdBrowserQuickAction(cell);
  assert.equal(requested.command, 'coc CityAkilaTheRock01');
  assert.equal(requested.definition.category, 'World');
  assert.equal(requested.definition.testStatus, 'verified');
  assert.equal(requested.definition.risk, 'danger');
  assert.equal(sandbox.idBrowserAction(location), 'findcell');
  assert.match(source, /\? 'Change Weather'/);
  assert.match(source, /\? 'Teleport Here'/);
  assert.match(source, /\? 'Find Teleportable Cell'/);
  assert.match(source, /idBrowserRecordTypeFilter = 'CELL'/);
  assert.match(source, /id="id-browser-quantity" type="text"/);
  assert.match(source, /Number\.isInteger\(quantity\) && quantity >= 1 && quantity <= 999999/);
});

test('known-broken command cards are unavailable at both render and execution boundaries', () => {
  assert.equal((commandSource.match(/unavailableReason:/g) ?? []).length, 3);
  assert.match(source, /const unavailable = Boolean\(command\.unavailableReason\)/);
  assert.match(source, /if \(execution\.definition\?\.unavailableReason\)/);
  assert.match(source, /class="availability-popover is-danger" role="tooltip"/);
  assert.match(source, /<code>\$\{escapeHtml\(command\.command\)\}<\/code>/);
  assert.match(source, /const executeControl = unavailable[\s\S]*?<button class="osf-btn osf-btn--osf-accent execute-button" type="button" disabled>Unavailable<\/button>/);
  assert.match(source, /<span class="command-heading-tags">\$\{testTag\}\$\{warningTag\}<\/span>/);
  assert.doesNotMatch(source, /command-availability-tag">UNAVAILABLE/);
  assert.match(styleSource, /\.availability-wrap:hover \.availability-popover/);
  assert.match(styleSource, /\.availability-popover::before/);
  assert.match(styleSource, /\.availability-popover\.is-danger \{ border-top-color: var\(--ccc-danger\); \}/);
});

test('reference scale blocks both native adapters after the direct getter also crashed', () => {
  const start = commandSource.indexOf("id: 'inspect-ref-scale'");
  const end = commandSource.indexOf("\n  {\n    id:", start);
  const commandBlock = commandSource.slice(start, end);
  assert.match(commandBlock, /category: 'Untested',[\s\S]*?captureOutput: true,[\s\S]*?testStatus: 'failed',[\s\S]*?unavailableReason:[\s\S]*?intakeGroup: 'Blocked — Known Crash'/);
  assert.match(directQuerySource, /if \(operation == "getscale" \|\| operation == "getopenstate"\)/);
  assert.doesNotMatch(directQuerySource, /reference->GetScale\(\)/);
});

test('current quest targets are blocked after the console-history path proved impractical', () => {
  const start = commandSource.indexOf("id: 'show-current-quest-targets'");
  const end = commandSource.indexOf("\n  {\n    id:", start);
  const commandBlock = commandSource.slice(start, end);
  assert.match(commandBlock, /category: 'Untested',[\s\S]*?command: 'sqt',[\s\S]*?closeBeforeExecute: true,[\s\S]*?testStatus: 'needs-adjustment',[\s\S]*?unavailableReason:[\s\S]*?intakeGroup: 'Executed — Issues'/);
  assert.doesNotMatch(commandBlock, /captureOutput: true/);
});

test('held-object inspection does not restore the unresolved native event adapter', () => {
  assert.doesNotMatch(commandSource, /id: 'get-player-grabbed-ref'/);
  assert.doesNotMatch(directQuerySource, /operation != "getplayergrabbedref"/);
  assert.doesNotMatch(nativeSource, /TESGrabReleaseEvent|GrabbedObjectTracker/);
});

test('open-state control uses the verified setter with a compact state chooser', () => {
  assert.doesNotMatch(commandSource, /id: 'inspect-open-state'/);
  assert.match(commandSource, /id: 'set-open-state',[\s\S]*?title: 'Open or Close Reference'/);
  assert.match(commandSource, /key: 'state'[\s\S]*?picker: OPEN_STATE_PICKER/);
  assert.match(referenceIdSource, /export const OPEN_STATE_PICKER:[\s\S]*?label: 'Open', value: '1'[\s\S]*?label: 'Closed', value: '0'/);
});

test('Form ID search commands open packaged browsers without native capture or scanning', () => {
  assert.match(commandSource, /id: 'search-form-ids',[\s\S]*?catalogSearch: \{\}/);
  assert.match(commandSource, /id: 'search-form-ids-by-type',[\s\S]*?catalogSearch: \{ recordTypeInput: 'recordType' \}/);
  assert.doesNotMatch(commandSource, /id: 'search-form-ids',[\s\S]*?captureOutput: true[\s\S]*?id: 'search-form-ids-by-type'/);
  assert.match(source, /function openPackagedFormSearch\(definition: CommandDefinition\)/);
  assert.match(source, /if \(recordType === 'QUST'\)/);
  assert.match(source, /entry\.type\.toUpperCase\(\) === idBrowserRecordTypeFilter/);
  assert.match(source, /command\.catalogSearch \? 'Search IDs' : escapeHtml\(command\.executeLabel \?\? 'Execute'\)/);
});

test('command fields can choose packaged item, base, mod, ship, quest, and stage IDs', () => {
  assert.match(commandSource, /const itemFormIdInput =/);
  assert.match(commandSource, /buttonLabel: 'Browse Equipment'/);
  assert.match(commandSource, /buttonLabel: 'Browse Base IDs'/);
  assert.match(commandSource, /buttonLabel: 'Browse Mods'/);
  assert.match(commandSource, /buttonLabel: 'Browse Ships'/);
  assert.equal((commandSource.match(/questIdInput\(\)/g) ?? []).length, 8);
  assert.match(commandSource, /questStageFor: 'questId'/);
  assert.match(source, /function openCatalogPicker\(command: CommandDefinition, input: CommandInput\)/);
  assert.match(source, /function finishCatalogPicker\(value\?: string, label\?: string\)/);
  assert.match(source, /async function openQuestStagePicker\(/);
  assert.match(source, /data-use-id-browser-selection/);
  assert.match(source, /data-use-quest-id=/);
  assert.match(source, /No console command will run\./);
  assert.match(source, /else if \(activeCatalogPicker\) \{\s*finishCatalogPicker\(\);/);
  assert.doesNotMatch(commandSource, /id: 'teleport-player-to-ref',[\s\S]*?browserPicker[\s\S]*?id: 'set-player-position-axis'/);
});

test('effective-total commands use the native preview-and-apply route', () => {
  assert.equal((commandSource.match(/effectiveTotal: true/g) ?? []).length, 8);
  assert.match(source, /apply: false/);
  assert.match(source, /apply: true/);
  assert.match(source, /console\.command-center\.setEffectiveActorValue/);
  assert.match(nativeSource, /calculatedBase = \*desiredTotal - modifierContribution/);
});

test('newly verified carry weight, interior gravity, and actor behavior controls remain available', () => {
  assert.match(commandSource, /id: 'set-carry-weight-total',[\s\S]*?ccc\.seteffectivetotal player CarryWeight \{value\}[\s\S]*?effectiveTotal: true/);
  assert.match(commandSource, /id: 'set-interior-gravity',[\s\S]*?command: 'setgravityscale \{value\}'[\s\S]*?Interior cells only/);
  assert.match(commandSource, /id: 'reevaluate-actor-package',[\s\S]*?command: '\{refId\}\.evp'[\s\S]*?testStatus: 'verified'/);
});

test('Quest Browser contains every extracted base-game and Shattered Space quest stage', () => {
  const entries = [...questBrowserSource.matchAll(/"questId":\s*"([0-9A-F]{8})",\s*"stages":\s*\[([\s\S]*?)\],\s*"source":\s*"([^"]+)"/g)]
    .map((match) => ({
      id: match[1],
      stages: match[2].split(',').map((value) => value.trim()).filter(Boolean).map(Number).filter(Number.isInteger),
      source: match[3],
    }));
  assert.equal(entries.length, 2318);
  assert.equal(entries.reduce((total, entry) => total + entry.stages.length, 0), 16844);
  assert.equal(entries.filter((entry) => entry.source === 'Base Game').length, 2077);
  assert.equal(entries.filter((entry) => entry.source === 'Shattered Space').length, 241);
  assert.equal(new Set(entries.map((entry) => `${entry.source}:${entry.id}`)).size, entries.length);
});

test('Quest Browser exposes native inspections and confirmed state-changing actions', () => {
  assert.match(source, /data-view="quest-browser"/);
  assert.match(source, /quest-browser-card-heading[\s\S]*?<strong>\$\{escapeHtml\(entry\.quest\)\}<\/strong>\$\{flags\}/);
  assert.match(styleSource, /\.quest-browser-card-heading\s*\{[\s\S]*?display:\s*flex;/);
  assert.match(styleSource, /\.quest-browser-card-flags\s*\{[\s\S]*?display:\s*flex;/);
  assert.doesNotMatch(source, /quest-browser-card-body">\s*<div class="quest-browser-meta"/);
  assert.match(source, /data-quest-inspect="history"/);
  assert.doesNotMatch(source, /data-quest-inspect="stage"/);
  assert.match(source, />Inspect Quest State<\/button>/);
  assert.match(source, /data-quest-action="start"/);
  assert.match(source, /data-quest-action="stop"/);
  assert.match(source, /data-quest-action="complete"/);
  assert.match(source, /data-quest-action="reset"/);
  assert.match(source, /verb: 'startquest'/);
  assert.match(source, /verb: 'stopquest'/);
  assert.match(source, /verb: 'completequest'/);
  assert.match(source, /verb: 'resetquest'/);
  assert.match(source, /risk: 'danger'/);
  assert.match(source, /QUEST_BROWSER_PAGE_SIZE = 50/);
  assert.match(source, /ORIGINAL STORY QUEST/);
  assert.match(source, /NEW GAME PLUS VARIANT/);
  assert.match(source, /Command sent:/);
  assert.match(source, /verifyInGame: true/);
});

test('Quest Browser routes GetStage and SQS through the native Papyrus quest reader', () => {
  const recognizedOperations = directQuerySource.match(/if \(operation != "showinventory"([\s\S]*?)\) \{/m)?.[1] ?? '';
  assert.doesNotMatch(recognizedOperations, /getstage/);
  assert.match(source, /console\.command-center\.questRead/);
  assert.match(source, /readQuestValue\(questId, 'currentStage'\)/);
  assert.match(source, /readQuestValue\(questId, 'isStageDone', stage\)/);
  assert.match(nativeSource, /functionName = "GetCurrentStageID"/);
  assert.match(nativeSource, /functionName = "IsStageDone"/);
  assert.match(nativeSource, /DispatchMethodCall\(handle, "Quest", functionName/);
  assert.doesNotMatch(commandSource, /id: 'get-quest-stage',[\s\S]*?captureOutput: true[\s\S]*?id: 'show-quest-stages'/);
  assert.match(source, /Start may not add a visible mission until a stage is activated/);
  assert.match(source, /const openQuestBrowserCards = new Set/);
  assert.match(source, /openQuestBrowserCards\.add\(normalizedQuestId\(questInspectButton\.dataset\.questId\)\)/);
  assert.match(source, /commandList\.scrollTop = preserveScrollTop/);
});

test('inconclusive visual commands remain available while known crash paths are blocked', () => {
  assert.match(commandSource, /id: 'toggle-grass',[\s\S]*?category: 'World',[\s\S]*?testStatus: 'verified'/);
  assert.doesNotMatch(untestedCommandSource, /\['toggle-grass'/);
  assert.match(untestedCommandSource, /const EFFECT_UNCONFIRMED_TOGGLE_IDS = \[[\s\S]*?'toggle-wireframe'[\s\S]*?'toggle-markers'/);
  assert.match(untestedCommandSource, /EFFECT_UNCONFIRMED_TOGGLE_IDS\.includes\(id as string\) \? 'inconclusive' : 'untested'/);
  assert.match(engineCommandSource, /togglewireframe: 'In-game v0\.3\.11 testing produced no visible wireframe effect\.'/);
  assert.match(untestedCommandSource, /id: 'untested-reload-climate',[\s\S]*?unavailableReason:/);
  assert.match(engineCommandSource, /This raw duplicate remains available for advanced testing/);
  assert.match(engineCommandSource, /reloadcurrentclimate:[\s\S]*?toggledecalrendering:/);
  assert.match(engineCommandSource, /DX12 render graph and sky-occlusion render passes/);
  assert.match(engineCommandSource, /unavailableReason: knownCrashReason/);
});

test('first-run welcome guide is persistent and remains available from contextual Help', () => {
  assert.match(source, /STORAGE_WELCOME_SEEN/);
  assert.match(source, /id="open-help"[^>]*>Help<\/button>/);
  assert.match(source, /id="welcome-backdrop"/);
  assert.match(source, /id="welcome-start"[^>]*>Start Exploring<\/button>/);
  assert.match(source, /id="help-welcome"[^>]*>First-time Overview<\/button>/);
  assert.match(source, /if \(!welcomeHasBeenSeen\(\)\) openWelcome\(\)/);
});

test('Help provides a dedicated guide for every major page type', () => {
  assert.match(source, /const HELP_PAGES: Record<HelpPageId, HelpPage>/);
  for (const page of ['recent', 'favorites', 'categories', 'id-browser', 'quest-browser', 'custom', 'activity']) {
    assert.match(source, new RegExp(`(?:^|\\n)  ['"]?${page.replace('-', '\\-')}['"]?: \\{`));
  }
  assert.match(source, /function activeHelpPageId\(\): HelpPageId/);
  assert.match(source, /openHelpButton\.addEventListener\('click', openHelp\)/);
  assert.match(source, /helpBackdrop\.hidden = false/);
});

test('searching health discovers the player actor-value inspector', () => {
  assert.match(commandSource, /id: 'inspect-player-actor-value',[\s\S]*?tags: \[[^\]]*'health'/);
});

test('verified sky and closest-actor commands leave prepared intake', () => {
  assert.match(commandSource, /id: 'toggle-sky',[\s\S]*?command: 'ts',[\s\S]*?testStatus: 'verified'/);
  assert.match(commandSource, /id: 'select-closest-actor',[\s\S]*?command: 'PickClosestActor',[\s\S]*?testStatus: 'verified'/);
  assert.doesNotMatch(untestedCommandSource, /\['toggle-sky'/);
  assert.doesNotMatch(untestedCommandSource, /id: 'untested-pick-closest-actor'/);
  assert.match(engineCommandSource, /togglecollisiongeometry: 'In-game v0\.3\.11 testing produced no visible collision-geometry overlay\.'/);
  assert.match(engineCommandSource, /setcamerafov: 'In-game v0\.3\.11 testing at 90 and 75 degrees produced no visible field-of-view change\.'/);
  assert.match(engineCommandSource, /showsubtitle: 'In-game v0\.3\.11 testing produced no visible subtitle override\.'/);
});

test('Quest stage history marks completed, current, and unset stage buttons', () => {
  assert.match(source, /const questProgressSnapshots = new Map/);
  assert.match(source, /questProgressSnapshots\.set\(questId, \{ currentStage, completedStages \}\)/);
  assert.match(source, /quest-stage-button--current/);
  assert.match(source, /quest-stage-button--done/);
  assert.match(source, /quest-stage-button--unset/);
  assert.match(styleSource, /\.quest-stage-button--current/);
  assert.match(styleSource, /\.quest-stage-button--done/);
});

test('verified quest reads remain available and unusable ship spawning is disabled', () => {
  assert.match(commandSource, /id: 'get-quest-stage',[\s\S]*?testStatus: 'verified'/);
  assert.match(commandSource, /id: 'show-quest-stages',[\s\S]*?testStatus: 'verified'/);
  assert.match(commandSource, /id: 'spawn-ship',[\s\S]*?category: 'Untested'[\s\S]*?testStatus: 'failed'[\s\S]*?unavailableReason:[\s\S]*?intakeGroup: 'Executed — Issues'/);
  assert.match(commandSource, /boarding ramp inaccessible/);
});
