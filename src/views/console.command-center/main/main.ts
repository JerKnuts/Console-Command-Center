import './style.css';
import { installControllerSupport } from './controller-support';
import { CATEGORY_ORDER, COMMANDS, type CommandDefinition, type CommandInput } from './commands';
import {
  ID_BROWSER_TOTAL,
  QUEST_BROWSER_CATEGORY_ORDER,
  QUEST_BROWSER_STAGE_TOTAL,
  QUEST_BROWSER_TOTAL,
} from './catalog-metadata';
import type { QuestBrowserEntry } from './quest-browser';
import type { ReferenceIdPicker } from './reference-ids';
import {
  CURATED_ID_CATALOG,
  ID_BROWSER_CATEGORIES,
  mergeGeneratedIdCatalog,
  type IdCatalogEntry,
} from './id-catalog';

type ViewMode = 'favorites' | 'recent' | 'quest-browser' | 'activity' | 'custom' | string;

type HelpPageId = 'recent' | 'favorites' | 'categories' | 'id-browser' | 'quest-browser' | 'custom' | 'activity';

type HelpPage = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; text: string }>;
  note?: string;
};

type PendingExecution = {
  command: string;
  commands?: string[];
  definition?: CommandDefinition;
  rememberRecent?: boolean;
  effectiveTotal?: EffectiveTotalRequest;
};

type EffectiveTotalRequest = {
  target: string;
  actorValue: string;
  desiredTotal: number;
};

type ActiveIdPicker = {
  commandId: string;
  inputKey: string;
  picker: ReferenceIdPicker;
};

type ActiveCatalogPicker = {
  browser: 'id' | 'quest';
  commandId: string;
  inputKey: string;
  allowedTypes: string[];
  allowedCategories: string[];
  returnView: ViewMode;
  returnQuery: string;
  values: Record<string, string>;
};

type ActivityEntry = {
  id: string;
  timestamp: number;
  command: string;
  label: string;
  category: string;
  outcome: 'success' | 'error';
  message: string;
};

type SavedCustomCommand = {
  id: string;
  name: string;
  commands: string;
  updatedAt: number;
};

type PingReply = {
  ok: boolean;
  backend: string;
  build?: string;
  executor?: string;
  runtime?: string;
  testedRuntime?: string;
  runtimeSupported?: boolean;
};

type ExecuteReply = {
  ok: boolean;
  command: string;
};

type QueryReply = {
  ok: boolean;
  command: string;
  output: string;
};

type QuestReadOperation = 'currentStage' | 'isRunning' | 'isCompleted' | 'isStageDone';

type QuestReadReply = {
  ok: boolean;
  questId: string;
  operation: QuestReadOperation;
  stage?: number;
  value: number | boolean;
};

type QuestProgressSnapshot = {
  currentStage: number;
  completedStages: Set<number>;
};

type EffectiveTotalReply = EffectiveTotalRequest & {
  ok: boolean;
  applied: boolean;
  currentBase: number;
  currentEffective: number;
  modifierContribution: number;
  calculatedBase: number;
  resultingEffective: number;
  command: string;
};

type InventoryResultRow = {
  type: string;
  id: string;
  count: number;
  name: string;
};

type CloseReply = {
  ok: boolean;
};

const app = document.querySelector('#app');
if (!(app instanceof HTMLElement)) throw new Error('Missing #app element');

const STORAGE_FAVORITES = 'consoleCommandCenter.favorites';
const STORAGE_RECENT = 'consoleCommandCenter.recent';
const STORAGE_ACTIVITY = 'consoleCommandCenter.activity';
const STORAGE_CUSTOM_COMMANDS = 'consoleCommandCenter.customCommands';
const STORAGE_WELCOME_SEEN = 'consoleCommandCenter.welcomeSeen.v1';
const MAX_RECENT = 10;
const MAX_ACTIVITY = 100;
const MAX_CUSTOM_BATCH_COMMANDS = 100;
const MAX_CUSTOM_COMMAND_LENGTH = 1024;
const MAX_SAVED_CUSTOM_COMMANDS = 100;
const MAX_CUSTOM_COMMAND_NAME_LENGTH = 50;
const ENGINE_COMMAND_LIBRARY_TOTAL = 1505;
const UNTESTED_COMMAND_PAGE_SIZE = 100;
const CONSOLE_COMMAND_CENTER_VERSION = '1.1.0';

const HELP_PAGES: Record<HelpPageId, HelpPage> = {
  recent: {
    eyebrow: 'RECENT COMMANDS HELP',
    title: 'Return to commands you just used',
    intro: 'Recent keeps the last ten command cards you successfully sent from CCC.',
    sections: [
      { title: 'RUN AGAIN', text: 'Review the inputs and warnings on a recent card, then use its action button to run it again.' },
      { title: 'KEEP A COMMAND', text: 'Select the star on a card to keep it in Favorites after it leaves the recent list.' },
      { title: 'CLEAR THE LIST', text: 'Clear Recent removes the history shown here. It does not reverse commands or remove Activity Log entries.' },
    ],
  },
  favorites: {
    eyebrow: 'FAVORITES HELP',
    title: 'Keep useful commands close',
    intro: 'Favorites collects the command cards you mark with a star.',
    sections: [
      { title: 'ADD FAVORITES', text: 'Select the star on any established or WIP command card. The filled star means it is saved here.' },
      { title: 'USE SAVED CARDS', text: 'Inputs, warnings, confirmation, and execution work the same way they do in the original category.' },
      { title: 'REMOVE FAVORITES', text: 'Select the star again to remove a card. Removing it does not affect Recent or Activity Log.' },
    ],
  },
  categories: {
    eyebrow: 'COMMAND CATEGORIES HELP',
    title: 'Find and run a command',
    intro: 'Categories organize prepared Starfield commands by what they affect.',
    sections: [
      { title: 'SEARCH', text: 'Search by command name, purpose, console syntax, or tag. The search covers every established category.' },
      { title: 'PREPARE', text: 'Fill the visible fields or use a Browse button when CCC has matching IDs. Helper text explains the expected value.' },
      { title: 'REVIEW AND RUN', text: 'Caution and Danger labels explain meaningful risks. CCC shows the completed command before execution.' },
      { title: 'CONTROLLER', text: 'Use the D-pad or left stick to move, A to select, B to go back, and the right stick to scroll. Press A on a text field to open the controller keyboard.' },
      { title: 'WIP COMMANDS', text: 'WIP separates commands by test result. Use uncertain commands only on a disposable or backed-up save.' },
    ],
    note: 'Make a manual save before changing quests, NPCs, ships, or important world state.',
  },
  'id-browser': {
    eyebrow: 'ID BROWSER HELP',
    title: 'Find packaged Form IDs',
    intro: 'ID Browser searches the records included with CCC without scanning the live game.',
    sections: [
      { title: 'SEARCH AND FILTER', text: 'Search by name, Form ID, type, or category. Open a category to browse its matching records.' },
      { title: 'SELECT A RECORD', text: 'Choose a tile to view its details and the actions CCC can safely prepare for that record type.' },
      { title: 'COMMAND PICKERS', text: 'When a command sends you here, only compatible records appear. Selecting one returns its Form ID to the command.' },
      { title: 'EXPANSION RECORDS', text: 'Shattered Space entries are labeled and require that expansion. Other installed mods are not scanned automatically.' },
    ],
  },
  'quest-browser': {
    eyebrow: 'QUEST BROWSER HELP',
    title: 'Inspect and repair quest progress',
    intro: 'Quest Browser contains packaged quest records and known stage indexes from the base game and Shattered Space.',
    sections: [
      { title: 'FIND A QUEST', text: 'Search by quest name, Editor ID, Form ID, source, or stage number, then open its group and quest card.' },
      { title: 'INSPECT QUEST STATE', text: 'Inspect reads the current stage and completed-stage history without changing the save.' },
      { title: 'CHANGE QUEST STATE', text: 'Start, Stop, Complete, Reset, and stage actions require confirmation because they can skip scripts, scenes, rewards, or prerequisites.' },
    ],
    note: 'Keep a backup save before repairing a quest. Prefer the smallest stage change that moves the stuck objective forward.',
  },
  custom: {
    eyebrow: 'CUSTOM COMMAND HELP',
    title: 'Build and reuse command batches',
    intro: 'Custom Command runs raw Starfield console commands that are not represented by prepared cards.',
    sections: [
      { title: 'ENTER COMMANDS', text: 'Enter one command per line. Empty lines are ignored, and a batch can contain up to 100 commands.' },
      { title: 'REVIEW THE BATCH', text: 'Review Commands shows the exact lines before CCC runs them in order. Execution stops when a command reports an error.' },
      { title: 'SAVE A WORKFLOW', text: 'Name the current batch and save it for reuse. Load, update, or delete saved entries from the right side of the screen.' },
    ],
    note: 'Raw commands may have undocumented effects. Save the game before experimenting with syntax you do not recognize.',
  },
  activity: {
    eyebrow: 'ACTIVITY LOG HELP',
    title: 'Review what CCC executed',
    intro: 'Activity Log keeps recent command outcomes and captured inspection results.',
    sections: [
      { title: 'CHECK RESULTS', text: 'Each entry records the command, time, outcome, and any readable result or error returned to CCC.' },
      { title: 'REOPEN OUTPUT', text: 'Inspection entries can reopen their saved Results window without running the command a second time.' },
      { title: 'CLEAR THE LOG', text: 'Clear Log removes the saved history from CCC. It does not undo commands or change the game state.' },
    ],
  },
};

let activeView: ViewMode = 'recent';
let query = '';
let untestedQuery = '';
let favorites = readStringArray(STORAGE_FAVORITES);
let recent = readStringArray(STORAGE_RECENT);
let activityLog = readActivityLog();
let savedCustomCommands = readSavedCustomCommands();
let pendingExecution: PendingExecution | null = null;
let activeIdPicker: ActiveIdPicker | null = null;
let activeCatalogPicker: ActiveCatalogPicker | null = null;
let nativeBackendReady = false;
let idCatalog: IdCatalogEntry[] = CURATED_ID_CATALOG;
let idCatalogLoaded = false;
let idCatalogLoading: Promise<void> | null = null;
let questBrowserEntries: QuestBrowserEntry[] = [];
let questBrowserLoaded = false;
let questBrowserLoading: Promise<void> | null = null;
let engineCommandLibraryLoaded = false;
let engineCommandLibraryLoading: Promise<void> | null = null;
let idBrowserCategory = 'all';
let idBrowserRecordTypeFilter = '';
let idBrowserSelected: IdCatalogEntry | null = null;
let idBrowserQuantity = 1;
const idBrowserOpenCategories = new Set<string>();
const idBrowserVisibleCounts = new Map<string, number>();
const ID_BROWSER_PAGE_SIZE = 100;
let openQuestBrowserGroup: string | null = null;
const questBrowserPages = new Map<string, number>();
const questProgressSnapshots = new Map<string, QuestProgressSnapshot>();
const openQuestBrowserCards = new Set<string>();
const QUEST_BROWSER_PAGE_SIZE = 50;
let openUntestedGroup: string | null = null;
const untestedGroupVisibleCounts = new Map<string, number>();

app.innerHTML = `
  <main class="command-center-shell">
    <header class="topbar">
      <div class="brand-block">
        <div class="brand-mark" aria-hidden="true">CCC</div>
        <h1>Console Command Center</h1>
      </div>
      <div class="topbar-actions">
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="open-help" type="button">Help</button>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="close-view" type="button">Close</button>
      </div>
    </header>

    <div class="osf-tricolor brand-stripe" aria-hidden="true"></div>

    <section class="workspace">
      <aside class="sidebar" aria-label="Command categories">
        <nav id="navigation" class="navigation"></nav>
      </aside>

      <section class="content">
        <div class="content-toolbar">
          <div>
            <p class="osf-eyebrow" id="section-kicker">COMMANDS</p>
            <h2 id="section-title">Recent Commands</h2>
          </div>
          <label class="search-wrap" id="search-wrap">
            <span class="osf-eyebrow">SEARCH</span>
            <span class="search-field"><input class="osf-input" id="search" type="search" placeholder="Search name, command, tag..." autocomplete="off"><button class="search-clear" id="search-clear" type="button" aria-label="Clear search" title="Clear search" hidden>×</button></span>
          </label>
        </div>

        <div class="command-summary">
          <span id="result-count">0 commands</span>
          <span class="summary-separator">/</span>
          <span>Commands may affect achievements or save-game state.</span>
          <span class="summary-separator">/</span>
          <span>Controller: D-pad / left stick navigate, A select, B back, right stick scroll.</span>
        </div>

        <div id="command-list" class="command-list" aria-live="polite"></div>
        <div id="custom-panel" class="custom-panel" hidden></div>
      </section>
    </section>

    <nav class="utility-nav-bar" aria-label="Tools and utilities">
      <button class="nav-button nav-button--ids" type="button" data-view="id-browser">
        <span>ID Browser</span><span class="nav-count">${ID_BROWSER_TOTAL}</span>
      </button>
      <button class="nav-button nav-button--quest" type="button" data-view="quest-browser">
        <span>Quest Browser</span><span class="nav-count">${QUEST_BROWSER_TOTAL}</span>
      </button>
      <button class="nav-button nav-button--custom" type="button" data-view="custom">
        <span>Custom Command</span><span class="nav-count">&gt;_</span>
      </button>
      <button class="nav-button nav-button--utility" type="button" data-view="activity">
        <span>Activity Log</span><span class="nav-count" id="activity-nav-count">0</span>
      </button>
    </nav>

    <footer class="statusbar">
      <div class="status-primary"><span class="osf-eyebrow">STATUS</span><span id="status">Ready.</span></div>
      <div class="status-versions" aria-label="Version information">
        <span class="version-item"><span class="version-label">CCC</span><span>v${CONSOLE_COMMAND_CENTER_VERSION}</span></span>
        <span class="version-separator">//</span>
        <span class="version-item"><span class="version-label">STARFIELD</span><span id="footer-starfield-version">...</span></span>
        <span class="version-separator">//</span>
        <span class="version-item"><span class="version-label">OSF UI</span><span id="footer-osf-version">...</span></span>
        <span class="version-separator">//</span>
        <span class="version-item"><span class="version-label">NATIVE</span><span id="footer-native-status">CHECKING</span></span>
      </div>
    </footer>
  </main>

  <div class="id-picker-backdrop" id="id-picker-backdrop" hidden>
    <section class="id-picker-dialog osf-card" role="dialog" aria-modal="true" aria-labelledby="id-picker-title">
      <div class="osf-tricolor popup-stripe" aria-hidden="true"></div>
      <div class="id-picker-head">
        <div>
          <p class="osf-eyebrow">QUICK CHOICES</p>
          <h2 id="id-picker-title">Select Reference ID</h2>
        </div>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="id-picker-close" type="button">Close</button>
      </div>
      <label class="id-picker-search-wrap">
        <span class="osf-eyebrow">SEARCH</span>
        <span class="search-field"><input class="osf-input" id="id-picker-search" type="search" autocomplete="off" placeholder="Search name or ID..."><button class="search-clear" id="id-picker-search-clear" type="button" aria-label="Clear picker search" title="Clear search" hidden>×</button></span>
      </label>
      <div class="id-picker-summary" id="id-picker-summary">0 IDs</div>
      <div class="osf-tricolor popup-stripe popup-stripe--picker-divider" aria-hidden="true"></div>
      <div class="id-picker-results" id="id-picker-results" aria-live="polite"></div>
      <div class="id-picker-footer">
        <span>Choose an entry to fill the command field. Manual ID entry remains available.</span>
        <button class="osf-btn" id="id-picker-cancel" type="button">Cancel</button>
      </div>
    </section>
  </div>

  <div class="welcome-backdrop" id="welcome-backdrop" hidden>
    <section class="welcome-dialog osf-card" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div class="osf-tricolor popup-stripe" aria-hidden="true"></div>
      <p class="osf-eyebrow">WELCOME TO CCC</p>
      <h2 id="welcome-title">Console commands, made easier</h2>
      <p class="welcome-intro">Find and run Starfield console commands without memorizing their syntax.</p>
      <div class="welcome-features">
        <article><strong>SEARCH COMMANDS</strong><span>Find everyday fixes, cheats, and player, world, target, or ship tools.</span></article>
        <article><strong>BROWSE IDS</strong><span>Find items, perks, powers, NPCs, weather, cells, and locations.</span></article>
        <article><strong>INSPECT QUESTS</strong><span>Read quest progress and carefully repair stuck stages.</span></article>
        <article><strong>SAVE WORKFLOWS</strong><span>Reuse favorites, recent actions, and saved custom command batches.</span></article>
        <article><strong>USE A CONTROLLER</strong><span>Navigate with the D-pad or left stick. Press A on a field for controller text entry.</span></article>
      </div>
      <p class="welcome-save-note"><strong>Before changing quests or important game state:</strong> make a manual save.</p>
      <div class="welcome-actions">
        <span>Help opens a guide for the page you are viewing.</span>
        <button class="osf-btn osf-btn--osf-accent" id="welcome-start" type="button">Start Exploring</button>
      </div>
    </section>
  </div>

  <div class="help-backdrop" id="help-backdrop" hidden>
    <section class="help-dialog osf-card" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div class="osf-tricolor popup-stripe" aria-hidden="true"></div>
      <header class="help-head">
        <div><p class="osf-eyebrow" id="help-eyebrow">PAGE HELP</p><h2 id="help-title">Help</h2></div>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="help-close" type="button">Close</button>
      </header>
      <p class="help-intro" id="help-intro"></p>
      <div class="help-sections" id="help-sections"></div>
      <p class="help-note" id="help-note" hidden></p>
      <div class="help-actions">
        <button class="osf-btn" id="help-welcome" type="button">First-time Overview</button>
        <button class="osf-btn osf-btn--osf-accent" id="help-done" type="button">Done</button>
      </div>
    </section>
  </div>

  <div class="confirm-backdrop" id="confirm-backdrop" hidden>
    <section class="confirm-dialog osf-card" id="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div class="osf-tricolor popup-stripe" aria-hidden="true"></div>
      <p class="osf-eyebrow confirm-label" id="confirm-label">CONFIRM</p>
      <h2 id="confirm-title">Confirm execution</h2>
      <p id="confirm-message"></p>
      <div class="confirm-command"><span>COMMAND</span><code id="confirm-command"></code></div>
      <div class="confirm-actions">
        <button class="osf-btn" id="confirm-cancel" type="button">Cancel</button>
        <button class="osf-btn osf-btn--osf-accent" id="confirm-run" type="button">Execute</button>
      </div>
    </section>
  </div>
`;

const resultsDialog = document.createElement('dialog');
resultsDialog.className = 'results-dialog';
resultsDialog.setAttribute('aria-labelledby', 'results-title');
resultsDialog.innerHTML = `
  <div class="osf-tricolor popup-stripe" aria-hidden="true"></div>
  <header class="results-head"><div><p class="osf-eyebrow">INSPECTION RESULTS</p><h2 id="results-title"></h2></div>
    <button class="osf-btn osf-btn--sm osf-btn--ghost" id="results-close" type="button">Close</button></header>
  <code id="results-command"></code>
  <p id="results-status" role="status"></p>
  <div class="results-id-actions" id="results-id-actions" hidden></div>
  <div class="inventory-results-toolbar" id="inventory-results-toolbar" hidden>
    <label><span class="osf-eyebrow">SEARCH INVENTORY</span><span class="search-field"><input class="osf-input" id="inventory-results-search" type="search" autocomplete="off" placeholder="Search item name, type, or Form ID..."><button class="search-clear" id="inventory-results-search-clear" type="button" aria-label="Clear inventory search" title="Clear search" hidden>×</button></span></label>
    <label><span class="osf-eyebrow">SORT</span><select class="osf-input" id="inventory-results-sort"><option value="type">Type, then name</option><option value="name">Name</option><option value="id">Form ID</option><option value="count">Quantity, highest first</option></select></label>
  </div>
  <div class="inventory-results" id="inventory-results" hidden></div>
  <pre id="results-output" tabindex="0" aria-label="Command output"></pre>
  <footer id="results-footer">Results are saved in Activity Log. Select text to copy it. Escape closes this window.</footer>`;
document.body.append(resultsDialog);
const resultsTitle = requiredElement('#results-title', HTMLElement);
const resultsCommand = requiredElement('#results-command', HTMLElement);
const resultsStatus = requiredElement('#results-status', HTMLElement);
const resultsIdActions = requiredElement('#results-id-actions', HTMLElement);
const resultsOutput = requiredElement('#results-output', HTMLElement);
const inventoryResultsToolbar = requiredElement('#inventory-results-toolbar', HTMLElement);
const inventoryResultsSearch = requiredElement('#inventory-results-search', HTMLInputElement);
const inventoryResultsSearchClear = requiredElement('#inventory-results-search-clear', HTMLButtonElement);
const inventoryResultsSort = requiredElement('#inventory-results-sort', HTMLSelectElement);
const inventoryResults = requiredElement('#inventory-results', HTMLElement);
const resultsFooter = requiredElement('#results-footer', HTMLElement);
let inventoryResultRows: InventoryResultRow[] = [];

function syncSearchClear(input: HTMLInputElement, button: HTMLButtonElement): void {
  button.hidden = input.value.length === 0;
}

function clearSearchInput(input: HTMLInputElement): void {
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
}

requiredElement('#results-close', HTMLButtonElement).addEventListener('click', () => resultsDialog.close());
// Handle Escape here so it cannot also close the entire CCC view.
resultsDialog.addEventListener('keydown', (event) => {
  event.stopPropagation();
  if (event.key === 'Escape') {
    event.preventDefault();
    resultsDialog.close();
  }
});

function showResults(title: string, command: string, output: string, state: 'loading' | 'ready' | 'error'): void {
  resultsTitle.textContent = title;
  resultsCommand.textContent = command;
  resultsStatus.textContent = state === 'loading' ? 'Reading game data…'
    : state === 'error' ? 'Inspection failed — no value was verified.'
    : `${output.length.toLocaleString()} characters • saved in Activity Log`;
  resultsStatus.dataset.state = state;
  const isInventory = state === 'ready' && output.startsWith('CCC_INVENTORY_V1\n');
  const resultIds = state === 'ready' && !isInventory ? extractResultIds(output) : [];
  resultsIdActions.hidden = resultIds.length === 0;
  resultsIdActions.innerHTML = resultIds.map((id) => `<button class="osf-btn osf-btn--sm" type="button" data-copy-result-id="${id}">Copy ID <code>${id}</code></button>`).join('');
  inventoryResultRows = isInventory ? parseInventoryResults(output) : [];
  inventoryResultsToolbar.hidden = !isInventory;
  inventoryResults.hidden = !isInventory;
  resultsOutput.hidden = isInventory;
  resultsFooter.textContent = isInventory
    ? 'Use Copy ID beside any item. Results are saved in Activity Log. Escape closes this window.'
    : 'Results are saved in Activity Log. Select text to copy it. Escape closes this window.';
  if (isInventory) {
    inventoryResultsSearch.value = '';
    syncSearchClear(inventoryResultsSearch, inventoryResultsSearchClear);
    inventoryResultsSort.value = 'type';
    renderInventoryResults();
  } else {
    resultsOutput.textContent = output;
    resultsOutput.scrollTop = 0;
  }
  if (!resultsDialog.open) resultsDialog.showModal();
}

function extractResultIds(output: string): string[] {
  return [...new Set(output.match(/\b[0-9A-F]{8}\b/gi)?.map((id) => id.toUpperCase()) ?? [])];
}

const INVENTORY_TYPE_LABELS: Record<string, string> = {
  WEAP: 'Weapons', ARMO: 'Armor & Apparel', AMMO: 'Ammo', AID: 'Aid & Consumables',
  BOOK: 'Books', NOTE: 'Notes', KEY: 'Keys', MISC: 'Miscellaneous & Resources',
  INGR: 'Ingredients', SPEL: 'Spells & Powers', OTHER: 'Other',
};

function parseInventoryResults(output: string): InventoryResultRow[] {
  return output.split(/\r?\n/).slice(2).flatMap((line) => {
    if (!line || line.startsWith('SUMMARY\t')) return [];
    const [type, id, countText, ...nameParts] = line.split('\t');
    const count = Number(countText);
    if (!type || !/^[0-9A-F]{8}$/i.test(id ?? '') || !Number.isFinite(count) || nameParts.length === 0) return [];
    return [{ type, id: id.toUpperCase(), count, name: nameParts.join(' ') }];
  });
}

function renderInventoryResults(): void {
  const term = inventoryResultsSearch.value.trim().toLowerCase();
  const sort = inventoryResultsSort.value;
  const rows = inventoryResultRows.filter((row) => !term || [row.name, row.id, row.type, INVENTORY_TYPE_LABELS[row.type] ?? 'Other']
    .some((value) => value.toLowerCase().includes(term)));
  rows.sort((a, b) => sort === 'count' ? b.count - a.count || a.name.localeCompare(b.name)
    : sort === 'id' ? a.id.localeCompare(b.id)
      : sort === 'name' ? a.name.localeCompare(b.name)
        : (INVENTORY_TYPE_LABELS[a.type] ?? a.type).localeCompare(INVENTORY_TYPE_LABELS[b.type] ?? b.type) || a.name.localeCompare(b.name));
  const renderRow = (row: InventoryResultRow) => `<article class="inventory-result-row"><span class="inventory-result-name">${escapeHtml(row.name)}</span><span class="inventory-result-type">${escapeHtml(INVENTORY_TYPE_LABELS[row.type] ?? row.type)}</span><strong class="inventory-result-count">${row.count.toLocaleString()}</strong><code>${escapeHtml(row.id)}</code><button class="osf-btn osf-btn--sm" type="button" data-copy-inventory-id="${escapeHtml(row.id)}">Copy ID</button></article>`;
  let contents = '';
  if (sort === 'type') {
    const groups = new Map<string, InventoryResultRow[]>();
    for (const row of rows) {
      const group = groups.get(row.type) ?? [];
      group.push(row);
      groups.set(row.type, group);
    }
    contents = [...groups].map(([type, group]) => `<details class="inventory-type-group"${term ? ' open' : ''}><summary><span>${escapeHtml(INVENTORY_TYPE_LABELS[type] ?? type)}</span><span>${group.length.toLocaleString()} ${group.length === 1 ? 'entry' : 'entries'}</span></summary><div class="inventory-type-contents">${group.map(renderRow).join('')}</div></details>`).join('');
  } else {
    contents = rows.map(renderRow).join('');
  }
  inventoryResults.innerHTML = `<div class="inventory-results-summary">${rows.length.toLocaleString()} of ${inventoryResultRows.length.toLocaleString()} entries</div>`
    + (contents || '<div class="id-picker-empty"><strong>No matching inventory entries</strong><span>Try a broader name, type, or Form ID.</span></div>');
}

async function copyResultId(id: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(id);
    else {
      const temporary = document.createElement('textarea');
      temporary.value = id;
      temporary.style.position = 'fixed';
      temporary.style.opacity = '0';
      document.body.append(temporary);
      temporary.select();
      if (!document.execCommand('copy')) throw new Error('Copy command was rejected');
      temporary.remove();
    }
    setStatus(`Copied Form ID ${id}.`, 'success');
  } catch {
    setStatus(`Could not access the clipboard. Select this ID manually: ${id}`, 'error');
  }
}

inventoryResultsSearch.addEventListener('input', () => {
  syncSearchClear(inventoryResultsSearch, inventoryResultsSearchClear);
  renderInventoryResults();
});
inventoryResultsSearchClear.addEventListener('click', () => clearSearchInput(inventoryResultsSearch));
inventoryResultsSearch.addEventListener('click', () => inventoryResultsSearch.select());
inventoryResultsSort.addEventListener('change', renderInventoryResults);
inventoryResults.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy-inventory-id]');
  if (button?.dataset.copyInventoryId) void copyResultId(button.dataset.copyInventoryId);
});
resultsIdActions.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy-result-id]');
  if (button?.dataset.copyResultId) void copyResultId(button.dataset.copyResultId);
});

function requiredElement<T extends Element>(selector: string, kind: { new(): T }): T {
  const element = document.querySelector(selector);
  if (!(element instanceof kind)) throw new Error('Missing ' + selector);
  return element;
}

const navigation = requiredElement('#navigation', HTMLElement);
const searchWrap = requiredElement('#search-wrap', HTMLElement);
const search = requiredElement('#search', HTMLInputElement);
const searchClear = requiredElement('#search-clear', HTMLButtonElement);
const sectionKicker = requiredElement('#section-kicker', HTMLElement);
const sectionTitle = requiredElement('#section-title', HTMLElement);
const resultCount = requiredElement('#result-count', HTMLElement);
const commandList = requiredElement('#command-list', HTMLElement);
const customPanel = requiredElement('#custom-panel', HTMLElement);
const status = requiredElement('#status', HTMLElement);
const footerOsfVersion = requiredElement('#footer-osf-version', HTMLElement);
const footerStarfieldVersion = requiredElement('#footer-starfield-version', HTMLElement);
const footerNativeStatus = requiredElement('#footer-native-status', HTMLElement);
const closeView = requiredElement('#close-view', HTMLButtonElement);
const openHelpButton = requiredElement('#open-help', HTMLButtonElement);
const welcomeBackdrop = requiredElement('#welcome-backdrop', HTMLElement);
const welcomeStart = requiredElement('#welcome-start', HTMLButtonElement);
const helpBackdrop = requiredElement('#help-backdrop', HTMLElement);
const helpEyebrow = requiredElement('#help-eyebrow', HTMLElement);
const helpTitle = requiredElement('#help-title', HTMLElement);
const helpIntro = requiredElement('#help-intro', HTMLElement);
const helpSections = requiredElement('#help-sections', HTMLElement);
const helpNote = requiredElement('#help-note', HTMLElement);
const helpClose = requiredElement('#help-close', HTMLButtonElement);
const helpWelcome = requiredElement('#help-welcome', HTMLButtonElement);
const helpDone = requiredElement('#help-done', HTMLButtonElement);
const idPickerBackdrop = requiredElement('#id-picker-backdrop', HTMLElement);
const idPickerTitle = requiredElement('#id-picker-title', HTMLElement);
const idPickerSearch = requiredElement('#id-picker-search', HTMLInputElement);
const idPickerSearchClear = requiredElement('#id-picker-search-clear', HTMLButtonElement);
const idPickerSummary = requiredElement('#id-picker-summary', HTMLElement);
const idPickerResults = requiredElement('#id-picker-results', HTMLElement);
const idPickerClose = requiredElement('#id-picker-close', HTMLButtonElement);
const idPickerCancel = requiredElement('#id-picker-cancel', HTMLButtonElement);
const confirmBackdrop = requiredElement('#confirm-backdrop', HTMLElement);
const confirmDialog = requiredElement('#confirm-dialog', HTMLElement);
const confirmLabel = requiredElement('#confirm-label', HTMLElement);
const confirmTitle = requiredElement('#confirm-title', HTMLElement);
const confirmMessage = requiredElement('#confirm-message', HTMLElement);
const confirmCommand = requiredElement('#confirm-command', HTMLElement);
const confirmRun = requiredElement('#confirm-run', HTMLButtonElement);
const confirmCancel = requiredElement('#confirm-cancel', HTMLButtonElement);

function readStringArray(key: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((entry): entry is string => typeof entry === 'string'))]
      : [];
  } catch {
    return [];
  }
}

function writeStringArray(key: string, values: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // The in-game webview may deny storage in unusual configurations. The
    // current session still works even if persistence is unavailable.
  }
}

function readSavedCustomCommands(): SavedCustomCommand[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_COMMANDS) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is SavedCustomCommand => {
      if (!entry || typeof entry !== 'object') return false;
      const value = entry as Partial<SavedCustomCommand>;
      return typeof value.id === 'string'
        && typeof value.name === 'string'
        && typeof value.commands === 'string'
        && typeof value.updatedAt === 'number';
    }).slice(0, MAX_SAVED_CUSTOM_COMMANDS);
  } catch {
    return [];
  }
}

function writeSavedCustomCommands(): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_COMMANDS, JSON.stringify(savedCustomCommands));
  } catch {
    // Saved commands remain available for the current session if persistent
    // storage is unavailable in the in-game webview.
  }
}


function readActivityLog(): ActivityEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_ACTIVITY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is ActivityEntry => {
      if (!entry || typeof entry !== 'object') return false;
      const value = entry as Partial<ActivityEntry>;
      return typeof value.id === 'string'
        && typeof value.timestamp === 'number'
        && typeof value.command === 'string'
        && typeof value.label === 'string'
        && typeof value.category === 'string'
        && (value.outcome === 'success' || value.outcome === 'error')
        && typeof value.message === 'string';
    }).slice(0, MAX_ACTIVITY);
  } catch {
    return [];
  }
}

function writeActivityLog(): void {
  try {
    localStorage.setItem(STORAGE_ACTIVITY, JSON.stringify(activityLog));
  } catch {
    // Logging is helpful, but command execution should still work if the
    // in-game webview cannot persist local storage.
  }
}

function addActivity(execution: PendingExecution, outcome: 'success' | 'error', message: string): void {
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    command: execution.command.trim(),
    label: execution.definition?.title ?? 'Custom Command',
    category: execution.definition?.category ?? 'Custom',
    outcome,
    message,
  };
  activityLog = [entry, ...activityLog].slice(0, MAX_ACTIVITY);
  // Large inventory snapshots should not exhaust the webview's storage quota.
  let retainedCharacters = activityLog.reduce((total, item) => total + item.message.length, 0);
  while (retainedCharacters > 1_000_000 && activityLog.length > 1) {
    retainedCharacters -= activityLog.pop()!.message.length;
  }
  writeActivityLog();
  if (activeView === 'activity') render();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);
}

function categoryCount(category: string): number {
  const loaded = COMMANDS.filter((command) => command.category === category).length;
  return category === 'Untested' && !engineCommandLibraryLoaded ? loaded + ENGINE_COMMAND_LIBRARY_TOTAL : loaded;
}

function renderNavigation(): void {
  const previousCategoryScrollTop = navigation.querySelector<HTMLElement>('.navigation-categories')?.scrollTop ?? 0;

  const special = [
    { id: 'recent', label: 'Recent', count: recent.filter((id) => COMMANDS.some((command) => command.id === id)).length },
    { id: 'favorites', label: 'Favorites', count: favorites.filter((id) => COMMANDS.some((command) => command.id === id)).length },
  ];

  const categories = CATEGORY_ORDER.map((category) => ({
    id: category,
    label: category === 'Untested' ? 'WIP' : category,
    count: categoryCount(category),
  }));

  navigation.innerHTML = `
    <div class="navigation-stationary" aria-label="Recent and favorite commands">
      ${special.map((item) => navButton(item.id, item.label, item.count)).join('')}
    </div>
    <div class="nav-divider"><span></span><span class="osf-eyebrow">CATEGORIES</span><span></span></div>
    <div class="navigation-categories" aria-label="Command categories">
      ${categories.map((item) => navButton(item.id, item.label, item.count)).join('')}
    </div>
  `;

  const categoryScroller = navigation.querySelector<HTMLElement>('.navigation-categories');
  if (categoryScroller) categoryScroller.scrollTop = previousCategoryScrollTop;

  const activityCount = document.querySelector('#activity-nav-count');
  if (activityCount instanceof HTMLElement) activityCount.textContent = String(activityLog.length);
}

function navButton(id: string, label: string, count: number): string {
  const active = activeView === id ? ' is-active' : '';
  return `<button class="nav-button${active}" type="button" data-view="${escapeHtml(id)}"><span>${escapeHtml(label)}</span><span class="nav-count">${count}</span></button>`;
}

function commandMatches(command: CommandDefinition, searchText = query): boolean {
  if (!searchText.trim()) return true;
  const haystack = [command.title, command.category, command.description, command.command, ...(command.tags ?? [])]
    .join(' ')
    .toLowerCase();
  const terms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function activeCommands(): CommandDefinition[] {
  if (activeView === 'Untested') {
    return COMMANDS
      .filter((command) => command.category === 'Untested')
      .filter((command) => commandMatches(command, untestedQuery));
  }

  // The main search is global across the established catalog. Untested
  // commands use their own search inside the isolated intake screen.
  if (query) return COMMANDS.filter((command) => command.category !== 'Untested' && commandMatches(command));

  let commands = COMMANDS;

  if (activeView === 'favorites') {
    commands = favorites
      .map((id) => COMMANDS.find((command) => command.id === id))
      .filter((command): command is CommandDefinition => Boolean(command));
  } else if (activeView === 'recent') {
    commands = recent
      .map((id) => COMMANDS.find((command) => command.id === id))
      .filter((command): command is CommandDefinition => Boolean(command));
  } else if (activeView !== 'custom' && activeView !== 'activity' && activeView !== 'quest-browser' && activeView !== 'id-browser') {
    commands = COMMANDS.filter((command) => command.category === activeView);
  }

  return commands.filter((command) => commandMatches(command));
}

function viewTitle(): string {
  if (query && activeView !== 'custom' && activeView !== 'activity') return 'Search Results';
  if (activeView === 'favorites') return 'Favorites';
  if (activeView === 'recent') return 'Recent Commands';
  if (activeView === 'quest-browser') return 'Quest Browser';
  if (activeView === 'id-browser') return 'ID Browser';
  if (activeView === 'activity') return 'Activity Log';
  if (activeView === 'custom') return 'Custom Command';
  if (activeView === 'Untested') return 'Work in Progress';
  return activeView;
}

function clearForDatasetLoad(): void {
  resultCount.textContent = '';
  commandList.replaceChildren();
}

function ensureIdCatalogLoaded(): Promise<void> {
  if (idCatalogLoaded) return Promise.resolve();
  if (idCatalogLoading) return idCatalogLoading;
  idCatalogLoading = import('./id-browser-data')
    .then(({ GENERATED_ID_CATALOG }) => {
      idCatalog = mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
      idCatalogLoaded = true;
    })
    .catch((error) => {
      setStatus(`ID Browser data could not be loaded: ${describe(error)}`, 'error');
    })
    .finally(() => {
      idCatalogLoading = null;
      if (activeView === 'id-browser') render();
    });
  return idCatalogLoading;
}

function ensureQuestBrowserLoaded(): Promise<void> {
  if (questBrowserLoaded) return Promise.resolve();
  if (questBrowserLoading) return questBrowserLoading;
  questBrowserLoading = import('./quest-browser')
    .then(({ QUEST_BROWSER_ENTRIES }) => {
      questBrowserEntries = QUEST_BROWSER_ENTRIES;
      questBrowserLoaded = true;
    })
    .catch((error) => {
      setStatus(`Quest Browser data could not be loaded: ${describe(error)}`, 'error');
    })
    .finally(() => {
      questBrowserLoading = null;
      if (activeView === 'quest-browser') render();
    });
  return questBrowserLoading;
}

function ensureEngineCommandLibraryLoaded(): Promise<void> {
  if (engineCommandLibraryLoaded) return Promise.resolve();
  if (engineCommandLibraryLoading) return engineCommandLibraryLoading;
  engineCommandLibraryLoading = import('./engine-command-library')
    .then(({ ENGINE_COMMAND_LIBRARY }) => {
      COMMANDS.push(...ENGINE_COMMAND_LIBRARY);
      engineCommandLibraryLoaded = true;
    })
    .catch((error) => {
      // Mark the load attempt complete so a missing/corrupt optional chunk does
      // not trigger an endless render -> import -> render retry loop.
      engineCommandLibraryLoaded = true;
      setStatus(`Engine command library could not be loaded: ${describe(error)}`, 'error');
    })
    .finally(() => {
      engineCommandLibraryLoading = null;
      render();
    });
  return engineCommandLibraryLoading;
}

function renderUntestedCommandGroups(commands: CommandDefinition[]): string {
  const groupOrder = [
    'Ready to Test',
    'Executed — Effect Unconfirmed',
    'Executed — Issues',
    'Blocked — Known Crash',
    'Engine Console Commands',
    'Script Functions',
  ];
  const groups = new Map<string, CommandDefinition[]>();
  for (const command of commands) {
    const group = command.intakeGroup ?? 'Ready to Test';
    const entries = groups.get(group) ?? [];
    entries.push(command);
    groups.set(group, entries);
  }

  const content = [...groups.entries()]
    .sort(([left], [right]) => groupOrder.indexOf(left) - groupOrder.indexOf(right))
    .map(([group, entries]) => {
      const open = Boolean(untestedQuery.trim()) || openUntestedGroup === group;
      const visibleCount = Math.min(entries.length, untestedGroupVisibleCounts.get(group) ?? UNTESTED_COMMAND_PAGE_SIZE);
      return `<section class="untested-group${open ? ' is-open' : ''}">
        <button class="untested-group-heading" type="button" data-untested-group="${escapeHtml(group)}" aria-expanded="${open}">
          <span>▶</span><strong>${escapeHtml(group)}</strong><small>${entries.length.toLocaleString()} commands</small>
        </button>
        ${open ? `<div class="untested-group-content">${entries.slice(0, visibleCount).map(renderCommandCard).join('')}${visibleCount < entries.length ? `<button class="osf-btn untested-show-more" type="button" data-untested-more="${escapeHtml(group)}">Show ${Math.min(UNTESTED_COMMAND_PAGE_SIZE, entries.length - visibleCount).toLocaleString()} more</button>` : ''}</div>` : ''}
      </section>`;
    }).join('');

  const intro = activeView === 'Untested'
    ? `<section class="untested-intro osf-card">
        <div class="untested-intro-copy"><strong>WORK IN PROGRESS</strong><span>Prepared commands are separated by test result. Commands with uncertain effects or known issues remain available for research, while known crash paths stay visible but blocked. The engine groups use optional raw arguments. Test on a disposable save.</span></div>
      </section>`
    : '';
  return intro + content;
}

function renderRecentToolbar(): string {
  return `<section class="recent-toolbar">
    <span>Recently executed command cards</span>
    <button class="osf-btn osf-btn--sm" type="button" data-clear-recent${recent.length ? '' : ' disabled'}>Clear Recent</button>
  </section>`;
}

function render(): void {
  syncSearchClear(search, searchClear);
  renderNavigation();
  const commandGridView = activeView !== 'id-browser'
    && activeView !== 'quest-browser'
    && activeView !== 'activity'
    && activeView !== 'custom'
    && activeView !== 'recent';
  commandList.classList.toggle('is-command-grid', commandGridView);
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === activeView);
  });

  sectionTitle.textContent = viewTitle();
  sectionKicker.textContent = activeView === 'custom'
    ? 'ADVANCED'
    : activeView === 'activity'
      ? 'DIAGNOSTICS'
      : activeView === 'id-browser'
        ? 'FORM / REFERENCE IDS'
        : activeView === 'quest-browser'
          ? 'QUEST DATABASE'
          : query
            ? 'SEARCH'
            : 'COMMANDS';
  searchWrap.hidden = activeView === 'custom' || activeView === 'activity';
  search.placeholder = activeView === 'quest-browser'
    ? 'Search quest, Editor ID, Form ID, source, or stage...'
    : activeView === 'id-browser'
      ? 'Search included IDs by name, Form ID, or type...'
      : activeView === 'Untested'
        ? 'Search WIP name, command, or description...'
      : 'Search name, command, tag...';

  if (activeView === 'id-browser') {
    customPanel.hidden = true;
    commandList.hidden = false;
    if (!idCatalogLoaded) {
      clearForDatasetLoad();
      void ensureIdCatalogLoaded();
      return;
    }
    commandList.hidden = true;
    customPanel.hidden = false;
    renderIdBrowserPanel();
    return;
  }

  if (activeView === 'quest-browser') {
    customPanel.hidden = true;
    commandList.hidden = false;
    if (!questBrowserLoaded) {
      clearForDatasetLoad();
      void ensureQuestBrowserLoaded();
      return;
    }
    renderQuestBrowser();
    return;
  }

  if (activeView === 'activity') {
    commandList.hidden = true;
    customPanel.hidden = false;
    resultCount.textContent = 'Command history';
    renderActivityPanel();
    return;
  }

  if (activeView === 'custom') {
    commandList.hidden = true;
    customPanel.hidden = false;
    resultCount.textContent = 'Direct console execution';
    renderCustomPanel();
    return;
  }

  if (activeView === 'Untested' && !engineCommandLibraryLoaded) {
    clearForDatasetLoad();
    void ensureEngineCommandLibraryLoaded();
    return;
  }

  customPanel.hidden = true;
  commandList.hidden = false;
  const commands = activeCommands();
  resultCount.textContent = activeView === 'Untested' && untestedQuery.trim()
    ? `${commands.length.toLocaleString()} matching WIP commands / ${categoryCount('Untested').toLocaleString()} total`
    : `${commands.length.toLocaleString()} command${commands.length === 1 ? '' : 's'}`;

  if (commands.length === 0) {
    const message = activeView === 'Untested' && untestedQuery.trim()
      ? 'No WIP commands match this search.'
      : query
      ? 'No commands match your search.'
      : activeView === 'favorites'
        ? 'No favorites yet. Mark commands as favorites and they will appear here.'
        : activeView === 'recent'
          ? 'No commands have been executed recently.'
          : 'Nothing is available in this category.';
    const emptyState = `<div class="empty-state"><p class="osf-eyebrow">NO RESULTS</p><h3>Nothing to show</h3><p>${escapeHtml(message)}</p></div>`;
    commandList.innerHTML = activeView === 'Untested'
      ? renderUntestedCommandGroups([]) + emptyState
      : activeView === 'recent'
        ? renderRecentToolbar() + emptyState
        : emptyState;
    return;
  }

  commandList.innerHTML = activeView === 'Untested'
    ? renderUntestedCommandGroups(commands)
    : `${activeView === 'recent' ? renderRecentToolbar() : ''}${commands.map(renderCommandCard).join('')}`;
}

function questBrowserMatches(entry: QuestBrowserEntry): boolean {
  if (!query) return true;
  const haystack = [
    entry.quest,
    entry.editorId,
    entry.questId,
    entry.source,
    entry.category,
    entry.requirement ?? '',
    ...entry.stages.map(String),
  ].join(' ').toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function questBrowserGroupKey(entry: QuestBrowserEntry): string {
  return `${entry.source}::${entry.category}`;
}

function questBrowserVariantLabel(entry: QuestBrowserEntry): string {
  if (entry.editorId.toUpperCase() === 'MQ101') return 'ORIGINAL STORY QUEST';
  if (/^MQ401[A-J]$/i.test(entry.editorId)) return 'NEW GAME PLUS VARIANT';
  return '';
}

function renderQuestBrowserCard(entry: QuestBrowserEntry): string {
  const progress = questProgressSnapshots.get(normalizedQuestId(entry.questId));
  const stages = entry.stages.map((stage) => {
    const command = `setstage ${entry.questId} ${stage}`;
    const isCurrent = progress?.currentStage === stage;
    const isDone = progress?.completedStages.has(stage) ?? false;
    const stateClass = isCurrent ? ' quest-stage-button--current' : isDone ? ' quest-stage-button--done' : progress ? ' quest-stage-button--unset' : '';
    const stateLabel = isCurrent ? 'CURRENT' : isDone ? 'DONE' : progress ? 'NOT SET' : 'STAGE';
    return `<button class="quest-stage-button${stateClass}" type="button" data-quest-command="${escapeHtml(command)}" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}" data-quest-stage="${stage}"${nativeBackendReady ? '' : ' disabled'}>
      <span>${stateLabel}</span><strong>${stage}</strong>
    </button>`;
  }).join('');

  const requirement = entry.requirement
    ? `<span class="quest-browser-requirement">${escapeHtml(entry.requirement)}</span>`
    : '';
  const internal = entry.internal
    ? '<span class="quest-browser-internal">INTERNAL / SYSTEM NAME</span>'
    : '';
  const variantLabel = questBrowserVariantLabel(entry);
  const variant = variantLabel
    ? `<span class="quest-browser-variant">${escapeHtml(variantLabel)}</span>`
    : '';
  const flags = requirement || internal || variant
    ? `<span class="quest-browser-card-flags">${requirement}${internal}${variant}</span>`
    : '';

  return `
    <details class="quest-browser-card" data-quest-card="${escapeHtml(entry.questId)}"${openQuestBrowserCards.has(normalizedQuestId(entry.questId)) ? ' open' : ''}>
      <summary>
        <span class="quest-browser-card-title"><span class="quest-browser-card-heading"><strong>${escapeHtml(entry.quest)}</strong>${flags}</span><small>${escapeHtml(entry.editorId)}</small></span>
        <span class="quest-browser-card-id"><code>${escapeHtml(entry.questId)}</code><small>${entry.stages.length} stage${entry.stages.length === 1 ? '' : 's'}</small></span>
      </summary>
      <div class="quest-browser-card-body">
        <div class="quest-browser-actions">
          ${activeCatalogPicker?.browser === 'quest' ? `<button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-use-quest-id="${escapeHtml(entry.questId)}" data-use-quest-title="${escapeHtml(entry.quest)}">Use This Quest</button>` : ''}
          <button class="osf-btn osf-btn--sm" type="button" data-quest-inspect="history" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${nativeBackendReady ? '' : ' disabled'}>Inspect Quest State</button>
          <button class="osf-btn osf-btn--sm" type="button" data-quest-action="start" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${nativeBackendReady ? '' : ' disabled'}>Start Quest</button>
          <button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-quest-action="stop" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${nativeBackendReady ? '' : ' disabled'}>Stop Quest</button>
          <button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-quest-action="complete" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${nativeBackendReady ? '' : ' disabled'}>Complete Quest</button>
          <button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-quest-action="reset" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${nativeBackendReady ? '' : ' disabled'}>Reset Quest</button>
          <button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-copy-text="${escapeHtml(entry.questId)}">Copy Quest ID</button>
        </div>
        <div class="quest-browser-action-note"><strong>QUEST ACTIONS</strong><span>Start may not add a visible mission until a stage is activated. Reset clears recorded stages and removes the mission from the log without restarting it.</span></div>
        <div class="quest-browser-stage-label"><span class="osf-eyebrow">ALL RECORDED STAGES</span><span>Setting a stage can skip scripts, dialogue, rewards, or prerequisites. Save first.</span></div>
        <div class="quest-stage-grid">${stages || '<div class="quest-browser-no-stages">No explicit stage indexes were found in this quest record.</div>'}</div>
      </div>
    </details>`;
}

function renderQuestBrowserGroup(key: string, entries: QuestBrowserEntry[], open: boolean): string {
  const [source, category] = key.split('::');
  const stageCount = entries.reduce((total, entry) => total + entry.stages.length, 0);
  const pageCount = Math.max(1, Math.ceil(entries.length / QUEST_BROWSER_PAGE_SIZE));
  const requestedPage = questBrowserPages.get(key) ?? 0;
  const page = Math.min(requestedPage, pageCount - 1);
  const start = page * QUEST_BROWSER_PAGE_SIZE;
  const pageEntries = entries.slice(start, start + QUEST_BROWSER_PAGE_SIZE);
  const content = open ? `
    <div class="quest-browser-group-content">
      ${pageEntries.map(renderQuestBrowserCard).join('')}
      ${pageCount > 1 ? `<div class="quest-browser-pagination">
        <button class="osf-btn osf-btn--sm" type="button" data-quest-page="${page - 1}" data-quest-page-group="${escapeHtml(key)}"${page === 0 ? ' disabled' : ''}>Previous</button>
        <span>Page ${page + 1} of ${pageCount} · quests ${start + 1}–${Math.min(start + QUEST_BROWSER_PAGE_SIZE, entries.length)}</span>
        <button class="osf-btn osf-btn--sm" type="button" data-quest-page="${page + 1}" data-quest-page-group="${escapeHtml(key)}"${page >= pageCount - 1 ? ' disabled' : ''}>Next</button>
      </div>` : ''}
    </div>` : '';

  return `<section class="quest-browser-group${open ? ' is-open' : ''}">
    <button class="quest-browser-group-heading" type="button" data-quest-group="${escapeHtml(key)}" aria-expanded="${open}">
      <span class="quest-browser-group-arrow">▶</span>
      <span><strong>${escapeHtml(category)}</strong><small>${escapeHtml(source)}</small></span>
      <span>${entries.length} quests · ${stageCount.toLocaleString()} stages</span>
    </button>
    ${content}
  </section>`;
}

function renderQuestBrowser(): void {
  const matches = questBrowserEntries.filter(questBrowserMatches);
  const visibleStageCount = matches.reduce((total, entry) => total + entry.stages.length, 0);
  resultCount.textContent = query
    ? `${matches.length.toLocaleString()} matching quests / ${visibleStageCount.toLocaleString()} stages`
    : `${questBrowserEntries.length.toLocaleString()} quests / ${QUEST_BROWSER_STAGE_TOTAL.toLocaleString()} stages`;

  const selectionBanner = activeCatalogPicker?.browser === 'quest'
    ? `<section class="browser-selection-banner osf-card"><div><strong>CHOOSE A QUEST</strong><span>Select a quest below to fill the original command field. No quest command will run.</span></div><button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-cancel-catalog-picker>Cancel Selection</button></section>`
    : '';

  if (matches.length === 0) {
    commandList.innerHTML = selectionBanner + `<div class="empty-state"><p class="osf-eyebrow">NO QUESTS</p><h3>No matching quest</h3><p>Try a quest name, Editor ID, Form ID, source, or stage number.</p></div>`;
    return;
  }

  const grouped = new Map<string, QuestBrowserEntry[]>();
  for (const source of ['Base Game', 'Shattered Space'] as const) {
    for (const category of QUEST_BROWSER_CATEGORY_ORDER) {
      const entries = matches.filter((entry) => entry.source === source && entry.category === category);
      if (entries.length) grouped.set(`${source}::${category}`, entries);
    }
  }

  const intro = `
    <section class="quest-browser-intro osf-card">
      <strong>Quest Browser uses quest records and every stage index found in the installed Bethesda masters.</strong>
      <span>Inspect Quest State is read-only and marks the current and completed stages. Start, Stop, Complete, Reset, and stage buttons change save-game state and always require confirmation.</span>
      <span class="quest-stage-caveat">Internal/system quests are included for completeness. Avoid changing them unless you know exactly what the record controls.</span>
    </section>`;

  const groups = [...grouped.entries()].map(([key, entries]) => {
    const open = query ? true : openQuestBrowserGroup === key;
    return renderQuestBrowserGroup(key, entries, open);
  }).join('');
  commandList.innerHTML = selectionBanner + intro + `<div class="quest-browser-groups">${groups}</div>`;
}

function renderCommandCard(command: CommandDefinition): string {
  const isFavorite = favorites.includes(command.id);
  const unavailable = Boolean(command.unavailableReason);
  const canRunWithoutNative = Boolean(command.catalogSearch);
  const inputs = (command.inputs ?? []).map((input) => renderInput(command, input)).join('');
  const riskLabel = command.risk === 'danger' ? 'DANGER' : 'CAUTION';
  const testTag = command.testStatus === 'untested'
    ? '<span class="command-test-tag">UNTESTED</span>'
    : command.testStatus === 'inconclusive'
      ? '<span class="command-test-tag">EFFECT UNCONFIRMED</span>'
      : command.testStatus === 'failed'
        ? '<span class="command-test-tag">FAILED</span>'
        : command.testStatus === 'needs-adjustment'
          ? '<span class="command-test-tag">ISSUE</span>'
          : '';
  const warningTag = command.warning
    ? `<span class="caution-wrap">
        <button class="command-warning-tag${command.risk === 'danger' ? ' is-danger' : ''}" type="button" data-caution="${escapeHtml(command.id)}" aria-expanded="false" aria-controls="caution-${escapeHtml(command.id)}">${riskLabel}</button>
        <span class="caution-popover${command.risk === 'danger' ? ' is-danger' : ''}" id="caution-${escapeHtml(command.id)}" role="tooltip">
          <strong>WHY THIS IS MARKED ${riskLabel}</strong>
          <span>${escapeHtml(command.warning)}</span>
        </span>
      </span>`
    : '';
  const executeControl = unavailable
    ? `<span class="availability-wrap" tabindex="0">
        <button class="osf-btn osf-btn--osf-accent execute-button" type="button" disabled>Unavailable</button>
        <span class="availability-popover is-danger" role="tooltip">
          <strong>CONSOLE COMMAND</strong>
          <code>${escapeHtml(command.command)}</code>
          <span>CCC blocks this card, but advanced users can enter the command manually in Starfield’s console.</span>
        </span>
      </span>`
    : command.secondaryAction
      ? `<span class="command-action-pair">
          <button class="osf-btn osf-btn--osf-accent execute-button" type="button" data-execute="${escapeHtml(command.id)}" data-command-action="primary"${nativeBackendReady || canRunWithoutNative ? '' : ' disabled'}>${escapeHtml(command.executeLabel ?? 'Execute')}</button>
          <button class="osf-btn execute-button execute-button--secondary" type="button" data-execute="${escapeHtml(command.id)}" data-command-action="secondary"${nativeBackendReady || canRunWithoutNative ? '' : ' disabled'}>${escapeHtml(command.secondaryAction.label)}</button>
        </span>`
      : `<button class="osf-btn osf-btn--osf-accent execute-button" type="button" data-execute="${escapeHtml(command.id)}"${nativeBackendReady || canRunWithoutNative ? '' : ' disabled'}>${command.catalogSearch ? 'Search IDs' : escapeHtml(command.executeLabel ?? 'Execute')}</button>`;

  return `
    <article class="command-card${command.secondaryAction ? ' command-card--dual-action' : ''}" data-command-id="${escapeHtml(command.id)}">
      <div class="command-main">
        <div class="command-heading">
          <div class="command-heading-main">
            <h3>${escapeHtml(command.title)}</h3>
          </div>
          <span class="command-heading-tags">${testTag}${warningTag}</span>
        </div>
        <p class="command-description">${escapeHtml(command.description)}</p>
        ${command.unavailableReason ? `<p class="command-unavailable-reason">${escapeHtml(command.unavailableReason)}</p>` : ''}
        ${inputs ? `<div class="command-inputs">${inputs}</div>` : ''}
      </div>
      <div class="command-actions">
        <button class="favorite-button${isFavorite ? ' is-favorite' : ''}" type="button" data-favorite="${escapeHtml(command.id)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <span aria-hidden="true">${isFavorite ? '★' : '☆'}</span>
        </button>
        ${executeControl}
      </div>
    </article>
  `;
}

function renderInput(command: CommandDefinition, input: CommandInput): string {
  // Curated ID choices always use the same compact field + boxed CHOOSE control.
  // Do not reintroduce inline preset-button grids inside command cards.
  const id = `${command.id}-${input.key}`;
  const attributes = [
    `id="${escapeHtml(id)}"`,
    `class="osf-input command-input"`,
    `data-command-input="${escapeHtml(command.id)}"`,
    `data-input-key="${escapeHtml(input.key)}"`,
    `type="${input.type === 'number' ? 'text' : input.type}"`,
    `data-value-type="${input.type}"`,
  ];
  if (input.type === 'number') attributes.push(`inputmode="${input.step !== undefined && !Number.isInteger(input.step) ? 'decimal' : 'numeric'}"`);
  if (input.defaultValue !== undefined) attributes.push(`value="${escapeHtml(String(input.defaultValue))}"`);
  if (input.placeholder) attributes.push(`placeholder="${escapeHtml(input.placeholder)}"`);
  if (input.min !== undefined) attributes.push(`min="${input.min}"`);
  if (input.max !== undefined) attributes.push(`max="${input.max}"`);
  if (input.step !== undefined) attributes.push(`step="${input.step}"`);
  if (input.pattern) attributes.push(`pattern="${escapeHtml(input.pattern)}"`);

  const hint = input.hint ? escapeHtml(input.hint) : '&nbsp;';
  const pickerButton = input.picker
    ? `<button class="input-picker-button" type="button" data-open-id-picker="${escapeHtml(command.id)}" data-input-key="${escapeHtml(input.key)}" aria-haspopup="dialog">${escapeHtml(input.picker.buttonLabel)}</button>`
    : input.browserPicker
      ? `<button class="input-picker-button" type="button" data-open-catalog-picker="${escapeHtml(command.id)}" data-input-key="${escapeHtml(input.key)}">${escapeHtml(input.browserPicker.buttonLabel)}</button>`
      : input.questStageFor
        ? `<button class="input-picker-button" type="button" data-open-quest-stage-picker="${escapeHtml(command.id)}" data-input-key="${escapeHtml(input.key)}" data-quest-input-key="${escapeHtml(input.questStageFor)}">Choose Stage</button>`
    : '';
  const control = pickerButton
    ? `<div class="input-control-row"><input ${attributes.join(' ')}>${pickerButton}</div>`
    : `<input ${attributes.join(' ')}>`;

  return `<div class="input-field${pickerButton ? ' input-field--picker' : ''}"><label class="input-label" for="${escapeHtml(id)}">${escapeHtml(input.label)}</label>${control}<small class="input-hint${input.hint ? '' : ' input-hint--empty'}">${hint}</small></div>`;
}

function buildCommand(command: CommandDefinition): string {
  return buildCommandTemplate(command, command.command);
}

function buildCommandTemplate(command: CommandDefinition, template: string): string {
  let output = template;
  for (const input of command.inputs ?? []) {
    const element = document.getElementById(`${command.id}-${input.key}`);
    const fallback = input.defaultValue === undefined ? '' : String(input.defaultValue);
    const value = element instanceof HTMLInputElement ? element.value.trim() : fallback;
    output = output.replaceAll(`{${input.key}}`, value || (input.optional ? '' : `{${input.key}}`));
  }
  return output.replace(/\s+/g, ' ').trim();
}

function validateCommand(command: CommandDefinition): string | null {
  for (const input of command.inputs ?? []) {
    const element = document.getElementById(`${command.id}-${input.key}`);
    if (!(element instanceof HTMLInputElement)) continue;
    if (!element.value.trim()) {
      if (input.optional) continue;
      return `${input.label} is required.`;
    }
    if (input.type === 'number') {
      const numericValue = Number(element.value);
      if (!Number.isFinite(numericValue)) return `${input.label} must be a number.`;
      if (input.min !== undefined && numericValue < input.min) return `${input.label} must be at least ${input.min}.`;
      if (input.max !== undefined && numericValue > input.max) return `${input.label} must be no more than ${input.max}.`;
      if (input.step !== undefined && input.step > 0) {
        const base = input.min ?? 0;
        const steps = (numericValue - base) / input.step;
        if (Math.abs(steps - Math.round(steps)) > 1e-8) return `${input.label} must use increments of ${input.step}.`;
      }
    }
    if (!element.checkValidity()) return `${input.label} is not valid${input.hint ? ` (${input.hint})` : ''}.`;
  }
  return null;
}

function pickerSearchText(picker: ReferenceIdPicker, option: ReferenceIdPicker['options'][number]): string {
  return [option.label, option.value, option.detail ?? '', ...(option.keywords ?? [])].join(' ').toLowerCase();
}

function renderIdPickerResults(): void {
  syncSearchClear(idPickerSearch, idPickerSearchClear);
  if (!activeIdPicker) return;
  const term = idPickerSearch.value.trim().toLowerCase();
  const matches = activeIdPicker.picker.options.filter((option) => !term || pickerSearchText(activeIdPicker!.picker, option).includes(term));
  idPickerSummary.textContent = `${matches.length} matching choice${matches.length === 1 ? '' : 's'}`;
  idPickerResults.innerHTML = matches.length > 0
    ? matches.map((option) => `<button class="id-picker-option" type="button" data-picker-value="${escapeHtml(option.value)}" data-picker-label="${escapeHtml(option.label)}">
        <span class="id-picker-option-copy"><strong>${escapeHtml(option.label)}</strong>${option.detail ? `<small>${escapeHtml(option.detail)}</small>` : ''}</span>
        <code>${escapeHtml(option.value)}</code>
      </button>`).join('')
    : `<div class="id-picker-empty"><strong>No matching IDs</strong><span>Try another name or type the Form ID manually in the command field.</span></div>`;
}

function idPickerOptions(): HTMLButtonElement[] {
  return Array.from(idPickerResults.querySelectorAll<HTMLButtonElement>('[data-picker-value]'));
}

function focusIdPickerOption(position: 'first' | 'last'): void {
  const options = idPickerOptions();
  const option = position === 'first' ? options[0] : options.at(-1);
  option?.focus({ preventScroll: true });
}

function openIdPicker(commandId: string, inputKey: string, picker: ReferenceIdPicker): void {
  activeIdPicker = { commandId, inputKey, picker };
  idPickerTitle.textContent = picker.title;
  idPickerSearch.placeholder = picker.searchPlaceholder;
  idPickerSearch.value = '';
  idPickerBackdrop.hidden = false;
  renderIdPickerResults();
  requestAnimationFrame(() => {
    idPickerSearch.focus({ preventScroll: true });
    idPickerSearch.select();
  });
}

function closeIdPicker(refocus = true): void {
  const previous = activeIdPicker;
  activeIdPicker = null;
  idPickerBackdrop.hidden = true;
  idPickerSearch.value = '';
  idPickerResults.innerHTML = '';
  if (!refocus || !previous) return;
  const input = document.getElementById(`${previous.commandId}-${previous.inputKey}`);
  if (input instanceof HTMLInputElement) input.focus({ preventScroll: true });
}

function chooseIdPickerValue(value: string, label: string): void {
  if (!activeIdPicker) return;
  const { commandId, inputKey } = activeIdPicker;
  const input = document.getElementById(`${commandId}-${inputKey}`);
  if (!(input instanceof HTMLInputElement)) return;
  input.value = value;
  setStatus(`Selected ${label}: ${value}`, 'success');
  closeIdPicker(false);
  input.focus({ preventScroll: true });
  input.select();
}

function toggleFavorite(commandId: string): void {
  if (favorites.includes(commandId)) {
    favorites = favorites.filter((id) => id !== commandId);
  } else {
    favorites = [commandId, ...favorites];
  }
  writeStringArray(STORAGE_FAVORITES, favorites);
  render();
}

function addRecent(commandId: string): void {
  recent = [commandId, ...recent.filter((id) => id !== commandId)].slice(0, MAX_RECENT);
  writeStringArray(STORAGE_RECENT, recent);
}

function showConfirmation(execution: PendingExecution, message: string, risk: 'normal' | 'caution' | 'danger' = 'normal'): void {
  pendingExecution = execution;
  const caution = risk === 'caution';
  const danger = risk === 'danger';
  confirmDialog.classList.toggle('is-caution', caution);
  confirmDialog.classList.toggle('is-danger', danger);
  confirmLabel.textContent = danger ? 'DANGER' : caution ? 'CAUTION' : 'CONFIRM';
  confirmTitle.textContent = execution.definition
    ? `Execute ${execution.definition.title}?`
    : execution.commands && execution.commands.length > 1
      ? `Execute ${execution.commands.length} Custom Commands?`
      : 'Execute Custom Command?';
  confirmMessage.textContent = message;
  confirmCommand.textContent = execution.command;
  confirmRun.textContent = danger ? 'Execute Dangerous Command' : caution ? 'Execute Anyway' : 'Execute';
  confirmRun.classList.toggle('osf-btn--danger', caution || danger);
  confirmRun.classList.toggle('osf-btn--osf-accent', !caution && !danger);
  confirmBackdrop.hidden = false;
  confirmCancel.focus();
}

function requestExecution(execution: PendingExecution): void {
  if (execution.definition?.unavailableReason) {
    setStatus(execution.definition.unavailableReason, 'error');
    return;
  }
  const warning = execution.definition?.warning;
  const risk = execution.definition?.risk ?? (warning ? 'caution' : 'normal');
  showConfirmation(
    execution,
    warning ?? 'Run this command now? Review the command below before continuing.',
    risk,
  );
}

function formatActorValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

async function prepareEffectiveTotalExecution(definition: CommandDefinition, builtCommand: string): Promise<void> {
  const match = builtCommand.match(/^ccc\.seteffectivetotal\s+(player|[0-9A-Fa-f]{1,8})\s+([A-Za-z0-9_]{1,64})\s+(-?(?:\d+(?:\.\d*)?|\.\d+))$/i);
  if (!match) {
    setStatus('Could not read the effective-total target, actor value, and desired total.', 'error');
    return;
  }
  if (!nativeBackendReady || !window.osfui?.request) {
    setStatus('ConsoleCommandCenter.dll is not connected.', 'error');
    return;
  }

  const effectiveTotal: EffectiveTotalRequest = {
    target: match[1],
    actorValue: match[2],
    desiredTotal: Number(match[3]),
  };
  setStatus(`Calculating the base value for ${effectiveTotal.actorValue}...`, 'working');
  try {
    const preview = await window.osfui.request<EffectiveTotalReply>('console.command-center.setEffectiveActorValue', {
      ...effectiveTotal,
      apply: false,
    });
    if (!preview?.ok) throw new Error('Native backend did not return an effective-total calculation');
    const message = `Current base: ${formatActorValue(preview.currentBase)}. Current effective total: ${formatActorValue(preview.currentEffective)}. Detected modifier contribution: ${formatActorValue(preview.modifierContribution)}. To reach ${formatActorValue(preview.desiredTotal)}, CCC will set the base to ${formatActorValue(preview.calculatedBase)}.`;
    showConfirmation(
      { command: preview.command, definition, effectiveTotal },
      message,
      definition.risk ?? 'caution',
    );
    setStatus('Effective-total calculation ready for review.');
  } catch (error) {
    setStatus(describe(error), 'error');
  }
}

function normalizedQuestId(value: string): string {
  return value.trim().toUpperCase().padStart(8, '0');
}

async function readQuestValue(questId: string, operation: QuestReadOperation, stage?: number): Promise<number | boolean> {
  if (!window.osfui?.request) throw new Error('OSF UI native request API is unavailable');
  const reply = await window.osfui.request<QuestReadReply>('console.command-center.questRead', {
    questId,
    operation,
    ...(stage === undefined ? {} : { stage }),
  });
  if (!reply?.ok || reply.operation !== operation) throw new Error('Native backend did not return the requested quest-state value');
  return reply.value;
}

async function inspectQuest(
  questIdValue: string,
  title: string,
  mode: 'stage' | 'history',
  definition?: CommandDefinition,
  preserveScrollTop?: number,
): Promise<void> {
  const questId = normalizedQuestId(questIdValue);
  const command = mode === 'history' ? `sqs ${questId}` : `getstage ${questId}`;
  const resultTitle = mode === 'history' ? `${title} — Stage History` : `${title} — Current Stage`;
  const execution: PendingExecution = {
    command,
    definition: definition ?? {
      id: `quest-browser-${mode}-${questId}`,
      title: resultTitle,
      category: 'Quests',
      description: 'Read quest state directly from Starfield.',
      command,
      testStatus: 'untested',
    },
    rememberRecent: definition !== undefined,
  };

  showResults(resultTitle, command, '', 'loading');
  setStatus(`Reading ${title} quest state...`, 'working');
  try {
    await ensureQuestBrowserLoaded();
    const entry = questBrowserEntries.find((candidate) => normalizedQuestId(candidate.questId) === questId);
    if (mode === 'history' && !entry) {
      throw new Error('Stage History needs a quest from CCC\'s packaged Quest Browser so its recorded stages are known.');
    }

    const currentStage = Number(await readQuestValue(questId, 'currentStage'));
    const running = Boolean(await readQuestValue(questId, 'isRunning'));
    const completed = Boolean(await readQuestValue(questId, 'isCompleted'));
    const state = completed ? 'Completed' : running ? 'Running' : 'Stopped or not started';
    const heading = [
      `Quest: ${entry?.quest ?? title}`,
      `Editor ID: ${entry?.editorId ?? 'Not in packaged catalog'}`,
      `Form ID: ${questId}`,
      `State: ${state}`,
      `Current/highest completed stage: ${currentStage}`,
    ];

    let output = heading.join('\n');
    if (mode === 'history' && entry) {
      const history: string[] = [];
      const completedStages = new Set<number>();
      for (let index = 0; index < entry.stages.length; index += 1) {
        const stage = entry.stages[index];
        const done = Boolean(await readQuestValue(questId, 'isStageDone', stage));
        if (done) completedStages.add(stage);
        history.push(`${done ? '(done)' : '(not set)'}\t${stage}`);
        if ((index + 1) % 10 === 0 || index + 1 === entry.stages.length) {
          setStatus(`Reading ${title}: ${index + 1} of ${entry.stages.length} recorded stages...`, 'working');
        }
      }
      questProgressSnapshots.set(questId, { currentStage, completedStages });
      output += `\n\nRecorded stages (${entry.stages.length}):\n${history.join('\n')}`;
    }

    showResults(resultTitle, command, output, 'ready');
    setStatus('Quest inspection complete. Results saved in Activity Log.', 'success');
    if (definition) addRecent(definition.id);
    addActivity(execution, 'success', `Result: ${output}`);
    if (activeView === 'recent' || activeView === 'activity' || activeView === 'quest-browser') {
      render();
      if (activeView === 'quest-browser' && preserveScrollTop !== undefined) commandList.scrollTop = preserveScrollTop;
    }
  } catch (error) {
    const message = describe(error);
    showResults(resultTitle, command, message, 'error');
    setStatus(message, 'error');
    addActivity(execution, 'error', message);
  }
}

async function executeConsole(execution: PendingExecution): Promise<void> {
  const command = execution.command.trim();
  if (!command) {
    setStatus('Enter a console command first.', 'error');
    return;
  }
  if (!nativeBackendReady) {
    setStatus('ConsoleCommandCenter.dll is not connected.', 'error');
    return;
  }

  if (execution.definition?.id === 'get-quest-stage' || execution.definition?.id === 'show-quest-stages') {
    const questId = command.split(/\s+/).at(-1) ?? '';
    await inspectQuest(
      questId,
      execution.definition.title,
      execution.definition.id === 'show-quest-stages' ? 'history' : 'stage',
      execution.definition,
    );
    return;
  }

  const capturesOutput = execution.definition?.captureOutput === true;
  const resultTitle = execution.definition?.title ?? 'Command Results';
  if (capturesOutput) showResults(resultTitle, command, '', 'loading');
  setStatus(`Executing: ${command}`, 'working');
  try {
    if (!window.osfui?.request) throw new Error('OSF UI native request API is unavailable');
    if (execution.effectiveTotal) {
      const reply = await window.osfui.request<EffectiveTotalReply>('console.command-center.setEffectiveActorValue', {
        ...execution.effectiveTotal,
        apply: true,
      });
      if (!reply?.ok || !reply.applied) throw new Error('Native backend did not apply the calculated base value');
      const message = `${reply.actorValue}: base ${formatActorValue(reply.calculatedBase)} applied for requested effective total ${formatActorValue(reply.desiredTotal)}. Immediate effective value: ${formatActorValue(reply.resultingEffective)}.`;
      setStatus(message, 'success');
      if (execution.definition && execution.rememberRecent !== false) addRecent(execution.definition.id);
      addActivity({ ...execution, command: reply.command }, 'success', message);
      if (activeView === 'recent' || activeView === 'activity') render();
      return;
    }
    const reply = capturesOutput
      ? await window.osfui.request<QueryReply>('console.command-center.query', { consoleCommand: command })
      : await window.osfui.request<ExecuteReply>('console.command-center.execute', {
        consoleCommand: command,
        closeBeforeExecute: execution.definition?.closeBeforeExecute === true,
      });
    if (!reply?.ok) throw new Error('Native backend did not report success');

    const executedCommand = reply.command || command;
    const capturedOutput = capturesOutput ? ((reply as QueryReply).output ?? '').trim() : '';
    if (capturesOutput && !capturedOutput) throw new Error('No readable result was returned. This does not mean the value is zero or the inventory is empty.');
    const needsGameVerification = execution.definition?.verifyInGame === true;
    const activityMessage = capturedOutput
      ? `Result: ${capturedOutput}`
      : needsGameVerification
        ? `Command sent: ${executedCommand}. Verify the resulting game state.`
        : `Executed: ${executedCommand}`;
    const statusMessage = capturesOutput
      ? 'Inspection complete. Results saved in Activity Log.'
      : needsGameVerification
        ? `Command sent: ${executedCommand}. Verify its effect in game.`
        : `Executed: ${executedCommand}`;
    setStatus(statusMessage, needsGameVerification ? 'normal' : 'success');
    if (execution.definition && execution.rememberRecent !== false) addRecent(execution.definition.id);
    addActivity(execution, 'success', activityMessage);
    if (capturesOutput) showResults(resultTitle, executedCommand, capturedOutput, 'ready');
    if (activeView === 'recent' || activeView === 'activity' || activeView === 'quest-browser') {
      render();
    }
  } catch (error) {
    const message = describe(error);
    setStatus(message, 'error');
    addActivity(execution, 'error', message);
    if (capturesOutput) showResults(resultTitle, command, message, 'error');
  }
}

function parseCustomCommands(value: string): string[] {
  return value.split(/\r?\n/).map((command) => command.trim()).filter(Boolean);
}

async function executeCustomBatch(execution: PendingExecution): Promise<void> {
  const commands = execution.commands ?? parseCustomCommands(execution.command);
  if (commands.length === 0) {
    setStatus('Enter at least one console command.', 'error');
    return;
  }
  if (!nativeBackendReady) {
    setStatus('ConsoleCommandCenter.dll is not connected.', 'error');
    return;
  }
  if (!window.osfui?.request) {
    setStatus('OSF UI native request API is unavailable.', 'error');
    return;
  }

  for (let index = 0; index < commands.length; index += 1) {
    const command = commands[index];
    setStatus(`Executing command ${index + 1} of ${commands.length}: ${command}`, 'working');
    try {
      const reply = await window.osfui.request<ExecuteReply>('console.command-center.execute', {
        consoleCommand: command,
        closeBeforeExecute: false,
      });
      if (!reply?.ok) throw new Error('Native backend did not report success');
      const executedCommand = reply.command || command;
      addActivity({ command: executedCommand }, 'success', `Executed: ${executedCommand}`);
    } catch (error) {
      const message = `Batch stopped at command ${index + 1} of ${commands.length}: ${describe(error)}`;
      setStatus(message, 'error');
      addActivity({ command }, 'error', message);
      return;
    }
  }

  setStatus(`Executed ${commands.length} custom command${commands.length === 1 ? '' : 's'} in order.`, 'success');
  if (activeView === 'activity') render();
}

function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  return 'code' in error ? `${String((error as Error & { code?: unknown }).code)}: ${error.message}` : error.message;
}

function setStatus(message: string, kind: 'normal' | 'working' | 'success' | 'error' = 'normal'): void {
  status.textContent = message;
  status.dataset.kind = kind;
}


function renderActivityPanel(): void {
  const entries = activityLog.map((entry) => `
    <article class="activity-entry activity-entry--${entry.outcome}">
      <div class="activity-entry-head">
        <div>
          <span class="activity-outcome">${entry.outcome === 'success' ? (entry.message.startsWith('Command sent:') ? 'SENT' : 'SUCCESS') : 'ERROR'}</span>
          <strong>${escapeHtml(entry.label)}</strong>
          <span class="activity-category">${escapeHtml(entry.category)}</span>
        </div>
        <time datetime="${new Date(entry.timestamp).toISOString()}">${escapeHtml(formatActivityTime(entry.timestamp))}</time>
      </div>
      <code class="activity-command">${escapeHtml(entry.command)}</code>
      ${entry.message.startsWith('Result:') || entry.outcome === 'error'
        ? `<button class="osf-btn osf-btn--sm" type="button" data-show-result="${escapeHtml(entry.id)}">Open Results</button><p>${entry.outcome === 'error' ? 'Error details saved' : `${(entry.message.length - 'Result:'.length).toLocaleString()} characters saved`}</p>`
        : entry.message !== `Executed: ${entry.command}`
          ? `<p>${escapeHtml(entry.message)}</p>`
          : ''}
    </article>
  `).join('');

  customPanel.innerHTML = `
    <section class="activity-panel">
      <div class="activity-toolbar">
        <div>
          <p class="osf-eyebrow">COMMAND HISTORY</p>
          <p>Executed commands and captured inspection results.</p>
        </div>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="clear-activity" type="button" ${activityLog.length === 0 ? 'disabled' : ''}>Clear Log</button>
      </div>

      <div class="activity-list">
        ${entries || '<div class="empty-state activity-empty"><p class="osf-eyebrow">NO ACTIVITY</p><h3>No commands logged yet</h3><p>Commands you execute will appear here, including raw custom commands and errors.</p></div>'}
      </div>
    </section>
  `;

  const clearButton = document.querySelector('#clear-activity');
  customPanel.querySelectorAll<HTMLButtonElement>('[data-show-result]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = activityLog.find((candidate) => candidate.id === button.dataset.showResult);
      if (entry) showResults(entry.label, entry.command,
        entry.message.startsWith('Result:') ? entry.message.slice('Result:'.length).trim() : entry.message,
        entry.outcome === 'error' ? 'error' : 'ready');
    });
  });
  if (clearButton instanceof HTMLButtonElement) {
    clearButton.addEventListener('click', () => {
      activityLog = [];
      writeActivityLog();
      setStatus('Activity log cleared.');
      render();
    });
  }
}

function formatActivityTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return String(timestamp);
  }
}


function activeIdBrowserCategory() {
  return ID_BROWSER_CATEGORIES.find((category) => category.value === idBrowserCategory) ?? ID_BROWSER_CATEGORIES[0];
}

function idBrowserTextMatches(entry: IdCatalogEntry): boolean {
  if (!query) return true;
  const haystack = [entry.label, entry.value, entry.type, entry.category, entry.detail ?? '', ...(entry.keywords ?? [])]
    .join(' ')
    .toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function matchingBuiltInIds(): IdCatalogEntry[] {
  const categories = activeIdBrowserCategory().builtInCategories;
  const pickerTypes = activeCatalogPicker?.browser === 'id' ? activeCatalogPicker.allowedTypes : [];
  const pickerCategories = activeCatalogPicker?.browser === 'id' ? activeCatalogPicker.allowedCategories : [];
  return idCatalog.filter((entry) => {
    const categoryMatches = categories.includes('*') || categories.includes(entry.category);
    const recordTypeMatches = !idBrowserRecordTypeFilter || entry.type.toUpperCase() === idBrowserRecordTypeFilter;
    const pickerTypeMatches = pickerTypes.length === 0 || pickerTypes.includes(entry.type.toUpperCase());
    const pickerCategoryMatches = pickerCategories.length === 0 || pickerCategories.includes(entry.category);
    return categoryMatches && recordTypeMatches && pickerTypeMatches && pickerCategoryMatches && idBrowserTextMatches(entry);
  });
}

function groupedIdBrowserResults(results: IdCatalogEntry[]): Array<[string, Array<{ entry: IdCatalogEntry; index: number }>]> {
  const categoryOrder = ID_BROWSER_CATEGORIES.flatMap((category) => category.builtInCategories)
    .filter((category, index, categories) => category !== '*' && categories.indexOf(category) === index);
  const groups = new Map<string, Array<{ entry: IdCatalogEntry; index: number }>>();
  results.forEach((entry, index) => {
    const group = groups.get(entry.category) ?? [];
    group.push({ entry, index });
    groups.set(entry.category, group);
  });
  return [...groups].sort(([left], [right]) => {
    const leftIndex = categoryOrder.indexOf(left);
    const rightIndex = categoryOrder.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}

function idBrowserAction(entry: IdCatalogEntry): 'additem' | 'addperk' | 'addspell' | 'spawn' | 'forceweather' | 'teleport' | 'findcell' | null {
  const type = entry.type.toUpperCase();
  if (type === 'GBFM') return null;
  if (entry.action) return entry.action;
  if (['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC'].includes(type)) return 'additem';
  if (type === 'PERK') return 'addperk';
  if (type === 'SPEL') return 'addspell';
  if (type === 'NPC_') return 'spawn';
  if (type === 'WTHR') return 'forceweather';
  if (type === 'CELL' && entry.keywords?.[0]) return 'teleport';
  if (type === 'LCTN') return 'findcell';
  return null;
}

function renderIdBrowserSelection(): string {
  const entry = idBrowserSelected;
  if (!entry) {
    return `<div class="id-browser-selection id-browser-selection--empty"><span class="osf-eyebrow">SELECTED ID</span><span>Choose a result to inspect it and reveal a safe quick action when available.</span></div>`;
  }
  const action = idBrowserAction(entry);
  const editorId = ['CELL', 'LCTN'].includes(entry.type.toUpperCase()) ? entry.keywords?.[0] : undefined;
  const actionLabel = action === 'additem'
    ? 'Add to Player'
    : action === 'addperk'
      ? 'Add Perk'
      : action === 'addspell'
        ? 'Add Spell / Power'
        : action === 'forceweather'
          ? 'Change Weather'
          : action === 'teleport'
            ? 'Teleport Here'
            : action === 'findcell'
              ? 'Find Teleportable Cell'
              : action === 'spawn'
                ? 'Spawn 1'
                : '';
  return `
    <div class="id-browser-selection">
      <div class="id-browser-selection-copy">
        <span class="osf-eyebrow">SELECTED ID</span>
        <strong>${escapeHtml(entry.label)}</strong>
        <span>${escapeHtml(entry.type)} / ${escapeHtml(entry.category)}${entry.detail ? ` — ${escapeHtml(entry.detail)}` : ''}</span>
        ${editorId ? `<span>Editor ID: <code>${escapeHtml(editorId)}</code></span>` : ''}
      </div>
      <code>${escapeHtml(entry.value)}</code>
      <div class="id-browser-selection-actions">
        ${activeCatalogPicker?.browser === 'id' ? `<button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-use-id-browser-selection>Use This ID</button>` : ''}
        <button class="osf-btn osf-btn--sm" type="button" data-copy-id-browser-id="${escapeHtml(entry.value)}">Copy ID</button>
        ${editorId ? `<button class="osf-btn osf-btn--sm" type="button" data-copy-id-browser-id="${escapeHtml(editorId)}">Copy Editor ID</button>` : ''}
        ${action === 'additem' ? `<label class="id-browser-quantity"><span class="osf-eyebrow">QUANTITY</span><input class="osf-input" id="id-browser-quantity" type="text" value="${idBrowserQuantity}" inputmode="numeric" autocomplete="off" aria-label="Item quantity from 1 to 999999"></label>` : ''}
        ${action ? `<button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-id-browser-action="${action}">${actionLabel}</button>` : ''}
      </div>
    </div>`;
}

function renderIdBrowserPanel(): void {
  const results = matchingBuiltInIds();
  resultCount.textContent = `${results.length} shown / ${idCatalog.length} included IDs${idBrowserRecordTypeFilter ? ` / ${idBrowserRecordTypeFilter}` : ''}`;

  const renderResultTile = (entry: IdCatalogEntry, index: number) => `
    <button class="id-browser-row${idBrowserSelected?.value === entry.value && idBrowserSelected?.type === entry.type ? ' is-selected' : ''}" type="button" data-id-browser-index="${index}">
      <span class="id-browser-row-main">
        <strong title="${escapeHtml(entry.label)}">${escapeHtml(entry.label)}</strong>
        <span class="id-browser-row-detail"><span>${escapeHtml(entry.type)}</span>${entry.detail ? `<span>${escapeHtml(entry.detail)}</span>` : `<span>${escapeHtml(entry.category)}</span>`}</span>
      </span>
      <code>${escapeHtml(entry.value)}</code>
    </button>`;
  const resultGroups = groupedIdBrowserResults(results).map(([category, entries]) => {
    const open = Boolean(query) || activeCatalogPicker?.browser === 'id' || idBrowserOpenCategories.has(category);
    const visibleCount = Math.min(entries.length, idBrowserVisibleCounts.get(category) ?? ID_BROWSER_PAGE_SIZE);
    const visibleEntries = open ? entries.slice(0, visibleCount) : [];
    return `
    <details class="inventory-type-group id-browser-category-group" data-id-browser-category-group="${escapeHtml(category)}"${open ? ' open' : ''}>
      <summary><span>${escapeHtml(category)}</span><span>${entries.length.toLocaleString()} ${entries.length === 1 ? 'ID' : 'IDs'}</span></summary>
      <div class="inventory-type-contents id-browser-category-contents">
        ${visibleEntries.map(({ entry, index }) => renderResultTile(entry, index)).join('')}
        ${open && visibleCount < entries.length ? `<button class="osf-btn id-browser-more" type="button" data-id-browser-more="${escapeHtml(category)}">Show ${Math.min(ID_BROWSER_PAGE_SIZE, entries.length - visibleCount).toLocaleString()} more</button>` : ''}
      </div>
    </details>`;
  }).join('');

  customPanel.innerHTML = `
    <section class="id-browser-panel${activeCatalogPicker?.browser === 'id' ? ' is-selecting' : ''}">
      ${activeCatalogPicker?.browser === 'id' ? `<section class="browser-selection-banner osf-card"><div><strong>CHOOSE AN ID</strong><span>Select a matching record, then choose Use This ID. No console command will run.</span></div><button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-cancel-catalog-picker>Cancel Selection</button></section>` : ''}
      ${renderIdBrowserSelection()}

      <div class="id-browser-result-head">
        <span>${results.length} matching IDs</span>
        <span>${idCatalog.length} included</span>
      </div>
      <div class="osf-tricolor id-browser-divider" aria-hidden="true"></div>
      <div class="id-browser-results" id="id-browser-results">
        ${resultGroups || '<div class="id-picker-empty"><strong>No matching IDs</strong><span>Try a broader search or another category.</span></div>'}
      </div>
    </section>`;

  const resultsElement = document.querySelector('#id-browser-results');
  resultsElement?.addEventListener('click', (event) => {
    const moreButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-id-browser-more]');
    if (moreButton?.dataset.idBrowserMore) {
      const category = moreButton.dataset.idBrowserMore;
      const scrollTop = resultsElement.scrollTop;
      idBrowserVisibleCounts.set(category, (idBrowserVisibleCounts.get(category) ?? ID_BROWSER_PAGE_SIZE) + ID_BROWSER_PAGE_SIZE);
      idBrowserOpenCategories.clear();
      idBrowserOpenCategories.add(category);
      render();
      const replacement = document.querySelector<HTMLElement>('#id-browser-results');
      if (replacement) replacement.scrollTop = scrollTop;
      return;
    }
    const row = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-id-browser-index]');
    if (!row?.dataset.idBrowserIndex) return;
    const index = Number(row.dataset.idBrowserIndex);
    const entry = results[index];
    if (!entry) return;
    const scrollTop = resultsElement.scrollTop;
    idBrowserSelected = entry;
    idBrowserQuantity = 1;
    setStatus(`Selected ${entry.label}: ${entry.value}`, 'success');
    render();
    const replacement = document.querySelector<HTMLElement>('#id-browser-results');
    if (replacement) replacement.scrollTop = scrollTop;
  });

  resultsElement?.querySelectorAll<HTMLDetailsElement>('[data-id-browser-category-group]').forEach((group) => {
    group.addEventListener('toggle', () => {
      if (query) return;
      const category = group.dataset.idBrowserCategoryGroup;
      if (!category) return;
      if (group.open) {
        const scrollTop = resultsElement.scrollTop;
        idBrowserOpenCategories.clear();
        idBrowserOpenCategories.add(category);
        resultsElement.querySelectorAll<HTMLDetailsElement>('[data-id-browser-category-group]').forEach((otherGroup) => {
          if (otherGroup !== group) otherGroup.open = false;
        });
        if (!group.querySelector('[data-id-browser-index]')) {
          render();
          const replacement = document.querySelector<HTMLElement>('#id-browser-results');
          if (replacement) replacement.scrollTop = scrollTop;
        }
      }
      else idBrowserOpenCategories.delete(category);
    });
  });

  const quantityInput = document.querySelector<HTMLInputElement>('#id-browser-quantity');
  quantityInput?.addEventListener('input', () => {
    const quantity = Number(quantityInput.value);
    if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 999999) idBrowserQuantity = quantity;
  });

  document.querySelector<HTMLButtonElement>('[data-id-browser-action]')?.addEventListener('click', () => {
    if (!idBrowserSelected) return;
    const action = idBrowserAction(idBrowserSelected);
    if (action === 'findcell') {
      query = idBrowserSelected.label;
      search.value = query;
      activeCatalogPicker = null;
      idBrowserCategory = 'locations';
      idBrowserRecordTypeFilter = 'CELL';
      idBrowserSelected = null;
      idBrowserOpenCategories.clear();
      idBrowserOpenCategories.add('Cells');
      idBrowserVisibleCounts.clear();
      setStatus(`Showing teleportable cells matching ${query}.`, 'success');
      render();
      return;
    }
    if (action === 'additem') {
      const quantity = Number(quantityInput?.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999999) {
        setStatus('Enter a whole-number quantity from 1 to 999999.', 'error');
        quantityInput?.focus();
        quantityInput?.select();
        return;
      }
      idBrowserQuantity = quantity;
    }
    requestIdBrowserQuickAction(idBrowserSelected, idBrowserQuantity);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-copy-id-browser-id]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.copyIdBrowserId) void copyResultId(button.dataset.copyIdBrowserId);
  }));
  document.querySelector<HTMLButtonElement>('[data-use-id-browser-selection]')?.addEventListener('click', () => {
    if (idBrowserSelected) finishCatalogPicker(idBrowserSelected.value, idBrowserSelected.label);
  });
  document.querySelector<HTMLButtonElement>('[data-cancel-catalog-picker]')?.addEventListener('click', () => finishCatalogPicker());
}

function requestIdBrowserQuickAction(entry: IdCatalogEntry, quantity = 1): void {
  const action = idBrowserAction(entry);
  if (!action || action === 'findcell') return;

  let command = '';
  let title = '';
  let description = '';
  let warning: string | undefined;
  let risk: 'caution' | 'danger' | undefined;

  if (action === 'additem') {
    command = `player.additem ${entry.value} ${quantity}`;
    title = `Add ${entry.label}`;
    description = `Add ${quantity.toLocaleString()} ${entry.label} to the player inventory.`;
    warning = `This adds ${quantity.toLocaleString()} item${quantity === 1 ? '' : 's'} directly to the player inventory.`;
    risk = 'caution';
  } else if (action === 'addperk') {
    command = `player.addperk ${entry.value}`;
    title = `Add ${entry.label}`;
    description = `Add the selected perk / skill record.`;
    warning = 'Adding progression records can bypass normal prerequisites or progression. Save first.';
    risk = 'caution';
  } else if (action === 'addspell') {
    command = `player.addspell ${entry.value}`;
    title = `Add ${entry.label}`;
    description = `Add the selected spell / power record.`;
    warning = 'Adding arbitrary spell or power records can create persistent progression or status changes. Save first.';
    risk = 'danger';
  } else if (action === 'forceweather') {
    command = `fw ${entry.value}`;
    title = `Change Weather to ${entry.label}`;
    description = `Immediately force the selected weather record.`;
    warning = 'Weather records are location-dependent. The selected weather may look wrong or be overridden by the current location, climate, or scripts.';
    risk = 'caution';
  } else if (action === 'teleport') {
    const cellEditorId = entry.keywords?.[0];
    if (!cellEditorId) return;
    command = `coc ${cellEditorId}`;
    title = `Teleport to ${entry.label}`;
    description = `Teleport directly to the selected cell.`;
    warning = 'An unsuitable cell can place you in test areas, unloaded spaces, or locations with broken progression context. Save first.';
    risk = 'danger';
  } else {
    command = `player.placeatme ${entry.value} 1`;
    title = `Spawn ${entry.label}`;
    description = `Spawn one instance of the selected base record.`;
    warning = 'Spawning base records can create duplicate NPCs, ships, or objects and may destabilize scripted content. Use a disposable save.';
    risk = 'danger';
  }

  const definition: CommandDefinition = {
    id: `id-browser-${action}-${entry.value.toLowerCase()}`,
    title,
    category: action === 'addperk' || action === 'addspell' ? 'Skills' : action === 'spawn' ? 'Targets' : action === 'forceweather' || action === 'teleport' ? 'World' : 'Inventory',
    description,
    command,
    warning,
    risk,
    testStatus: action === 'forceweather' || action === 'teleport' ? 'verified' : 'untested',
  };
  requestExecution({ command, definition, rememberRecent: false });
}

function renderCustomPanel(draftName = '', draftCommands = ''): void {
  const savedEntries = savedCustomCommands.map((entry) => {
    const commands = parseCustomCommands(entry.commands);
    return `
      <article class="custom-saved-entry">
        <div class="custom-saved-entry-copy">
          <strong>${escapeHtml(entry.name)}</strong>
          <span>${commands.length} command${commands.length === 1 ? '' : 's'}</span>
        </div>
        <div class="custom-saved-entry-actions">
          <button class="osf-btn osf-btn--sm" type="button" data-custom-load="${escapeHtml(entry.id)}">Load</button>
          <button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-custom-delete="${escapeHtml(entry.id)}">Delete</button>
        </div>
      </article>`;
  }).join('');

  customPanel.innerHTML = `
    <section class="custom-card osf-card">
      <div class="custom-workspace">
        <div class="custom-editor-pane">
          <p class="osf-eyebrow">RAW CONSOLE COMMANDS</p>
          <h3>Execute commands directly</h3>
          <p>Enter one console command per line. CCC runs nonempty lines in order.</p>
          <form id="custom-form" class="custom-form">
            <label>
              <span>Commands</span>
              <textarea class="osf-input custom-command-input" id="custom-command" rows="8" autocomplete="off" spellcheck="false" placeholder="One command per line, for example:&#10;tgm&#10;player.additem 0000ABF9 4">${escapeHtml(draftCommands)}</textarea>
            </label>
            <button class="osf-btn osf-btn--osf-accent" type="submit" ${nativeBackendReady ? '' : 'disabled'}>Review Commands</button>
          </form>
          <div class="custom-note"><strong>NOTE</strong><span>Up to ${MAX_CUSTOM_BATCH_COMMANDS} commands can run in one batch. The batch stops if a command reports an error. Save before experimenting with commands you do not recognize.</span></div>
        </div>
        <aside class="custom-saved-panel" aria-label="Saved custom commands">
          <div class="custom-saved-heading">
            <div><p class="osf-eyebrow">SAVED COMMANDS</p><h4>Reusable entries</h4></div>
            <div class="custom-saved-heading-actions">
              <span>${savedCustomCommands.length} / ${MAX_SAVED_CUSTOM_COMMANDS}</span>
              ${savedCustomCommands.length ? '<button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-custom-delete-all>Delete All</button>' : ''}
            </div>
          </div>
          <div class="custom-delete-all-confirm" data-custom-delete-all-confirm hidden>
            <strong>Delete all saved entries?</strong>
            <span>Type <b>Delete</b> to confirm. This cannot be undone.</span>
            <input class="osf-input" type="text" autocomplete="off" spellcheck="false" placeholder="Type Delete" data-custom-delete-all-input>
            <div><button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-custom-delete-all-cancel>Cancel</button><button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-custom-delete-all-commit disabled>Delete All</button></div>
          </div>
          <form id="custom-save-form" class="custom-save-form">
            <label>
              <span>Entry Name</span>
              <input class="osf-input" id="custom-command-name" type="text" maxlength="${MAX_CUSTOM_COMMAND_NAME_LENGTH}" autocomplete="off" placeholder="Example: Photo mode setup" value="${escapeHtml(draftName)}">
            </label>
            <button class="osf-btn osf-btn--sm" type="submit">Save Current</button>
          </form>
          <div class="custom-saved-list">
            ${savedEntries || '<div class="custom-saved-empty"><strong>No saved entries</strong><span>Name the current batch and save it here.</span></div>'}
          </div>
        </aside>
      </div>
    </section>
  `;

  const form = customPanel.querySelector('#custom-form');
  const input = customPanel.querySelector('#custom-command');
  const saveForm = customPanel.querySelector('#custom-save-form');
  const nameInput = customPanel.querySelector('#custom-command-name');
  if (form instanceof HTMLFormElement && input instanceof HTMLTextAreaElement) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const commands = parseCustomCommands(input.value);
      if (commands.length === 0) {
        setStatus('Enter at least one console command.', 'error');
        input.focus();
        return;
      }
      if (commands.length > MAX_CUSTOM_BATCH_COMMANDS) {
        setStatus(`A batch can contain up to ${MAX_CUSTOM_BATCH_COMMANDS} commands.`, 'error');
        input.focus();
        return;
      }
      const oversizedIndex = commands.findIndex((command) => command.length > MAX_CUSTOM_COMMAND_LENGTH);
      if (oversizedIndex >= 0) {
        setStatus(`Command ${oversizedIndex + 1} exceeds the ${MAX_CUSTOM_COMMAND_LENGTH}-character limit.`, 'error');
        input.focus();
        return;
      }
      showConfirmation(
        { command: commands.join('\n'), commands },
        `${commands.length} custom command${commands.length === 1 ? '' : 's'} will run in order. The batch stops if a command reports an error.`,
        'danger',
      );
    });
  }

  if (saveForm instanceof HTMLFormElement && nameInput instanceof HTMLInputElement && input instanceof HTMLTextAreaElement) {
    saveForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const commands = parseCustomCommands(input.value);
      if (!name) {
        setStatus('Enter a name for this saved command entry.', 'error');
        nameInput.focus();
        return;
      }
      if (commands.length === 0) {
        setStatus('Enter at least one console command before saving.', 'error');
        input.focus();
        return;
      }
      if (commands.length > MAX_CUSTOM_BATCH_COMMANDS) {
        setStatus(`A saved batch can contain up to ${MAX_CUSTOM_BATCH_COMMANDS} commands.`, 'error');
        input.focus();
        return;
      }
      const oversizedIndex = commands.findIndex((command) => command.length > MAX_CUSTOM_COMMAND_LENGTH);
      if (oversizedIndex >= 0) {
        setStatus(`Command ${oversizedIndex + 1} exceeds the ${MAX_CUSTOM_COMMAND_LENGTH}-character limit.`, 'error');
        input.focus();
        return;
      }

      const existingIndex = savedCustomCommands.findIndex((entry) => entry.name.toLowerCase() === name.toLowerCase());
      if (existingIndex < 0 && savedCustomCommands.length >= MAX_SAVED_CUSTOM_COMMANDS) {
        setStatus(`You can save up to ${MAX_SAVED_CUSTOM_COMMANDS} custom command entries. Delete one before adding another.`, 'error');
        return;
      }

      const entry: SavedCustomCommand = {
        id: existingIndex >= 0 ? savedCustomCommands[existingIndex].id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        commands: commands.join('\n'),
        updatedAt: Date.now(),
      };
      if (existingIndex >= 0) savedCustomCommands.splice(existingIndex, 1);
      savedCustomCommands = [entry, ...savedCustomCommands].slice(0, MAX_SAVED_CUSTOM_COMMANDS);
      writeSavedCustomCommands();
      setStatus(`${existingIndex >= 0 ? 'Updated' : 'Saved'} custom command entry: ${name}.`, 'success');
      renderCustomPanel('', input.value);
    });
  }

  customPanel.querySelectorAll<HTMLButtonElement>('[data-custom-load]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = savedCustomCommands.find((candidate) => candidate.id === button.dataset.customLoad);
      if (!entry || !(input instanceof HTMLTextAreaElement) || !(nameInput instanceof HTMLInputElement)) return;
      input.value = entry.commands;
      nameInput.value = entry.name;
      input.focus();
      setStatus(`Loaded ${entry.name}. Review the commands before running them.`, 'success');
    });
  });

  customPanel.querySelectorAll<HTMLButtonElement>('[data-custom-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = savedCustomCommands.find((candidate) => candidate.id === button.dataset.customDelete);
      if (!entry) return;
      const currentName = nameInput instanceof HTMLInputElement ? nameInput.value : '';
      const currentCommands = input instanceof HTMLTextAreaElement ? input.value : '';
      savedCustomCommands = savedCustomCommands.filter((candidate) => candidate.id !== entry.id);
      writeSavedCustomCommands();
      setStatus(`Deleted saved custom command entry: ${entry.name}.`, 'success');
      renderCustomPanel(currentName, currentCommands);
    });
  });

  const deleteAllButton = customPanel.querySelector<HTMLButtonElement>('[data-custom-delete-all]');
  const deleteAllConfirm = customPanel.querySelector<HTMLElement>('[data-custom-delete-all-confirm]');
  const deleteAllInput = customPanel.querySelector<HTMLInputElement>('[data-custom-delete-all-input]');
  const deleteAllCancel = customPanel.querySelector<HTMLButtonElement>('[data-custom-delete-all-cancel]');
  const deleteAllCommit = customPanel.querySelector<HTMLButtonElement>('[data-custom-delete-all-commit]');
  deleteAllButton?.addEventListener('click', () => {
    if (!deleteAllConfirm || !deleteAllInput) return;
    deleteAllConfirm.hidden = false;
    deleteAllInput.value = '';
    if (deleteAllCommit) deleteAllCommit.disabled = true;
    deleteAllInput.focus();
  });
  deleteAllInput?.addEventListener('input', () => {
    if (deleteAllCommit) deleteAllCommit.disabled = deleteAllInput.value !== 'Delete';
  });
  deleteAllCancel?.addEventListener('click', () => {
    if (deleteAllConfirm) deleteAllConfirm.hidden = true;
  });
  deleteAllCommit?.addEventListener('click', () => {
    if (deleteAllInput?.value !== 'Delete') return;
    const currentName = nameInput instanceof HTMLInputElement ? nameInput.value : '';
    const currentCommands = input instanceof HTMLTextAreaElement ? input.value : '';
    const deletedCount = savedCustomCommands.length;
    savedCustomCommands = [];
    writeSavedCustomCommands();
    setStatus(`Deleted all ${deletedCount} saved custom command entries.`, 'success');
    renderCustomPanel(currentName, currentCommands);
  });
}

function openPackagedFormSearch(definition: CommandDefinition): void {
  const searchInput = document.getElementById(`${definition.id}-search`);
  const searchText = searchInput instanceof HTMLInputElement ? searchInput.value.trim() : '';
  const recordTypeKey = definition.catalogSearch?.recordTypeInput;
  const recordTypeInput = recordTypeKey ? document.getElementById(`${definition.id}-${recordTypeKey}`) : null;
  const recordType = recordTypeInput instanceof HTMLInputElement ? recordTypeInput.value.trim().toUpperCase() : '';

  addRecent(definition.id);
  query = searchText;
  search.value = searchText;

  if (recordType === 'QUST') {
    activeView = 'quest-browser';
    openQuestBrowserGroup = null;
    idBrowserRecordTypeFilter = '';
    render();
    setStatus(`Showing included quest records matching “${searchText}”.`, 'success');
    return;
  }

  activeView = 'id-browser';
  idBrowserRecordTypeFilter = recordType;
  idBrowserCategory = recordType
    ? (ID_BROWSER_CATEGORIES.find((category) => category.recordType === recordType)?.value ?? 'all')
    : 'all';
  idBrowserSelected = null;
  idBrowserQuantity = 1;
  idBrowserOpenCategories.clear();
  idBrowserVisibleCounts.clear();
  render();
  setStatus(recordType
    ? `Showing included ${recordType} records matching “${searchText}”.`
    : `Showing included IDs matching “${searchText}”.`, 'success');
}

function commandInputValues(command: CommandDefinition): Record<string, string> {
  return Object.fromEntries((command.inputs ?? []).map((input) => {
    const element = document.getElementById(`${command.id}-${input.key}`);
    const fallback = input.defaultValue === undefined ? '' : String(input.defaultValue);
    return [input.key, element instanceof HTMLInputElement ? element.value : fallback];
  }));
}

function openCatalogPicker(command: CommandDefinition, input: CommandInput): void {
  const browserPicker = input.browserPicker;
  if (!browserPicker) return;
  activeCatalogPicker = {
    browser: browserPicker.browser,
    commandId: command.id,
    inputKey: input.key,
    allowedTypes: (browserPicker.allowedTypes ?? []).map((type) => type.toUpperCase()),
    allowedCategories: browserPicker.allowedCategories ?? [],
    returnView: activeView,
    returnQuery: query,
    values: commandInputValues(command),
  };

  query = '';
  search.value = '';
  if (browserPicker.browser === 'quest') {
    activeView = 'quest-browser';
    openQuestBrowserGroup = null;
    render();
    setStatus('Choose a quest to fill the command field. No quest command will run.', 'normal');
    return;
  }

  activeView = 'id-browser';
  idBrowserRecordTypeFilter = '';
  idBrowserCategory = activeCatalogPicker.allowedTypes.length === 1
    ? (ID_BROWSER_CATEGORIES.find((category) => category.recordType === activeCatalogPicker?.allowedTypes[0])?.value ?? 'all')
    : 'all';
  idBrowserSelected = null;
  idBrowserQuantity = 1;
  idBrowserOpenCategories.clear();
  idBrowserVisibleCounts.clear();
  render();
  setStatus('Choose an included record to fill the command field. No console command will run.', 'normal');
}

function finishCatalogPicker(value?: string, label?: string): void {
  const picker = activeCatalogPicker;
  if (!picker) return;
  activeCatalogPicker = null;
  activeView = picker.returnView;
  query = picker.returnQuery;
  search.value = picker.returnQuery;
  idBrowserCategory = 'all';
  idBrowserRecordTypeFilter = '';
  idBrowserSelected = null;
  idBrowserOpenCategories.clear();
  idBrowserVisibleCounts.clear();
  render();

  for (const [inputKey, inputValue] of Object.entries(picker.values)) {
    const element = document.getElementById(`${picker.commandId}-${inputKey}`);
    if (element instanceof HTMLInputElement) element.value = inputValue;
  }
  const target = document.getElementById(`${picker.commandId}-${picker.inputKey}`);
  if (target instanceof HTMLInputElement && value) {
    target.value = value;
    target.focus();
    target.select();
    setStatus(`Selected ${label ?? value}: ${value}`, 'success');
  } else {
    setStatus('Selection cancelled. Command values were preserved.', 'normal');
  }
}

async function openQuestStagePicker(commandId: string, inputKey: string, questInputKey: string): Promise<void> {
  const questInput = document.getElementById(`${commandId}-${questInputKey}`);
  if (!(questInput instanceof HTMLInputElement)) return;
  const questId = questInput.value.trim().toUpperCase().padStart(8, '0');
  setStatus('Loading recorded quest stages...', 'working');
  await ensureQuestBrowserLoaded();
  const quest = questBrowserEntries.find((entry) => entry.questId.toUpperCase() === questId);
  if (!quest) {
    setStatus('That Quest ID is not in the packaged Quest Browser.', 'error');
    questInput.focus();
    questInput.select();
    return;
  }
  if (quest.stages.length === 0) {
    setStatus(`${quest.quest} has no recorded stage indexes to choose from.`, 'error');
    return;
  }
  openIdPicker(commandId, inputKey, {
    title: `Choose Stage — ${quest.quest}`,
    buttonLabel: 'Choose Stage',
    searchPlaceholder: 'Search stage number...',
    options: quest.stages.map((stage) => ({ label: `Stage ${stage}`, value: String(stage), detail: quest.editorId })),
  });
  setStatus(`Choose one of ${quest.stages.length} recorded stages for ${quest.quest}.`, 'normal');
}

function switchView(view: string): void {
  const leavingIdBrowserSearch = activeView === 'id-browser' && Boolean(query);
  activeView = view;
  activeCatalogPicker = null;
  query = '';
  search.value = view === 'Untested' ? untestedQuery : '';
  if (view === 'id-browser') {
    idBrowserCategory = 'all';
    idBrowserRecordTypeFilter = '';
  }
  if (leavingIdBrowserSearch) {
    idBrowserOpenCategories.clear();
    idBrowserVisibleCounts.clear();
  }
  render();
}

navigation.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-view]');
  if (!button?.dataset.view) return;
  switchView(button.dataset.view);
});

(['id-browser', 'quest-browser', 'activity', 'custom'] as const).forEach((view) => {
  document.querySelector<HTMLButtonElement>(`[data-view="${view}"]`)?.addEventListener('click', () => switchView(view));
});

search.addEventListener('input', () => {
  if (activeView === 'Untested') {
    untestedQuery = search.value;
    untestedGroupVisibleCounts.clear();
    render();
    return;
  }
  const previousQuery = query;
  query = search.value.trim();
  untestedGroupVisibleCounts.clear();
  if (activeView === 'id-browser') {
    idBrowserSelected = null;
    idBrowserQuantity = 1;
    idBrowserVisibleCounts.clear();
    if (previousQuery && !query) {
      idBrowserOpenCategories.clear();
      if (!activeCatalogPicker) {
        idBrowserCategory = 'all';
        idBrowserRecordTypeFilter = '';
      }
    }
  }
  render();
});
searchClear.addEventListener('click', () => clearSearchInput(search));

document.addEventListener('click', (event) => {
  const input = (event.target as Element | null)?.closest<HTMLInputElement>('input.osf-input');
  if (input && !input.disabled && !input.readOnly) input.select();
});

commandList.addEventListener('click', (event) => {
  const clearRecentButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-clear-recent]');
  if (clearRecentButton) {
    recent = [];
    writeStringArray(STORAGE_RECENT, recent);
    render();
    setStatus('Recent commands cleared.', 'success');
    return;
  }

  const untestedGroupButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-untested-group]');
  if (untestedGroupButton?.dataset.untestedGroup && !untestedQuery.trim()) {
    openUntestedGroup = openUntestedGroup === untestedGroupButton.dataset.untestedGroup
      ? null
      : untestedGroupButton.dataset.untestedGroup;
    render();
    return;
  }

  const untestedMoreButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-untested-more]');
  if (untestedMoreButton?.dataset.untestedMore) {
    const group = untestedMoreButton.dataset.untestedMore;
    const scrollTop = commandList.scrollTop;
    untestedGroupVisibleCounts.set(group, (untestedGroupVisibleCounts.get(group) ?? UNTESTED_COMMAND_PAGE_SIZE) + UNTESTED_COMMAND_PAGE_SIZE);
    openUntestedGroup = group;
    render();
    commandList.scrollTop = scrollTop;
    return;
  }

  const pickerButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-open-id-picker]');
  if (pickerButton?.dataset.openIdPicker && pickerButton.dataset.inputKey) {
    const command = COMMANDS.find((entry) => entry.id === pickerButton.dataset.openIdPicker);
    const input = command?.inputs?.find((entry) => entry.key === pickerButton.dataset.inputKey);
    if (command && input?.picker) openIdPicker(command.id, input.key, input.picker);
    return;
  }

  const catalogPickerButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-open-catalog-picker]');
  if (catalogPickerButton?.dataset.openCatalogPicker && catalogPickerButton.dataset.inputKey) {
    const command = COMMANDS.find((entry) => entry.id === catalogPickerButton.dataset.openCatalogPicker);
    const input = command?.inputs?.find((entry) => entry.key === catalogPickerButton.dataset.inputKey);
    if (command && input?.browserPicker) openCatalogPicker(command, input);
    return;
  }

  const questStagePickerButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-open-quest-stage-picker]');
  if (questStagePickerButton?.dataset.openQuestStagePicker && questStagePickerButton.dataset.inputKey && questStagePickerButton.dataset.questInputKey) {
    void openQuestStagePicker(
      questStagePickerButton.dataset.openQuestStagePicker,
      questStagePickerButton.dataset.inputKey,
      questStagePickerButton.dataset.questInputKey,
    );
    return;
  }

  const cancelCatalogPickerButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-cancel-catalog-picker]');
  if (cancelCatalogPickerButton) {
    finishCatalogPicker();
    return;
  }

  const useQuestButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-use-quest-id]');
  if (useQuestButton?.dataset.useQuestId) {
    finishCatalogPicker(useQuestButton.dataset.useQuestId, useQuestButton.dataset.useQuestTitle);
    return;
  }

  const questGroupButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-group]');
  if (questGroupButton?.dataset.questGroup) {
    openQuestBrowserGroup = openQuestBrowserGroup === questGroupButton.dataset.questGroup
      ? null
      : questGroupButton.dataset.questGroup;
    renderQuestBrowser();
    return;
  }

  const questPageButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-page-group]');
  if (questPageButton?.dataset.questPageGroup && questPageButton.dataset.questPage) {
    questBrowserPages.set(questPageButton.dataset.questPageGroup, Number(questPageButton.dataset.questPage));
    openQuestBrowserGroup = questPageButton.dataset.questPageGroup;
    renderQuestBrowser();
    return;
  }

  const questCopyButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy-text]');
  if (questCopyButton?.dataset.copyText) {
    void copyResultId(questCopyButton.dataset.copyText);
    return;
  }

  const questInspectButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-inspect]');
  if (questInspectButton?.dataset.questInspect && questInspectButton.dataset.questId && questInspectButton.dataset.questTitle) {
    const mode = questInspectButton.dataset.questInspect === 'history' ? 'history' : 'stage';
    openQuestBrowserCards.add(normalizedQuestId(questInspectButton.dataset.questId));
    const groupButton = questInspectButton.closest('.quest-browser-group')?.querySelector<HTMLButtonElement>('[data-quest-group]');
    if (groupButton?.dataset.questGroup) openQuestBrowserGroup = groupButton.dataset.questGroup;
    void inspectQuest(questInspectButton.dataset.questId, questInspectButton.dataset.questTitle, mode, undefined, commandList.scrollTop);
    return;
  }

  const questActionButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-action]');
  if (questActionButton?.dataset.questAction && questActionButton.dataset.questId && questActionButton.dataset.questTitle) {
    const actions = {
      start: {
        verb: 'startquest', label: 'Start', status: 'needs-adjustment' as const,
        description: 'Start the selected quest. Some quests need a stage before they appear in the quest log.',
        warning: 'StartQuest can begin content before its prerequisites are ready. Some quests do not become visible until a stage is set. Make a manual save before continuing.',
      },
      stop: {
        verb: 'stopquest', label: 'Stop', status: 'verified' as const,
        description: 'Stop the selected quest without clearing its recorded stages.',
        warning: 'StopQuest can leave scripts, scenes, NPC state, and linked quests inconsistent. Make a manual save before continuing.',
      },
      complete: {
        verb: 'completequest', label: 'Complete', status: 'verified' as const,
        description: 'Request completion of the selected quest. Not every quest supports generic completion.',
        warning: 'CompleteQuest can skip objectives, dialogue, scripts, scenes, and rewards, and some quests do not accept generic completion. Make a manual save before continuing.',
      },
      reset: {
        verb: 'resetquest', label: 'Reset', status: 'verified' as const,
        description: 'Clear recorded stages and remove the selected quest from the quest log. This does not restart it.',
        warning: 'ResetQuest clears recorded stages and removes the quest from the log without restarting it. Existing NPC, scene, and world changes may remain. Use only on a backup save.',
      },
    };
    const action = actions[questActionButton.dataset.questAction as keyof typeof actions];
    if (!action) return;
    const command = `${action.verb} ${questActionButton.dataset.questId}`;
    const definition: CommandDefinition = {
      id: `quest-browser-${questActionButton.dataset.questAction}-${questActionButton.dataset.questId}`,
      title: `${action.label} ${questActionButton.dataset.questTitle}`,
      category: 'Quests',
      description: action.description,
      command,
      warning: action.warning,
      risk: 'danger',
      testStatus: action.status,
      verifyInGame: true,
    };
    requestExecution({ command, definition, rememberRecent: false });
    return;
  }


  const questButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-command]');
  if (questButton?.dataset.questCommand && questButton.dataset.questTitle && questButton.dataset.questStage) {
    const questTitle = questButton.dataset.questTitle;
    const stage = Number(questButton.dataset.questStage);
    const command = questButton.dataset.questCommand;
    const definition: CommandDefinition = {
      id: `quest-browser-stage-${command.replace(/\s+/g, '-').toLowerCase()}`,
      title: `${questTitle} — Stage ${stage}`,
      category: 'Quests',
      description: `Set ${questTitle} directly to stage ${stage}.`,
      command,
      warning: 'SetStage can bypass dialogue, scripts, rewards, scenes, or prerequisites. Make a manual save and use this only to skip past a quest step that is already stuck.',
      risk: 'danger',
      testStatus: 'untested',
      verifyInGame: true,
    };
    requestExecution({ command, definition, rememberRecent: false });
    return;
  }

  const cautionButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-caution]');
  if (cautionButton?.dataset.caution) {
    const wrap = cautionButton.closest<HTMLElement>('.caution-wrap');
    const willOpen = !(wrap?.classList.contains('is-open') ?? false);
    closeCautionPopovers(cautionButton.dataset.caution);
    if (wrap) wrap.classList.toggle('is-open', willOpen);
    cautionButton.setAttribute('aria-expanded', String(willOpen));
    return;
  }

  const favoriteButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-favorite]');
  if (favoriteButton?.dataset.favorite) {
    toggleFavorite(favoriteButton.dataset.favorite);
    return;
  }

  const executeButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-execute]');
  if (!executeButton?.dataset.execute) return;
  const command = COMMANDS.find((entry) => entry.id === executeButton.dataset.execute);
  if (!command) return;
  const validationError = validateCommand(command);
  if (validationError) {
    setStatus(validationError, 'error');
    return;
  }
  const builtCommand = buildCommand(command);
  const secondary = executeButton.dataset.commandAction === 'secondary' ? command.secondaryAction : undefined;
  const actionDefinition: CommandDefinition = secondary
    ? {
        ...command,
        title: secondary.title,
        command: secondary.command,
        warning: secondary.warning,
        risk: secondary.risk,
        secondaryAction: undefined,
      }
    : command;
  const actionCommand = secondary ? buildCommandTemplate(command, secondary.command) : builtCommand;
  if (command.catalogSearch) {
    openPackagedFormSearch(command);
    return;
  }
  if (command.effectiveTotal) {
    void prepareEffectiveTotalExecution(command, builtCommand);
    return;
  }
  requestExecution({ command: actionCommand, definition: actionDefinition });
});

function closeCautionPopovers(exceptCommandId?: string): void {
  commandList.querySelectorAll<HTMLElement>('.caution-wrap').forEach((wrap) => {
    const button = wrap.querySelector<HTMLButtonElement>('[data-caution]');
    if (exceptCommandId && button?.dataset.caution === exceptCommandId) return;
    wrap.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
  });
}

document.addEventListener('pointerdown', (event) => {
  const target = event.target as Element | null;
  if (!target?.closest('.caution-wrap')) closeCautionPopovers();
});

idPickerSearch.addEventListener('input', renderIdPickerResults);
idPickerSearchClear.addEventListener('click', () => clearSearchInput(idPickerSearch));
idPickerSearch.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  focusIdPickerOption(event.key === 'ArrowDown' ? 'first' : 'last');
});
idPickerClose.addEventListener('click', () => closeIdPicker());
idPickerCancel.addEventListener('click', () => closeIdPicker());
idPickerBackdrop.addEventListener('click', (event) => {
  if (event.target === idPickerBackdrop) closeIdPicker();
});
idPickerResults.addEventListener('click', (event) => {
  const option = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-picker-value]');
  if (!option?.dataset.pickerValue || !option.dataset.pickerLabel) return;
  chooseIdPickerValue(option.dataset.pickerValue, option.dataset.pickerLabel);
});
idPickerResults.addEventListener('keydown', (event) => {
  const option = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-picker-value]');
  if (!option) return;
  const options = idPickerOptions();
  const index = options.indexOf(option);
  if (index < 0) return;

  let nextIndex: number | null = null;
  if (event.key === 'ArrowDown') nextIndex = Math.min(index + 1, options.length - 1);
  if (event.key === 'ArrowUp') nextIndex = Math.max(index - 1, 0);
  if (event.key === 'Home') nextIndex = 0;
  if (event.key === 'End') nextIndex = options.length - 1;
  if (nextIndex === null) return;

  event.preventDefault();
  options[nextIndex]?.focus({ preventScroll: true });
});

async function closeCurrentView(): Promise<void> {
  if (!idPickerBackdrop.hidden) closeIdPicker(false);
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

  if (!window.osfui?.request) {
    setStatus('OSF UI native request API is unavailable.', 'error');
    return;
  }

  try {
    const reply = await window.osfui.request<CloseReply>('console.command-center.close');
    if (!reply?.ok) throw new Error('Native backend did not confirm the close request');
  } catch (error) {
    setStatus(`Unable to close Console Command Center: ${error instanceof Error ? error.message : String(error)}`, 'error');
  }
}

closeView.addEventListener('click', () => {
  void closeCurrentView();
});

function welcomeHasBeenSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_WELCOME_SEEN) === '1';
  } catch {
    return false;
  }
}

function activeHelpPageId(): HelpPageId {
  if (activeView === 'recent') return 'recent';
  if (activeView === 'favorites') return 'favorites';
  if (activeView === 'id-browser') return 'id-browser';
  if (activeView === 'quest-browser') return 'quest-browser';
  if (activeView === 'custom') return 'custom';
  if (activeView === 'activity') return 'activity';
  return 'categories';
}

function openHelp(): void {
  const page = HELP_PAGES[activeHelpPageId()];
  helpEyebrow.textContent = page.eyebrow;
  helpTitle.textContent = page.title;
  helpIntro.textContent = page.intro;
  helpSections.innerHTML = page.sections.map((section) => `
    <article><strong>${escapeHtml(section.title)}</strong><span>${escapeHtml(section.text)}</span></article>
  `).join('');
  helpNote.textContent = page.note ?? '';
  helpNote.hidden = !page.note;
  helpBackdrop.hidden = false;
  helpDone.focus();
}

function closeHelp(restoreFocus = true): void {
  helpBackdrop.hidden = true;
  if (restoreFocus) openHelpButton.focus();
}

function openWelcome(): void {
  welcomeBackdrop.hidden = false;
  welcomeStart.focus();
}

function closeWelcome(): void {
  welcomeBackdrop.hidden = true;
  try {
    localStorage.setItem(STORAGE_WELCOME_SEEN, '1');
  } catch {
    // The guide can still be closed for the current session when persistence is unavailable.
  }
  openHelpButton.focus();
}

openHelpButton.addEventListener('click', openHelp);
helpClose.addEventListener('click', () => closeHelp());
helpDone.addEventListener('click', () => closeHelp());
helpWelcome.addEventListener('click', () => {
  closeHelp(false);
  openWelcome();
});
helpBackdrop.addEventListener('click', (event) => {
  if (event.target === helpBackdrop) closeHelp();
});
welcomeStart.addEventListener('click', closeWelcome);
welcomeBackdrop.addEventListener('click', (event) => {
  if (event.target === welcomeBackdrop) closeWelcome();
});

confirmCancel.addEventListener('click', () => {
  pendingExecution = null;
  confirmBackdrop.hidden = true;
});

confirmRun.addEventListener('click', () => {
  const execution = pendingExecution;
  pendingExecution = null;
  confirmBackdrop.hidden = true;
  if (execution?.commands) void executeCustomBatch(execution);
  else if (execution) void executeConsole(execution);
});

confirmBackdrop.addEventListener('click', (event) => {
  if (event.target === confirmBackdrop) {
    pendingExecution = null;
    confirmBackdrop.hidden = true;
  }
});

document.addEventListener('keydown', (event) => {
  // Back can target the document instead of the focused dialog, so handle it
  // here as well as on the dialog itself.
  if (event.key === 'Escape' && resultsDialog.open) {
    event.preventDefault();
    event.stopPropagation();
    resultsDialog.close();
    return;
  }
  if (event.key === 'Escape') {
    const openCaution = commandList.querySelector<HTMLElement>('.caution-wrap.is-open');
    if (!helpBackdrop.hidden) {
      closeHelp();
    } else if (!welcomeBackdrop.hidden) {
      closeWelcome();
    } else if (!idPickerBackdrop.hidden) {
      closeIdPicker();
    } else if (!confirmBackdrop.hidden) {
      pendingExecution = null;
      confirmBackdrop.hidden = true;
    } else if (openCaution) {
      closeCautionPopovers();
    } else if (activeCatalogPicker) {
      finishCatalogPicker();
    } else {
      void closeCurrentView();
    }
  }
  if (event.key === '/' && idPickerBackdrop.hidden && helpBackdrop.hidden && welcomeBackdrop.hidden && confirmBackdrop.hidden && activeView !== 'custom' && activeView !== 'activity' && document.activeElement !== search) {
    event.preventDefault();
    search.focus({ preventScroll: true });
    search.select();
    return;
  }

  const activeElement = document.activeElement;
  const isEditable = activeElement instanceof HTMLInputElement
    || activeElement instanceof HTMLTextAreaElement
    || activeElement instanceof HTMLSelectElement
    || (activeElement instanceof HTMLElement && activeElement.isContentEditable);

  if (
    event.key.length === 1
    && !event.ctrlKey
    && !event.altKey
    && !event.metaKey
    && activeView !== 'custom'
    && activeView !== 'activity'
    && confirmBackdrop.hidden
    && idPickerBackdrop.hidden
    && helpBackdrop.hidden
    && welcomeBackdrop.hidden
    && !isEditable
  ) {
    event.preventDefault();
    search.focus({ preventScroll: true });
    search.value += event.key;
    search.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

async function connectNativeBackend(): Promise<void> {
  if (!window.osfui?.request) {
    nativeBackendReady = false;
    footerNativeStatus.textContent = 'UNAVAILABLE';
    setStatus('OSF UI native request API is unavailable.', 'error');
    return;
  }

  try {
    const reply = await window.osfui.request<PingReply>('console.command-center.ping');
    if (!reply?.ok) throw new Error('Native backend returned an unsuccessful ping');
    footerStarfieldVersion.textContent = reply.runtime ?? 'UNKNOWN';
    if (reply.runtimeSupported === false) {
      nativeBackendReady = false;
      footerNativeStatus.textContent = 'DISABLED';
      setStatus(`CCC ${reply.build ?? ''} is tested for Starfield ${reply.testedRuntime ?? '1.16.244'}, but ${reply.runtime ?? 'an unknown runtime'} is running. Native commands are disabled.`, 'error');
      render();
      return;
    }
    nativeBackendReady = true;
    footerNativeStatus.textContent = 'READY';
    setStatus(`${reply.backend}${reply.build ? ` ${reply.build}` : ''} connected.`, 'success');
  } catch (error) {
    nativeBackendReady = false;
    footerNativeStatus.textContent = 'NOT CONNECTED';
    setStatus(`Native backend unavailable: ${describe(error)}`, 'error');
  }

  render();
}

if (window.osfui?.request) {
  footerOsfVersion.textContent = '2.0 API';
  setStatus('OSF UI ready; checking ConsoleCommandCenter.dll...', 'working');
  void connectNativeBackend();
} else {
  nativeBackendReady = false;
  footerOsfVersion.textContent = 'UNAVAILABLE';
  footerStarfieldVersion.textContent = 'UNKNOWN';
  footerNativeStatus.textContent = 'UNAVAILABLE';
  setStatus('OSF UI bridge unavailable.', 'error');
}

render();
installControllerSupport(window.osfui);
if (!welcomeHasBeenSeen()) openWelcome();
