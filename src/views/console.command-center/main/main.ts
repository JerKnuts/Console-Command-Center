import '/shared/osfui.css';
import '/shared/osfui.js';
import './style.css';
import { CATEGORY_ORDER, COMMANDS, type CommandDefinition, type CommandInput } from './commands';
import { QUEST_FIXES, QUEST_FIX_STAGE_COUNT, type QuestFixGroup } from './quest-fixes';
import type { ReferenceIdPicker } from './reference-ids';

type ViewMode = 'favorites' | 'recent' | 'quest-fixes' | 'activity' | 'custom' | string;

type PendingExecution = {
  command: string;
  definition?: CommandDefinition;
  rememberRecent?: boolean;
  questId?: string;
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
  executor?: string;
};

type ExecuteReply = {
  ok: boolean;
  command: string;
};

type QuestStatusReply = {
  ok: boolean;
  questId: string;
  currentStage: number | null;
  completedStages: number[];
};

type QuestDiagnostic = {
  state: 'loading' | 'ready' | 'error';
  currentStage: number | null;
  completedStages: number[];
  message?: string;
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
const CONSOLE_COMMAND_CENTER_VERSION = '0.3.0';
const LATEST_STARFIELD_VERSION = '1.16.244';

let activeView: ViewMode = 'recent';
let query = '';
let favorites = readStringArray(STORAGE_FAVORITES);
let recent = readStringArray(STORAGE_RECENT);
let activityLog = readActivityLog();
let pendingExecution: PendingExecution | null = null;
let activeIdPicker: ActiveIdPicker | null = null;
let executionCount = 0;
let lastCommand = 'None this session';
let bridgeVersion = 'unknown';
let bridgeState: 'connecting' | 'ready' | 'unavailable' = 'connecting';
let nativeBackendReady = false;
const questDiagnostics = new Map<string, QuestDiagnostic>();

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
        <div class="sidebar-head osf-eyebrow">COMMAND LIBRARY</div>
        <nav id="navigation" class="navigation"></nav>
        <div class="sidebar-spacer"></div>
        <div class="sidebar-bottom-actions">
          <button class="nav-button nav-button--quest" type="button" data-view="quest-fixes">
            <span>Quest Fixes</span><span class="nav-count">${QUEST_FIX_STAGE_COUNT}</span>
          </button>
          <button class="nav-button nav-button--custom" type="button" data-view="custom">
            <span>Custom Command</span><span class="nav-count">&gt;_</span>
          </button>
          <button class="nav-button nav-button--utility" type="button" data-view="activity">
            <span>Activity Log</span><span class="nav-count" id="activity-nav-count">0</span>
          </button>
        </div>
      </aside>

      <section class="content">
        <div class="content-toolbar">
          <div>
            <p class="osf-eyebrow" id="section-kicker">COMMANDS</p>
            <h2 id="section-title">Recent Commands</h2>
          </div>
          <label class="search-wrap" id="search-wrap">
            <span class="osf-eyebrow">SEARCH</span>
            <input class="osf-input" id="search" type="search" placeholder="Search name, command, tag..." autocomplete="off" autofocus>
          </label>
        </div>

        <div class="command-summary">
          <span id="result-count">0 commands</span>
          <span class="summary-separator">/</span>
          <span>Commands may affect achievements or save-game state.</span>
        </div>

        <div id="command-list" class="command-list" aria-live="polite"></div>
        <div id="custom-panel" class="custom-panel" hidden></div>
      </section>
    </section>

    <footer class="statusbar">
      <div class="status-primary"><span class="osf-eyebrow">STATUS</span><span id="status">Ready.</span></div>
      <div class="status-versions" aria-label="Version information">
        <span class="version-item"><span class="version-label">CCC</span><span>v${CONSOLE_COMMAND_CENTER_VERSION}</span></span>
        <span class="version-separator">//</span>
        <span class="version-item"><span class="version-label">STARFIELD LATEST</span><span>${LATEST_STARFIELD_VERSION}</span></span>
        <span class="version-separator">//</span>
        <span class="version-item"><span class="version-label">OSF UI</span><span id="footer-osf-version">...</span></span>
      </div>
    </footer>
  </main>

  <div class="id-picker-backdrop" id="id-picker-backdrop" hidden>
    <section class="id-picker-dialog osf-card" role="dialog" aria-modal="true" aria-labelledby="id-picker-title">
      <div class="id-picker-head">
        <div>
          <p class="osf-eyebrow">REFERENCE ID PICKER</p>
          <h2 id="id-picker-title">Select Reference ID</h2>
        </div>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="id-picker-close" type="button">Close</button>
      </div>
      <label class="id-picker-search-wrap">
        <span class="osf-eyebrow">SEARCH</span>
        <input class="osf-input" id="id-picker-search" type="search" autocomplete="off" placeholder="Search name or ID...">
      </label>
      <div class="id-picker-summary" id="id-picker-summary">0 IDs</div>
      <div class="id-picker-results" id="id-picker-results" aria-live="polite"></div>
      <div class="id-picker-footer">
        <span>Choose an entry to fill the command field. Manual ID entry remains available.</span>
        <button class="osf-btn" id="id-picker-cancel" type="button">Cancel</button>
      </div>
    </section>
  </div>

  <div class="confirm-backdrop" id="confirm-backdrop" hidden>
    <section class="confirm-dialog osf-card" id="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
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
  } else if (activeView !== 'custom' && activeView !== 'activity' && activeView !== 'quest-fixes') {
    commands = COMMANDS.filter((command) => command.category === activeView);
  }

  return commands.filter(commandMatches);
}

function viewTitle(): string {
  if (query && activeView !== 'custom' && activeView !== 'activity') return 'Search Results';
  if (activeView === 'favorites') return 'Favorites';
  if (activeView === 'recent') return 'Recent Commands';
  if (activeView === 'quest-fixes') return 'Quest Fixes';
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
      : activeView === 'quest-fixes'
        ? 'QUEST REPAIR'
        : query
          ? 'SEARCH'
          : 'COMMANDS';
  searchWrap.hidden = activeView === 'custom' || activeView === 'activity';
  search.placeholder = activeView === 'quest-fixes'
    ? 'Search quest, Form ID, stage...'
    : 'Search name, command, tag...';

  if (activeView === 'quest-fixes') {
    customPanel.hidden = true;
    commandList.hidden = false;
    renderQuestFixes();
    return;
  }

  if (activeView === 'activity') {
    commandList.hidden = true;
    customPanel.hidden = false;
    resultCount.textContent = `${activityLog.length} saved log entr${activityLog.length === 1 ? 'y' : 'ies'}`;
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

function questFixMatches(group: QuestFixGroup, stage: number): boolean {
  if (!query) return true;
  const command = `setstage ${group.questId} ${stage}`;
  const haystack = `${group.quest} ${group.questId} stage ${stage} ${command}`.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function matchingQuestFixes(): Array<QuestFixGroup & { stages: number[] }> {
  return QUEST_FIXES
    .map((group) => ({ ...group, stages: group.stages.filter((stage) => questFixMatches(group, stage)) }))
    .filter((group) => group.stages.length > 0);
}

function renderQuestFixes(): void {
  const groups = matchingQuestFixes();
  const visibleStageCount = groups.reduce((total, group) => total + group.stages.length, 0);
  resultCount.textContent = query
    ? `${groups.length} quest${groups.length === 1 ? '' : 's'} / ${visibleStageCount} matching fix${visibleStageCount === 1 ? '' : 'es'}`
    : `${QUEST_FIXES.length} quest entries / ${QUEST_FIX_STAGE_COUNT} stage fixes`;

  if (groups.length === 0) {
    commandList.innerHTML = `<div class="empty-state"><p class="osf-eyebrow">NO QUEST FIXES</p><h3>No matching quest repair</h3><p>Try the quest name, Quest Form ID, or a stage number.</p></div>`;
    return;
  }

  const intro = `
    <section class="quest-fix-intro osf-card">
      <div>
        <p class="osf-eyebrow">SURGICAL QUEST REPAIR</p>
        <h3>Diagnose first. Repair second.</h3>
        <p>Use <strong>Check Status</strong> to read the quest's highest completed stage and completed-stage history before choosing a fix. These repair buttons run Starfield's vanilla <code>setstage</code> command. Make a manual save first.</p>
        <p class="quest-stage-caveat">* Starfield reports the highest completed stage as the current stage. A quest designed to revisit a lower stage can therefore show a higher historical value.</p>
      </div>
      <div class="quest-fix-source">
        <span class="osf-eyebrow">DATASET</span>
        <strong>${QUEST_FIX_STAGE_COUNT} stage fixes</strong>
        <span>Curated quest-stage repair mappings.</span>
      </div>
    </section>`;

  const cards = groups.map((group) => {
    const diagnostic = questDiagnostics.get(group.questId);
    const completedSet = new Set(diagnostic?.completedStages ?? []);
    const currentStage = diagnostic?.state === 'ready' ? diagnostic.currentStage : null;

    const stages = group.stages.map((stage) => {
      const command = `setstage ${group.questId} ${stage}`;
      const isCompleted = completedSet.has(stage);
      const isCurrent = currentStage === stage;
      const stateClass = isCurrent ? ' is-current' : isCompleted ? ' is-completed' : '';
      const stateLabel = isCurrent ? 'CURRENT' : isCompleted ? 'DONE' : 'STAGE';
      return `<button class="quest-stage-button${stateClass}" type="button" data-quest-command="${escapeHtml(command)}" data-quest-id="${escapeHtml(group.questId)}" data-quest-title="${escapeHtml(group.quest)}" data-quest-stage="${stage}"${nativeBackendReady ? '' : ' disabled'}>
        <span>${stateLabel}</span><strong>${stage}</strong>
      </button>`;
    }).join('');

    let statusValue = 'NOT CHECKED';
    let statusDetail = 'Check the live save before using a repair stage.';
    if (diagnostic?.state === 'loading') {
      statusValue = 'CHECKING...';
      statusDetail = 'Reading quest stage state from the game.';
    } else if (diagnostic?.state === 'error') {
      statusValue = 'UNAVAILABLE';
      statusDetail = diagnostic.message ?? 'Could not read this quest.';
    } else if (diagnostic?.state === 'ready') {
      statusValue = diagnostic.currentStage === null ? 'NONE COMPLETED' : String(diagnostic.currentStage);
      statusDetail = `${diagnostic.completedStages.length} completed stage${diagnostic.completedStages.length === 1 ? '' : 's'} found.`;
    }

    const history = diagnostic?.state === 'ready'
      ? diagnostic.completedStages.length > 0
        ? `<div class="quest-stage-history"><span>COMPLETED STAGES</span><div>${diagnostic.completedStages.map((stage) => `<code>${stage}</code>`).join('')}</div></div>`
        : `<div class="quest-stage-history"><span>COMPLETED STAGES</span><div class="quest-stage-history-empty">None reported yet.</div></div>`
      : '';

    return `
      <article class="quest-fix-card" data-quest-card="${escapeHtml(group.questId)}">
        <div class="quest-fix-heading">
          <div>
            <h3>${escapeHtml(group.quest)}</h3>
            <div class="quest-fix-id"><span>QUEST ID</span><code>${escapeHtml(group.questId)}</code></div>
          </div>
          <span class="quest-fix-count">${group.stages.length} repair stage${group.stages.length === 1 ? '' : 's'}</span>
        </div>

        <div class="quest-diagnostic-row">
          <div class="quest-current-stage${diagnostic?.state === 'ready' ? ' is-ready' : ''}${diagnostic?.state === 'error' ? ' is-error' : ''}">
            <span class="osf-eyebrow">CURRENT / HIGHEST COMPLETED*</span>
            <strong>${escapeHtml(statusValue)}</strong>
            <small>${escapeHtml(statusDetail)}</small>
          </div>
          <div class="quest-diagnostic-actions">
            <button class="osf-btn osf-btn--sm" type="button" data-quest-status="${escapeHtml(group.questId)}"${nativeBackendReady && diagnostic?.state !== 'loading' ? '' : ' disabled'}>${diagnostic?.state === 'ready' ? 'Refresh Status' : 'Check Status'}</button>
            <button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-quest-sqs="${escapeHtml(group.questId)}" data-quest-title="${escapeHtml(group.quest)}"${nativeBackendReady ? '' : ' disabled'}>Full SQS</button>
          </div>
        </div>

        ${history}

        <div class="quest-fix-stage-label"><span class="osf-eyebrow">AVAILABLE REPAIR STAGES</span><span>Choose only the stage needed to get past the broken step.</span></div>
        <div class="quest-stage-grid">${stages}</div>
      </article>`;
  }).join('');

  commandList.innerHTML = intro + cards;
}

async function loadQuestStatus(questId: string): Promise<void> {
  if (!nativeBackendReady) {
    setStatus('ConsoleCommandCenter.dll is not connected.', 'error');
    return;
  }

  const numericQuestId = Number.parseInt(questId, 16);
  if (!Number.isFinite(numericQuestId)) {
    setStatus(`Invalid Quest Form ID: ${questId}`, 'error');
    return;
  }

  questDiagnostics.set(questId, { state: 'loading', currentStage: null, completedStages: [] });
  render();
  setStatus(`Checking quest ${questId}...`, 'working');

  try {
    if (!window.osfui?.call) throw new Error('OSF UI native request API is unavailable');
    const reply = await window.osfui.call<QuestStatusReply>('console.command-center.questStatus', { questFormId: numericQuestId });
    if (!reply?.ok) throw new Error('Native backend did not return quest status');

    const completedStages = Array.isArray(reply.completedStages)
      ? reply.completedStages.filter((stage) => Number.isInteger(stage)).sort((a, b) => a - b)
      : [];
    const currentStage = typeof reply.currentStage === 'number' ? reply.currentStage : null;
    questDiagnostics.set(questId, { state: 'ready', currentStage, completedStages });
    setStatus(currentStage === null
      ? `Quest ${questId}: no completed stages reported.`
      : `Quest ${questId}: highest completed stage ${currentStage}.`, 'success');
  } catch (error) {
    const message = describe(error);
    questDiagnostics.set(questId, { state: 'error', currentStage: null, completedStages: [], message });
    setStatus(message, 'error');
  }

  if (activeView === 'quest-fixes') render();
}

function renderCommandCard(command: CommandDefinition): string {
  const isFavorite = favorites.includes(command.id);
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
          <h3>${escapeHtml(command.title)}</h3>
          ${warningTag}
        </div>
        <p class="command-description">${escapeHtml(command.description)}</p>
        ${inputs ? `<div class="command-inputs">${inputs}</div>` : ''}
        <div class="command-preview"><span>COMMAND</span><code data-preview="${escapeHtml(command.id)}">${escapeHtml(buildCommand(command))}</code></div>
      </div>
      <div class="command-actions">
        <button class="favorite-button${isFavorite ? ' is-favorite' : ''}" type="button" data-favorite="${escapeHtml(command.id)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <span aria-hidden="true">${isFavorite ? '★' : '☆'}</span>
        </button>
        <button class="osf-btn osf-btn--osf-accent execute-button" type="button" data-execute="${escapeHtml(command.id)}"${nativeBackendReady ? '' : ' disabled'}>Execute</button>
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
    `type="${input.type}"`,
  ];
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
  idPickerSummary.textContent = `${matches.length} matching ID${matches.length === 1 ? '' : 's'}`;
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
  const warning = execution.definition?.warning;
  const risk = execution.definition?.risk ?? (warning ? 'caution' : 'normal');
  showConfirmation(
    execution,
    warning ?? 'Run this command now? Review the command below before continuing.',
    risk,
  );
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

  setStatus(`Executing: ${command}`, 'working');
  try {
    if (!window.osfui?.call) throw new Error('OSF UI native request API is unavailable');
    const reply = await window.osfui.call<ExecuteReply>('console.command-center.execute', { consoleCommand: command });
    if (!reply?.ok) throw new Error('Native backend did not report success');

    const executedCommand = reply.command || command;
    const successMessage = `Executed: ${executedCommand}`;
    executionCount += 1;
    lastCommand = executedCommand;
    setStatus(successMessage, 'success');
    if (execution.definition && execution.rememberRecent !== false) addRecent(execution.definition.id);
    addActivity(execution, 'success', successMessage);
    if (execution.questId) {
      await loadQuestStatus(execution.questId);
    } else if (activeView === 'recent' || activeView === 'activity') {
      render();
    }
  } catch (error) {
    const message = describe(error);
    setStatus(message, 'error');
    addActivity(execution, 'error', message);
  }
}

function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  return 'code' in error ? `${String((error as Error & { code?: unknown }).code)}: ${error.message}` : error.message;
}

function setStatus(message: string, kind: 'normal' | 'working' | 'success' | 'error' = 'normal'): void {
  status.textContent = message;
  status.dataset.kind = kind;
}


function runtimeLabel(): string {
  if (bridgeState === 'unavailable') return 'OSF UI / BRIDGE UNAVAILABLE';
  if (bridgeState !== 'ready') return 'OSF UI / CONNECTING';
  return `OSF UI ${bridgeVersion} / ${nativeBackendReady ? 'NATIVE READY' : 'NATIVE NOT CONNECTED'}`;
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
      ${entry.outcome === 'error' || entry.message !== `Executed: ${entry.command}` ? `<p>${escapeHtml(entry.message)}</p>` : ''}
    </article>
  `).join('');

  customPanel.innerHTML = `
    <section class="activity-panel">
      <div class="activity-stats">
        <div class="activity-stat">
          <span class="osf-eyebrow">SESSION EXECUTIONS</span>
          <strong>${executionCount}</strong>
        </div>
        <div class="activity-stat activity-stat--wide">
          <span class="osf-eyebrow">LAST COMMAND</span>
          <code>${escapeHtml(lastCommand)}</code>
        </div>
        <div class="activity-stat">
          <span class="osf-eyebrow">SAVED ENTRIES</span>
          <strong>${activityLog.length}</strong>
        </div>
        <div class="activity-stat activity-stat--runtime">
          <span class="osf-eyebrow">RUNTIME</span>
          <code>${escapeHtml(runtimeLabel())}</code>
        </div>
      </div>

      <div class="activity-toolbar">
        <div>
          <p class="osf-eyebrow">COMMAND HISTORY</p>
          <p>Records commands executed through ConsoleCommandCenter.dll and the native Starfield console bridge. It does not capture text printed by Starfield's console.</p>
        </div>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="clear-activity" type="button" ${activityLog.length === 0 ? 'disabled' : ''}>Clear Log</button>
      </div>

      <div class="activity-list">
        ${entries || '<div class="empty-state activity-empty"><p class="osf-eyebrow">NO ACTIVITY</p><h3>No commands logged yet</h3><p>Commands you execute will appear here, including raw custom commands and errors.</p></div>'}
      </div>
    </section>
  `;

  const clearButton = document.querySelector('#clear-activity');
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

function renderCustomPanel(): void {
  customPanel.innerHTML = `
    <section class="custom-card osf-card">
      <p class="osf-eyebrow">RAW CONSOLE COMMAND</p>
      <h3>Execute a command directly</h3>
      <p>For commands that are not in the library yet. Enter exactly what you would type into Starfield's console.</p>
      <form id="custom-form" class="custom-form">
        <label>
          <span>Command</span>
          <input class="osf-input custom-command-input" id="custom-command" type="text" autocomplete="off" placeholder="Example: tgm">
        </label>
        <button class="osf-btn osf-btn--osf-accent" type="submit" ${nativeBackendReady ? '' : 'disabled'}>Execute Command</button>
      </form>
      <div class="custom-note"><strong>NOTE</strong><span>Console Command Center does not validate arbitrary commands. Save before experimenting with commands you do not recognize.</span></div>
    </section>
  `;

  const form = document.querySelector('#custom-form');
  const input = document.querySelector('#custom-command');
  if (form instanceof HTMLFormElement && input instanceof HTMLInputElement) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const command = input.value.trim();
      if (!command) {
        setStatus('Enter a console command first.', 'error');
        input.focus();
        return;
      }
      showConfirmation(
        { command },
        'Raw commands are executed exactly as entered. Only continue if you recognize this command.',
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

document.querySelector<HTMLButtonElement>('[data-view="activity"]')?.addEventListener('click', () => switchView('activity'));
document.querySelector<HTMLButtonElement>('[data-view="custom"]')?.addEventListener('click', () => switchView('custom'));

search.addEventListener('input', () => {
  query = search.value.trim();
  render();
});

function focusSearchNow(): void {
  if (activeView === 'custom' || activeView === 'activity' || !confirmBackdrop.hidden || !idPickerBackdrop.hidden || document.hidden) return;
  search.focus({ preventScroll: true });
  search.select();
}

function focusSearchOnEntry(): void {
  if (activeView === 'custom' || activeView === 'activity' || !confirmBackdrop.hidden || !idPickerBackdrop.hidden) return;

  // OSF UI keeps this webview alive between closes, so normal browser
  // focus/visibility events are not guaranteed to fire when the menu is
  // reopened. Try after paint and again shortly afterward so the host has
  // finished transferring keyboard focus to the newly-active menu.
  requestAnimationFrame(() => {
    requestAnimationFrame(focusSearchNow);
  });
  window.setTimeout(focusSearchNow, 50);
  window.setTimeout(focusSearchNow, 150);
}

function primeSearchForNextOpen(): void {
  if (activeView === 'custom' || activeView === 'activity' || !confirmBackdrop.hidden || !idPickerBackdrop.hidden) return;
  // OSF UI keeps this webview alive between closes. Leave focus on Search
  // before hiding the surface so reopening the same view retains Search as
  // the active control.
  search.focus({ preventScroll: true });
  search.select();
}

window.addEventListener('focus', focusSearchOnEntry);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) focusSearchOnEntry();
});

// This is the reliable lifecycle edge for an OSF UI menu. It fires every
// time CCC becomes the focused menu, including reopenings where the webview
// itself never reloads and the browser's normal focus/visibility events do
// not change.
window.osfui?.on?.<{ visible: boolean; reason?: 'overlay' | 'focus' }>('ui.visibility', (payload) => {
  if (payload.visible) focusSearchOnEntry();
});

commandList.addEventListener('click', (event) => {
  const pickerButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-open-id-picker]');
  if (pickerButton?.dataset.openIdPicker && pickerButton.dataset.inputKey) {
    const command = COMMANDS.find((entry) => entry.id === pickerButton.dataset.openIdPicker);
    const input = command?.inputs?.find((entry) => entry.key === pickerButton.dataset.inputKey);
    if (command && input?.picker) openIdPicker(command.id, input.key, input.picker);
    return;
  }


  const statusButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-status]');
  if (statusButton?.dataset.questStatus) {
    void loadQuestStatus(statusButton.dataset.questStatus);
    return;
  }

  const sqsButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-sqs]');
  if (sqsButton?.dataset.questSqs && sqsButton.dataset.questTitle) {
    const questId = sqsButton.dataset.questSqs;
    const questTitle = sqsButton.dataset.questTitle;
    const command = `sqs ${questId}`;
    const definition: CommandDefinition = {
      id: `quest-sqs-${questId.toLowerCase()}`,
      title: `${questTitle} — Full SQS`,
      category: 'Quests',
      description: `Print the full stage-status table for ${questTitle} to Starfield's console.`,
      command,
      testStatus: 'untested',
    };
    showConfirmation(
      { command, definition, rememberRecent: false },
      'This is a read-only diagnostic command. It prints the full stage table to Starfield\'s console. Check Status summarizes the same quest data inside CCC.',
      'normal',
    );
    return;
  }

  const questButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-command]');
  if (questButton?.dataset.questCommand && questButton.dataset.questTitle && questButton.dataset.questStage) {
    const questTitle = questButton.dataset.questTitle;
    const stage = Number(questButton.dataset.questStage);
    const command = questButton.dataset.questCommand;
    const definition: CommandDefinition = {
      id: `quest-fix-${command.replace(/\s+/g, '-').toLowerCase()}`,
      title: `${questTitle} — Stage ${stage}`,
      category: 'Quests',
      description: `Advance ${questTitle} directly to stage ${stage}.`,
      command,
      warning: 'SetStage can bypass dialogue, scripts, rewards, scenes, or prerequisites. Make a manual save and use this only to repair a quest that is already stuck.',
      risk: 'danger',
      testStatus: 'untested',
    };
    requestExecution({ command, definition, rememberRecent: false, questId: questButton.dataset.questId });
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
  requestExecution({ command: buildCommand(command), definition: command });
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
  primeSearchForNextOpen();

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
  if (execution) void executeConsole(execution);
});

confirmBackdrop.addEventListener('click', (event) => {
  if (event.target === confirmBackdrop) {
    pendingExecution = null;
    confirmBackdrop.hidden = true;
  }
});

document.addEventListener('keydown', (event) => {
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
    setStatus('OSF UI native request API is unavailable.', 'error');
    return;
  }

  try {
    const reply = await window.osfui.call<PingReply>('console.command-center.ping');
    if (!reply?.ok) throw new Error('Native backend returned an unsuccessful ping');
    nativeBackendReady = true;
    setStatus(`${reply.backend} connected.`, 'success');
  } catch (error) {
    nativeBackendReady = false;
    setStatus(`Native backend unavailable: ${describe(error)}`, 'error');
  }

  render();
}

const ready = window.osfui?.ready;
if (ready) {
  ready.then(async (info) => {
    bridgeVersion = info.version;
    bridgeState = 'ready';
    footerOsfVersion.textContent = info.version;
    setStatus('OSF UI ready; checking ConsoleCommandCenter.dll...', 'working');
    if (activeView === 'activity') render();
    await connectNativeBackend();
    focusSearchOnEntry();
  }).catch(() => {
    bridgeState = 'unavailable';
    nativeBackendReady = false;
    footerOsfVersion.textContent = 'UNAVAILABLE';
    setStatus('OSF UI bridge unavailable.', 'error');
    render();
  });
} else {
  bridgeState = 'unavailable';
  nativeBackendReady = false;
  footerOsfVersion.textContent = 'UNAVAILABLE';
  setStatus('OSF UI bridge unavailable.', 'error');
}

render();
focusSearchOnEntry();
