import '/shared/osfui.css';
import '/shared/osfui.js';
import './style.css';
import { CATEGORY_ORDER, COMMANDS, type CommandDefinition, type CommandInput } from './commands';
import { QUEST_SKIPS, QUEST_SKIP_STAGE_COUNT, type QuestSkipGroup } from './quest-skips';
import type { ReferenceIdPicker } from './reference-ids';
import { ID_BROWSER_CATEGORIES, ID_CATALOG, type IdCatalogEntry } from './id-catalog';

type ViewMode = 'favorites' | 'recent' | 'quest-skips' | 'activity' | 'custom' | string;

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

type ActivityEntry = {
  id: string;
  timestamp: number;
  command: string;
  label: string;
  category: string;
  outcome: 'success' | 'error';
  message: string;
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
const MAX_RECENT = 10;
const MAX_ACTIVITY = 100;
const MAX_CUSTOM_BATCH_COMMANDS = 100;
const MAX_CUSTOM_COMMAND_LENGTH = 1024;
const CONSOLE_COMMAND_CENTER_VERSION = '0.3.3';

let activeView: ViewMode = 'recent';
let query = '';
let favorites = readStringArray(STORAGE_FAVORITES);
let recent = readStringArray(STORAGE_RECENT);
let activityLog = readActivityLog();
let pendingExecution: PendingExecution | null = null;
let activeIdPicker: ActiveIdPicker | null = null;
let nativeBackendReady = false;
let idBrowserCategory = 'all';
let idBrowserSelected: IdCatalogEntry | null = null;
let idBrowserQuantity = 1;
const idBrowserOpenCategories = new Set<string>();

app.innerHTML = `
  <main class="command-center-shell">
    <header class="topbar">
      <div class="brand-block">
        <div class="brand-mark" aria-hidden="true">CCC</div>
        <h1>Console Command Center</h1>
      </div>
      <div class="topbar-actions">
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
            <input class="osf-input" id="search" type="search" placeholder="Search name, command, tag..." autocomplete="off">
          </label>
        </div>

        <div class="command-summary">
          <span id="result-count">0 commands</span>
          <span class="summary-separator">/</span>
          <span>Commands may affect achievements or save-game state.</span>
          <span class="summary-separator">/</span>
          <span>Controller support is in development.</span>
        </div>

        <div id="command-list" class="command-list" aria-live="polite"></div>
        <div id="custom-panel" class="custom-panel" hidden></div>
      </section>
    </section>

    <nav class="utility-nav-bar" aria-label="Tools and utilities">
      <button class="nav-button nav-button--ids" type="button" data-view="id-browser">
        <span>ID Browser</span><span class="nav-count">${ID_CATALOG.length}</span>
      </button>
      <button class="nav-button nav-button--quest" type="button" data-view="quest-skips">
        <span>Quest Skips</span><span class="nav-count">${QUEST_SKIP_STAGE_COUNT}</span>
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
        <input class="osf-input" id="id-picker-search" type="search" autocomplete="off" placeholder="Search name or ID...">
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
    <label><span class="osf-eyebrow">SEARCH INVENTORY</span><input class="osf-input" id="inventory-results-search" type="search" autocomplete="off" placeholder="Search item name, type, or Form ID..."></label>
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
const inventoryResultsSort = requiredElement('#inventory-results-sort', HTMLSelectElement);
const inventoryResults = requiredElement('#inventory-results', HTMLElement);
const resultsFooter = requiredElement('#results-footer', HTMLElement);
let inventoryResultRows: InventoryResultRow[] = [];
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

inventoryResultsSearch.addEventListener('input', renderInventoryResults);
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
const idPickerBackdrop = requiredElement('#id-picker-backdrop', HTMLElement);
const idPickerTitle = requiredElement('#id-picker-title', HTMLElement);
const idPickerSearch = requiredElement('#id-picker-search', HTMLInputElement);
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
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
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
  return COMMANDS.filter((command) => command.category === category).length;
}

function renderNavigation(): void {
  const previousCategoryScrollTop = navigation.querySelector<HTMLElement>('.navigation-categories')?.scrollTop ?? 0;

  const special = [
    { id: 'recent', label: 'Recent', count: recent.filter((id) => COMMANDS.some((command) => command.id === id)).length },
    { id: 'favorites', label: 'Favorites', count: favorites.filter((id) => COMMANDS.some((command) => command.id === id)).length },
  ];

  const categories = CATEGORY_ORDER.map((category) => ({
    id: category,
    label: category,
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

function commandMatches(command: CommandDefinition): boolean {
  if (!query) return true;
  const haystack = [command.title, command.category, command.description, command.command, ...(command.tags ?? [])]
    .join(' ')
    .toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function activeCommands(): CommandDefinition[] {
  // Search is intentionally global: typing in the search box scans the entire
  // library regardless of which category/list is currently selected.
  if (query) return COMMANDS.filter(commandMatches);

  let commands = COMMANDS;

  if (activeView === 'favorites') {
    commands = favorites
      .map((id) => COMMANDS.find((command) => command.id === id))
      .filter((command): command is CommandDefinition => Boolean(command));
  } else if (activeView === 'recent') {
    commands = recent
      .map((id) => COMMANDS.find((command) => command.id === id))
      .filter((command): command is CommandDefinition => Boolean(command));
  } else if (activeView !== 'custom' && activeView !== 'activity' && activeView !== 'quest-skips' && activeView !== 'id-browser') {
    commands = COMMANDS.filter((command) => command.category === activeView);
  }

  return commands.filter(commandMatches);
}

function viewTitle(): string {
  if (query && activeView !== 'custom' && activeView !== 'activity') return 'Search Results';
  if (activeView === 'favorites') return 'Favorites';
  if (activeView === 'recent') return 'Recent Commands';
  if (activeView === 'quest-skips') return 'Quest Skips';
  if (activeView === 'id-browser') return 'ID Browser';
  if (activeView === 'activity') return 'Activity Log';
  if (activeView === 'custom') return 'Custom Command';
  return activeView;
}

function render(): void {
  renderNavigation();
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
        : activeView === 'quest-skips'
          ? 'QUEST SKIPS'
          : query
            ? 'SEARCH'
            : 'COMMANDS';
  searchWrap.hidden = activeView === 'custom' || activeView === 'activity';
  search.placeholder = activeView === 'quest-skips'
    ? 'Search quest, Form ID, stage...'
    : activeView === 'id-browser'
      ? 'Search included IDs by name, Form ID, or type...'
      : 'Search name, command, tag...';

  if (activeView === 'id-browser') {
    commandList.hidden = true;
    customPanel.hidden = false;
    renderIdBrowserPanel();
    return;
  }

  if (activeView === 'quest-skips') {
    customPanel.hidden = true;
    commandList.hidden = false;
    renderQuestSkips();
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

  customPanel.hidden = true;
  commandList.hidden = false;
  const commands = activeCommands();
  resultCount.textContent = `${commands.length} command${commands.length === 1 ? '' : 's'}`;

  if (commands.length === 0) {
    const message = query
      ? 'No commands match your search.'
      : activeView === 'favorites'
        ? 'No favorites yet. Mark commands as favorites and they will appear here.'
        : activeView === 'recent'
          ? 'No commands have been executed recently.'
          : 'Nothing is available in this category.';
    commandList.innerHTML = `<div class="empty-state"><p class="osf-eyebrow">NO RESULTS</p><h3>Nothing to show</h3><p>${escapeHtml(message)}</p></div>`;
    return;
  }

  commandList.innerHTML = commands.map(renderCommandCard).join('');
}

function questSkipMatches(group: QuestSkipGroup, stage: number): boolean {
  if (!query) return true;
  const command = `setstage ${group.questId} ${stage}`;
  const haystack = `${group.quest} ${group.questId} stage ${stage} ${command}`.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function matchingQuestSkips(): Array<QuestSkipGroup & { stages: number[] }> {
  return QUEST_SKIPS
    .map((group) => ({ ...group, stages: group.stages.filter((stage) => questSkipMatches(group, stage)) }))
    .filter((group) => group.stages.length > 0);
}

function renderQuestSkips(): void {
  const groups = matchingQuestSkips();
  const visibleStageCount = groups.reduce((total, group) => total + group.stages.length, 0);
  resultCount.textContent = query
    ? `${groups.length} quest${groups.length === 1 ? '' : 's'} / ${visibleStageCount} matching skip${visibleStageCount === 1 ? '' : 's'}`
    : `${QUEST_SKIPS.length} quest entries / ${QUEST_SKIP_STAGE_COUNT} stage skips`;

  if (groups.length === 0) {
    commandList.innerHTML = `<div class="empty-state"><p class="osf-eyebrow">NO QUEST SKIPS</p><h3>No matching quest skip</h3><p>Try the quest name, Quest Form ID, or a stage number.</p></div>`;
    return;
  }

  const intro = `
    <section class="quest-skip-intro osf-card">
      <strong>Quest stages are unverified skip choices.</strong>
      <span>Live quest diagnostics are temporarily unavailable. Check the quest in Starfield, make a manual save, and use <code>setstage</code> only when a quest is already stuck.</span>
      <span class="quest-stage-caveat">A stage can skip scripts, dialogue, scenes, prerequisites, or rewards.</span>
    </section>`;

  const cards = groups.map((group) => {
    const stages = group.stages.map((stage) => {
      const command = `setstage ${group.questId} ${stage}`;
      return `<button class="quest-stage-button" type="button" data-quest-command="${escapeHtml(command)}" data-quest-id="${escapeHtml(group.questId)}" data-quest-title="${escapeHtml(group.quest)}" data-quest-stage="${stage}"${nativeBackendReady ? '' : ' disabled'}>
        <span>STAGE</span><strong>${stage}</strong>
      </button>`;
    }).join('');

    return `
      <article class="quest-skip-card" data-quest-card="${escapeHtml(group.questId)}">
        <div class="quest-skip-heading">
          <div>
            <h3>${escapeHtml(group.quest)}</h3>
            <div class="quest-skip-id"><span>QUEST ID</span><code>${escapeHtml(group.questId)}</code></div>
          </div>
          <span class="quest-skip-count">${group.stages.length} skip stage${group.stages.length === 1 ? '' : 's'}</span>
        </div>

        <div class="quest-diagnostic-row">
          <div class="quest-current-stage is-error">
            <span class="osf-eyebrow">LIVE QUEST DIAGNOSTICS</span>
            <strong>UNAVAILABLE</strong>
            <small>The previous native adapter is disabled while a safe replacement is developed.</small>
          </div>
          <div class="quest-diagnostic-actions">
            <button class="osf-btn osf-btn--sm" type="button" disabled>Check Status</button>
            <button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" disabled>Full SQS</button>
          </div>
        </div>

        <div class="quest-skip-stage-label"><span class="osf-eyebrow">AVAILABLE SKIP STAGES</span><span>Choose only the stage needed to get past the broken step.</span></div>
        <div class="quest-stage-grid">${stages}</div>
      </article>`;
  }).join('');

  commandList.innerHTML = intro + cards;
}

function renderCommandCard(command: CommandDefinition): string {
  const isFavorite = favorites.includes(command.id);
  const unavailable = Boolean(command.unavailableReason);
  const inputs = (command.inputs ?? []).map((input) => renderInput(command, input)).join('');
  const riskLabel = command.risk === 'danger' ? 'DANGER' : 'CAUTION';
  const warningTag = command.warning
    ? `<span class="caution-wrap">
        <button class="command-warning-tag${command.risk === 'danger' ? ' is-danger' : ''}" type="button" data-caution="${escapeHtml(command.id)}" aria-expanded="false" aria-controls="caution-${escapeHtml(command.id)}">${riskLabel}</button>
        <span class="caution-popover${command.risk === 'danger' ? ' is-danger' : ''}" id="caution-${escapeHtml(command.id)}" role="tooltip">
          <strong>WHY THIS IS MARKED ${riskLabel}</strong>
          <span>${escapeHtml(command.warning)}</span>
        </span>
      </span>`
    : '';

  return `
    <article class="command-card" data-command-id="${escapeHtml(command.id)}">
      <div class="command-main">
        <div class="command-heading">
          <div class="command-heading-main">
            <h3>${escapeHtml(command.title)}</h3>
            <code class="command-heading-preview" data-preview="${escapeHtml(command.id)}">${escapeHtml(buildCommand(command))}</code>
          </div>
          <span class="command-heading-tags">${command.unavailableReason ? '<span class="command-availability-tag">UNAVAILABLE</span>' : ''}${warningTag}</span>
        </div>
        <p class="command-description">${escapeHtml(command.description)}</p>
        ${command.unavailableReason ? `<p class="command-unavailable-reason">${escapeHtml(command.unavailableReason)}</p>` : ''}
        ${inputs ? `<div class="command-inputs">${inputs}</div>` : ''}
      </div>
      <div class="command-actions">
        <button class="favorite-button${isFavorite ? ' is-favorite' : ''}" type="button" data-favorite="${escapeHtml(command.id)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <span aria-hidden="true">${isFavorite ? '★' : '☆'}</span>
        </button>
        <button class="osf-btn osf-btn--osf-accent execute-button" type="button" data-execute="${escapeHtml(command.id)}"${nativeBackendReady && !unavailable ? '' : ' disabled'}>${unavailable ? 'Unavailable' : 'Execute'}</button>
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
    : '';
  const control = pickerButton
    ? `<div class="input-control-row"><input ${attributes.join(' ')}>${pickerButton}</div>`
    : `<input ${attributes.join(' ')}>`;

  return `<div class="input-field${input.picker ? ' input-field--picker' : ''}"><label class="input-label" for="${escapeHtml(id)}">${escapeHtml(input.label)}</label>${control}<small class="input-hint${input.hint ? '' : ' input-hint--empty'}">${hint}</small></div>`;
}

function buildCommand(command: CommandDefinition): string {
  let output = command.command;
  for (const input of command.inputs ?? []) {
    const element = document.getElementById(`${command.id}-${input.key}`);
    const fallback = input.defaultValue === undefined ? '' : String(input.defaultValue);
    const value = element instanceof HTMLInputElement ? element.value.trim() : fallback;
    output = output.replaceAll(`{${input.key}}`, value || `{${input.key}}`);
  }
  return output;
}

function validateCommand(command: CommandDefinition): string | null {
  for (const input of command.inputs ?? []) {
    const element = document.getElementById(`${command.id}-${input.key}`);
    if (!(element instanceof HTMLInputElement)) continue;
    if (!element.value.trim()) return `${input.label} is required.`;
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
  updatePreview(commandId);
  setStatus(`Selected ${label}: ${value}`, 'success');
  closeIdPicker(false);
  input.focus({ preventScroll: true });
  input.select();
}

function updatePreview(commandId: string): void {
  const command = COMMANDS.find((entry) => entry.id === commandId);
  if (!command) return;
  const preview = document.querySelector<HTMLElement>(`[data-preview="${CSS.escape(commandId)}"]`);
  if (preview) preview.textContent = buildCommand(command);
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
  if (!nativeBackendReady || !window.osfui?.call) {
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
    const preview = await window.osfui.call<EffectiveTotalReply>('console.command-center.setEffectiveActorValue', {
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

  const capturesOutput = execution.definition?.captureOutput === true;
  const resultTitle = execution.definition?.title ?? 'Command Results';
  if (capturesOutput) showResults(resultTitle, command, '', 'loading');
  setStatus(`Executing: ${command}`, 'working');
  try {
    if (!window.osfui?.call) throw new Error('OSF UI native request API is unavailable');
    if (execution.effectiveTotal) {
      const reply = await window.osfui.call<EffectiveTotalReply>('console.command-center.setEffectiveActorValue', {
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
      ? await window.osfui.call<QueryReply>('console.command-center.query', { consoleCommand: command })
      : await window.osfui.call<ExecuteReply>('console.command-center.execute', {
        consoleCommand: command,
        closeBeforeExecute: execution.definition?.closeBeforeExecute === true,
      });
    if (!reply?.ok) throw new Error('Native backend did not report success');

    const executedCommand = reply.command || command;
    const capturedOutput = capturesOutput ? ((reply as QueryReply).output ?? '').trim() : '';
    if (capturesOutput && !capturedOutput) throw new Error('No readable result was returned. This does not mean the value is zero or the inventory is empty.');
    const activityMessage = capturedOutput ? `Result: ${capturedOutput}` : `Executed: ${executedCommand}`;
    const statusMessage = capturesOutput
      ? 'Inspection complete. Results saved in Activity Log.'
      : `Executed: ${executedCommand}`;
    setStatus(statusMessage, 'success');
    if (execution.definition && execution.rememberRecent !== false) addRecent(execution.definition.id);
    addActivity(execution, 'success', activityMessage);
    if (capturesOutput) showResults(resultTitle, executedCommand, capturedOutput, 'ready');
    if (activeView === 'recent' || activeView === 'activity' || activeView === 'quest-skips') {
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
  if (!window.osfui?.call) {
    setStatus('OSF UI native request API is unavailable.', 'error');
    return;
  }

  for (let index = 0; index < commands.length; index += 1) {
    const command = commands[index];
    setStatus(`Executing command ${index + 1} of ${commands.length}: ${command}`, 'working');
    try {
      const reply = await window.osfui.call<ExecuteReply>('console.command-center.execute', {
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
          <span class="activity-outcome">${entry.outcome === 'success' ? 'SUCCESS' : 'ERROR'}</span>
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
  return ID_CATALOG.filter((entry) => {
    const categoryMatches = categories.includes('*') || categories.includes(entry.category);
    return categoryMatches && idBrowserTextMatches(entry);
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

function idBrowserAction(entry: IdCatalogEntry): 'additem' | 'addperk' | 'addspell' | 'spawn' | null {
  if (entry.action) return entry.action;
  const type = entry.type.toUpperCase();
  if (['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC'].includes(type)) return 'additem';
  if (type === 'PERK') return 'addperk';
  if (type === 'SPEL') return 'addspell';
  if (type === 'NPC_' || type === 'GBFM') return 'spawn';
  return null;
}

function renderIdBrowserSelection(): string {
  const entry = idBrowserSelected;
  if (!entry) {
    return `<div class="id-browser-selection id-browser-selection--empty"><span class="osf-eyebrow">SELECTED ID</span><span>Choose a result to inspect it and reveal a safe quick action when available.</span></div>`;
  }
  const action = idBrowserAction(entry);
  const actionLabel = action === 'additem'
    ? 'Add to Player'
    : action === 'addperk'
      ? 'Add Perk'
      : action === 'addspell'
        ? 'Add Spell / Power'
        : action === 'spawn'
          ? 'Spawn 1'
          : '';
  return `
    <div class="id-browser-selection">
      <div class="id-browser-selection-copy">
        <span class="osf-eyebrow">SELECTED ID</span>
        <strong>${escapeHtml(entry.label)}</strong>
        <span>${escapeHtml(entry.type)} / ${escapeHtml(entry.category)}${entry.detail ? ` — ${escapeHtml(entry.detail)}` : ''}</span>
      </div>
      <code>${escapeHtml(entry.value)}</code>
      <div class="id-browser-selection-actions">
        <button class="osf-btn osf-btn--sm" type="button" data-copy-id-browser-id="${escapeHtml(entry.value)}">Copy ID</button>
        ${action === 'additem' ? `<label class="id-browser-quantity"><span class="osf-eyebrow">QUANTITY</span><input class="osf-input" id="id-browser-quantity" type="text" value="${idBrowserQuantity}" inputmode="numeric" autocomplete="off" aria-label="Item quantity from 1 to 999999"></label>` : ''}
        ${action ? `<button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-id-browser-action="${action}">${actionLabel}</button>` : ''}
      </div>
    </div>`;
}

function renderIdBrowserPanel(): void {
  const results = matchingBuiltInIds();
  resultCount.textContent = `${results.length} shown / ${ID_CATALOG.length} included IDs`;

  const renderResultRow = (entry: IdCatalogEntry, index: number) => `
    <button class="id-browser-row${idBrowserSelected?.value === entry.value && idBrowserSelected?.type === entry.type ? ' is-selected' : ''}" type="button" data-id-browser-index="${index}">
      <span class="id-browser-row-main">
        <span class="id-browser-row-title"><strong>${escapeHtml(entry.label)}</strong><small>${escapeHtml(entry.category)}</small></span>
        ${entry.detail ? `<span class="id-browser-row-detail">${escapeHtml(entry.detail)}</span>` : ''}
      </span>
      <span class="id-browser-row-meta"><span>${escapeHtml(entry.type)}</span><code>${escapeHtml(entry.value)}</code></span>
    </button>`;
  const resultGroups = groupedIdBrowserResults(results).map(([category, entries]) => `
    <details class="inventory-type-group id-browser-category-group" data-id-browser-category-group="${escapeHtml(category)}"${query || idBrowserOpenCategories.has(category) ? ' open' : ''}>
      <summary><span>${escapeHtml(category)}</span><span>${entries.length.toLocaleString()} ${entries.length === 1 ? 'ID' : 'IDs'}</span></summary>
      <div class="inventory-type-contents id-browser-category-contents">${entries.map(({ entry, index }) => renderResultRow(entry, index)).join('')}</div>
    </details>`).join('');

  customPanel.innerHTML = `
    <section class="id-browser-panel">
      <div class="id-browser-controls">
        <label>
          <span class="osf-eyebrow">CATEGORY</span>
          <select class="osf-input" id="id-browser-category">
            ${ID_BROWSER_CATEGORIES.map((category) => `<option value="${escapeHtml(category.value)}"${category.value === idBrowserCategory ? ' selected' : ''}>${escapeHtml(category.label)}</option>`).join('')}
          </select>
        </label>
      </div>

      ${renderIdBrowserSelection()}

      <div class="id-browser-result-head">
        <span>${results.length} matching IDs</span>
        <span>${ID_CATALOG.length} included</span>
      </div>
      <div class="osf-tricolor id-browser-divider" aria-hidden="true"></div>
      <div class="id-browser-results" id="id-browser-results">
        ${resultGroups || '<div class="id-picker-empty"><strong>No matching IDs</strong><span>Try a broader search or another category.</span></div>'}
      </div>
    </section>`;

  const categorySelect = document.querySelector('#id-browser-category');
  if (categorySelect instanceof HTMLSelectElement) {
    categorySelect.addEventListener('change', () => {
      idBrowserCategory = categorySelect.value;
      idBrowserSelected = null;
      idBrowserQuantity = 1;
      idBrowserOpenCategories.clear();
      render();
    });
  }

  const resultsElement = document.querySelector('#id-browser-results');
  resultsElement?.addEventListener('click', (event) => {
    const row = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-id-browser-index]');
    if (!row?.dataset.idBrowserIndex) return;
    const index = Number(row.dataset.idBrowserIndex);
    const entry = results[index];
    if (!entry) return;
    idBrowserSelected = entry;
    idBrowserQuantity = 1;
    setStatus(`Selected ${entry.label}: ${entry.value}`, 'success');
    render();
  });

  resultsElement?.querySelectorAll<HTMLDetailsElement>('[data-id-browser-category-group]').forEach((group) => {
    group.addEventListener('toggle', () => {
      if (query) return;
      const category = group.dataset.idBrowserCategoryGroup;
      if (!category) return;
      if (group.open) idBrowserOpenCategories.add(category);
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
    if (idBrowserAction(idBrowserSelected) === 'additem') {
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
  document.querySelector<HTMLButtonElement>('[data-copy-id-browser-id]')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    if (button.dataset.copyIdBrowserId) void copyResultId(button.dataset.copyIdBrowserId);
  });
}

function requestIdBrowserQuickAction(entry: IdCatalogEntry, quantity = 1): void {
  const action = idBrowserAction(entry);
  if (!action) return;

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
    category: action === 'addperk' || action === 'addspell' ? 'Skills' : action === 'spawn' ? 'Targets' : 'Inventory',
    description,
    command,
    warning,
    risk,
    testStatus: 'untested',
  };
  requestExecution({ command, definition, rememberRecent: false });
}

function renderCustomPanel(): void {
  customPanel.innerHTML = `
    <section class="custom-card osf-card">
      <p class="osf-eyebrow">RAW CONSOLE COMMANDS</p>
      <h3>Execute commands directly</h3>
      <p>Enter one console command per line. CCC runs nonempty lines in order.</p>
      <form id="custom-form" class="custom-form">
        <label>
          <span>Commands</span>
          <textarea class="osf-input custom-command-input" id="custom-command" rows="8" autocomplete="off" spellcheck="false" placeholder="One command per line, for example:&#10;tgm&#10;player.additem 0000ABF9 4"></textarea>
        </label>
        <button class="osf-btn osf-btn--osf-accent" type="submit" ${nativeBackendReady ? '' : 'disabled'}>Review Commands</button>
      </form>
      <div class="custom-note"><strong>NOTE</strong><span>Up to ${MAX_CUSTOM_BATCH_COMMANDS} commands can run in one batch. The batch stops if a command reports an error. Save before experimenting with commands you do not recognize.</span></div>
    </section>
  `;

  const form = document.querySelector('#custom-form');
  const input = document.querySelector('#custom-command');
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
}

function switchView(view: string): void {
  activeView = view;
  query = '';
  search.value = '';
  render();
}

navigation.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-view]');
  if (!button?.dataset.view) return;
  switchView(button.dataset.view);
});

(['id-browser', 'quest-skips', 'activity', 'custom'] as const).forEach((view) => {
  document.querySelector<HTMLButtonElement>(`[data-view="${view}"]`)?.addEventListener('click', () => switchView(view));
});

search.addEventListener('input', () => {
  query = search.value.trim();
  if (activeView === 'id-browser') {
    idBrowserSelected = null;
    idBrowserQuantity = 1;
  }
  render();
});

document.addEventListener('click', (event) => {
  const input = (event.target as Element | null)?.closest<HTMLInputElement>('input.osf-input');
  if (input && !input.disabled && !input.readOnly) input.select();
});

commandList.addEventListener('click', (event) => {
  const pickerButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-open-id-picker]');
  if (pickerButton?.dataset.openIdPicker && pickerButton.dataset.inputKey) {
    const command = COMMANDS.find((entry) => entry.id === pickerButton.dataset.openIdPicker);
    const input = command?.inputs?.find((entry) => entry.key === pickerButton.dataset.inputKey);
    if (command && input?.picker) openIdPicker(command.id, input.key, input.picker);
    return;
  }


  const questButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-command]');
  if (questButton?.dataset.questCommand && questButton.dataset.questTitle && questButton.dataset.questStage) {
    const questTitle = questButton.dataset.questTitle;
    const stage = Number(questButton.dataset.questStage);
    const command = questButton.dataset.questCommand;
    const definition: CommandDefinition = {
      id: `quest-skip-${command.replace(/\s+/g, '-').toLowerCase()}`,
      title: `${questTitle} — Stage ${stage}`,
      category: 'Quests',
      description: `Advance ${questTitle} directly to stage ${stage}.`,
      command,
      warning: 'SetStage can bypass dialogue, scripts, rewards, scenes, or prerequisites. Make a manual save and use this only to skip past a quest step that is already stuck.',
      risk: 'danger',
      testStatus: 'untested',
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
  if (command.effectiveTotal) {
    void prepareEffectiveTotalExecution(command, builtCommand);
    return;
  }
  requestExecution({ command: builtCommand, definition: command });
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

commandList.addEventListener('input', (event) => {
  const input = (event.target as Element | null)?.closest<HTMLInputElement>('[data-command-input]');
  if (input?.dataset.commandInput) updatePreview(input.dataset.commandInput);
});

idPickerSearch.addEventListener('input', renderIdPickerResults);
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

async function closeCurrentView(): Promise<void> {
  if (!idPickerBackdrop.hidden) closeIdPicker(false);
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

  if (!window.osfui?.call) {
    setStatus('OSF UI native request API is unavailable.', 'error');
    return;
  }

  try {
    const reply = await window.osfui.call<CloseReply>('console.command-center.close');
    if (!reply?.ok) throw new Error('Native backend did not confirm the close request');
  } catch (error) {
    setStatus(`Unable to close Console Command Center: ${error instanceof Error ? error.message : String(error)}`, 'error');
  }
}

closeView.addEventListener('click', () => {
  void closeCurrentView();
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
  // OSF UI's synthetic Back can target the document instead of the focused
  // dialog, so handle it here as well as on the dialog itself.
  if (event.key === 'Escape' && resultsDialog.open) {
    event.preventDefault();
    event.stopPropagation();
    resultsDialog.close();
    return;
  }
  if (event.key === 'Escape') {
    const openCaution = commandList.querySelector<HTMLElement>('.caution-wrap.is-open');
    if (!idPickerBackdrop.hidden) {
      closeIdPicker();
    } else if (!confirmBackdrop.hidden) {
      pendingExecution = null;
      confirmBackdrop.hidden = true;
    } else if (openCaution) {
      closeCautionPopovers();
    } else {
      void closeCurrentView();
    }
  }
  if (event.key === '/' && idPickerBackdrop.hidden && activeView !== 'custom' && activeView !== 'activity' && document.activeElement !== search) {
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
    && !isEditable
  ) {
    event.preventDefault();
    search.focus({ preventScroll: true });
    search.value += event.key;
    search.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

async function connectNativeBackend(): Promise<void> {
  if (!window.osfui?.call) {
    nativeBackendReady = false;
    footerNativeStatus.textContent = 'UNAVAILABLE';
    setStatus('OSF UI native request API is unavailable.', 'error');
    return;
  }

  try {
    const reply = await window.osfui.call<PingReply>('console.command-center.ping');
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

const ready = window.osfui?.ready;
if (ready) {
  ready.then(async (info) => {
    window.osfui?.send?.('osfui.handleBack', { handle: true });
    footerOsfVersion.textContent = info.version;
    setStatus('OSF UI ready; checking ConsoleCommandCenter.dll...', 'working');
    if (activeView === 'activity') render();
    await connectNativeBackend();
  }).catch(() => {
    nativeBackendReady = false;
    footerOsfVersion.textContent = 'UNAVAILABLE';
    footerStarfieldVersion.textContent = 'UNKNOWN';
    footerNativeStatus.textContent = 'UNAVAILABLE';
    setStatus('OSF UI bridge unavailable.', 'error');
    render();
  });
} else {
  nativeBackendReady = false;
  footerOsfVersion.textContent = 'UNAVAILABLE';
  footerStarfieldVersion.textContent = 'UNKNOWN';
  footerNativeStatus.textContent = 'UNAVAILABLE';
  setStatus('OSF UI bridge unavailable.', 'error');
}

render();
