import { installBookReader } from './book-reader';
import { canInspectRecord, installRecordDetails } from './record-details';
import { installTranslations, translateUiText, type TranslationPack } from './translations';
import { exportReportText } from './report-export';
import type { CurrentArea } from './area-identification';
import { modCategoryCounts, modCategoryMatches } from './mod-browser-layout';
import { applyCommandFeedback, wipCommandOutcome } from './command-feedback';
import { updateCommandHighlight, syncCommandHighlight } from './command-syntax';
import { SAMPLE_BATCHES, prepareSampleCommands } from './sample-batches';
import { createLoadingRing, loadingRingHtml } from './loading-ring';
import { canPreviewModel, installModelPreview } from './model-preview';
import { uiPreferences, installUiSettings, setPreviewResolution, visibleIdCategory, visibleIdRecord, visibleQuestRecord, visibleCommandRecord } from './ui-preferences';
import { reviewedReferenceNote, applyReviewedFindings, reviewedWasTested } from './reviewed-id-findings';
import { orderIdEntries } from './id-record-order';
import { armorReferenceNote, applyArmorFindings } from './armor-test-findings';
import { rerenderKeepingPosition } from './preserve-report-position';
import { devFeedbackButton, devFeedbackRow, installDevFeedback, isDevModeEnabled, devFeedbackTestedClass, devFeedbackCommandOutcome, hasEngineCommandFeedback } from './dev-feedback';
import { ammoReferenceNote, applyAmmoFindings } from './ammo-test-findings';
import './style.css';
import './light-theme.css';
import './dark-theme.css';
import { gameSettingGroup, gameSettingMatches, gameSettingInspectCommand, gameSettingResetValue, gameSettingWriteCommand, type GameSettingEntry } from './game-settings-catalog';
import { installControllerSupport } from './controller-support';
import { CATEGORY_ORDER, COMMANDS, type CommandCategory, type CommandDefinition, type CommandInput } from './commands';
import {
  ID_BROWSER_TOTAL,
  QUEST_BROWSER_CATEGORY_ORDER,
  QUEST_BROWSER_TOTAL,
} from './catalog-metadata';
import type { QuestBrowserEntry } from './quest-browser';
import { resolvePackagedQuestCatalog } from './official-quest-catalog';
import type { ReferenceIdPicker } from './reference-ids';
import {
  CURATED_ID_CATALOG,
  ID_BROWSER_CATEGORIES,
  idCategoryForRecordType,
  mergeGeneratedIdCatalog,
  resolvePackagedIdCatalog,
  type IdBrowserCategory,
  type PluginLoadOrderReply,
  type IdCatalogEntry,
} from './id-catalog';
import { normalizeModCatalogs, type ModCatalogReply, type ModCatalogSummary } from './mod-catalog';

const previewReady = (window as Window & { __CCC_PREVIEW_READY__?: Promise<void> }).__CCC_PREVIEW_READY__;
if (previewReady) await previewReady;

type ViewMode = 'commands' | 'favorites' | 'recent' | 'id-browser' | 'mod-browser' | 'quest-browser' | 'activity' | 'custom' | string;

type HelpPageId = 'recent' | 'favorites' | 'categories' | 'id-browser' | 'mod-browser' | 'quest-browser' | 'custom' | 'activity';

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

type CommandActionChoice = 'primary' | 'secondary';

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
  favorite?: boolean;
  valid?: boolean;
  error?: string;
};

type CommandBatchListReply = {
  ok: boolean;
  directory: string;
  entries: Array<{
    id: string;
    name: string;
    file: string;
    commands: string;
    commandCount: number;
    valid: boolean;
    error?: string;
  }>;
  warnings: string[];
  migrated: number;
  migrationComplete: boolean;
};

type CommandBatchMutationReply = {
  ok: boolean;
  removed?: boolean | number;
};

type CommandBatchAutoRunReply = {
  ok: boolean;
  enabled: boolean;
  batches: string[];
  delaySeconds: number;
};

type CommandBatchAutoRunReportsReply = {
  ok: boolean;
  reports: Array<{
    id: number;
    success: boolean;
    batchCount: number;
    commandCount: number;
    message: string;
  }>;
};

type FavoriteIdEntry = IdCatalogEntry & {
  favoriteKey: string;
  savedFrom: 'id-browser' | 'mod-browser';
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
const STORAGE_ID_FAVORITES = 'consoleCommandCenter.idFavorites';
const STORAGE_RECENT = 'consoleCommandCenter.recent';
const STORAGE_ACTIVITY = 'consoleCommandCenter.activity';
const STORAGE_CUSTOM_COMMANDS = 'consoleCommandCenter.customCommands';
const STORAGE_CUSTOM_COMMAND_FAVORITES = 'consoleCommandCenter.customCommandFavorites';
const STORAGE_WELCOME_SEEN = 'consoleCommandCenter.welcomeSeen.v1';
const MAX_RECENT = 10;
const MAX_ACTIVITY = 100;
const MAX_CUSTOM_COMMAND_LENGTH = 1024;
const MAX_SAVED_CUSTOM_COMMANDS = 100;
const MAX_CUSTOM_COMMAND_NAME_LENGTH = 50;
const ENGINE_COMMAND_LIBRARY_TOTAL = 1493;
const CONSOLE_COMMAND_CENTER_VERSION = '1.3.31';

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
    intro: 'Favorites collects command cards, saved command batches, and browser IDs you mark with a star.',
    sections: [
      { title: 'ADD FAVORITES', text: 'Select the star on any command, saved command batch, or selected ID. The filled star means it is saved here.' },
      { title: 'USE SAVED COMMANDS', text: 'Load a saved batch from Favorites to open it in Custom Command for review before execution.' },
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
      { title: 'CONTROLLER', text: 'Use the D-pad or left stick to move, LB and RB to switch pages, A to enter or select, B to go back, Start to search, and Select to open Help. Commands are selected as whole cards. Press A to enter a card with Execute selected, then press A again to run it. B returns to card selection.' },
      { title: 'ADVANCED SETTINGS', text: 'Enable Advanced Options in Settings, then choose Advanced Settings in Commands. Search the grouped list, inspect the live value, or review a numeric change. Base-game resets appear where a reference is supplied; they do not restore mod-specific values. String settings are read-only.' },
      { title: 'WIP COMMANDS', text: 'Working results move commands into their functional categories. Issues move into the WIP Issues group; Not noticeable moves into Effect Unconfirmed. Saved results still apply after reloading or leaving Dev Mode. Known safety blocks remain in place.' },
    ],
    note: 'Make a manual save before changing quests, NPCs, ships, or important world state.',
  },
  'id-browser': {
    eyebrow: 'ID BROWSER HELP',
    title: 'Find Form IDs',
    intro: 'ID Browser searches records included with CCC and supported records detected from the mods currently loaded by Starfield.',
    sections: [
      { title: 'SEARCH AND FILTER', text: 'Choose an ID category from the left side, then search its records by name, Form ID, type, or category.' },
      { title: 'SELECT A RECORD', text: 'Choose a name from the compact list to view its information and the actions CCC can safely prepare for that record type.' },
      { title: 'COMMAND PICKERS', text: 'When a command sends you here, only compatible records appear. Selecting one returns its Form ID to the command.' },
      { title: 'MOD CATALOGS', text: 'Mod records live in the separate Mod Browser. Opening ID Browser never starts a mod scan.' },
    ],
  },
  'mod-browser': {
    eyebrow: 'MOD BROWSER',
    title: 'Browse records added by active mods',
    intro: 'Mod Browser scans only when you select Scan Mods. Results remain available for the current game session.',
    sections: [
      { title: 'SCAN MODS', text: 'One action discovers the active mods and collects their supported IDs for the current game session.' },
      { title: 'Session scan', text: 'CCC does not scan when Mod Browser opens. Select Scan Mods once after starting the game when you want to browse mod IDs.' },
      { title: 'Sort the browser', text: 'Sort by Mod lists plugins. Sort by Category lists record categories across all scanned mods; item rows identify their source mod. Both controls are below Scan Mods.' },
      { title: 'Search scope', text: 'With no mod selected, Search All searches every scanned mod ID. Select a mod and choose Search Mod to limit results to that plugin.' },
      { title: 'Current load order', text: 'Each scan uses the current full, medium, and small plugin indexes so the displayed Form IDs match this session.' },
      { title: 'Refresh the list', text: 'Select Scan Mods again after enabling, disabling, or updating plugins.' },
    ],
  },
  'quest-browser': {
    eyebrow: 'QUEST BROWSER HELP',
    title: 'Inspect and repair quest progress',
    intro: 'Quest Browser contains packaged quest records and known stage indexes from the base game, Free Lanes, Shattered Space, and Terran Armada.',
    sections: [
      { title: 'FIND A QUEST', text: 'Choose a quest category from the left side, then search by quest name, Editor ID, Form ID, source, or stage number.' },
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
      { title: 'ENTER COMMANDS', text: 'Enter one command per line. Empty lines and lines beginning with # are ignored.' },
      { title: 'REVIEW THE BATCH', text: 'Review Commands shows the exact lines before CCC runs them in order. Execution stops when a command reports an error.' },
      { title: 'SAVE A WORKFLOW', text: 'Each saved batch is a .txt file in your user-owned CCC folder. The filename becomes its name in CCC.' },
      { title: 'START WITH A SAMPLE', text: 'On first use, an empty batch folder receives three editable Sample files. Load one, adjust its quantities, and review it before running. Samples are never enabled for Auto-Run automatically.' },
      { title: 'EDIT OUTSIDE CCC', text: 'Edit or add .txt files in a text editor, then select Refresh. Empty lines and lines beginning with # are ignored.' },
      { title: 'RUN AFTER LOADING', text: 'Select On Load beside a saved batch, then turn on the Auto-Run master switch. CCC runs selected files three seconds after an existing save finishes loading.' },
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
let idFavorites = readFavoriteIds().map(applyAmmoFindings).map(applyArmorFindings).map(applyReviewedFindings);
let recent = readStringArray(STORAGE_RECENT);
let activityLog = readActivityLog();
let savedCustomCommands = readSavedCustomCommands();
let savedCustomCommandFavorites = new Set(readStringArray(STORAGE_CUSTOM_COMMAND_FAVORITES).map((name) => name.toLowerCase()));
for (const entry of savedCustomCommands) if (entry.favorite) savedCustomCommandFavorites.add(entry.name.toLowerCase());
let commandBatchDirectory = 'Documents\\My Games\\Starfield\\Console Command Center\\Command Batches';
let commandBatchesLoading = false;
let commandBatchesLoaded = false;
let commandBatchAutoRunEnabled = false;
let commandBatchAutoRunNames = new Set<string>();
let commandBatchAutoRunDelaySeconds = 3;
let customSampleRequest = 0;
let includedBatchDirectory = 'Documents\\My Games\\Starfield\\Console Command Center\\Included Batches';
let includedBatchSetup: Promise<void> | null = null;
let includedBatchEntries: Array<{name:string;file:string;commandCount:number}> = [];
let customCommandDraftName = '';
let customCommandDraft = '';
let pendingExecution: PendingExecution | null = null;
let activeIdPicker: ActiveIdPicker | null = null;
let activeCatalogPicker: ActiveCatalogPicker | null = null;
let nativeBackendReady = false;
let idCatalog: IdCatalogEntry[] = CURATED_ID_CATALOG;
let packagedIdCatalog: IdCatalogEntry[] = CURATED_ID_CATALOG;
let idCatalogLoaded = false;
let idCatalogLoading: Promise<void> | null = null;
let officialLoadOrderLoading: Promise<PluginLoadOrderReply | null> | null = null;
let modCatalogs: ModCatalogSummary[] = [];
let modCatalogScanAllRunning = false;
let modCatalogScanAllComplete = false;
let modCatalogScanCancelRequested = false;
let modCatalogSummaryScanStartedAt = 0;
let modCatalogSummaryTimer: number | null = null;
let modCatalogScanReturnFocus: HTMLElement | null = null;
let modSearchScope: 'mod' | 'all' = 'mod';
let modBrowserSort: 'mod' | 'category' = 'mod';
let modBrowserCategory = '';
const openModCategories = new Set<string>();
let questBrowserEntries: QuestBrowserEntry[] = [];
let questBrowserLoaded = false;
let questBrowserLoading: Promise<void> | null = null;
let engineCommandLibraryLoaded = false;
let engineCommandLibraryLoading: Promise<void> | null = null;
let idBrowserCategory = 'common';
let idBrowserRecordTypeFilter = '';
let idBrowserSelected: IdCatalogEntry | null = null;
let gameSettings: GameSettingEntry[] = [];
let gameSettingsLoading: Promise<void> | null = null;
let gameSettingsLoaded = false;
let gameSettingsError: string | null = null;
let selectedGameSetting: string | null = null;
const openGameSettingGroups = new Set<string>(['MAIN / Scanner']);
const gameSettingLimits = new Map<string, number>();
let idBrowserQuantity = 1;
let selectedFavoriteIdKey: string | null = null;
let commandCategory = CATEGORY_ORDER[0];
let questBrowserSource: QuestBrowserEntry['source'] | 'all' = 'Base Game';
let questBrowserCategory = QUEST_BROWSER_CATEGORY_ORDER[0] as string;
const questProgressSnapshots = new Map<string, QuestProgressSnapshot>();
let selectedQuestKey: string | null = null;
let openUntestedGroup: string | null = null;
let selectedCommandId: string | null = null;
const selectedCommandActions = new Map<string, CommandActionChoice>();
const armedCommandActions = new Map<string, CommandActionChoice>();

app.innerHTML = `
  <main class="command-center-shell">
    <header class="topbar">
      <div class="brand-block">
        <div class="brand-mark" aria-hidden="true">CCC</div>
        <h1>Console Command Center</h1>
      </div>
      <div class="topbar-actions">
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="open-settings" type="button">Settings</button>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="open-help" type="button"><span class="controller-view-hint" aria-hidden="true"><i></i><i></i></span><span>Help</span></button>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="close-view" type="button" data-controller-hint="B">Close</button>
      </div>
    </header>

    <div class="osf-tricolor brand-stripe" aria-hidden="true"></div>

    <nav class="utility-nav-bar" aria-label="Main pages">
      <span class="controller-bumper-hint controller-bumper-hint--left" aria-hidden="true">LB</span>
      <button class="nav-button nav-button--commands" type="button" data-view="commands">
        <span>Commands</span><span class="nav-count">${currentCommands().filter((command) => command.category !== 'Untested').length}</span>
      </button>
      <button class="nav-button nav-button--ids" type="button" data-view="id-browser">
        <span>ID Browser</span><span class="nav-count" id="id-browser-nav-count">${ID_BROWSER_TOTAL}</span>
      </button>
      <button class="nav-button nav-button--mods" type="button" data-view="mod-browser">
        <span>Mod Browser</span><span class="nav-count" id="mod-browser-nav-count">0</span>
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
      <span class="controller-bumper-hint controller-bumper-hint--right" aria-hidden="true">RB</span>
    </nav>

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
          <div class="search-tools">
            <div class="mod-search-scope" id="mod-search-scope" aria-label="Mod search scope" hidden>
              <button type="button" data-mod-search-scope="mod">Search Mod</button>
              <button type="button" data-mod-search-scope="all">Search All</button>
            </div>
            <label class="search-wrap" id="search-wrap">
              <span class="osf-eyebrow search-label"><span>SEARCH</span><span class="controller-menu-hint" aria-hidden="true"><i></i><i></i><i></i></span></span>
              <span class="search-field"><input class="osf-input" id="search" type="search" placeholder="Search name, command, tag..." autocomplete="off"><button class="search-clear" id="search-clear" type="button" aria-label="Clear search" title="Clear search" hidden>×</button></span>
            </label>
          </div>
        </div>

        <div class="mod-scan-overlay" id="mod-scan-overlay" role="dialog" aria-modal="true" aria-labelledby="mod-scan-title" hidden>
          <section class="mod-scan-card osf-card">
            ${loadingRingHtml()}
            <div class="mod-scan-copy">
              <p class="osf-eyebrow">MOD BROWSER</p>
              <h3 id="mod-scan-title">Updating Mod Browser</h3>
              <p id="mod-scan-detail" aria-live="polite">Reading the active load order and plugin headers.</p>
              <div class="mod-scan-meta"><span id="mod-scan-count" aria-live="polite">Discovering plugins…</span><span id="mod-scan-elapsed">Elapsed 0.0s</span></div>
              <small>Cancel stops after the current plugin reply and keeps your existing Mod Browser catalog.</small>
              <div class="mod-scan-actions"><button class="osf-btn osf-btn--sm osf-btn--ghost" id="mod-scan-cancel" type="button">Cancel Scan</button></div>
            </div>
          </section>
        </div>

        <div class="command-summary">
          <span id="result-count">0 commands</span>
          <span class="summary-separator" id="result-count-separator">/</span>
          <span>Commands may affect achievements or save-game state.</span>
        </div>

        <div id="command-list" class="command-list" aria-live="polite"></div>
        <div id="custom-panel" class="custom-panel" hidden></div>
      </section>
    </section>

    <footer class="statusbar">
      <div class="status-primary"><button id="dev-mode-dot" class="dev-mode-dot" type="button" aria-label="Toggle Dev Mode with five clicks" aria-pressed="false" title="Click five times to toggle Dev Mode">●</button><button id="dev-feedback-export" class="osf-btn osf-btn--sm dev-feedback-export" type="button" hidden>Export Reports</button><span class="osf-eyebrow">STATUS</span><span id="status">Ready.</span></div>
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
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="id-picker-close" type="button" data-controller-hint="B">Close</button>
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
        <button class="osf-btn" id="id-picker-cancel" type="button" data-controller-hint="B">Cancel</button>
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
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="help-close" type="button" data-controller-hint="B">Close</button>
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
      <div class="confirm-command"><span>COMMAND</span><code id="confirm-command" tabindex="0" aria-label="Commands to review"></code></div>
      <div class="confirm-actions">
        <button class="osf-btn" id="confirm-cancel" type="button" data-controller-hint="B">Cancel</button>
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
    <button class="osf-btn osf-btn--sm osf-btn--ghost" id="results-close" type="button" data-controller-hint="B">Close</button></header>
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
let resultsReturnFocus: (() => HTMLElement | null) | null = null;

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
resultsDialog.addEventListener('close', () => {
  const resolveTarget = resultsReturnFocus;
  resultsReturnFocus = null;
  if (resolveTarget) requestAnimationFrame(() => resolveTarget()?.focus({ preventScroll: true }));
});

function showResults(title: string, command: string, output: string, state: 'loading' | 'ready' | 'error'): void {
  resultsTitle.textContent = title;
  resultsCommand.textContent = command;
  resultsStatus.textContent = state === 'loading' ? 'Reading game data…'
    : state === 'error' ? 'Inspection failed — no value was verified.'
    : `${output.length.toLocaleString()} characters • saved in Activity Log`;
  resultsStatus.dataset.state = state;resultsStatus.setAttribute('aria-busy',String(state==='loading'));if(state==='loading')resultsStatus.prepend(createLoadingRing('small'));
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
const modSearchScopeControl = requiredElement('#mod-search-scope', HTMLElement);
const modScanOverlay = requiredElement('#mod-scan-overlay', HTMLElement);
const modScanDetail = requiredElement('#mod-scan-detail', HTMLElement);
const modScanCount = requiredElement('#mod-scan-count', HTMLElement);
const modScanElapsed = requiredElement('#mod-scan-elapsed', HTMLElement);
const modScanCancel = requiredElement('#mod-scan-cancel', HTMLButtonElement);
const search = requiredElement('#search', HTMLInputElement);
const searchClear = requiredElement('#search-clear', HTMLButtonElement);
const sectionKicker = requiredElement('#section-kicker', HTMLElement);
const sectionTitle = requiredElement('#section-title', HTMLElement);
const resultCount = requiredElement('#result-count', HTMLElement);
const resultCountSeparator = requiredElement('#result-count-separator', HTMLElement);
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

function readFavoriteIds(): FavoriteIdEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_ID_FAVORITES) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is FavoriteIdEntry => {
      if (!entry || typeof entry !== 'object') return false;
      const value = entry as Partial<FavoriteIdEntry>;
      return typeof value.favoriteKey === 'string'
        && (value.savedFrom === 'id-browser' || value.savedFrom === 'mod-browser')
        && typeof value.label === 'string'
        && typeof value.value === 'string'
        && typeof value.type === 'string'
        && typeof value.category === 'string';
    });
  } catch {
    return [];
  }
}

function writeFavoriteIds(): void {
  try {
    localStorage.setItem(STORAGE_ID_FAVORITES, JSON.stringify(idFavorites));
  } catch {
    // Favorites remain available for the current session if storage is unavailable.
  }
}

function idFavoriteKey(entry: IdCatalogEntry): string {
  return entry.plugin && entry.localFormId
    ? `${entry.source === 'mod' ? 'mod' : 'official'}:${entry.plugin.toLowerCase()}:${entry.localFormId.toUpperCase()}:${entry.type.toUpperCase()}`
    : `id:${entry.value.toUpperCase()}:${entry.type.toUpperCase()}`;
}

function toggleIdFavorite(entry: IdCatalogEntry): void {
  const favoriteKey = idFavoriteKey(entry);
  const existing = idFavorites.some((favorite) => favorite.favoriteKey === favoriteKey);
  idFavorites = existing
    ? idFavorites.filter((favorite) => favorite.favoriteKey !== favoriteKey)
    : [{ ...entry, favoriteKey, savedFrom: entry.source === 'mod' ? 'mod-browser' : 'id-browser' }, ...idFavorites];
  writeFavoriteIds();
  render();
  setStatus(`${existing ? 'Removed' : 'Added'} ${entry.label} ${existing ? 'from' : 'to'} Favorites.`, 'success');
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
        && typeof value.updatedAt === 'number'
        && (value.favorite === undefined || typeof value.favorite === 'boolean');
    }).slice(0, MAX_SAVED_CUSTOM_COMMANDS);
  } catch {
    return [];
  }
}

function writeSavedCustomCommandFavorites(): void {
  writeStringArray(STORAGE_CUSTOM_COMMAND_FAVORITES, [...savedCustomCommandFavorites]);
}

function applyCommandBatchReply(reply: CommandBatchListReply): void {
  commandBatchDirectory = reply.directory || commandBatchDirectory;
  savedCustomCommands = reply.entries.map((entry) => ({
    id: entry.id || entry.name.toLowerCase(),
    name: entry.name,
    commands: entry.commands,
    updatedAt: 0,
    favorite: savedCustomCommandFavorites.has(entry.name.toLowerCase()),
    valid: entry.valid,
    error: entry.error,
  }));
  commandBatchesLoaded = true;
  if (reply.migrationComplete) {
    writeSavedCustomCommandFavorites();
    try { localStorage.removeItem(STORAGE_CUSTOM_COMMANDS); } catch { /* Retry migration next session if storage is unavailable. */ }
  }
}

function applyCommandBatchAutoRunReply(reply: CommandBatchAutoRunReply): void {
  commandBatchAutoRunEnabled = reply.enabled === true;
  commandBatchAutoRunNames = new Set((reply.batches ?? []).map((name) => name.toLowerCase()));
  commandBatchAutoRunDelaySeconds = Number.isFinite(reply.delaySeconds) ? reply.delaySeconds : 3;
}

async function refreshCommandBatchAutoRun(): Promise<void> {
  if (!window.osfui?.request || !nativeBackendReady) return;
  const reply = await window.osfui.request<CommandBatchAutoRunReply>('console.command-center.commandBatchAutoRunGet');
  if (!reply?.ok || !Array.isArray(reply.batches)) throw new Error('Native backend returned invalid Auto Run settings.');
  applyCommandBatchAutoRunReply(reply);
}

async function importCommandBatchAutoRunReports(): Promise<void> {
  if (!window.osfui?.request || !nativeBackendReady) return;
  try {
    const reply = await window.osfui.request<CommandBatchAutoRunReportsReply>('console.command-center.commandBatchAutoRunReports');
    if (!reply?.ok || !Array.isArray(reply.reports)) return;
    for (const report of reply.reports) {
      addActivitySummary(
        'Automatic Batch Run',
        'Custom Command',
        'Run after loading save',
        report.success ? 'success' : 'error',
        report.message,
      );
    }
    if (reply.reports.length) {
      renderNavigation();
      setStatus(reply.reports.at(-1)?.message ?? 'Automatic batch run finished.', reply.reports.at(-1)?.success ? 'success' : 'error');
    }
  } catch {
    // Auto Run reports are supplementary; never block the rest of CCC startup.
  }
}

async function ensureIncludedBatchFiles(refresh = false): Promise<void> {
  if (refresh) includedBatchSetup = null;
  if (!includedBatchSetup) {
    includedBatchSetup = (async () => {
      if (!window.osfui?.request || !nativeBackendReady) throw new Error('Connect the native backend to read Included Batches.');
      const plugins = (await readOfficialPluginLoadOrder())?.plugins;
      const defaults = SAMPLE_BATCHES.flatMap(sample => {
        try { return [{name:sample.name, previousName:sample.previousName??'', commands:prepareSampleCommands(sample, plugins) + (sample.plugin ? '\n# CCC plugin: ' + sample.plugin + '\n' : '')}]; }
        catch { return []; }
      });
      const reply = await window.osfui.request<{ok:boolean;directory:string;entries:Array<{name:string;file:string;commandCount:number}>}>('console.command-center.includedBatch', {samples:defaults});
      if (!reply?.ok || !reply.directory) throw new Error('Could not prepare Included Batches. Update the native DLL and restart Starfield.');
      includedBatchDirectory = reply.directory;
      includedBatchEntries = reply.entries ?? [];
      renderNavigation();
    })().catch(error => { includedBatchSetup = null; throw error; });
  }
  await includedBatchSetup;
}

async function refreshCommandBatches(migrateLegacy = false): Promise<void> {
  if (commandBatchesLoading) return;
  if (!window.osfui?.request || !nativeBackendReady) {
    setStatus('ConsoleCommandCenter.dll is not connected, so batch files cannot be read.', 'error');
    return;
  }
  commandBatchesLoading = true;
  if (activeView === 'custom') renderCustomPanel();
  setStatus(migrateLegacy ? 'Loading command-batch files and migrating existing saves...' : 'Refreshing command-batch files...', 'working');
  try {
    const legacyBatches = migrateLegacy ? readSavedCustomCommands().map(({ name, commands }) => ({ name, commands })) : [];
    const reply = await window.osfui.request<CommandBatchListReply>('console.command-center.commandBatchList', { legacyBatches });
    if (!reply?.ok || !Array.isArray(reply.entries)) throw new Error('Native backend returned an invalid batch-file list.');
    applyCommandBatchReply(reply);
    await refreshCommandBatchAutoRun();
    await ensureIncludedBatchFiles(true);
    const warning = reply.warnings?.[0];
    const migrated = reply.migrated ? ` Migrated ${reply.migrated} existing ${reply.migrated === 1 ? 'batch' : 'batches'}.` : '';
    setStatus(warning ? `Loaded ${reply.entries.length} batch files. ${warning}` : `Loaded ${reply.entries.length} batch files.${migrated}`, warning ? 'error' : 'success');
  } catch (error) {
    setStatus(`Could not refresh command-batch files: ${describe(error)}`, 'error');
  } finally {
    commandBatchesLoading = false;
    if (activeView === 'custom') renderCustomPanel();
    renderNavigation();
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

function addActivitySummary(label: string, category: string, command: string, outcome: 'success' | 'error', message: string): void {
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    command: command.trim(),
    label,
    category,
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

function addActivity(execution: PendingExecution, outcome: 'success' | 'error', message: string): void {
  addActivitySummary(
    execution.definition?.title ?? 'Custom Command',
    execution.definition?.category ?? 'Custom',
    execution.command,
    outcome,
    message,
  );
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

function currentCommands(): CommandDefinition[] {
  return COMMANDS.map(command => applyCommandFeedback(command, devFeedbackCommandOutcome(command.id)));
}

function categoryCount(category: string): number {
  const loaded = currentCommands().filter((command) => command.category === category).length;
  return category === 'Untested' && !engineCommandLibraryLoaded ? loaded + ENGINE_COMMAND_LIBRARY_TOTAL : loaded;
}

function renderNavigation(): void {
  const previousCategoryScrollTop = navigation.querySelector<HTMLElement>('.navigation-categories')?.scrollTop ?? 0;

  const special = [
    { id: 'recent', label: 'Recent', count: recent.filter((id) => currentCommands().some((command) => command.id === id)).length },
    { id: 'favorites', label: 'Favorites', count: favorites.filter((id) => currentCommands().some((command) => command.id === id)).length + savedCustomCommands.filter((entry) => entry.favorite).length + idFavorites.length },
  ];

  let categoryLabel = 'COMMAND CATEGORIES';
  let categoryContent = '';

  if (activeView === 'id-browser') {
    categoryLabel = 'ID CATEGORIES';
    const builtInCategories = ID_BROWSER_CATEGORIES
      .filter((category) => category.value !== 'all')
      .filter((category) => visibleIdCategory(category.value, uiPreferences.advanced))
      .map((category) => ({ category, count: idBrowserCategoryCount(category.value) }))
      .filter(({ category, count }) => count > 0)
      .map(({ category, count }) => sidebarCategoryButton('id', category.value, category.label, count, idBrowserCategory === category.value))
      .join('');
    categoryContent = builtInCategories;
  } else if (activeView === 'mod-browser') {
    categoryLabel = 'MOD CATALOGS';
    const populatedCatalogs = (modCatalogScanAllComplete ? modCatalogs.filter((catalog) => catalog.entries.length > 0) : modCatalogs)
      .slice()
      .sort((left, right) => {
        const leftCount = left.recordsLoaded ? left.entries.length : left.reportedCount;
        const rightCount = right.recordsLoaded ? right.entries.length : right.reportedCount;
        return rightCount - leftCount || left.name.localeCompare(right.name);
      });
    const officialCreations = populatedCatalogs.filter((catalog) => catalog.officialCreation);
    const communityMods = populatedCatalogs.filter((catalog) => !catalog.officialCreation);
    const modCategories = [
      officialCreations.length
        ? `<div class="sidebar-source-heading">Official Creations</div>${officialCreations.map((catalog) => sidebarCatalogButton(catalog, idBrowserCategory === catalog.key)).join('')}`
        : '',
      communityMods.length
        ? `<div class="sidebar-source-heading">Mods</div>${communityMods.map((catalog) => sidebarCatalogButton(catalog, idBrowserCategory === catalog.key)).join('')}`
        : '',
    ].join('');
    const recordCategories = modCategoryCounts(idCatalog,uiPreferences.advanced);
    const categoryButtons = recordCategories.length ? `<button class="nav-button${!modBrowserCategory?' is-active':''}" type="button" data-mod-record-category="" aria-pressed="${!modBrowserCategory}"><span>All Categories</span><span class="nav-count">${recordCategories.reduce((n,c)=>n+c.count,0)}</span></button>` + recordCategories.map(category=>`<button class="nav-button${modBrowserCategory===category.name?' is-active':''}" type="button" data-mod-record-category="${escapeHtml(category.name)}" aria-pressed="${modBrowserCategory===category.name}"><span>${escapeHtml(category.name==='Cells'?'Cells / Teleport':category.name)}</span><span class="nav-count">${category.count}</span></button>`).join('') : '';
    categoryLabel = modBrowserSort==='category'?'MOD CATEGORIES':'MOD CATALOGS';
    const modState = (modBrowserSort==='category'?categoryButtons:modCategories) || '<div class="sidebar-catalog-note">Select Scan Mods to load this session\'s mod IDs.</div>';
    categoryContent = `<div class="sidebar-mod-actions">
        <button class="nav-button sidebar-refresh" type="button" data-scan-mod-catalogs ${modCatalogScanAllRunning ? 'disabled' : ''}><span>${modCatalogScanAllRunning ? 'Scanning Mods…' : 'Scan Mods'}</span></button>
        <div class="sidebar-mod-sort" role="group" aria-label="Mod Browser sorting">
          <button class="nav-button${modBrowserSort==='mod'?' is-active':''}" type="button" data-mod-sort="mod" aria-pressed="${modBrowserSort==='mod'}">Sort by Mod</button>
          <button class="nav-button${modBrowserSort==='category'?' is-active':''}" type="button" data-mod-sort="category" aria-pressed="${modBrowserSort==='category'}">Sort by Category</button>
        </div>
      </div>${modState}`;
  } else if (activeView === 'quest-browser') {
    categoryLabel = 'QUEST CATEGORIES';
    categoryContent = (['Base Game', 'Shattered Space', 'Free Lanes', 'Terran Armada'] as const).map((source) => {
      const buttons = QUEST_BROWSER_CATEGORY_ORDER.filter((category) => uiPreferences.advanced || category !== 'Internal / System').map((category) => ({
        category,
        count: questBrowserEntries.filter((entry) => entry.source === source && entry.category === category).length,
      })).filter(({ count }) => count > 0)
        .map(({ category, count }) => questSidebarCategoryButton(source, category, count, questBrowserSource === source && questBrowserCategory === category))
        .join('');
      return `<div class="sidebar-source-heading quest-source-heading">${escapeHtml(source)}</div>${buttons}`;
    }).join('');
  } else if (activeView === 'custom') {
    categoryLabel = 'INCLUDED';
    categoryContent = includedBatchEntries.map((entry) => `<button class="nav-button" type="button" data-included-batch="${escapeHtml(entry.name)}" title="${escapeHtml(entry.file)}"><span>${escapeHtml(entry.file)}</span><span class="nav-count">${entry.commandCount}</span></button>`).join('');
  } else if (activeView === 'commands' || activeView === 'recent' || activeView === 'favorites') {
    categoryContent = CATEGORY_ORDER.filter((category) => visibleCommandRecord({ category }, uiPreferences.advanced)).map((category) => sidebarCategoryButton(
      'command',
      category,
      category === 'Untested' ? 'WIP' : category,
      categoryCount(category),
      activeView === 'commands' && commandCategory === category,
    )).join('');
  } else {
    categoryLabel = 'PAGE';
  }

  navigation.innerHTML = `
    <div class="navigation-stationary" aria-label="Recent and favorite commands">
      ${special.map((item) => navButton(item.id, item.label, item.count)).join('')}
    </div>
    <div class="nav-divider"><span></span><span class="osf-eyebrow">${categoryLabel}</span><span></span></div>
    <div class="navigation-categories" aria-label="${categoryLabel.toLowerCase()}">
      ${categoryContent}
    </div>
  `;

  const categoryScroller = navigation.querySelector<HTMLElement>('.navigation-categories');
  if (categoryScroller) categoryScroller.scrollTop = previousCategoryScrollTop;

  const commandsCount = document.querySelector('[data-view="commands"] .nav-count');
  if (commandsCount) commandsCount.textContent = String(currentCommands().filter(command => command.category !== 'Untested').length);
  const activityCount = document.querySelector('#activity-nav-count');
  if (activityCount instanceof HTMLElement) activityCount.textContent = String(activityLog.length);
  const idCount = document.querySelector('#id-browser-nav-count');
  if (idCount instanceof HTMLElement) idCount.textContent = (idCatalogLoaded ? idCatalog.length : ID_BROWSER_TOTAL).toLocaleString();
  const modCount = document.querySelector('#mod-browser-nav-count');
  if (modCount instanceof HTMLElement) {
    modCount.textContent = modCatalogs.reduce((total, catalog) => total + catalog.entries.length, 0).toLocaleString();
  }
}

function navButton(id: string, label: string, count: number): string {
  const active = activeView === id ? ' is-active' : '';
  return `<button class="nav-button${active}" type="button" data-view="${escapeHtml(id)}"><span>${escapeHtml(label)}</span><span class="nav-count">${count}</span></button>`;
}

function sidebarCategoryButton(kind: 'command' | 'id', id: string, label: string, count: number, active: boolean): string {
  return `<button class="nav-button${active ? ' is-active' : ''}" type="button" data-${kind}-category="${escapeHtml(id)}" title="${escapeHtml(label)}"><span>${escapeHtml(label)}</span>${kind === 'command' && id === 'Advanced Settings' ? '' : `<span class="nav-count">${count.toLocaleString()}</span>`}</button>`;
}

function sidebarCatalogButton(catalog: ModCatalogSummary, active: boolean): string {
  const availableCount = catalog.recordsLoaded ? catalog.entries.length : catalog.reportedCount;
  const count = availableCount > 0 ? availableCount.toLocaleString() : catalog.cached ? '0' : '…';
  return `<button class="nav-button${active ? ' is-active' : ''}" type="button" data-id-category="${escapeHtml(catalog.key)}" title="${escapeHtml(catalog.plugin)}"><span>${escapeHtml(catalog.name)}</span><span class="nav-count">${count}</span></button>`;
}

function selectQuestBrowserCategory(source: string | undefined, category: string | undefined): boolean {
  if (!category || !QUEST_BROWSER_CATEGORY_ORDER.includes(category as typeof QUEST_BROWSER_CATEGORY_ORDER[number])) return false;
  if (source !== 'Base Game' && source !== 'Shattered Space' && source !== 'Free Lanes' && source !== 'Terran Armada') return false;
  questBrowserSource = source;
  questBrowserCategory = category;
  selectedQuestKey = null;
  render();
  return true;
}

function questSidebarCategoryButton(source: QuestBrowserEntry['source'], category: string, count: number, active: boolean): string {
  return `<button class="nav-button${active ? ' is-active' : ''}" type="button" data-quest-source="${escapeHtml(source)}" data-quest-category="${escapeHtml(category)}" title="${escapeHtml(category)}"><span>${escapeHtml(category)}</span><span class="nav-count">${count.toLocaleString()}</span></button>`;
}

function idBrowserCategoryCount(value: string): number {
  if (value === 'all') return idCatalogLoaded ? idCatalog.filter((entry) => entry.source !== 'mod' && visibleIdRecord(entry, uiPreferences.advanced)).length : ID_BROWSER_TOTAL;
  const modCatalog = modCatalogs.find((catalog) => catalog.key === value);
  if (modCatalog) return modCatalog.entries.length;
  const category = ID_BROWSER_CATEGORIES.find((entry) => entry.value === value);
  if (!category || !idCatalogLoaded) return 0;
  return idCatalog.filter((entry) => {
    const sourceMatches = !category.sources?.length || category.sources.includes(entry.source);
    const categoryMatches = category.builtInCategories.includes('*') || category.builtInCategories.includes(entry.category)
      || (category.builtInCategories.length === 0 && category.recordType === entry.type.toUpperCase());
    return entry.source !== 'mod' && visibleIdRecord(entry, uiPreferences.advanced) && sourceMatches && categoryMatches;
  }).length;
}

function commandMatches(command: CommandDefinition, searchText = query): boolean {
  if (!searchText.trim()) return true;
  const haystack = [command.title, command.category, command.description, command.command, ...(command.tags ?? [])]
    .flatMap(value => [value, typeof translateUiText==='function'?translateUiText(String(value??'')):value]).join(' ')
    .toLowerCase();
  const terms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function activeCommands(): CommandDefinition[] {
  const visibleCommands = currentCommands().filter((command) => visibleCommandRecord(command, uiPreferences.advanced));
  if (query) return visibleCommands.filter((command) => commandMatches(command));

  if (activeView === 'commands' && commandCategory === 'Untested') {
    return visibleCommands
      .filter((command) => command.category === 'Untested')
      .filter((command) => commandMatches(command, untestedQuery));
  }

  let commands = visibleCommands;

  if (activeView === 'favorites') {
    commands = favorites
      .map((id) => visibleCommands.find((command) => command.id === id))
      .filter((command): command is CommandDefinition => Boolean(command));
  } else if (activeView === 'recent') {
    commands = recent
      .map((id) => currentCommands().find((command) => command.id === id))
      .filter((command): command is CommandDefinition => Boolean(command));
  } else if (activeView === 'commands') {
    commands = visibleCommands.filter((command) => command.category === commandCategory);
  }

  return commands.filter((command) => commandMatches(command));
}

function viewTitle(): string {
  if (query && activeView === 'mod-browser') {
    const activeMod = modCatalogs.find((catalog) => catalog.key === idBrowserCategory);
    return modSearchScope === 'all' || !activeMod ? 'Search All Mod IDs' : `Search ${activeMod.name}`;
  }
  if (query && activeView !== 'custom' && activeView !== 'activity') return 'Search Results';
  if (activeView === 'favorites') return 'Favorites';
  if (activeView === 'recent') return 'Recent Commands';
  if (activeView === 'quest-browser') return questBrowserCategory === 'all' ? 'All Quests' : questBrowserCategory;
  if (activeView === 'id-browser') return idBrowserCategory === 'all' ? 'All Included IDs' : activeIdBrowserCategory().label;
  if (activeView === 'mod-browser') return modBrowserSort==='category' ? (modBrowserCategory==='Cells'?'Cells / Teleport':modBrowserCategory||'All Mod Categories') : modCatalogs.find((catalog) => catalog.key === idBrowserCategory)?.name ?? 'Installed Mods';
  if (activeView === 'activity') return 'Activity Log';
  if (activeView === 'custom') return 'Custom Command';
  if (activeView === 'commands' && commandCategory === 'Untested') return 'Work in Progress';
  if (activeView === 'commands') return commandCategory;
  return activeView;
}

function clearForDatasetLoad(): void {
  resultCount.textContent = '';
  commandList.innerHTML=`<div class="dataset-loading" role="status">${loadingRingHtml()}<span>Loading records…</span></div>`;
}

function updateModCatalogSummaryTimer(): void {
  if (!modCatalogSummaryScanStartedAt) return;
  const elapsedSeconds = (performance.now() - modCatalogSummaryScanStartedAt) / 1000;
  modScanElapsed.textContent = `Elapsed ${elapsedSeconds.toFixed(1)}s`;
}

function beginModCatalogSummaryScan(): void {
  modCatalogSummaryScanStartedAt = performance.now();
  modCatalogScanReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modScanDetail.textContent = 'Reading the active load order and plugin headers.';
  modScanCount.textContent = modCatalogs.length > 0
    ? `Checking ${modCatalogs.length.toLocaleString()} known plugins…`
    : 'Discovering plugins…';
  updateModCatalogSummaryTimer();
  modScanCancel.disabled = false;
  modScanCancel.textContent = 'Cancel Scan';
  modScanOverlay.hidden = false;
  if (modCatalogSummaryTimer !== null) window.clearInterval(modCatalogSummaryTimer);
  modCatalogSummaryTimer = window.setInterval(updateModCatalogSummaryTimer, 100);
  requestAnimationFrame(() => modScanCancel.focus({ preventScroll: true }));
}

function setModCatalogSummaryProgress(detail: string, count: string): void {
  modScanDetail.textContent = detail;
  modScanCount.textContent = count;
  updateModCatalogSummaryTimer();
}

function finishModCatalogSummaryScan(): void {
  if (modCatalogSummaryTimer !== null) window.clearInterval(modCatalogSummaryTimer);
  modCatalogSummaryTimer = null;
  modCatalogSummaryScanStartedAt = 0;
  modScanOverlay.hidden = true;
  const returnFocus = modCatalogScanReturnFocus;
  modCatalogScanReturnFocus = null;
  if (returnFocus?.isConnected) requestAnimationFrame(() => returnFocus.focus({ preventScroll: true }));
}

function cancelModCatalogScan(): void {
  if (!modCatalogScanAllRunning || modCatalogScanCancelRequested) return;
  modCatalogScanCancelRequested = true;
  modScanCancel.disabled = true;
  modScanCancel.textContent = 'Cancelling…';
  finishModCatalogSummaryScan();
  setStatus('Cancelling the Mod Browser scan after the current plugin reply. The existing catalog will be kept.', 'normal');
}

function paintModCatalogSummaryScan(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function readOfficialPluginLoadOrder(): Promise<PluginLoadOrderReply | null> {
  if (!officialLoadOrderLoading) {
    officialLoadOrderLoading = (async () => {
      try {
        const reply = await window.osfui?.request<PluginLoadOrderReply>('console.command-center.pluginLoadOrder', {});
        return reply?.ok && Array.isArray(reply.plugins) ? reply : null;
      } catch { return null; }
    })();
  }
  return officialLoadOrderLoading;
}

function ensureIdCatalogLoaded(): Promise<void> {
  if (idCatalogLoaded) return Promise.resolve();
  if (idCatalogLoading) return idCatalogLoading;
  idCatalogLoading = import('./id-browser-data')
    .then(async ({ GENERATED_ID_CATALOG }) => {
      const loadOrder = await readOfficialPluginLoadOrder();
      packagedIdCatalog = resolvePackagedIdCatalog(mergeGeneratedIdCatalog(GENERATED_ID_CATALOG), loadOrder);
      idFavorites = resolvePackagedIdCatalog(idFavorites.map((favorite) => {
        const localId = (favorite.localFormId ?? favorite.value).toUpperCase().slice(-6);
        const metadata = packagedIdCatalog.find((candidate) => candidate.type === favorite.type
          && (candidate.plugin ?? 'Starfield.esm').toLowerCase() === (favorite.plugin ?? 'Starfield.esm').toLowerCase()
          && ((candidate.localFormId ?? candidate.value).toUpperCase().slice(-6) === localId || candidate.alternateFormIds?.some(id => id.slice(-6) === localId)));
        return metadata ? { ...favorite, ...metadata } : favorite;
      }), loadOrder).map((entry) => ({ ...entry, favoriteKey: idFavoriteKey(entry), savedFrom: entry.source === 'mod' ? 'mod-browser' as const : 'id-browser' as const })).filter((entry, index, entries) => entries.findIndex(candidate => candidate.favoriteKey === entry.favoriteKey) === index);
      writeFavoriteIds();
      idCatalog = [...packagedIdCatalog, ...modCatalogs.flatMap((catalog) => catalog.entries)];
      idCatalogLoaded = true;
    })
    .catch((error) => {
      setStatus(`ID Browser data could not be loaded: ${describe(error)}`, 'error');
    })
    .finally(() => {
      idCatalogLoading = null;
      if (activeView === 'id-browser' || activeView === 'mod-browser') render();
    });
  return idCatalogLoading;
}

function rebuildIdCatalog(): void {
  idCatalog = [...packagedIdCatalog, ...modCatalogs.flatMap((item) => item.entries)]
    .sort((a, b) => a.label.localeCompare(b.label));
}

async function requestModCatalogRecords(catalog: ModCatalogSummary, index: number, total: number, action: string, showProgress = true, idsFound = 0): Promise<ModCatalogSummary | null> {
  const bridge = window.osfui;
  if (!bridge?.request) return null;
  if (showProgress) {
    setModCatalogSummaryProgress(`${action} ${catalog.name}.`, `Mod ${(index + 1).toLocaleString()} / ${total.toLocaleString()} · ${idsFound.toLocaleString()} IDs found`);
    await paintModCatalogSummaryScan();
  }
  try {
    const reply = await bridge.request<ModCatalogReply>('console.command-center.modCatalogRecords', { plugin: catalog.plugin }, { timeoutMs: 0 });
    if (!reply.ok || reply.error) throw new Error(reply.error || 'The mod returned an invalid catalog reply.');
    return normalizeModCatalogs(reply)[0] ?? null;
  } catch {
    return null;
  }
}

async function scanModCatalogs(): Promise<void> {
  if (modCatalogScanAllRunning || !nativeBackendReady || !window.osfui?.request) return;
  const scanStartedAt = performance.now();
  const previousScanComplete = modCatalogScanAllComplete;
  modCatalogScanAllRunning = true;
  modCatalogScanAllComplete = false;
  modCatalogScanCancelRequested = false;
  beginModCatalogSummaryScan();
  setModCatalogSummaryProgress('Scanning active mods and collecting all supported IDs.', 'This may take a while with a large load order.');
  renderNavigation();
  await paintModCatalogSummaryScan();
  try {
    const reply = await window.osfui.request<ModCatalogReply>('console.command-center.modCatalogs', {}, { timeoutMs: 0 });
    if (modCatalogScanCancelRequested) throw new Error('Scan cancelled by the user.');
    if (!reply.ok || reply.error) throw new Error(reply.error || 'The mod scan reply was not valid.');
    const discoveredCatalogs = normalizeModCatalogs(reply);
    if (discoveredCatalogs.length === 0 && (reply.loadOrderEntries ?? reply.scannedPlugins ?? 0) > 0) {
      throw new Error('The scan found a load order but returned no usable mod plugins. The existing catalog was kept.');
    }
    const scannedCatalogs: ModCatalogSummary[] = [];
    let scannedIdTotal = 0;
    let failed = 0;
    for (let index = 0; index < discoveredCatalogs.length; ++index) {
      if (modCatalogScanCancelRequested) throw new Error('Scan cancelled by the user.');
      const loaded = await requestModCatalogRecords(discoveredCatalogs[index], index, discoveredCatalogs.length, 'Scanning IDs from', true, scannedIdTotal);
      if (modCatalogScanCancelRequested) throw new Error('Scan cancelled by the user.');
      if (loaded) {
        scannedCatalogs.push(loaded);
        scannedIdTotal += loaded.entries.length;
      }
      else ++failed;
    }
    if (discoveredCatalogs.length > 0 && scannedCatalogs.length === 0) {
      throw new Error('No mod catalog replies could be loaded. The existing catalog was kept.');
    }
    setModCatalogSummaryProgress('Finishing the Mod Browser catalog.', `Mod ${discoveredCatalogs.length.toLocaleString()} / ${discoveredCatalogs.length.toLocaleString()} · ${scannedIdTotal.toLocaleString()} IDs found`);
    await paintModCatalogSummaryScan();
    if (modCatalogScanCancelRequested) throw new Error('Scan cancelled by the user.');
    modCatalogs = scannedCatalogs;
    rebuildIdCatalog();
    modCatalogs.sort((left, right) => right.entries.length - left.entries.length || left.name.localeCompare(right.name));
    modCatalogScanAllComplete = true;
    const total = modCatalogs.reduce((sum, catalog) => sum + catalog.entries.length, 0);
    const empty = modCatalogs.filter((catalog) => catalog.entries.length === 0).length;
    const elapsedMs = performance.now() - scanStartedAt;
    const details = [
      'Mod Browser scan completed.',
      `Active load-order entries: ${(reply.loadOrderEntries ?? discoveredCatalogs.length).toLocaleString()}`,
      `Mod plugins discovered: ${discoveredCatalogs.length.toLocaleString()}`,
      `Mod catalogs loaded: ${scannedCatalogs.length.toLocaleString()}`,
      `Supported IDs found: ${total.toLocaleString()}`,
      `Mods with no supported IDs: ${empty.toLocaleString()}`,
      `Mods that could not be read: ${failed.toLocaleString()}`,
      `Plugin files opened: ${(reply.pluginFilesOpened ?? discoveredCatalogs.length).toLocaleString()}`,
      `Plugin files missing: ${(reply.pluginFilesMissing ?? 0).toLocaleString()}`,
      `Elapsed: ${(elapsedMs / 1000).toFixed(1)} seconds`,
    ].join('\n');
    addActivitySummary('Mod Browser Scan', 'Mod Browser', 'Scan Mods', 'success', `Result: ${details}`);
    setStatus(`Scanned ${discoveredCatalogs.length.toLocaleString()} mods and loaded ${total.toLocaleString()} IDs for this session. ${empty.toLocaleString()} mods with no supported IDs are hidden${failed ? `; ${failed.toLocaleString()} mods could not be read` : ''}.`, failed ? 'normal' : 'success');
  } catch (error) {
    const elapsedSeconds = ((performance.now() - scanStartedAt) / 1000).toFixed(1);
    if (modCatalogScanCancelRequested) {
      modCatalogScanAllComplete = previousScanComplete;
      const message = `Mod Browser scan cancelled by the user. The existing catalog was kept.\nElapsed: ${elapsedSeconds} seconds`;
      addActivitySummary('Mod Browser Scan', 'Mod Browser', 'Scan Mods', 'success', `Result: ${message}`);
      setStatus('Mod Browser scan cancelled. The existing catalog was kept.', 'normal');
    } else {
      const message = `Mods could not be scanned: ${describe(error)}`;
      addActivitySummary('Mod Browser Scan', 'Mod Browser', 'Scan Mods', 'error', `${message}\nElapsed: ${elapsedSeconds} seconds`);
      setStatus(message, 'error');
    }
  } finally {
    finishModCatalogSummaryScan();
    modCatalogScanAllRunning = false;
    modCatalogScanCancelRequested = false;
    render();
  }
}

function ensureQuestBrowserLoaded(): Promise<void> {
  if (questBrowserLoaded) return Promise.resolve();
  if (questBrowserLoading) return questBrowserLoading;
  questBrowserLoading = import('./quest-browser')
    .then(async ({ QUEST_BROWSER_ENTRIES }) => {
      questBrowserEntries = resolvePackagedQuestCatalog(QUEST_BROWSER_ENTRIES, await readOfficialPluginLoadOrder());
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

function renderUntestedCommandGroups(commands: CommandDefinition[], compact = false): string {
  const groupOrder = [
    'Executed — Effect Unconfirmed',
    'Executed — Issues',
    'Blocked — Known Crash',
    'Engine Console Commands',
    'Script Functions',
  ];
  const groups = new Map<string, CommandDefinition[]>();
  for (const command of commands) {
    const group = command.intakeGroup ?? 'Script Functions';
    const entries = groups.get(group) ?? [];
    entries.push(command);
    groups.set(group, entries);
  }

  const content = [...groups.entries()]
    .sort(([left], [right]) => groupOrder.indexOf(left) - groupOrder.indexOf(right))
    .map(([group, entries]) => {
      const open = Boolean(untestedQuery.trim()) || openUntestedGroup === group;
      return `<section class="untested-group${open ? ' is-open' : ''}">
        <button class="untested-group-heading" type="button" data-untested-group="${escapeHtml(group)}" aria-expanded="${open}">
          <span>▶</span><strong>${escapeHtml(group)}</strong><small>${entries.length.toLocaleString()} commands</small>
        </button>
        ${open ? `<div class="untested-group-content">${entries.map((entry) => compact ? renderCommandListRow(entry) : renderCommandCard(entry)).join('')}</div>` : ''}
      </section>`;
    }).join('');

  const intro = activeView === 'commands' && commandCategory === 'Untested'
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

function commandTestedClass(command: CommandDefinition): string {
  if (!isDevModeEnabled()) return '';
  const outcome = wipCommandOutcome(command);
  if (outcome) return ` dev-tested dev-${outcome} wip-status`;
  return devFeedbackTestedClass({ kind: 'Command', name: command.title, id: command.id }, Boolean(command.testStatus && command.testStatus !== 'untested'));
}

function renderCommandListRow(command: CommandDefinition): string {
  const selected = command.id === selectedCommandId;
  const unavailable = Boolean(command.unavailableReason);
  const status = !isDevModeEnabled() ? '' : command.testStatus === 'untested'
    ? 'UNTESTED'
    : command.testStatus === 'inconclusive'
      ? 'UNCONFIRMED'
      : command.testStatus === 'failed'
        ? 'FAILED'
        : command.testStatus === 'needs-adjustment'
          ? 'ISSUE'
          : '';
  const risk = command.warning ? (command.risk === 'danger' ? 'DANGER' : 'CAUTION') : '';
  return `<button class="command-list-row${commandTestedClass(command)}${unavailable ? ' is-unavailable' : ''}" type="button" data-select-command="${escapeHtml(command.id)}" role="option" aria-selected="${selected}" aria-label="${escapeHtml(command.title)} command">
    <span class="command-list-row-title">${escapeHtml(command.title)}</span>
    <span class="command-list-row-tags">${status ? `<span>${status}</span>` : ''}${risk ? `<span class="${command.risk === 'danger' ? 'is-danger' : ''}">${risk}</span>` : ''}${unavailable ? '<span>UNAVAILABLE</span>' : ''}</span>
  </button>`;
}

function renderCommandDetail(command: CommandDefinition | undefined): string {
  if (!command) {
    return `<aside class="command-detail-panel is-empty" aria-label="Selected command">
      <p class="osf-eyebrow">SELECTED COMMAND</p>
      <h3>Select a command</h3>
      <p>Choose a command from the compact list to see its information and controls.</p>
    </aside>`;
  }
  return `<aside class="command-detail-panel" aria-label="Selected command">
    <p class="osf-eyebrow command-detail-kicker">SELECTED COMMAND</p>
    ${renderCommandCard(command, true)}
  </aside>`;
}

function renderCompactCommandLayout(commands: CommandDefinition[]): string {
  const selected = commands.find((command) => command.id === selectedCommandId);
  const favoriteId = activeView === 'favorites' ? idFavorites.find((entry) => entry.favoriteKey === selectedFavoriteIdKey && visibleIdRecord(entry, uiPreferences.advanced)) : undefined;
  if (favoriteId) idBrowserSelected = favoriteId;
  const savedFavorites = activeView === 'favorites' ? renderSavedCommandFavorites() : '';
  const idFavoriteCards = activeView === 'favorites' ? renderIdFavorites() : '';
  const list = activeView === 'commands' && commandCategory === 'Untested' && !query
    ? renderUntestedCommandGroups(commands, true)
    : `${activeView === 'recent' ? renderRecentToolbar() : ''}${savedFavorites}${idFavoriteCards}${commands.map(renderCommandListRow).join('')}`;
  return `<div class="compact-command-list" role="listbox" aria-label="${escapeHtml(viewTitle())} commands">${list}</div>${favoriteId ? `<aside class="command-detail-panel favorite-id-detail" aria-label="Selected favorite ID">${renderIdBrowserSelection()}</aside>` : renderCommandDetail(selected)}`;
}

function renderSavedCommandFavorites(): string {
  return savedCustomCommands.filter((entry) => entry.favorite).map((entry) => {
    const commandCount = parseCustomCommands(entry.commands).length;
    return `<article class="favorite-saved-command">
      <div class="favorite-saved-command-copy">
        <strong>${escapeHtml(entry.name)}</strong>
        <small>Saved command · ${commandCount} command${commandCount === 1 ? '' : 's'}</small>
      </div>
      <div class="favorite-saved-command-actions">
        <button class="favorite-button is-favorite" type="button" data-favorite-custom-toggle="${escapeHtml(entry.id)}" aria-label="Remove ${escapeHtml(entry.name)} from favorites" title="Remove from favorites">★</button>
        <button class="osf-btn osf-btn--sm" type="button" data-favorite-custom-load="${escapeHtml(entry.id)}">Load</button>
      </div>
    </article>`;
  }).join('');
}

function renderIdFavorites(): string {
  return orderIdEntries(idFavorites.filter((entry) => visibleIdRecord(entry, uiPreferences.advanced))).map((entry) => {
    const selected = entry.favoriteKey === selectedFavoriteIdKey;
    return devFeedbackRow(`<button class="command-list-row favorite-id-row${idTestedClass(entry)}${selected ? ' is-selected' : ''}" type="button" data-select-favorite-id="${escapeHtml(entry.favoriteKey)}" role="option" aria-selected="${selected}" aria-label="${escapeHtml(entry.label)} favorite ID"><span class="command-list-row-title">${escapeHtml(entry.label)}</span></button>`,{kind:'ID',name:entry.label,id:entry.value,localId:entry.localFormId,source:entry.plugin??entry.source,category:entry.category,recordType:entry.type,editorId:entry.editorId??entry.keywords?.[0]});
  }).join('');
}

function selectCommand(commandId: string, focusRow = false): void {
  const command = currentCommands().find((entry) => entry.id === commandId);
  if (!command) return;
  selectedFavoriteIdKey = null;
  if (selectedCommandId !== commandId) armedCommandActions.clear();
  selectedCommandId = commandId;
  commandList.querySelectorAll<HTMLElement>('[data-select-favorite-id]').forEach((row) => row.setAttribute('aria-selected', 'false'));
  commandList.querySelectorAll<HTMLElement>('[data-select-command]').forEach((row) => {
    row.setAttribute('aria-selected', String(row.dataset.selectCommand === commandId));
  });
  const detail = commandList.querySelector<HTMLElement>('.command-detail-panel');
  if (detail) detail.outerHTML = renderCommandDetail(command);
  if (focusRow) commandList.querySelector<HTMLElement>(`[data-select-command="${CSS.escape(commandId)}"]`)?.focus({ preventScroll: true });
}

function render(): void {
  if (!engineCommandLibraryLoaded && hasEngineCommandFeedback()) void ensureEngineCommandLibraryLoaded();
  if (!uiPreferences.advanced) {
    if (commandCategory === 'Untested' || commandCategory === 'Advanced Settings') commandCategory = CATEGORY_ORDER[0];
    if (!visibleIdCategory(idBrowserCategory, false)) { idBrowserCategory = 'all'; idBrowserSelected = null; }
    if (idBrowserSelected && !visibleIdRecord(idBrowserSelected, false)) idBrowserSelected = null;
    if (questBrowserCategory === 'Internal / System') { questBrowserCategory = QUEST_BROWSER_CATEGORY_ORDER[0]; selectedQuestKey = null; }
  }
  if (activeView === 'quest-browser' && questBrowserLoaded && !query && !questBrowserEntries.some((entry) => (questBrowserSource === 'all' || entry.source === questBrowserSource) && entry.category === questBrowserCategory && visibleQuestRecord(entry, uiPreferences.advanced))) {
    questBrowserCategory = QUEST_BROWSER_CATEGORY_ORDER.find((category) => questBrowserEntries.some((entry) => (questBrowserSource === 'all' || entry.source === questBrowserSource) && entry.category === category && visibleQuestRecord(entry, uiPreferences.advanced))) ?? QUEST_BROWSER_CATEGORY_ORDER[0];
    selectedQuestKey = null;
  }
  syncSearchClear(search, searchClear);
  renderNavigation();
  const activeModSelected = modCatalogs.some((catalog) => catalog.key === idBrowserCategory);
  const effectiveModSearchScope = activeModSelected ? modSearchScope : 'all';
  modSearchScopeControl.hidden = activeView !== 'mod-browser';
  modSearchScopeControl.querySelectorAll<HTMLButtonElement>('[data-mod-search-scope]').forEach((button) => {
    const scope = button.dataset.modSearchScope;
    const active = scope === effectiveModSearchScope;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
    button.disabled = scope === 'mod' && !activeModSelected;
  });
  const commandGridView = activeView !== 'id-browser'
    && activeView !== 'mod-browser'
    && activeView !== 'quest-browser'
    && activeView !== 'activity'
    && activeView !== 'custom'
    && activeView !== 'recent';
  commandList.classList.toggle('is-command-grid', commandGridView);
  commandList.classList.toggle('is-compact-command-layout', commandGridView || activeView === 'recent');
  commandList.classList.toggle('is-quest-browser-layout', activeView === 'quest-browser');
  const commandsPageActive = activeView === 'commands' || activeView === 'recent' || activeView === 'favorites';
  const settingsPageActive = activeView === 'commands' && commandCategory === 'Advanced Settings';
  resultCount.hidden = commandsPageActive && !settingsPageActive;
  resultCountSeparator.hidden = commandsPageActive && !settingsPageActive;
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === 'commands' ? commandsPageActive : button.dataset.view === activeView);
  });

  sectionTitle.textContent = viewTitle();
  sectionKicker.textContent = activeView === 'custom'
    ? 'ADVANCED'
    : activeView === 'activity'
      ? 'DIAGNOSTICS'
      : activeView === 'id-browser'
        ? 'ID BROWSER'
        : activeView === 'mod-browser'
          ? 'MOD BROWSER'
        : activeView === 'quest-browser'
          ? 'QUEST BROWSER'
          : query
            ? 'SEARCH'
            : 'COMMANDS';
  searchWrap.hidden = activeView === 'custom' || activeView === 'activity';
  search.placeholder = settingsPageActive ? 'Search setting name, group, or Form ID...' : activeView === 'quest-browser'
    ? 'Search quest, Editor ID, Form ID, source, or stage...'
    : activeView === 'id-browser'
      ? 'Search included IDs by name, Form ID, or type...'
    : activeView === 'mod-browser'
        ? (effectiveModSearchScope === 'all' ? 'Search every loaded mod ID...' : 'Search this mod by name, Form ID, or type...')
      : activeView === 'commands' && commandCategory === 'Untested'
        ? 'Search WIP name, command, or description...'
      : 'Search name, command, tag...';

  if (settingsPageActive) {
    commandList.classList.remove('is-compact-command-layout');
    commandList.hidden = true;
    customPanel.hidden = false;
    renderGameSettingsPanel();
    return;
  }

  if (activeView === 'id-browser') {
    commandList.classList.remove('is-compact-command-layout');
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

  if (activeView === 'mod-browser') {
    commandList.classList.remove('is-compact-command-layout');
    commandList.hidden = true;
    customPanel.hidden = false;
    renderIdBrowserPanel();
    return;
  }

  if (activeView === 'quest-browser') {
    commandList.classList.remove('is-compact-command-layout');
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
    commandList.classList.remove('is-compact-command-layout');
    commandList.hidden = true;
    customPanel.hidden = false;
    resultCount.textContent = 'Command history';
    renderActivityPanel();
    return;
  }

  if (activeView === 'custom') {
    commandList.classList.remove('is-compact-command-layout');
    commandList.hidden = true;
    customPanel.hidden = false;
    resultCount.textContent = 'Direct console execution';
    renderCustomPanel();
    return;
  }

  if (activeView === 'commands' && (commandCategory === 'Untested' || query) && !engineCommandLibraryLoaded) {
    clearForDatasetLoad();
    void ensureEngineCommandLibraryLoaded();
    return;
  }

  customPanel.hidden = true;
  commandList.hidden = false;
  const commands = activeCommands();
  const savedFavoriteCount = activeView === 'favorites' ? savedCustomCommands.filter((entry) => entry.favorite).length : 0;
  const idFavoriteCount = activeView === 'favorites' ? idFavorites.length : 0;
  if (activeView === 'favorites' && idFavorites.some((entry) => entry.favoriteKey === selectedFavoriteIdKey)) {
    selectedCommandId = null;
  } else if (!commands.some((command) => command.id === selectedCommandId)) {
    selectedCommandId = activeView === 'commands' && commandCategory === 'Untested' && !untestedQuery.trim() ? null : commands[0]?.id ?? null;
  }
  resultCount.textContent = activeView === 'commands' && commandCategory === 'Untested' && untestedQuery.trim()
    ? `${commands.length.toLocaleString()} matching WIP commands / ${categoryCount('Untested').toLocaleString()} total`
    : activeView === 'favorites'
      ? `${(commands.length + savedFavoriteCount + idFavoriteCount).toLocaleString()} favorite${commands.length + savedFavoriteCount + idFavoriteCount === 1 ? '' : 's'}`
      : `${commands.length.toLocaleString()} command${commands.length === 1 ? '' : 's'}`;

  if (commands.length === 0 && savedFavoriteCount === 0 && idFavoriteCount === 0) {
    const message = activeView === 'commands' && commandCategory === 'Untested' && untestedQuery.trim()
      ? 'No WIP commands match this search.'
      : query
      ? 'No commands match your search.'
      : activeView === 'favorites'
        ? 'No favorites yet. Mark commands, saved command batches, or browser IDs as favorites and they will appear here.'
        : activeView === 'recent'
          ? 'No commands have been executed recently.'
          : 'Nothing is available in this category.';
    const emptyState = `<div class="empty-state"><p class="osf-eyebrow">NO RESULTS</p><h3>Nothing to show</h3><p>${escapeHtml(message)}</p></div>`;
    commandList.innerHTML = activeView === 'commands' && commandCategory === 'Untested'
      ? renderUntestedCommandGroups([]) + emptyState
      : activeView === 'recent'
        ? renderRecentToolbar() + emptyState
        : emptyState;
    return;
  }

  commandList.innerHTML = renderCompactCommandLayout(commands);
  if (activeView === 'favorites' && selectedFavoriteIdKey) bindIdBrowserSelectionActions();
}

function questBrowserMatches(entry: QuestBrowserEntry): boolean {
  if (!visibleQuestRecord(entry, uiPreferences.advanced)) return false;
  if (!query) {
    if (questBrowserSource !== 'all' && entry.source !== questBrowserSource) return false;
    if (questBrowserCategory !== 'all' && entry.category !== questBrowserCategory) return false;
    return true;
  }
  const haystack = [
    entry.quest,
    entry.editorId,
    entry.questId,
    entry.source,
    entry.category,
    entry.requirement ?? '',
    ...entry.stages.map(String),
  ].flatMap(value => [value, typeof translateUiText==='function'?translateUiText(String(value??'')):value]).join(' ').toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function questBrowserVariantLabel(entry: Pick<QuestBrowserEntry, 'editorId'>): string {
  if (entry.editorId.toUpperCase() === 'MQ101') return 'ORIGINAL STORY QUEST';
  if (/^MQ401[A-J]$/i.test(entry.editorId)) return 'NEW GAME PLUS VARIANT';
  return '';
}

function questBrowserEntryKey(entry: QuestBrowserEntry): string {
  return `${entry.source}::${entry.plugin.toLowerCase()}:${entry.localFormId.toUpperCase()}`;
}

function renderQuestBrowserRow(entry: QuestBrowserEntry): string {
  const key = questBrowserEntryKey(entry);
  return `<button class="quest-browser-row${devFeedbackTestedClass({ kind: 'Quest', name: entry.quest, id: entry.questId, localId: entry.localFormId, source: entry.plugin })}${selectedQuestKey === key ? ' is-selected' : ''}" type="button" data-select-quest="${escapeHtml(key)}" role="option" aria-selected="${selectedQuestKey === key}">
    <strong title="${escapeHtml(entry.quest)}">${escapeHtml(entry.quest)}</strong>
  </button>`;
}

function renderQuestBrowserSelection(entry: (Pick<QuestBrowserEntry, 'quest' | 'editorId' | 'questId' | 'stages' | 'requirement' | 'category' | 'internal'> & { source: string; stagesScanned?: boolean; available?: boolean }) | undefined, modQuest = false): string {
  if (!entry) {
    return `<aside class="quest-browser-selection quest-browser-selection--empty" aria-label="Selected quest">
      <span class="osf-eyebrow">SELECTED QUEST</span>
      <h3>Select a quest</h3>
      <span>Choose a quest from the compact list to see its information, commands, and recorded stages.</span>
    </aside>`;
  }

  const questActionsReady = nativeBackendReady && entry.available !== false;
  const scannedStagesKnown = !modQuest || entry.stagesScanned === true;
  const progress = questProgressSnapshots.get(normalizedQuestId(entry.questId));
  const stages = entry.stages.map((stage) => {
    const command = `setstage ${entry.questId} ${stage}`;
    const isCurrent = progress?.currentStage === stage;
    const isDone = progress?.completedStages.has(stage) ?? false;
    const stateClass = isCurrent ? ' quest-stage-button--current' : isDone ? ' quest-stage-button--done' : progress ? ' quest-stage-button--unset' : '';
    const stateLabel = isCurrent ? 'CURRENT' : isDone ? 'DONE' : progress ? 'NOT SET' : 'STAGE';
    return `<button class="quest-stage-button${stateClass}" type="button" data-quest-command="${escapeHtml(command)}" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}" data-quest-stage="${stage}"${questActionsReady ? '' : ' disabled'}>
      <span>${stateLabel}</span><strong>${stage}</strong>
    </button>`;
  }).join('');

  const requirement = entry.requirement
    ? `<span class="quest-browser-requirement">${escapeHtml(entry.requirement)}</span>`
    : '';
  const internal = entry.internal
    ? '<span class="quest-browser-internal">SUPPORT / INTERNAL QUEST</span>'
    : '';
  const variantLabel = questBrowserVariantLabel(entry);
  const variant = variantLabel
    ? `<span class="quest-browser-variant">${escapeHtml(variantLabel)}</span>`
    : '';
  const flags = requirement || internal || variant
    ? `<span class="quest-browser-selection-flags">${requirement}${internal}${variant}</span>`
    : '';

  return `
    <aside class="quest-browser-selection" aria-label="Selected quest">
      <div class="quest-browser-selection-scroll">
        <span class="osf-eyebrow">SELECTED QUEST</span>
        <h3>${escapeHtml(entry.quest)}</h3>
        ${flags}
        <dl class="quest-browser-metadata">
          <div><dt>Source</dt><dd>${escapeHtml(entry.source)}</dd></div>
          ${uiPreferences.advanced ? `<div><dt>Category</dt><dd>${escapeHtml(entry.category)}</dd></div>
          <div><dt>Editor ID</dt><dd><code>${escapeHtml(entry.editorId)}</code></dd></div>
          <div><dt>Form ID</dt><dd>${entry.available === false ? 'Required plugin is not active' : `<code>${escapeHtml(entry.questId)}</code>`}</dd></div>` : ''}
          <div><dt>Stages</dt><dd>${modQuest && !scannedStagesKnown ? 'Scan again to load stages' : entry.stages.length.toLocaleString()}</dd></div>
        </dl>
        <div class="quest-browser-actions">
          ${devFeedbackButton({ kind: 'Quest', name: entry.quest, id: entry.questId, source: entry.source, category: entry.category })}
          ${activeCatalogPicker?.browser === 'quest' && entry.available !== false ? `<button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-use-quest-id="${escapeHtml(entry.questId)}" data-use-quest-title="${escapeHtml(entry.quest)}">Use This Quest</button>` : ''}
          <button class="osf-btn osf-btn--sm" type="button" data-quest-inspect="${modQuest && !scannedStagesKnown ? 'stage' : 'history'}" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${questActionsReady ? '' : ' disabled'}>Inspect Quest State</button>
          <button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-copy-text="${escapeHtml(entry.questId)}"${entry.available === false ? ' disabled' : ''}>Copy Quest ID</button>
        </div>
        <div class="quest-browser-action-note"><strong>QUEST COMMANDS</strong><span>These commands change save-game state. Start may not add a visible mission until a stage is activated. Reset removes it from the log without restarting it. Make a manual save first.</span></div>
        <div class="quest-browser-state-actions">
          <button class="osf-btn osf-btn--sm" type="button" data-quest-action="start" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${questActionsReady ? '' : ' disabled'}>Start Quest</button>
          <button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-quest-action="stop" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${questActionsReady ? '' : ' disabled'}>Stop Quest</button>
          <button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-quest-action="complete" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${questActionsReady ? '' : ' disabled'}>Complete Quest</button>
          <button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-quest-action="reset" data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${questActionsReady ? '' : ' disabled'}>Reset Quest</button>
        </div>
        ${modQuest ? `<div class="mod-quest-stage-controls">
          <label><span class="osf-eyebrow">SET QUEST STAGE</span><input class="osf-input" type="text" inputmode="numeric" pattern="[0-9]{1,5}" maxlength="5" aria-label="Quest stage number" placeholder="Known stage number" data-mod-quest-stage-input></label>
          <button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-mod-quest-set-stage data-quest-id="${escapeHtml(entry.questId)}" data-quest-title="${escapeHtml(entry.quest)}"${questActionsReady ? '' : ' disabled'}>Set Stage</button>
          <p>${scannedStagesKnown ? 'Choose a recorded stage below, or enter a known stage number.' : 'Stage data is unavailable. Scan Mods again, or enter a known stage from the mod author.'} Setting a stage can skip scripts, dialogue, rewards, or prerequisites. Save first.</p>
        </div>
        ${scannedStagesKnown ? `<div class="quest-browser-stage-label"><span class="osf-eyebrow">ALL RECORDED STAGES</span></div><div class="quest-stage-grid">${stages || '<div class="quest-browser-no-stages">No explicit stage indexes were found in this quest record.</div>'}</div>` : ''}` : `
        <div class="quest-browser-stage-label"><span class="osf-eyebrow">ALL RECORDED STAGES</span><span>Setting a stage can skip scripts, dialogue, rewards, or prerequisites. Save first.</span></div>
        <div class="quest-stage-grid">${stages || '<div class="quest-browser-no-stages">No explicit stage indexes were found in this quest record.</div>'}</div>`}
      </div>
    </aside>`;
}

function renderQuestBrowserResults(entries: QuestBrowserEntry[]): string {
  const selected = entries.find((entry) => questBrowserEntryKey(entry) === selectedQuestKey);
  return `<div class="quest-browser-workspace">
    <div class="quest-browser-list" role="listbox" aria-label="Quests">
    ${entries.map(renderQuestBrowserRow).join('')}
    </div>
    ${renderQuestBrowserSelection(selected)}
  </div>`;
}

function renderQuestBrowser(): void {
  const matches = questBrowserEntries.filter(questBrowserMatches);
  const visibleStageCount = matches.reduce((total, entry) => total + entry.stages.length, 0);
  resultCount.textContent = query
    ? `${matches.length.toLocaleString()} matching quests / ${visibleStageCount.toLocaleString()} stages`
    : `${matches.length.toLocaleString()} quests / ${visibleStageCount.toLocaleString()} stages`;

  const selectionBanner = activeCatalogPicker?.browser === 'quest'
    ? `<section class="browser-selection-banner osf-card"><div><strong>CHOOSE A QUEST</strong><span>Select a quest below to fill the original command field. No quest command will run.</span></div><button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-cancel-catalog-picker>Cancel Selection</button></section>`
    : '';

  if (matches.length === 0) {
    commandList.innerHTML = `<div class="quest-browser-panel${selectionBanner ? ' is-selecting' : ''}">${selectionBanner}<div class="empty-state"><p class="osf-eyebrow">NO QUESTS</p><h3>No matching quest</h3><p>Try a quest name, Editor ID, Form ID, source, or stage number.</p></div></div>`;
    return;
  }

  commandList.innerHTML = `<div class="quest-browser-panel${selectionBanner ? ' is-selecting' : ''}">${selectionBanner}${renderQuestBrowserResults(matches)}</div>`;
}

function selectQuest(key: string, focusRow = false): void {
  const entry = questBrowserEntries.find((candidate) => questBrowserEntryKey(candidate) === key);
  if (!entry) return;
  selectedQuestKey = key;
  commandList.querySelectorAll<HTMLElement>('[data-select-quest]').forEach((row) => {
    const selected = row.dataset.selectQuest === key;
    row.classList.toggle('is-selected', selected);
    row.setAttribute('aria-selected', String(selected));
  });
  const detail = commandList.querySelector<HTMLElement>('.quest-browser-selection');
  if (detail) detail.outerHTML = renderQuestBrowserSelection(entry);
  if (focusRow) commandList.querySelector<HTMLElement>(`[data-select-quest="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
}

function renderCommandCard(command: CommandDefinition, detailView = false): string {
  const isFavorite = favorites.includes(command.id);
  const unavailable = Boolean(command.unavailableReason);
  const canRunWithoutNative = Boolean(command.catalogSearch);
  const inputs = (command.inputs ?? []).map((input) => renderInput(command, input)).join('');
  const riskLabel = command.risk === 'danger' ? 'DANGER' : 'CAUTION';
  const selectedAction = selectedCommandAction(command);
  const displayedCommand = commandActionTemplate(command, selectedAction);
  const testTag = !isDevModeEnabled() ? '' : command.testStatus === 'untested'
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
          <button class="osf-btn execute-button command-action-toggle${selectedAction === 'primary' ? ' osf-btn--osf-accent is-active' : ' execute-button--secondary'}" type="button" data-execute="${escapeHtml(command.id)}" data-command-action="primary" aria-pressed="${selectedAction === 'primary'}"${nativeBackendReady || canRunWithoutNative ? '' : ' disabled'}>${escapeHtml(command.executeLabel ?? 'Execute')}</button>
          <button class="osf-btn execute-button command-action-toggle${selectedAction === 'secondary' ? ' osf-btn--osf-accent is-active' : ' execute-button--secondary'}" type="button" data-execute="${escapeHtml(command.id)}" data-command-action="secondary" aria-pressed="${selectedAction === 'secondary'}"${nativeBackendReady || canRunWithoutNative ? '' : ' disabled'}>${escapeHtml(command.secondaryAction.label)}</button>
        </span>`
      : `<button class="osf-btn osf-btn--osf-accent execute-button" type="button" data-execute="${escapeHtml(command.id)}"${nativeBackendReady || canRunWithoutNative ? '' : ' disabled'}>${command.catalogSearch ? 'Search IDs' : escapeHtml(command.executeLabel ?? 'Execute')}</button>`;
  const addToBatchControl = `<button class="osf-btn add-to-batch-button" type="button" data-add-to-batch="${escapeHtml(command.id)}"${unavailable ? ' disabled' : ''}>Add to Batch</button>`;

  return `
    <article class="command-card${command.secondaryAction ? ' command-card--dual-action' : ''}${detailView ? ' command-card--detail' : ''}" data-command-id="${escapeHtml(command.id)}"${detailView ? '' : ' tabindex="0"'} aria-label="${escapeHtml(command.title)} command">
      <div class="command-main">
        <div class="command-heading">
          <div class="command-heading-main">
            <h3>${escapeHtml(command.title)}</h3>
          </div>
          <span class="command-heading-tags">${testTag}${warningTag}</span>
        </div>
        ${detailView ? `<code class="command-detail-syntax">${escapeHtml(displayedCommand)}</code>` : ''}
        <p class="command-description">${escapeHtml(command.description)}</p>
        ${detailView && command.warning ? `<div class="command-detail-warning${command.risk === 'danger' ? ' is-danger' : ''}"><strong>${riskLabel}</strong><span>${escapeHtml(command.warning)}</span></div>` : ''}
        ${command.unavailableReason ? `<p class="command-unavailable-reason">${escapeHtml(command.unavailableReason)}</p>` : ''}
        ${inputs ? `<div class="command-inputs">${inputs}</div>` : ''}
      </div>
      ${detailView && command.secondaryAction ? '<p class="command-action-note">Double-click the highlighted action to execute it.</p>' : ''}
      <div class="command-actions">
        ${devFeedbackButton({ kind: 'Command', name: command.title, id: command.id, category: command.category, command: displayedCommand })}
        <button class="favorite-button${isFavorite ? ' is-favorite' : ''}" type="button" data-favorite="${escapeHtml(command.id)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <span aria-hidden="true">${isFavorite ? '★' : '☆'}</span>
        </button>
        ${addToBatchControl}
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

function selectedCommandAction(command: CommandDefinition): CommandActionChoice {
  if (!command.secondaryAction) return 'primary';
  return selectedCommandActions.get(command.id) ?? 'primary';
}

function commandActionTemplate(command: CommandDefinition, action = selectedCommandAction(command)): string {
  return action === 'secondary' && command.secondaryAction
    ? command.secondaryAction.command
    : command.command;
}

function commandActionCommand(command: CommandDefinition, action = selectedCommandAction(command)): string {
  return buildCommandTemplate(command, commandActionTemplate(command, action));
}

function commandActionDefinition(command: CommandDefinition, action = selectedCommandAction(command)): CommandDefinition {
  if (action !== 'secondary' || !command.secondaryAction) return command;
  return {
    ...command,
    title: command.secondaryAction.title,
    command: command.secondaryAction.command,
    warning: command.secondaryAction.warning,
    risk: command.secondaryAction.risk,
    secondaryAction: undefined,
  };
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
  confirmRun.textContent = 'Execute';
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
    const scannedQuest = idCatalog.find((candidate) => candidate.source === 'mod' && candidate.type === 'QUST' && normalizedQuestId(candidate.value) === questId);
    const entry = scannedQuest && Array.isArray(scannedQuest.questStages)
      ? { quest: scannedQuest.label, editorId: scannedQuest.editorId ?? 'Not provided', questId, stages: scannedQuest.questStages }
      : questBrowserEntries.find((candidate) => normalizedQuestId(candidate.questId) === questId);
    if (mode === 'history' && !entry) {
      throw new Error('Stage History needs recorded stages. Run Scan Mods again to load mod quest stages.');
    }

    if (entry && 'available' in entry && entry.available === false) throw new Error('The required quest plugin is not active.');
    const currentStage = Number(await readQuestValue(questId, 'currentStage'));
    const running = Boolean(await readQuestValue(questId, 'isRunning'));
    const completed = Boolean(await readQuestValue(questId, 'isCompleted'));
    const state = completed ? 'Completed' : running ? 'Running' : 'Stopped or not started';
    const heading = [
      `Quest: ${entry?.quest ?? title}`,
      `Editor ID: ${entry?.editorId ?? (idBrowserSelected?.value === questId ? idBrowserSelected.editorId : undefined) ?? 'Not in packaged catalog'}`,
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
    if (activeView === 'recent' || activeView === 'activity' || activeView === 'quest-browser' || activeView === 'mod-browser') {
      render();
      if (activeView === 'quest-browser' && preserveScrollTop !== undefined) {
        const questList = commandList.querySelector<HTMLElement>('.quest-browser-list');
        if (questList) questList.scrollTop = preserveScrollTop;
      }
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
  return value.split(/\r?\n/).map((line) => {
    let quoted = false, escaped = false;
    for (let i = 0; i < line.length; ++i) {
      const ch = line[i];
      if (escaped) { escaped = false; continue; }
      if (quoted && ch === '\\') { escaped = true; continue; }
      if (ch === '"') { quoted = !quoted; continue; }
      if (!quoted && (ch === '#' || ch === ';')) return line.slice(0, i).trim();
    }
    return line.trim();
  }).filter(Boolean);
}

function syncCustomCommandLineNumbers(input: HTMLTextAreaElement, gutter: HTMLElement): void {
  const numbers = gutter.firstElementChild;
  if (numbers instanceof HTMLElement) numbers.style.transform = `translateY(-${input.scrollTop}px)`;
  syncCommandHighlight(input);
}

function updateCustomCommandLineNumbers(input: HTMLTextAreaElement, gutter: HTMLElement): void {
  const lineCount = Math.max(1, input.value.split(/\r?\n/).length);
  gutter.innerHTML = `<span class="custom-command-line-number-content">${Array.from({ length: lineCount }, (_, index) => `<span class="custom-command-line-number">${index + 1}</span>`).join('')}</span>`;
  input.closest<HTMLElement>('.custom-command-editor')?.style.setProperty('--custom-gutter-width', `calc(${Math.max(2, String(lineCount).length)}ch + 16px)`);
  updateCommandHighlight(input);
  syncCustomCommandLineNumbers(input, gutter);
}

function appendCommandToBatch(command: CommandDefinition): void {
  const validationError = validateCommand(command);
  if (validationError) {
    setStatus(validationError, 'error');
    return;
  }
  const selectedAction = selectedCommandAction(command);
  const actionDefinition = commandActionDefinition(command, selectedAction);
  const builtCommand = commandActionCommand(command, selectedAction);
  if (!builtCommand || builtCommand.includes('{')) {
    setStatus('Complete the command fields before adding it to the batch.', 'error');
    return;
  }
  const currentCommands = parseCustomCommands(customCommandDraft);
  customCommandDraft += customCommandDraft && !customCommandDraft.endsWith('\n') ? `\n${builtCommand}` : builtCommand;
  setStatus(`Added ${actionDefinition.title} to the Custom Command batch (${currentCommands.length + 1} commands).`, 'success');
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
  status.dataset.kind = kind;status.setAttribute('aria-busy',String(kind==='working'));if(kind==='working')status.prepend(createLoadingRing('small'));
}


function renderActivityPanel(): void {
  const entries = activityLog.map((entry) => `
    <article class="activity-entry activity-entry--${entry.outcome}" tabindex="0">
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
          <p class="osf-eyebrow">ACTIVITY HISTORY</p>
          <p>Executed commands, captured inspection results, and Mod Browser scans.</p>
        </div>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" id="clear-activity" type="button" ${activityLog.length === 0 ? 'disabled' : ''}>Clear Log</button>
      </div>

      <div class="activity-list">
        ${entries || '<div class="empty-state activity-empty" tabindex="0"><p class="osf-eyebrow">NO ACTIVITY</p><h3>No commands logged yet</h3><p>Commands you execute will appear here, including raw custom commands and errors.</p></div>'}
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


function activeIdBrowserCategory(): IdBrowserCategory {
  if(activeView==='mod-browser'&&modBrowserSort==='category')return {label:modBrowserCategory||'All Mod Categories',value:'mod-categories',detail:'Scanned records across mods',recordType:'',builtInCategories:modBrowserCategory?[modBrowserCategory]:['*']};
  const modCatalog = modCatalogs.find((catalog) => catalog.key === idBrowserCategory);
  if (modCatalog) return { label: modCatalog.name, value: modCatalog.key, detail: modCatalog.plugin, recordType: '', builtInCategories: [] };
  if (activeView === 'mod-browser') return { label: 'Installed Mods', value: '', detail: '', recordType: '', builtInCategories: [] };
  return ID_BROWSER_CATEGORIES.find((category) => category.value === idBrowserCategory) ?? ID_BROWSER_CATEGORIES[0];
}

function idBrowserTextMatches(entry: IdCatalogEntry): boolean {
  if (!query) return true;
  const haystack = [entry.label, entry.value, entry.localFormId ?? '', entry.editorId ?? '', entry.type, entry.category, entry.sourceName ?? '', entry.plugin ?? '', entry.detail ?? '', ...(entry.alternateFormIds ?? []), ...(entry.keywords ?? [])]
    .flatMap(value => [value, typeof translateUiText==='function'?translateUiText(String(value??'')):value]).join(' ')
    .toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function matchingIds(): IdCatalogEntry[] {
  const activeCategory = activeIdBrowserCategory();
  const categories = activeCategory.builtInCategories;
  const modCatalog = modCatalogs.find((catalog) => catalog.key === idBrowserCategory);
  const pickerTypes = activeCatalogPicker?.browser === 'id' ? activeCatalogPicker.allowedTypes : [];
  const pickerCategories = activeCatalogPicker?.browser === 'id' ? activeCatalogPicker.allowedCategories : [];
  return orderIdEntries(idCatalog.filter((entry) => {
    if (!uiPreferences.advanced && entry.referenceOnly) return false;
    if (activeView !== 'mod-browser' && !visibleIdRecord(entry, uiPreferences.advanced)) return false;
    const sourceMatches = !activeCategory.sources?.length || activeCategory.sources.includes(entry.source);
    const categoryMatches = activeView==='mod-browser'&&modBrowserSort==='category' ? modCategoryMatches(entry,modBrowserCategory) : sourceMatches && (modCatalog
      ? entry.plugin === modCatalog.plugin
      : categories.includes('*')
        || categories.includes(entry.category)
        || (categories.length === 0 && activeCategory.recordType === entry.type.toUpperCase()));
    const recordTypeMatches = !idBrowserRecordTypeFilter || entry.type.toUpperCase() === idBrowserRecordTypeFilter;
    const pickerTypeMatches = pickerTypes.length === 0 || pickerTypes.includes(entry.type.toUpperCase());
    const pickerCategoryMatches = pickerCategories.length === 0 || pickerCategories.includes(entry.category);
    const searchAllMods = activeView === 'mod-browser' && query && (modSearchScope === 'all' || !modCatalog);
    const browserScopeMatches = query ? (searchAllMods || categoryMatches) : categoryMatches && recordTypeMatches;
    const sourceScopeMatches = activeView === 'mod-browser'
      ? modBrowserSort==='category'||searchAllMods ? entry.source === 'mod' : Boolean(modCatalog && entry.plugin === modCatalog.plugin)
      : entry.source !== 'mod';
    return browserScopeMatches && sourceScopeMatches && pickerTypeMatches && pickerCategoryMatches && idBrowserTextMatches(entry);
  }));
}

function idTestedClass(entry: IdCatalogEntry): string {
  return devFeedbackTestedClass({ kind: 'ID', name: entry.label, id: entry.value, localId: entry.localFormId, source: entry.plugin ?? entry.source, referenceOnly: Boolean(entry.referenceOnly || reviewedReferenceNote(entry) || ammoReferenceNote(entry) || armorReferenceNote(entry)) }, reviewedWasTested(entry) || Boolean(ammoReferenceNote(entry) || armorReferenceNote(entry)));
}

function idBrowserAction(entry: IdCatalogEntry): 'additem' | 'addperk' | 'addspell' | 'spawn' | 'forceweather' | 'teleport' | null {
  if (entry.available === false) return null;
  const type = entry.type.toUpperCase();
  if (entry.referenceOnly || reviewedReferenceNote(entry) || ammoReferenceNote(entry) || armorReferenceNote(entry)) {
    return type === 'CELL' && uiPreferences.advanced && (entry.editorId ?? entry.keywords?.[0]) ? 'teleport' : null;
  }
  if (entry.action) return entry.action;
  if (entry.category === 'Workshop / Outpost Objects' && ['FURN', 'STAT', 'MSTT', 'CONT'].includes(type)) return 'spawn';
  if (['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK'].includes(type)) return 'additem';
  if (type === 'PERK') return 'addperk';
  if (type === 'SPEL') return 'addspell';
  if (type === 'NPC_' || type === 'FURN') return 'spawn';
  if (type === 'WTHR') return 'forceweather';
  if (type === 'CELL' && (entry.editorId ?? entry.keywords?.[0])) return 'teleport';
  return null;
}

function renderIdBrowserSelection(): string {
  const entry = idBrowserSelected ? applyReviewedFindings(applyArmorFindings(applyAmmoFindings(idBrowserSelected))) : null;
  if (!entry) {
    return `<aside class="id-browser-selection id-browser-selection--empty" aria-label="Selected ID">
      <span class="osf-eyebrow">SELECTED ID</span>
      <h3>Select an item</h3>
      <span>Choose a name from the compact list to see its record information and available actions.</span>
    </aside>`;
  }
  if (entry.source === 'mod' && entry.type.toUpperCase() === 'QUST') {
    const quest = {
      quest: entry.label,
      editorId: entry.editorId ?? 'Not provided',
      questId: entry.value,
      stages: entry.questStages ?? [],
      stagesScanned: Array.isArray(entry.questStages),
      source: entry.sourceName ?? entry.plugin ?? 'Mod catalog',
      requirement: entry.questStagesError ? `Stage scan failed: ${entry.questStagesError}` : null,
      category: entry.category,
      internal: false,
    };
    const favoriteKey = idFavoriteKey(entry);
    const isFavorite = idFavorites.some((favorite) => favorite.favoriteKey === favoriteKey);
    const footer = `<div class="quest-browser-actions mod-quest-id-actions">
      ${activeCatalogPicker?.browser === 'id' ? '<button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-use-id-browser-selection>Use This ID</button>' : ''}
      <button class="favorite-button id-browser-favorite${isFavorite ? ' is-favorite' : ''}" type="button" data-id-favorite-toggle="${escapeHtml(favoriteKey)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">${isFavorite ? '★' : '☆'}</button>
      ${entry.editorId ? `<button class="osf-btn osf-btn--sm" type="button" data-copy-id-browser-id="${escapeHtml(entry.editorId)}">Copy Editor ID</button>` : ''}
    </div>`;
    return renderQuestBrowserSelection(quest, true)
      .replace('class="quest-browser-selection"', 'class="quest-browser-selection mod-quest-selection"')
      .replace(/(\s*<\/div>\s*<\/aside>)$/, footer + '$1');
  }
  const action = idBrowserAction(entry);
  const displayedCategory = entry.category === 'Cells' ? 'Cells / Teleport' : entry.category;
  const favoriteKey = idFavoriteKey(entry);
  const isFavorite = idFavorites.some((favorite) => favorite.favoriteKey === favoriteKey);
  const editorId = entry.editorId ?? (['CELL', 'LCTN'].includes(entry.type.toUpperCase()) ? entry.keywords?.[0] : undefined);
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
            : action === 'spawn'
                ? entry.category === 'Workshop / Outpost Objects' ? 'Spawn Object' : 'Spawn 1'
                : '';
  return `
    <aside class="id-browser-selection" aria-label="Selected ID">
      <div class="id-browser-selection-copy">
        <span class="osf-eyebrow">SELECTED ID</span>
        <strong>${escapeHtml(entry.label)}</strong>
        <div class="id-browser-detail-body">
        ${canPreviewModel(entry, uiPreferences.advanced) ? `<div class="inline-model-preview" data-inline-preview="${escapeHtml(entry.value)}" data-preview-label="${escapeHtml(entry.label)}" data-preview-type="${escapeHtml(entry.type.toUpperCase())}" data-preview-category="${escapeHtml(entry.category)}" aria-label="Item model preview"></div>` : ''}
        <div class="id-browser-detail-text">
        ${canInspectRecord(entry) ? `<section class="record-details" data-record-details="${escapeHtml(entry.value)}" data-record-type="${escapeHtml(entry.type.toUpperCase())}" aria-label="Description and stats" aria-live="polite"></section>` : ''}
        <dl class="id-browser-metadata">
          ${uiPreferences.advanced ? `<div><dt>Record Type</dt><dd>${escapeHtml(entry.type)}</dd></div><div><dt>Category</dt><dd>${escapeHtml(displayedCategory)}</dd></div>` : ''}
          ${entry.source === 'mod' ? `<div><dt>Mod</dt><dd>${escapeHtml(entry.sourceName ?? entry.plugin ?? 'Mod catalog')}</dd></div>` : uiPreferences.advanced && entry.source && entry.source !== 'built-in' ? `<div><dt>Source</dt><dd>${escapeHtml(entry.source)}</dd></div>` : ''}
          ${uiPreferences.advanced && entry.plugin ? `<div><dt>Plugin</dt><dd>${escapeHtml(entry.plugin)}</dd></div>` : ''}
          ${uiPreferences.advanced && entry.originalName ? `<div><dt>Original Name</dt><dd>${escapeHtml(entry.originalName)}</dd></div>` : ''}
          ${entry.detail ? `<div><dt>Information</dt><dd>${escapeHtml(entry.detail)}</dd></div>` : ''}
          ${(entry.type.toUpperCase() === 'LCTN' || (entry.type.toUpperCase() === 'CELL' && entry.referenceOnly)) ? '<div><dt>Usage</dt><dd>Reference Only</dd></div>' : ''}
          ${uiPreferences.advanced ? `<div><dt>Form ID</dt><dd>${entry.available === false ? '<span>Not loaded</span>' : `<code>${escapeHtml(entry.value)}</code>`}</dd></div>` : ''}
          ${uiPreferences.advanced && entry.alternateFormIds?.length ? `<div><dt>Alternate Form IDs</dt><dd>${entry.alternateFormIds.map(id => `<code>${escapeHtml(id)}</code>`).join('<br>')}</dd></div>` : ''}
          ${uiPreferences.advanced && entry.localFormId ? `<div><dt>Local ID</dt><dd><code>${escapeHtml(entry.localFormId)}</code></dd></div>` : ''}
          ${uiPreferences.advanced && editorId ? `<div><dt>Editor ID</dt><dd><code>${escapeHtml(editorId)}</code></dd></div>` : ''}
        </dl>
        </div>
        </div>
      </div>
      <div class="id-browser-selection-actions">

        ${activeCatalogPicker?.browser === 'id' && entry.available !== false ? `<button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-use-id-browser-selection>Use This ID</button>` : ''}
        <button class="favorite-button id-browser-favorite${isFavorite ? ' is-favorite' : ''}" type="button" data-id-favorite-toggle="${escapeHtml(favoriteKey)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">${isFavorite ? '★' : '☆'}</button>
        ${entry.available === false ? '<span class="id-browser-unavailable">Required plugin is not active. ID actions are disabled.</span>' : `<button class="osf-btn osf-btn--sm" type="button" data-copy-id-browser-id="${escapeHtml(entry.value)}">Copy ID</button>`}
        ${editorId ? `<button class="osf-btn osf-btn--sm" type="button" data-copy-id-browser-id="${escapeHtml(editorId)}">Copy Editor ID</button>` : ''}
        ${entry.type.toUpperCase() === 'BOOK' ? `<button class="osf-btn osf-btn--sm" type="button" data-read-book="${escapeHtml(entry.value)}" data-book-title="${escapeHtml(entry.label)}"${entry.available === false ? ' disabled' : ''}>Read</button>` : ''}
        ${action === 'additem'
          ? `<div class="id-browser-add-row"><label class="id-browser-quantity"><span class="osf-eyebrow">QUANTITY</span><input class="osf-input" id="id-browser-quantity" type="text" value="${idBrowserQuantity}" inputmode="numeric" autocomplete="off" aria-label="Item quantity from 1 to 999999"></label><button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-id-browser-action="additem">Add to Player</button></div>`
          : action ? `<button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-id-browser-action="${action}">${actionLabel}</button>` : ''}
      </div>
    </aside>`;
}

function renderGameSettingsPanel(): void {
  if (gameSettingsError) {
    customPanel.innerHTML = '<div class="empty-state"><h3>Game Settings could not be loaded</h3><p>' + escapeHtml(gameSettingsError) + '</p></div>';
    return;
  }
  if (!gameSettingsLoaded) {
    customPanel.innerHTML = `<div class="empty-state dataset-loading" role="status">${loadingRingHtml()}<h3>Loading Game Settings…</h3></div>`;
    if (!gameSettingsLoading) {
      gameSettingsLoading = import('./game-settings-data').then(({ GAME_SETTINGS }) => {
        gameSettings = GAME_SETTINGS;
        gameSettingsLoaded = true;
      }).catch((error) => {
        gameSettingsError = describe(error);
        setStatus(`Game Settings could not be loaded: ${describe(error)}`, 'error');
      }).finally(() => {
        gameSettingsLoading = null;
        if (activeView === 'commands' && commandCategory === 'Advanced Settings') render();
      });
    }
    return;
  }
  const matches = gameSettings.filter((entry) => gameSettingMatches(entry, query));
  resultCount.textContent = `${matches.length.toLocaleString()} / ${gameSettings.length.toLocaleString()} settings`;
  const selected = gameSettings.find((entry) => entry.name === selectedGameSetting);
  const groups = [...new Set(matches.map(gameSettingGroup))].sort((a, b) => a.localeCompare(b)).map((group) => {
    const rows = matches.filter((entry) => gameSettingGroup(entry) === group);
    if (!rows.length) return '';
    const limit = gameSettingLimits.get(group) ?? 200;
    const open = query.trim() || openGameSettingGroups.has(group);
    return `<details class="game-setting-group" data-setting-group="${escapeHtml(group)}"${open ? ' open' : ''}><summary>${escapeHtml(group)} <span class="nav-count">${rows.length.toLocaleString()}</span></summary>${open ? rows.slice(0, limit).map((entry) => `<button class="id-browser-row${devFeedbackTestedClass({ kind: 'Setting', name: entry.name })}${selected?.name === entry.name ? ' is-selected' : ''}" type="button" data-select-setting="${escapeHtml(entry.name)}" aria-pressed="${selected?.name === entry.name}">${escapeHtml(entry.name)}</button>`).join('') + (rows.length > limit ? `<button class="osf-btn osf-btn--sm" type="button" data-more-settings="${escapeHtml(group)}">Show 200 More</button>` : '') : ''}</details>`;
  }).join('');
  const value = (v: GameSettingEntry['referenceValue']) => v === null ? 'Not supplied' : escapeHtml(String(v));
  const detail = selected ? `<aside class="id-browser-selection" aria-label="Selected game setting"><div class="id-browser-selection-copy"><span class="osf-eyebrow">GAME SETTING</span><strong>${escapeHtml(selected.name)}</strong><dl class="id-browser-metadata"><div><dt>Group</dt><dd>${escapeHtml(gameSettingGroup(selected))}</dd></div><div><dt>Category</dt><dd>${escapeHtml(selected.category)}</dd></div><div><dt>Type</dt><dd>${escapeHtml(selected.type)}</dd></div><div><dt>Form ID</dt><dd>${selected.formId ? '<code>' + escapeHtml(selected.formId) + '</code>' : 'No Form ID supplied (engine setting)'}</dd></div><div><dt>Reference value</dt><dd>${value(selected.referenceValue)}</dd></div><div><dt>Master value</dt><dd>${value(selected.masterValue)}</dd></div><div><dt>Engine default</dt><dd>${value(selected.engineValue)}</dd></div></dl><p class="game-settings-reference-note">Values above are workbook references, not live readings. Mods and the current session may change them. Inspect to read the current value. Some Creation Kit settings may not be available in the running game. Reset restores a supplied base-game reference, not mod-specific or session values.</p></div><div class="id-browser-selection-actions">${devFeedbackButton({ kind: 'Setting', name: selected.name, id: selected.formId ?? undefined, category: selected.category, command: gameSettingInspectCommand(selected) })}<button class="osf-btn osf-btn--sm" type="button" data-copy-setting-name>Copy Setting Name</button><button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-inspect-setting${nativeBackendReady ? '' : ' disabled'}>Inspect Current Value</button>${selected.type !== 'String' ? `<label class="game-settings-value"><span>New Value</span><input class="osf-input" data-setting-value type="text" inputmode="decimal" autocomplete="off" aria-label="New game setting value" placeholder="Inspect the current value first"></label><button class="osf-btn osf-btn--sm" type="button" data-apply-setting${nativeBackendReady ? '' : ' disabled'}>Review Change</button>${gameSettingResetValue(selected) !== null ? `<button class="osf-btn osf-btn--sm" type="button" data-reset-setting${nativeBackendReady ? '' : ' disabled'}>Reset to Base-Game Value (${escapeHtml(String(gameSettingResetValue(selected)))})</button>` : ''}` : ''}</div></aside>` : '<aside class="id-browser-selection id-browser-selection--empty"><strong>Select a Game Setting</strong><span>Choose a name to see its reference data and inspect its current value.</span></aside>';
  customPanel.innerHTML = `<section class="id-browser-panel"><div class="id-browser-workspace"><div class="id-browser-results" id="game-settings-results">${groups || '<div class="empty-state">No matching settings.</div>'}</div>${detail}</div></section>`;
  const results = customPanel.querySelector<HTMLElement>('#game-settings-results');
  const refresh = () => {
    const top = results?.scrollTop ?? 0;
    renderGameSettingsPanel();
    const replacement = customPanel.querySelector<HTMLElement>('#game-settings-results');
    if (replacement) replacement.scrollTop = top;
  };
  results?.querySelectorAll<HTMLDetailsElement>('[data-setting-group]').forEach((details) => details.addEventListener('toggle', () => {
    const group = details.dataset.settingGroup!;
    if (query.trim() || details.open === openGameSettingGroups.has(group)) return;
    if (details.open) openGameSettingGroups.add(group); else openGameSettingGroups.delete(group);
    refresh();
  }));
  results?.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const more = target?.closest<HTMLButtonElement>('[data-more-settings]');
    if (more?.dataset.moreSettings) {
      const group = more.dataset.moreSettings;
      gameSettingLimits.set(group, (gameSettingLimits.get(group) ?? 200) + 200);
      refresh();
      return;
    }
    const row = target?.closest<HTMLButtonElement>('[data-select-setting]');
    if (!row?.dataset.selectSetting) return;
    selectedGameSetting = row.dataset.selectSetting;
    refresh();
    customPanel.querySelector<HTMLElement>(`[data-select-setting="${CSS.escape(selectedGameSetting)}"]`)?.focus({ preventScroll: true });
  });
  customPanel.querySelector('[data-copy-setting-name]')?.addEventListener('click', () => { if (selected) void copyResultId(selected.name); });
  const reviewSettingChange = (reset: boolean) => {
    if (!selected || !nativeBackendReady) return;
    try {
      const value = reset ? gameSettingResetValue(selected) : customPanel.querySelector<HTMLInputElement>('[data-setting-value]')?.value;
      if (value === null || value === undefined) return;
      const command = gameSettingWriteCommand(selected, value);
      requestExecution({command, definition: {id: 'change-setting-' + selected.name, title: (reset ? 'Reset ' : 'Change ') + selected.name, category: 'Advanced Settings', description: reset ? 'Restore the supplied base-game reference value.' : 'Change a numeric game setting.', command, verifyInGame: true, warning: 'Settings can change gameplay immediately. Record the current value first. Base-game reset values do not restore mod-specific or session overrides.', risk: 'caution', testStatus: 'untested'}, rememberRecent: false});
    } catch (error) { setStatus(describe(error), 'error'); }
  };
  customPanel.querySelector('[data-apply-setting]')?.addEventListener('click', () => reviewSettingChange(false));
  customPanel.querySelector('[data-reset-setting]')?.addEventListener('click', () => reviewSettingChange(true));
  customPanel.querySelector('[data-inspect-setting]')?.addEventListener('click', () => {
    if (!selected || !nativeBackendReady) return;
    const command = gameSettingInspectCommand(selected);
    requestExecution({ command, definition: { id: 'game-setting-' + selected.name, title: 'Inspect ' + selected.name, category: 'World', description: 'Read the current game setting value.', command, captureOutput: true, testStatus: 'untested' }, rememberRecent: false });
  });
}

function renderIdBrowserPanel(): void {
  const results = matchingIds();
  const activeMod = modCatalogs.find((catalog) => catalog.key === idBrowserCategory);
  const globalModSearch = activeView === 'mod-browser' && Boolean(query) && (modSearchScope === 'all' || !activeMod);
  const includedTotal = activeView === 'mod-browser'
    ? !activeMod || globalModSearch ? idCatalog.filter((entry) => entry.source === 'mod').length : activeMod.entries.length
    : idCatalog.filter((entry) => entry.source !== 'mod').length;
  resultCount.textContent = activeView === 'mod-browser' && modBrowserSort==='category' && !query
    ? `${results.length.toLocaleString()} shown / ${includedTotal.toLocaleString()} scanned mod IDs`
    : activeView === 'mod-browser' && !activeMod
    ? query
      ? `${results.length.toLocaleString()} matching IDs / ${includedTotal.toLocaleString()} scanned mod IDs`
      : `${modCatalogs.length.toLocaleString()} scanned mods / ${includedTotal.toLocaleString()} IDs`
    : `${results.length.toLocaleString()} shown / ${includedTotal.toLocaleString()} included IDs${idBrowserRecordTypeFilter ? ` / ${idBrowserRecordTypeFilter}` : ''}`;

  const renderResultRow = (entry: IdCatalogEntry, index: number) => devFeedbackRow(`
    <button class="id-browser-row${idTestedClass(entry)}${idBrowserSelected?.value === entry.value && idBrowserSelected?.type === entry.type && idBrowserSelected?.plugin === entry.plugin ? ' is-selected' : ''}" type="button" data-id-browser-index="${index}">
      <strong title="${escapeHtml(entry.label)}">${escapeHtml(entry.label)}</strong>
      ${entry.referenceOnly ? '<span class="id-browser-reference-tag">REFERENCE ONLY</span>' : ''}
      ${globalModSearch || (activeView==='mod-browser'&&modBrowserSort==='category') ? `<span class="id-browser-row-source">${escapeHtml(entry.sourceName ?? entry.plugin ?? 'Mod')}</span>` : ''}
    </button>`, {kind:'ID',name:entry.label,id:entry.value,localId:entry.localFormId,source:entry.plugin??entry.source,category:entry.category,recordType:entry.type,editorId:entry.editorId??entry.keywords?.[0]});
  const visibleRows = activeView === 'mod-browser' && results.length > 0 && !(modBrowserSort==='category'&&modBrowserCategory)
    ? (() => {
        const groups = new Map<string, Array<{ entry: IdCatalogEntry; index: number }>>();
        results.forEach((entry, index) => {
          const category = entry.category || entry.type || 'Other';
          const group = groups.get(category) ?? [];
          group.push({ entry, index });
          groups.set(category, group);
        });
        const categoryOrder = ['Weapons', 'Armor', 'Ammo', 'Aid', 'Resources & Miscellaneous', 'Books & Notes', 'Perks', 'Powers', 'NPCs', 'Mods', 'Factions', 'Quests', 'Cells', 'Locations', 'Ships', 'Ship Parts & Other Forms', 'Furniture', 'Weather'];
        return [...groups.entries()]
          .sort(([left], [right]) => {
            const leftIndex = categoryOrder.indexOf(left);
            const rightIndex = categoryOrder.indexOf(right);
            if (leftIndex < 0 && rightIndex < 0) return left.localeCompare(right);
            if (leftIndex < 0) return 1;
            if (rightIndex < 0) return -1;
            return leftIndex - rightIndex;
          })
          .map(([category, group]) => {
            const categoryKey = `${globalModSearch ? 'all' : activeMod?.key ?? 'mods'}:${category}`;
            const expanded = Boolean(query) || openModCategories.has(categoryKey);
            return `<details class="id-browser-category-group" data-mod-category-key="${escapeHtml(categoryKey)}"${expanded ? ' open' : ''}>
              <summary><span>${escapeHtml(category)}</span><span>${group.length.toLocaleString()} IDs</span></summary>
              <div class="id-browser-category-contents">${expanded ? group.map(({ entry, index }) => renderResultRow(entry, index)).join('') : ''}</div>
            </details>`;
          }).join('');
      })()
    : results.map(renderResultRow).join('');

  customPanel.innerHTML = `
    <section class="id-browser-panel${activeCatalogPicker?.browser === 'id' ? ' is-selecting' : ''}">
      ${activeCatalogPicker?.browser === 'id' ? `<section class="browser-selection-banner osf-card"><div><strong>CHOOSE AN ID</strong><span>Select a matching record, then choose Use This ID. No console command will run.</span></div><button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-cancel-catalog-picker>Cancel Selection</button></section>` : ''}
      <div class="id-browser-workspace">
        <div class="id-browser-results" id="id-browser-results">
          ${visibleRows || (activeView === 'mod-browser' && !activeMod
            ? query
              ? '<div class="id-picker-empty"><strong>No matching mod IDs</strong><span>Try a broader ID name, Form ID, Editor ID, record type, or plugin name.</span></div>'
              : '<div class="id-picker-empty"><strong>Search all scanned mod IDs</strong><span>Select Scan Mods for this session, then enter a search or choose a mod on the left.</span></div>'
            : '<div class="id-picker-empty"><strong>No matching IDs</strong><span>Try a broader search or another category.</span></div>')}
        </div>
        ${renderIdBrowserSelection()}
      </div>
    </section>`;

  const resultsElement = document.querySelector('#id-browser-results');
  resultsElement?.querySelectorAll<HTMLDetailsElement>('[data-mod-category-key]').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (query) return;
      const key = details.dataset.modCategoryKey;
      if (!key || details.open === openModCategories.has(key)) return;
      if (details.open) openModCategories.add(key);
      else openModCategories.delete(key);
      const scrollTop = resultsElement.scrollTop;
      render();
      requestAnimationFrame(() => {
        const replacement = document.querySelector<HTMLElement>('#id-browser-results');
        if (replacement) replacement.scrollTop = scrollTop;
        document.querySelector<HTMLElement>(`[data-mod-category-key="${CSS.escape(key)}"] > summary`)?.focus({ preventScroll: true });
      });
    });
  });
  resultsElement?.addEventListener('click', (event) => {
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

  bindIdBrowserSelectionActions();
}

function bindIdBrowserSelectionActions(): void {
  const quantityInput = document.querySelector<HTMLInputElement>('#id-browser-quantity');
  quantityInput?.addEventListener('input', () => {
    const quantity = Number(quantityInput.value);
    if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 999999) idBrowserQuantity = quantity;
  });

  document.querySelector<HTMLButtonElement>('[data-id-browser-action]')?.addEventListener('click', () => {
    if (!idBrowserSelected) return;
    const action = idBrowserAction(idBrowserSelected);
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
  document.querySelector<HTMLButtonElement>('[data-id-favorite-toggle]')?.addEventListener('click', () => {
    if (idBrowserSelected) toggleIdFavorite(idBrowserSelected);
  });
  document.querySelector<HTMLButtonElement>('[data-use-id-browser-selection]')?.addEventListener('click', () => {
    if (idBrowserSelected) finishCatalogPicker(idBrowserSelected.value, idBrowserSelected.label);
  });
  document.querySelector<HTMLButtonElement>('[data-cancel-catalog-picker]')?.addEventListener('click', () => finishCatalogPicker());
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
  } else if (action === 'forceweather') {
    command = `fw ${entry.value}`;
    title = `Change Weather to ${entry.label}`;
    description = `Immediately force the selected weather record.`;
    warning = 'Weather records are location-dependent. The selected weather may look wrong or be overridden by the current location, climate, or scripts.';
    risk = 'caution';
  } else if (action === 'teleport') {
    const cellEditorId = entry.editorId ?? entry.keywords?.[0];
    if (!cellEditorId) return;
    command = `coc ${cellEditorId}`;
    title = `Teleport to ${entry.label}`;
    description = `Teleport directly to the selected cell.`;
    warning = entry.referenceOnly || reviewedReferenceNote(entry)
      ? 'This is a reference-only or unverified cell offered for exploration. It may be empty, have no usable arrival point, or fail to teleport. Make a manual save first.'
      : 'An unsuitable cell can place you in test areas, unloaded spaces, or locations with broken progression context. Save first.';
    risk = 'danger';
  } else {
    command = `player.placeatme ${entry.value} 1`;
    title = `Spawn ${entry.label}`;
    description = `Spawn one instance of the selected base record.`;
    warning = entry.category === 'Workshop / Outpost Objects'
      ? 'Places one object at the player. Leave room for it and make a manual save first. This does not register it with an outpost, create a build-menu entry, or connect power and storage.'
      : entry.category === 'Vehicles'
      ? 'EXPERIMENTAL: PlaceAtMe can create a physical vehicle without registering ownership, deployment, storage, or normal ship linkage. It may be unusable or persist incorrectly. Test only outdoors on a disposable save.'
      : entry.type.toUpperCase() === 'GBFM'
        ? 'EXPERIMENTAL: PlaceAtMe can spawn a ship directly on the player or partly underground, leaving its boarding ramp inaccessible. Make a disposable save, enable no-clip if needed, and test only in a large open area.'
        : 'Spawning base records can create duplicate NPCs or objects and may destabilize scripted content. Use a disposable save.';
    risk = entry.category === 'Workshop / Outpost Objects' ? 'caution' : 'danger';
  }

  const definition: CommandDefinition = {
    id: `id-browser-${action}-${entry.value.toLowerCase()}`,
    title,
    category: action === 'addperk' || action === 'addspell' ? 'Skills' : action === 'spawn' ? 'Targets' : action === 'forceweather' || action === 'teleport' ? 'World' : 'Inventory',
    description,
    command,
    warning,
    risk,
    closeBeforeExecute: action === 'teleport',
    verifyInGame: action === 'teleport',
    testStatus: action === 'forceweather' || (action === 'teleport' && !entry.referenceOnly && !reviewedReferenceNote(entry)) ? 'verified' : 'untested',
  };
  requestExecution({ command, definition, rememberRecent: false });
}

let customHighlightCleanup: (() => void) | undefined;
function renderCustomPanel(): void {
  customHighlightCleanup?.();
  customHighlightCleanup = undefined;
  const savedEntries = savedCustomCommands.map((entry) => {
    const commands = parseCustomCommands(entry.commands);
    const invalid = entry.valid === false;
    const runsOnLoad = commandBatchAutoRunNames.has(entry.name.toLowerCase());
    return `
      <article class="custom-saved-entry${invalid ? ' is-invalid' : ''}">
        <div class="custom-saved-entry-copy">
          <strong>${escapeHtml(entry.name)}</strong>
          <span>${invalid ? escapeHtml(entry.error ?? 'This file cannot be used.') : `${commands.length} command${commands.length === 1 ? '' : 's'}`}</span>
        </div>
        <div class="custom-saved-entry-actions">
          <button class="osf-btn osf-btn--sm custom-auto-run-button${runsOnLoad ? ' is-active' : ''}" type="button" data-custom-auto-run="${escapeHtml(entry.id)}" aria-pressed="${runsOnLoad}" title="${runsOnLoad ? 'Remove from' : 'Add to'} automatic save-load batches"${invalid ? ' disabled' : ''}>On Load</button>
          <button class="favorite-button${entry.favorite ? ' is-favorite' : ''}" type="button" data-custom-favorite="${escapeHtml(entry.id)}" aria-label="${entry.favorite ? 'Remove' : 'Add'} ${escapeHtml(entry.name)} ${entry.favorite ? 'from' : 'to'} favorites" title="${entry.favorite ? 'Remove from' : 'Add to'} favorites">${entry.favorite ? '★' : '☆'}</button>
          <button class="osf-btn osf-btn--sm" type="button" data-custom-load="${escapeHtml(entry.id)}"${invalid ? ' disabled' : ''}>Load</button>
          <button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-custom-delete="${escapeHtml(entry.id)}">Delete</button>
        </div>
      </article>`;
  }).join('');

  customPanel.innerHTML = `
    <section class="custom-card osf-card">
      <div class="custom-workspace">
        <div class="custom-editor-pane">
          <form id="custom-form" class="custom-form">
            <div class="custom-command-field">
              <div class="custom-command-editor">
                <pre class="custom-command-line-numbers" aria-hidden="true"></pre>
                <pre class="custom-command-highlight" aria-hidden="true"><code class="custom-command-highlight-content"></code></pre>
                <textarea class="osf-input custom-command-input" id="custom-command" aria-label="Commands" rows="8" wrap="soft" autocomplete="off" spellcheck="false" placeholder="# Comments begin with # or ; and will not run&#10;# Blank lines can separate sections&#10;&#10;# Player setup&#10;tgm&#10;player.modav carryweight 100&#10;&#10;# Add 4 of an item&#10;player.additem 0000ABF9 4">${escapeHtml(customCommandDraft)}</textarea>
              </div>
            </div>
            <div class="custom-form-actions">
              <div class="custom-format-tips" aria-label="Command formatting tips">
                <strong>FORMAT TIPS</strong>
                <span>One command per line</span>
                <span><code>#</code> or <code>;</code> starts a comment</span>
                <span>Blank lines add spacing; inline comments work too</span>
                <span>No bullets, typed line numbers, or <code>&gt;</code> prompts</span>
              </div>
              <div class="custom-form-action-buttons">
                <button class="osf-btn osf-btn--ghost" type="button" data-custom-clear${customCommandDraft ? '' : ' disabled'}>Clear</button>
                <button class="osf-btn osf-btn--osf-accent" type="submit" ${nativeBackendReady ? '' : 'disabled'}>Review Commands</button>
              </div>
            </div>
          </form>
          <div class="custom-note"><strong>NOTE</strong><span>Commands run in order, and the batch stops if a command reports an error. Save before experimenting with commands you do not recognize.</span></div>
        </div>
        <aside class="custom-saved-panel" aria-label="Saved custom commands" tabindex="0">
          <div class="custom-saved-heading">
            <h4>Batch Files</h4>
            <div class="custom-saved-heading-actions">
              <span>${savedCustomCommands.length} / ${MAX_SAVED_CUSTOM_COMMANDS}</span>
              <button class="osf-btn osf-btn--sm custom-auto-run-master${commandBatchAutoRunEnabled ? ' is-active' : ''}" type="button" data-custom-auto-run-master aria-pressed="${commandBatchAutoRunEnabled}" title="Selected batches run ${commandBatchAutoRunDelaySeconds} seconds after loading an existing save">Auto-Run ${commandBatchAutoRunEnabled ? 'On' : 'Off'}</button>
              <button class="osf-btn osf-btn--sm" type="button" data-custom-refresh${commandBatchesLoading ? ' disabled' : ''}>${commandBatchesLoading ? 'Refreshing...' : 'Refresh'}</button>
              ${savedCustomCommands.length ? '<button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-custom-delete-all>Delete All</button>' : ''}
            </div>
          </div>
          <div class="custom-batch-directory"><span class="osf-eyebrow">INCLUDED FILES</span><code title="${escapeHtml(includedBatchDirectory)}">${escapeHtml(includedBatchDirectory)}</code></div>
          <div class="custom-batch-directory"><span class="osf-eyebrow">USER FOLDER</span><code title="${escapeHtml(commandBatchDirectory)}">${escapeHtml(commandBatchDirectory)}</code></div>
          <div class="custom-delete-all-confirm" data-custom-delete-all-confirm hidden>
            <strong>Delete all saved entries?</strong>
            <span>Type <b>Delete</b> to confirm. This cannot be undone.</span>
            <input class="osf-input" type="text" autocomplete="off" spellcheck="false" placeholder="Type Delete" data-custom-delete-all-input>
            <div><button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-custom-delete-all-cancel>Cancel</button><button class="osf-btn osf-btn--sm osf-btn--danger" type="button" data-custom-delete-all-commit disabled>Delete All</button></div>
          </div>
          <form id="custom-save-form" class="custom-save-form">
            <label>
              <span>Entry Name</span>
              <input class="osf-input" id="custom-command-name" type="text" maxlength="${MAX_CUSTOM_COMMAND_NAME_LENGTH}" autocomplete="off" placeholder="Example: Photo mode setup" value="${escapeHtml(customCommandDraftName)}">
            </label>
            <button class="osf-btn osf-btn--sm" type="submit"${commandBatchesLoading ? ' disabled' : ''}>Save .txt File</button>
          </form>
          <div class="custom-saved-list">
            ${savedEntries || `<div class="custom-saved-empty">${commandBatchesLoading?loadingRingHtml():''}<strong>${commandBatchesLoading ? 'Loading batch files...' : 'No batch files found'}</strong><span>${commandBatchesLoading ? 'Reading the user-owned CCC folder.' : 'Create a .txt file here or save the current batch.'}</span></div>`}
          </div>
        </aside>
      </div>
    </section>
  `;

  const form = customPanel.querySelector('#custom-form');
  const input = customPanel.querySelector('#custom-command');
  const lineNumbers = customPanel.querySelector('.custom-command-line-numbers');
  const saveForm = customPanel.querySelector('#custom-save-form');
  const nameInput = customPanel.querySelector('#custom-command-name');
  if (form instanceof HTMLFormElement && input instanceof HTMLTextAreaElement && lineNumbers instanceof HTMLElement) {
    updateCustomCommandLineNumbers(input, lineNumbers);
    const highlightResize = new ResizeObserver(() => syncCustomCommandLineNumbers(input, lineNumbers));
    highlightResize.observe(input);
    customHighlightCleanup = () => highlightResize.disconnect();
    input.addEventListener('input', () => {
      customCommandDraft = input.value;
      updateCustomCommandLineNumbers(input, lineNumbers);
    });
    input.addEventListener('scroll', () => { syncCustomCommandLineNumbers(input, lineNumbers); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const commands = parseCustomCommands(input.value);
      if (commands.length === 0) {
        setStatus('Enter at least one console command.', 'error');
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
  if (nameInput instanceof HTMLInputElement) {
    nameInput.addEventListener('input', () => { customCommandDraftName = nameInput.value; });
  }

  customPanel.querySelector<HTMLButtonElement>('[data-custom-clear]')?.addEventListener('click', () => {
    customCommandDraft = '';
    renderCustomPanel();
    customPanel.querySelector<HTMLTextAreaElement>('#custom-command')?.focus({ preventScroll: true });
    setStatus('Cleared the current Custom Command batch.', 'success');
  });

  if (saveForm instanceof HTMLFormElement && nameInput instanceof HTMLInputElement && input instanceof HTMLTextAreaElement) {
    saveForm.addEventListener('submit', async (event) => {
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
      if (!window.osfui?.request || !nativeBackendReady) {
        setStatus('ConsoleCommandCenter.dll is not connected, so the batch file cannot be saved.', 'error');
        return;
      }
      try {
        const reply = await window.osfui.request<CommandBatchMutationReply>('console.command-center.commandBatchSave', { name, content: input.value });
        if (!reply?.ok) throw new Error('Native backend did not confirm the saved file.');
        setStatus(`${existingIndex >= 0 ? 'Updated' : 'Saved'} ${name}.txt in the user Command Batches folder.`, 'success');
        customCommandDraftName = name;
        customCommandDraft = input.value;
        await refreshCommandBatches(false);
      } catch (error) {
        setStatus(`Could not save ${name}.txt: ${describe(error)}`, 'error');
        nameInput.focus();
      }
    });
  }

  customPanel.querySelector<HTMLButtonElement>('[data-custom-refresh]')?.addEventListener('click', () => {
    void refreshCommandBatches(false);
  });

  customPanel.querySelector<HTMLButtonElement>('[data-custom-auto-run-master]')?.addEventListener('click', async () => {
    if (!window.osfui?.request || !nativeBackendReady) return;
    const enabled = !commandBatchAutoRunEnabled;
    try {
      const reply = await window.osfui.request<CommandBatchAutoRunReply>('console.command-center.commandBatchAutoRunEnable', { enabled });
      if (!reply?.ok) throw new Error('Native backend did not confirm the Auto Run setting.');
      applyCommandBatchAutoRunReply(reply);
      const selectedCount = commandBatchAutoRunNames.size;
      setStatus(enabled
        ? selectedCount
          ? `Auto-Run enabled. ${selectedCount} batch file${selectedCount === 1 ? '' : 's'} will run ${commandBatchAutoRunDelaySeconds} seconds after a save loads.`
          : 'Auto-Run enabled. Select On Load beside at least one batch file.'
        : 'Auto-Run disabled. No batch files will run when a save loads.', 'success');
      renderCustomPanel();
      customPanel.querySelector<HTMLButtonElement>('[data-custom-auto-run-master]')?.focus({ preventScroll: true });
    } catch (error) {
      setStatus(`Could not update Auto-Run: ${describe(error)}`, 'error');
    }
  });

  customPanel.querySelectorAll<HTMLButtonElement>('[data-custom-auto-run]').forEach((button) => {
    button.addEventListener('click', async () => {
      const entry = savedCustomCommands.find((candidate) => candidate.id === button.dataset.customAutoRun);
      if (!entry || !window.osfui?.request || !nativeBackendReady) return;
      const enabled = !commandBatchAutoRunNames.has(entry.name.toLowerCase());
      try {
        const reply = await window.osfui.request<CommandBatchAutoRunReply>('console.command-center.commandBatchAutoRunBatch', { name: entry.name, enabled });
        if (!reply?.ok) throw new Error('Native backend did not confirm the batch Auto Run setting.');
        applyCommandBatchAutoRunReply(reply);
        setStatus(enabled
          ? `${entry.name} will run after a save loads${commandBatchAutoRunEnabled ? '.' : ' once Auto-Run is turned on.'}`
          : `${entry.name} will no longer run after a save loads.`, 'success');
        renderCustomPanel();
        customPanel.querySelector<HTMLButtonElement>(`[data-custom-auto-run="${CSS.escape(entry.id)}"]`)?.focus({ preventScroll: true });
      } catch (error) {
        setStatus(`Could not update ${entry.name}: ${describe(error)}`, 'error');
      }
    });
  });

  customPanel.querySelectorAll<HTMLButtonElement>('[data-custom-load]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = savedCustomCommands.find((candidate) => candidate.id === button.dataset.customLoad);
      if (!entry || !(input instanceof HTMLTextAreaElement) || !(nameInput instanceof HTMLInputElement)) return;
      input.value = entry.commands;
      if (lineNumbers instanceof HTMLElement) updateCustomCommandLineNumbers(input, lineNumbers);
      nameInput.value = entry.name;
      customCommandDraft = entry.commands;
      customCommandDraftName = entry.name;
      input.focus();
      setStatus(`Loaded ${entry.name}. Review the commands before running them.`, 'success');
    });
  });

  customPanel.querySelectorAll<HTMLButtonElement>('[data-custom-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = savedCustomCommands.find((candidate) => candidate.id === button.dataset.customFavorite);
      if (!entry) return;
      entry.favorite = !entry.favorite;
      if (entry.favorite) savedCustomCommandFavorites.add(entry.name.toLowerCase());
      else savedCustomCommandFavorites.delete(entry.name.toLowerCase());
      writeSavedCustomCommandFavorites();
      setStatus(`${entry.favorite ? 'Added' : 'Removed'} ${entry.name} ${entry.favorite ? 'to' : 'from'} Favorites.`, 'success');
      renderCustomPanel();
      customPanel.querySelector<HTMLButtonElement>(`[data-custom-favorite="${CSS.escape(entry.id)}"]`)?.focus({ preventScroll: true });
      renderNavigation();
    });
  });

  customPanel.querySelectorAll<HTMLButtonElement>('[data-custom-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const entry = savedCustomCommands.find((candidate) => candidate.id === button.dataset.customDelete);
      if (!entry) return;
      if (!window.osfui?.request || !nativeBackendReady) return;
      try {
        const reply = await window.osfui.request<CommandBatchMutationReply>('console.command-center.commandBatchDelete', { name: entry.name });
        if (!reply?.ok) throw new Error('Native backend did not confirm the deletion.');
        savedCustomCommandFavorites.delete(entry.name.toLowerCase());
        writeSavedCustomCommandFavorites();
        setStatus(`Deleted ${entry.name}.txt.`, 'success');
        await refreshCommandBatches(false);
      } catch (error) {
        setStatus(`Could not delete ${entry.name}.txt: ${describe(error)}`, 'error');
      }
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
  deleteAllCommit?.addEventListener('click', async () => {
    if (deleteAllInput?.value !== 'Delete') return;
    const deletedCount = savedCustomCommands.length;
    if (!window.osfui?.request || !nativeBackendReady) return;
    try {
      const reply = await window.osfui.request<CommandBatchMutationReply>('console.command-center.commandBatchDeleteAll');
      if (!reply?.ok) throw new Error('Native backend did not confirm the deletion.');
      savedCustomCommandFavorites.clear();
      writeSavedCustomCommandFavorites();
      setStatus(`Deleted all ${deletedCount} command-batch files.`, 'success');
      await refreshCommandBatches(false);
    } catch (error) {
      setStatus(`Could not delete all command-batch files: ${describe(error)}`, 'error');
    }
  });
}

function openSavedCustomCommand(entry: SavedCustomCommand): void {
  activeView = 'custom';
  query = '';
  search.value = '';
  customCommandDraftName = entry.name;
  customCommandDraft = entry.commands;
  render();
  customPanel.querySelector<HTMLTextAreaElement>('#custom-command')?.focus({ preventScroll: true });
  setStatus(`Loaded ${entry.name}. Review the commands before running them.`, 'success');
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
    questBrowserSource = 'all';
    questBrowserCategory = 'all';
    selectedQuestKey = null;
    idBrowserRecordTypeFilter = '';
    render();
    setStatus(`Showing included quest records matching “${searchText}”.`, 'success');
    return;
  }

  activeView = 'id-browser';
  idBrowserRecordTypeFilter = recordType;
  idBrowserCategory = recordType
    ? idCategoryForRecordType(recordType)
    : 'all';
  idBrowserSelected = null;
  idBrowserQuantity = 1;
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
    questBrowserSource = 'all';
    questBrowserCategory = 'all';
    selectedQuestKey = null;
    render();
    setStatus('Choose a quest to fill the command field. No quest command will run.', 'normal');
    return;
  }

  activeView = 'id-browser';
  idBrowserRecordTypeFilter = '';
  idBrowserCategory = activeCatalogPicker.allowedTypes.length === 1
    ? idCategoryForRecordType(activeCatalogPicker.allowedTypes[0])
    : 'all';
  idBrowserSelected = null;
  idBrowserQuantity = 1;
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
  idBrowserCategory = 'common';
  idBrowserRecordTypeFilter = '';
  idBrowserSelected = null;
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
  activeView = view;
  selectedCommandId = null;
  activeCatalogPicker = null;
  query = '';
  search.value = view === 'commands' && commandCategory === 'Untested' ? untestedQuery : '';
  if (view === 'id-browser') {
    idBrowserCategory = 'common';
    idBrowserRecordTypeFilter = '';
  }
  if (view === 'mod-browser') {
    idBrowserCategory = '';
    modBrowserCategory = '';
    idBrowserRecordTypeFilter = '';
    idBrowserSelected = null;
    modSearchScope = 'all';
    openModCategories.clear();
  }
  if (view === 'quest-browser') {
    questBrowserSource = 'Base Game';
    questBrowserCategory = QUEST_BROWSER_CATEGORY_ORDER[0];
    selectedQuestKey = null;
  }
  render();
  if (view === 'custom') void refreshCommandBatches(!commandBatchesLoaded);
}

modScanCancel.addEventListener('click', cancelModCatalogScan);

navigation.addEventListener('click', async (event) => {
  const sampleButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-included-batch]');
  if (sampleButton && activeView === 'custom') {
    const name = sampleButton.dataset.includedBatch;
    if (!name) return;
    const request = ++customSampleRequest, previousDraft = customCommandDraft;
    try {
      await ensureIncludedBatchFiles();
      const reply = await window.osfui!.request<{ok:boolean;entry?:{commands:string}}>('console.command-center.includedBatch', {name});
      if (!reply?.ok || typeof reply.entry?.commands !== 'string') throw new Error('Included file is missing or unreadable. Check the Included Batches folder.');
      const content = reply.entry.commands;
      const sample = SAMPLE_BATCHES.find(entry => entry.name === name) ?? SAMPLE_BATCHES.find(entry => entry.plugin && (content.includes('# CCC plugin: ' + entry.plugin) || content.includes('; CCC plugin: ' + entry.plugin)));
      const plugins = sample?.plugin ? (await readOfficialPluginLoadOrder())?.plugins : undefined;
      if (request !== customSampleRequest || activeView !== 'custom' || customCommandDraft !== previousDraft) return;
      customCommandDraft = sample ? prepareSampleCommands(sample, plugins, content) : content;
      customCommandDraftName = name;
      renderCustomPanel();
      customPanel.querySelector<HTMLTextAreaElement>('#custom-command')?.focus({ preventScroll: true });
      setStatus(`Loaded ${name}.txt. Edit or review the commands before running.`, 'success');
    } catch (error) {
      if (request === customSampleRequest) setStatus(`Could not load ${name}: ${describe(error)}`, 'error');
    }
    return;
  }
  const sortButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-mod-sort]');
  if(sortButton && activeView==='mod-browser'){
    const mode=sortButton.dataset.modSort;
    if(mode!=='mod'&&mode!=='category')return;
    modBrowserSort=mode;modBrowserCategory='';idBrowserCategory='';idBrowserRecordTypeFilter='';idBrowserSelected=null;modSearchScope='all';openModCategories.clear();
    render();document.querySelector<HTMLElement>(`[data-mod-sort="${mode}"]`)?.focus({preventScroll:true});return;
  }
  const modCategoryButton=(event.target as Element | null)?.closest<HTMLButtonElement>('[data-mod-record-category]');
  if(modCategoryButton && activeView==='mod-browser'){
    modBrowserCategory=modCategoryButton.dataset.modRecordCategory??'';idBrowserCategory='';idBrowserRecordTypeFilter='';idBrowserSelected=null;query='';search.value='';modSearchScope='all';openModCategories.clear();render();return;
  }
  const scanCatalogs = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-scan-mod-catalogs]');
  if (scanCatalogs) {
    openModCategories.clear();
    void scanModCatalogs();
    return;
  }
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-view]');
  if (button?.dataset.view) {
    switchView(button.dataset.view);
    return;
  }

  const commandButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-command-category]');
  if (commandButton?.dataset.commandCategory) {
    const selectedCategory = CATEGORY_ORDER.find((category) => category === commandButton.dataset.commandCategory);
    if (!selectedCategory) return;
    activeView = 'commands';
    commandCategory = selectedCategory as CommandCategory;
    selectedCommandId = null;
    activeCatalogPicker = null;
    query = '';
    search.value = commandCategory === 'Untested' ? untestedQuery : '';
    render();
    return;
  }

  const idButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-id-category]');
  if (idButton?.dataset.idCategory) {
    idBrowserCategory = idButton.dataset.idCategory;
    idBrowserRecordTypeFilter = '';
    idBrowserSelected = null;
    idBrowserQuantity = 1;
    if (activeView === 'mod-browser') {
      query = '';
      search.value = '';
      modSearchScope = 'mod';
      openModCategories.clear();
    }
    render();
    return;
  }

  const questButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-quest-category]');
  if (questButton) selectQuestBrowserCategory(questButton.dataset.questSource, questButton.dataset.questCategory);
});

(['commands', 'id-browser', 'mod-browser', 'quest-browser', 'activity', 'custom'] as const).forEach((view) => {
  document.querySelector<HTMLButtonElement>(`[data-view="${view}"]`)?.addEventListener('click', () => switchView(view));
});

search.addEventListener('input', () => {
  const previousQuery = query;
  query = search.value.trim();
  if (activeView === 'commands' && commandCategory === 'Untested') untestedQuery = query;
  if (activeView === 'id-browser' || activeView === 'mod-browser') {
    idBrowserSelected = null;
    idBrowserQuantity = 1;
    if (previousQuery && !query) {
      if (!activeCatalogPicker) {
        idBrowserRecordTypeFilter = '';
      }
    }
  }
  render();
});
searchClear.addEventListener('click', () => clearSearchInput(search));
modSearchScopeControl.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-mod-search-scope]');
  const scope = button?.dataset.modSearchScope;
  if (scope !== 'mod' && scope !== 'all') return;
  if (scope === 'mod' && !modCatalogs.some((catalog) => catalog.key === idBrowserCategory)) return;
  modSearchScope = scope;
  idBrowserSelected = null;
  idBrowserQuantity = 1;
  render();
});

document.addEventListener('click', (event) => {
  const input = (event.target as Element | null)?.closest<HTMLInputElement>('input.osf-input');
  if (input && !input.disabled && !input.readOnly) input.select();
});

commandList.addEventListener('click', (event) => {
  const favoriteIdRow = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-select-favorite-id]');
  if (favoriteIdRow?.dataset.selectFavoriteId) {
    const entry = idFavorites.find((candidate) => candidate.favoriteKey === favoriteIdRow.dataset.selectFavoriteId);
    if (!entry) return;
    selectedFavoriteIdKey = entry.favoriteKey;
    selectedCommandId = null;
    idBrowserSelected = entry;
    idBrowserQuantity = 1;
    const list = commandList.querySelector<HTMLElement>('.compact-command-list');
    const scrollTop = list?.scrollTop ?? 0;
    render();
    const replacement = commandList.querySelector<HTMLElement>('.compact-command-list');
    if (replacement) replacement.scrollTop = scrollTop;
    commandList.querySelector<HTMLElement>(`[data-select-favorite-id="${CSS.escape(entry.favoriteKey)}"]`)?.focus({ preventScroll: true });
    return;
  }

  const favoriteIdToggle = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-favorite-id-toggle]');
  if (favoriteIdToggle?.dataset.favoriteIdToggle) {
    const entry = idFavorites.find((candidate) => candidate.favoriteKey === favoriteIdToggle.dataset.favoriteIdToggle);
    if (!entry) return;
    idFavorites = idFavorites.filter((candidate) => candidate.favoriteKey !== entry.favoriteKey);
    writeFavoriteIds();
    render();
    setStatus(`Removed ${entry.label} from Favorites.`, 'success');
    return;
  }

  const openFavoriteId = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-open-favorite-id]');
  if (openFavoriteId?.dataset.openFavoriteId) {
    const entry = idFavorites.find((candidate) => candidate.favoriteKey === openFavoriteId.dataset.openFavoriteId);
    if (!entry) return;
    activeView = entry.savedFrom;
    selectedCommandId = null;
    query = '';
    search.value = '';
    idBrowserCategory = entry.savedFrom === 'mod-browser' && entry.plugin ? `mod:${entry.plugin.toLowerCase()}` : 'all';
    idBrowserRecordTypeFilter = '';
    idBrowserSelected = entry;
    idBrowserQuantity = 1;
    modSearchScope = entry.savedFrom === 'mod-browser' ? 'mod' : 'all';
    render();
    setStatus(`Opened favorite ID ${entry.label}: ${entry.value}`, 'success');
    return;
  }

  const favoriteCustomToggle = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-favorite-custom-toggle]');
  if (favoriteCustomToggle?.dataset.favoriteCustomToggle) {
    const entry = savedCustomCommands.find((candidate) => candidate.id === favoriteCustomToggle.dataset.favoriteCustomToggle);
    if (!entry) return;
    entry.favorite = false;
    savedCustomCommandFavorites.delete(entry.name.toLowerCase());
    writeSavedCustomCommandFavorites();
    render();
    setStatus(`Removed ${entry.name} from Favorites.`, 'success');
    return;
  }

  const favoriteCustomLoad = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-favorite-custom-load]');
  if (favoriteCustomLoad?.dataset.favoriteCustomLoad) {
    const entry = savedCustomCommands.find((candidate) => candidate.id === favoriteCustomLoad.dataset.favoriteCustomLoad);
    if (entry) openSavedCustomCommand(entry);
    return;
  }

  const commandRow = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-select-command]');
  if (commandRow?.dataset.selectCommand) {
    selectCommand(commandRow.dataset.selectCommand);
    return;
  }

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

  const pickerButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-open-id-picker]');
  if (pickerButton?.dataset.openIdPicker && pickerButton.dataset.inputKey) {
    const command = currentCommands().find((entry) => entry.id === pickerButton.dataset.openIdPicker);
    const input = command?.inputs?.find((entry) => entry.key === pickerButton.dataset.inputKey);
    if (command && input?.picker) openIdPicker(command.id, input.key, input.picker);
    return;
  }

  const catalogPickerButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-open-catalog-picker]');
  if (catalogPickerButton?.dataset.openCatalogPicker && catalogPickerButton.dataset.inputKey) {
    const command = currentCommands().find((entry) => entry.id === catalogPickerButton.dataset.openCatalogPicker);
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

  const questRow = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-select-quest]');
  if (questRow?.dataset.selectQuest) {
    selectQuest(questRow.dataset.selectQuest, true);
    return;
  }

  const useQuestButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-use-quest-id]');
  if (useQuestButton?.dataset.useQuestId) {
    finishCatalogPicker(useQuestButton.dataset.useQuestId, useQuestButton.dataset.useQuestTitle);
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
    const inspectedQuestId = questInspectButton.dataset.questId;
    resultsReturnFocus = () => [...commandList.querySelectorAll<HTMLButtonElement>('[data-quest-inspect]')]
      .find((button) => button.dataset.questId === inspectedQuestId) ?? null;
    const questListScrollTop = commandList.querySelector<HTMLElement>('.quest-browser-list')?.scrollTop;
    void inspectQuest(questInspectButton.dataset.questId, questInspectButton.dataset.questTitle, mode, undefined, questListScrollTop);
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


  const modStageButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-mod-quest-set-stage]');
  if (modStageButton?.dataset.questId && modStageButton.dataset.questTitle) {
    const input = modStageButton.closest('.mod-quest-stage-controls')?.querySelector<HTMLInputElement>('[data-mod-quest-stage-input]');
    const rawStage = input?.value.trim() ?? '';
    const stage = Number(rawStage);
    if (!/^\d{1,5}$/.test(rawStage) || !Number.isInteger(stage) || stage < 0 || stage > 65535) {
      setStatus('Enter a quest stage from 0 through 65535.', 'error');
      input?.focus();
      return;
    }
    const command = `setstage ${modStageButton.dataset.questId} ${stage}`;
    const definition: CommandDefinition = {
      id: `mod-quest-stage-${modStageButton.dataset.questId}-${stage}`,
      title: `${modStageButton.dataset.questTitle} — Stage ${stage}`,
      category: 'Quests',
      description: 'Set the selected mod quest to a known stage.',
      command,
      warning: 'SetStage can bypass dialogue, scripts, rewards, scenes, or prerequisites. A manually entered stage may not exist in this quest. Make a manual save and use a stage documented for this quest.',
      risk: 'danger',
      testStatus: 'untested',
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

  const addToBatchButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-add-to-batch]');
  if (addToBatchButton?.dataset.addToBatch) {
    const command = currentCommands().find((entry) => entry.id === addToBatchButton.dataset.addToBatch);
    if (command) appendCommandToBatch(command);
    return;
  }

  const executeButton = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-execute]');
  if (!executeButton?.dataset.execute) return;
  const command = currentCommands().find((entry) => entry.id === executeButton.dataset.execute);
  if (!command) return;
  const requestedAction: CommandActionChoice = executeButton.dataset.commandAction === 'secondary' ? 'secondary' : 'primary';
  if (command.secondaryAction && requestedAction !== selectedCommandAction(command)) {
    selectedCommandActions.set(command.id, requestedAction);
    armedCommandActions.set(command.id, requestedAction);
    selectCommand(command.id);
    requestAnimationFrame(() => {
      commandList.querySelector<HTMLButtonElement>(`[data-execute="${CSS.escape(command.id)}"][data-command-action="${requestedAction}"]`)?.focus({ preventScroll: true });
    });
    const selectedLabel = requestedAction === 'secondary' ? command.secondaryAction.label : command.executeLabel ?? 'Execute';
    setStatus(`Selected ${selectedLabel}. Select it again to review and execute it.`, 'success');
    return;
  }
  if (command.secondaryAction && armedCommandActions.get(command.id) !== requestedAction) {
    armedCommandActions.set(command.id, requestedAction);
    const selectedLabel = requestedAction === 'secondary' ? command.secondaryAction.label : command.executeLabel ?? 'Execute';
    setStatus(`${selectedLabel} is selected. Select it again to review and execute it.`, 'success');
    return;
  }
  armedCommandActions.delete(command.id);
  const validationError = validateCommand(command);
  if (validationError) {
    setStatus(validationError, 'error');
    return;
  }
  const builtCommand = buildCommand(command);
  const actionDefinition = commandActionDefinition(command, requestedAction);
  const actionCommand = command.secondaryAction ? commandActionCommand(command, requestedAction) : builtCommand;
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

commandList.addEventListener('focusin', (event) => {
  const commandRow = (event.target as Element | null)?.closest<HTMLElement>('[data-select-command]');
  if (commandRow?.dataset.selectCommand && commandRow.dataset.selectCommand !== selectedCommandId) {
    selectCommand(commandRow.dataset.selectCommand);
  }
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
  if (activeView === 'mod-browser') return 'mod-browser';
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
  const modelDialog = document.querySelector<HTMLDialogElement>('dialog.model-preview-dialog[open]');
  if (event.key === 'Escape' && modelDialog) { event.preventDefault(); event.stopPropagation(); modelDialog.close(); return; }
  const settingsDialog = document.querySelector<HTMLDialogElement>('dialog.ui-settings-dialog[open]');
  if (event.key === 'Escape' && settingsDialog) { event.preventDefault(); event.stopPropagation(); settingsDialog.close(); return; }
  const devReportDialog = document.querySelector<HTMLDialogElement>('dialog.dev-feedback-dialog[open]');
  if (event.key === 'Escape' && devReportDialog) {
    event.preventDefault();
    event.stopPropagation();
    devReportDialog.close();
    return;
  }
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
    if (!modScanOverlay.hidden) {
      cancelModCatalogScan();
    } else if (!helpBackdrop.hidden) {
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
  const activeElement = document.activeElement;
  const isEditable = activeElement instanceof HTMLInputElement
    || activeElement instanceof HTMLTextAreaElement
    || activeElement instanceof HTMLSelectElement
    || (activeElement instanceof HTMLElement && activeElement.isContentEditable);

  if (event.key === '/' && !isEditable && !document.querySelector('dialog[open]') && idPickerBackdrop.hidden && helpBackdrop.hidden && welcomeBackdrop.hidden && confirmBackdrop.hidden && activeView !== 'custom' && activeView !== 'activity' && document.activeElement !== search) {
    event.preventDefault();
    search.focus({ preventScroll: true });
    search.select();
    return;
  }



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
    void importCommandBatchAutoRunReports();
    footerNativeStatus.textContent = 'READY';
    setStatus(`${reply.backend}${reply.build ? ` ${reply.build}` : ''} connected.`, 'success');
  } catch (error) {
    nativeBackendReady = false;
    footerNativeStatus.textContent = 'NOT CONNECTED';
    setStatus(`Native backend unavailable: ${describe(error)}`, 'error');
  }

  render();
  if (activeView === 'custom' && !commandBatchesLoaded) void refreshCommandBatches(true);
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

installDevFeedback({
  identifyArea: async () => {
    if(previewReady||!nativeBackendReady||!window.osfui?.request)throw new Error('Identify Current Area requires a loaded save and the updated in-game plugin.');
    return window.osfui.request<CurrentArea>('console.command-center.identifyCurrentArea',{}, {timeoutMs:12000});
  },
  nameChanged: () => {
    idCatalog=idCatalog.map(applyReviewedFindings);
    idFavorites=idFavorites.map(applyReviewedFindings);
    if(idBrowserSelected)idBrowserSelected=applyReviewedFindings(idBrowserSelected);
  },
  version: CONSOLE_COMMAND_CENTER_VERSION,
  rerender: () => rerenderKeepingPosition(render),
  status: (message, error = false) => setStatus(message, error ? 'error' : 'success'),
  exportText: async (content) => {
    if (previewReady || !window.osfui?.request) {
      const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = `CCC-Dev-Feedback-${new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')}.txt`;
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      return `${link.download} (browser download)`;
    }
    const bridge=window.osfui;
    return exportReportText((name,payload,options)=>bridge.request(name,payload,options),content);
  },
});

installBookReader(async (name, payload) => {
  if (previewReady || !nativeBackendReady || !window.osfui?.request) throw new Error('Reading requires the in-game CCC plugin.');
  return window.osfui.request(name, payload, { timeoutMs: 30000 });
}, { available: () => !previewReady && nativeBackendReady && !!window.osfui?.request });

installRecordDetails(async (name, payload) => {
  if (previewReady || !nativeBackendReady || !window.osfui?.request) throw new Error('Live item details require the in-game plugin.');
  return window.osfui.request(name, payload, { timeoutMs: 30000 });
}, { available: () => !previewReady && nativeBackendReady && !!window.osfui?.request });

installModelPreview(async (name, payload) => {
  if (previewReady || !window.osfui?.request) throw new Error('Live model loading requires the in-game native plugin.');
  return window.osfui.request(name, payload, { timeoutMs: name.endsWith('previewChunk') ? 12000 : 120000 });
}, { quality: () => uiPreferences.previewResolution, setQuality: quality => { setPreviewResolution(quality); } });

installUiSettings({ changed: render, status: (message, error = false) => setStatus(message, error ? 'error' : 'success') });

installTranslations(async () => {
  if(!previewReady&&window.osfui?.request){
    const reply=await window.osfui.request<{ok:boolean;pack?:TranslationPack|null;packs?:Array<{file:string;pack:TranslationPack}>}>('console.command-center.translationPack',{});
    if(!reply?.ok)throw Error('Translation read failed.');
    return reply.packs?reply:reply.pack??null;
  }
  const response=await fetch('/__ccc/translations',{cache:'no-store'});
  if(!response.ok)throw Error('Translation file could not be loaded.');
  return response.json();
}, render);
