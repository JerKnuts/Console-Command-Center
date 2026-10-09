import type { OSFUIBridge, OSFUIGamepadButtonEvent, OSFUIGamepadStickEvent } from '../../../osfui';

type GamepadPayload = OSFUIGamepadButtonEvent | OSFUIGamepadStickEvent;

type EditableTarget = HTMLInputElement | HTMLTextAreaElement;

const BUTTON_DPAD_UP = 0x0001;
const BUTTON_DPAD_DOWN = 0x0002;
const BUTTON_DPAD_LEFT = 0x0004;
const BUTTON_DPAD_RIGHT = 0x0008;
const BUTTON_START = 0x0010;
const BUTTON_SELECT = 0x0020;
const BUTTON_A = 0x1000;
const BUTTON_B = 0x2000;
const BUTTON_X = 0x4000;
const BUTTON_Y = 0x8000;
const BUTTON_LB = 0x0100;
const BUTTON_RB = 0x0200;
const CONTROLLER_EVENT_WINDOW_MS = 750;
const STICK_DEAD_ZONE = 0.55;
const DIRECTION_REPEAT_DELAY_MS = 260;
const DIRECTION_REPEAT_MS = 85;
const B_LONG_PRESS_MS = 700;
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const ALPHA_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const SYMBOL_ROWS = [
  ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
  ['-', '_', '=', '+', '[', ']', '{', '}', '<', '>'],
  ['.', ',', ':', ';', "'", '"', '/', '?', '\\', '|'],
  ['`', '~'],
];

const NUMBER_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['-', '0', '.'],
];

const HEX_ROWS = [
  ['0', '1', '2', '3', '4', '5', '6', '7'],
  ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
];

function isVisible(element: HTMLElement): boolean {
  if (element.hidden || element.closest('[hidden], [aria-hidden="true"]')) return false;
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isEditable(element: Element | null): element is EditableTarget {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

function currentScope(keyboard: HTMLElement): ParentNode {
  if (!keyboard.hidden) return keyboard;
  const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
  if (dialog) return dialog;
  const backdrop = [...document.querySelectorAll<HTMLElement>('.help-backdrop, .welcome-backdrop, .id-picker-backdrop, .confirm-backdrop')]
    .find((element) => !element.hidden);
  return backdrop ?? document;
}

function focusableElements(scope: ParentNode): HTMLElement[] {
  return [...scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(isVisible);
}

function elementCenter(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function controllerDirectionalScore(
  current: { x: number; y: number },
  candidate: { x: number; y: number },
  direction: 'up' | 'down' | 'left' | 'right',
): number | null {
  const dx = candidate.x - current.x;
  const dy = candidate.y - current.y;
  const primary = direction === 'left' ? -dx
    : direction === 'right' ? dx
      : direction === 'up' ? -dy
        : dy;
  if (primary <= 2) return null;
  const cross = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
  return primary * 1000 + cross * 5 + (cross / primary) * 250;
}

function preferredInitialFocus(elements: HTMLElement[]): HTMLElement | undefined {
  return elements.find((element) => element.matches('[aria-current="page"], .is-active'))
    ?? elements.find((element) => element.matches('.osf-btn--osf-accent'))
    ?? elements[0];
}

function focusElement(element: HTMLElement | undefined): void {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

export function installControllerSupport(bridge?: OSFUIBridge): void {
  let controllerActive = false;
  let lastGamepadEvent = 0;
  let keyboardTarget: EditableTarget | null = null;
  let keyboardValue = '';
  let keyboardCursor = 0;
  let keyboardMode: 'alpha' | 'symbols' | 'number' | 'hex' = 'alpha';
  let keyboardShift = false;
  let heldNavigationDirection: 'up' | 'down' | 'left' | 'right' | null = null;
  let heldNavigationSource: 'dpad' | 'stick' | null = null;
  let directionRepeatDelayTimer: number | null = null;
  let directionRepeatTimer: number | null = null;
  let contentMode = false;
  let bPressStartedAt: number | null = null;
  let bLongPressTimer: number | null = null;
  let bLongPressHandled = false;
  let lastPageFocus: HTMLElement | null = null;

  const keyboard = document.createElement('div');
  keyboard.className = 'controller-keyboard-backdrop';
  keyboard.hidden = true;
  keyboard.innerHTML = `
    <section class="controller-keyboard osf-card" role="dialog" aria-modal="true" aria-labelledby="controller-keyboard-title">
      <div class="osf-tricolor popup-stripe" aria-hidden="true"></div>
      <div class="controller-keyboard-head">
        <div><p class="osf-eyebrow">CONTROLLER TEXT ENTRY</p><h2 id="controller-keyboard-title">Enter text</h2></div>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-controller-keyboard-cancel data-controller-hint="B">Cancel</button>
      </div>
      <div class="controller-keyboard-value" data-controller-keyboard-value aria-live="polite"></div>
      <div class="controller-keyboard-grid" data-controller-keyboard-grid></div>
      <div class="controller-keyboard-actions">
        <button class="osf-btn" type="button" data-controller-keyboard-mode>Symbols</button>
        <button class="osf-btn" type="button" data-controller-keyboard-shift>Shift</button>
        <button class="osf-btn controller-keyboard-space" type="button" data-controller-key=" " data-controller-hint="Y">Space</button>
        <button class="osf-btn" type="button" data-controller-keyboard-newline hidden>New Line</button>
        <button class="osf-btn" type="button" data-controller-keyboard-backspace data-controller-hint="X">Backspace</button>
        <button class="osf-btn" type="button" data-controller-keyboard-clear>Clear</button>
        <button class="osf-btn osf-btn--osf-accent" type="button" data-controller-keyboard-done>Done</button>
      </div>
      <p class="controller-keyboard-hint">A select · B cancel · X backspace · Y space · LB/RB move cursor</p>
    </section>`;
  document.body.append(keyboard);

  const title = keyboard.querySelector<HTMLElement>('#controller-keyboard-title')!;
  const valueDisplay = keyboard.querySelector<HTMLElement>('[data-controller-keyboard-value]')!;
  const grid = keyboard.querySelector<HTMLElement>('[data-controller-keyboard-grid]')!;
  const modeButton = keyboard.querySelector<HTMLButtonElement>('[data-controller-keyboard-mode]')!;
  const shiftButton = keyboard.querySelector<HTMLButtonElement>('[data-controller-keyboard-shift]')!;
  const newlineButton = keyboard.querySelector<HTMLButtonElement>('[data-controller-keyboard-newline]')!;
  const keyboardActions = keyboard.querySelector<HTMLElement>('.controller-keyboard-actions')!;

  const gamepadRecentlyActive = (): boolean => controllerActive && performance.now() - lastGamepadEvent <= CONTROLLER_EVENT_WINDOW_MS;

  function updateKeyboardValue(): void {
    const before = keyboardValue.slice(0, keyboardCursor);
    const after = keyboardValue.slice(keyboardCursor);
    valueDisplay.textContent = '';
    valueDisplay.append(document.createTextNode(before));
    const caret = document.createElement('span');
    caret.className = 'controller-keyboard-caret';
    caret.textContent = keyboardCursor < keyboardValue.length ? keyboardValue[keyboardCursor] : ' ';
    valueDisplay.append(caret, document.createTextNode(keyboardCursor < keyboardValue.length ? after.slice(1) : after));
  }

  function activeRows(): string[][] {
    if (keyboardMode === 'number') return NUMBER_ROWS;
    if (keyboardMode === 'hex') return HEX_ROWS;
    if (keyboardMode === 'symbols') return SYMBOL_ROWS;
    return ALPHA_ROWS.map((row) => row.map((key) => keyboardShift ? key.toUpperCase() : key));
  }

  function renderKeyboard(): void {
    grid.innerHTML = activeRows().map((row) => `<div class="controller-keyboard-row">${row.map((key) =>
      `<button class="controller-key" type="button" data-controller-key="${key.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}">${key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</button>`).join('')}</div>`).join('');
    modeButton.hidden = keyboardMode === 'number' || keyboardMode === 'hex';
    shiftButton.hidden = keyboardMode === 'number' || keyboardMode === 'hex' || keyboardMode === 'symbols';
    modeButton.textContent = keyboardMode === 'symbols' ? 'Letters' : 'Symbols';
    shiftButton.classList.toggle('is-active', keyboardShift);
    updateKeyboardValue();
  }

  function inputLabel(target: EditableTarget): string {
    const associatedLabel = target.id ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(target.id)}"]`) : null;
    const label = associatedLabel?.textContent?.trim() ?? target.closest('label')?.querySelector('span')?.textContent?.trim();
    return label || target.getAttribute('aria-label') || target.placeholder || 'Enter text';
  }

  function detectKeyboardMode(target: EditableTarget): typeof keyboardMode {
    if (target.dataset.valueType === 'number' || (target instanceof HTMLInputElement && target.type === 'number')) return 'number';
    if (/\[0-9A-Fa-f\]/.test(target.getAttribute('pattern') ?? '')) return 'hex';
    const identifyingText = `${target.id} ${target.placeholder} ${target.getAttribute('aria-label') ?? ''}`.toLowerCase();
    if (target instanceof HTMLInputElement && target.maxLength === 8 && /id|form|reference|hex/.test(identifyingText)) return 'hex';
    return 'alpha';
  }

  function openKeyboard(target: EditableTarget): void {
    if (target.readOnly || target.disabled) return;
    // Reassert exclusive raw input whenever focus moves into the modal keyboard.
    bridge?.send('osfui.gamepadRaw', { raw: true });
    bridge?.send('osfui.handleBack', { handle: true });
    stopDirectionalRepeat();
    keyboardTarget = target;
    keyboardValue = target.value;
    keyboardCursor = keyboardValue.length;
    keyboardMode = detectKeyboardMode(target);
    keyboardShift = false;
    newlineButton.hidden = !(target instanceof HTMLTextAreaElement);
    title.textContent = inputLabel(target);
    keyboard.hidden = false;
    renderKeyboard();
    focusElement(grid.querySelector<HTMLButtonElement>('[data-controller-key]') ?? modeButton);
  }

  function closeKeyboard(apply: boolean): void {
    const target = keyboardTarget;
    keyboard.hidden = true;
    keyboardTarget = null;
    if (!target) return;
    if (apply) {
      target.value = keyboardValue;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    }
    requestAnimationFrame(() => focusElement(target));
  }

  function insertText(text: string): void {
    if (!keyboardTarget) return;
    const maxLength = keyboardTarget.maxLength > 0 ? keyboardTarget.maxLength : Number.POSITIVE_INFINITY;
    if (keyboardValue.length + text.length > maxLength) return;
    keyboardValue = keyboardValue.slice(0, keyboardCursor) + text + keyboardValue.slice(keyboardCursor);
    keyboardCursor += text.length;
    updateKeyboardValue();
  }

  function backspace(): void {
    if (keyboardCursor <= 0) return;
    keyboardValue = keyboardValue.slice(0, keyboardCursor - 1) + keyboardValue.slice(keyboardCursor);
    keyboardCursor -= 1;
    updateKeyboardValue();
  }

  function moveCursor(delta: number): void {
    keyboardCursor = Math.max(0, Math.min(keyboardValue.length, keyboardCursor + delta));
    updateKeyboardValue();
  }

  function moveKeyboardGridFocus(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    if (keyboard.hidden || !(document.activeElement instanceof HTMLButtonElement)) return false;
    const active = document.activeElement;
    const row = active.closest<HTMLElement>('.controller-keyboard-row');
    const rows = [...grid.querySelectorAll<HTMLElement>('.controller-keyboard-row')];
    const actionRow = active.closest<HTMLElement>('.controller-keyboard-actions');
    if (actionRow) {
      const actions = focusableElements(keyboardActions);
      const index = actions.indexOf(active);
      if (direction === 'left' || direction === 'right') {
        focusElement(actions[index + (direction === 'left' ? -1 : 1)]);
      } else if (direction === 'up') {
        const lastRow = rows[rows.length - 1];
        const keys = lastRow ? [...lastRow.querySelectorAll<HTMLButtonElement>('[data-controller-key]')] : [];
        focusElement(directionalCandidate(active, keys, 'up'));
      }
      return true;
    }
    if (!row || !active.matches('[data-controller-key]')) return false;
    const rowIndex = rows.indexOf(row);
    const keys = [...row.querySelectorAll<HTMLButtonElement>('[data-controller-key]')];
    const columnIndex = keys.indexOf(active);
    if (rowIndex < 0 || columnIndex < 0) return true;

    if (direction === 'left' || direction === 'right') {
      const nextColumn = columnIndex + (direction === 'left' ? -1 : 1);
      focusElement(keys[nextColumn]);
      return true;
    }

    const nextRow = rows[rowIndex + (direction === 'up' ? -1 : 1)];
    if (!nextRow && direction === 'down') {
      focusElement(directionalCandidate(active, focusableElements(keyboardActions), 'down'));
      return true;
    }
    const nextKeys = nextRow ? [...nextRow.querySelectorAll<HTMLButtonElement>('[data-controller-key]')] : [];
    focusElement(directionalCandidate(active, nextKeys, direction));
    return true;
  }

  function firstCategoryButton(): HTMLElement | undefined {
    return document.querySelector<HTMLElement>('#navigation .navigation-categories .nav-button:not([data-scan-mod-catalogs])')
      ?? document.querySelector<HTMLElement>('#navigation [data-scan-mod-catalogs]')
      ?? undefined;
  }

  function activeNavigationButton(): HTMLElement | undefined {
    return document.querySelector<HTMLElement>('#navigation .nav-button.is-active')
      ?? document.querySelector<HTMLElement>('.utility-nav-bar .nav-button.is-active')
      ?? document.querySelector<HTMLElement>('#navigation .nav-button')
      ?? undefined;
  }

  function commandAreaTarget(): HTMLElement | undefined {
    const commandList = document.querySelector<HTMLElement>('#command-list');
    const customPanel = document.querySelector<HTMLElement>('#custom-panel');
    const commandTarget = commandList && !commandList.hidden
      ? commandList.querySelector<HTMLElement>('.command-list-row[aria-selected="true"]')
        ?? commandList.querySelector<HTMLElement>('.command-list-row')
        ?? commandList.querySelector<HTMLElement>('.quest-browser-row[aria-selected="true"]')
        ?? commandList.querySelector<HTMLElement>('.quest-browser-row')
        ?? commandList.querySelector<HTMLElement>('.command-card[tabindex]')
        ?? focusableElements(commandList)[0]
      : undefined;
    return commandTarget
      ?? (customPanel && !customPanel.hidden ? focusableElements(customPanel)[0] : undefined)
      ?? document.querySelector<HTMLElement>('#search')
      ?? undefined;
  }

  function idDetailTarget(): HTMLElement | undefined {
    return document.querySelector<HTMLElement>('.id-browser-selection input:not([disabled]), .id-browser-selection button:not([disabled])')
      ?? undefined;
  }

  function questDetailTarget(): HTMLElement | undefined {
    return document.querySelector<HTMLElement>('.quest-browser-selection .osf-btn:not([disabled]), .quest-browser-selection .quest-stage-button:not([disabled])')
      ?? undefined;
  }

  function utilityViewTarget(view: string | undefined): HTMLElement | undefined {
    if (view === 'commands' || view === 'id-browser' || view === 'mod-browser' || view === 'quest-browser') return firstCategoryButton();
    if (view === 'custom') {
      return document.querySelector<HTMLElement>('.custom-saved-list [data-custom-load], #custom-command-name, #custom-save-form button, .custom-saved-panel')
        ?? commandAreaTarget();
    }
    if (view === 'activity') {
      return document.querySelector<HTMLElement>('.activity-list .activity-entry, .activity-list .activity-empty') ?? commandAreaTarget();
    }
    return commandAreaTarget();
  }

  function directionalCandidate(
    active: HTMLElement,
    elements: HTMLElement[],
    direction: 'up' | 'down' | 'left' | 'right',
  ): HTMLElement | undefined {
    const current = elementCenter(active);
    let best: HTMLElement | undefined;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const candidate of elements) {
      if (candidate === active) continue;
      const score = controllerDirectionalScore(current, elementCenter(candidate), direction);
      if (score !== null && score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    return best;
  }

  function moveMappedRegion(active: HTMLElement, direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const customEntry = active.closest<HTMLElement>('.custom-saved-entry');
    if (customEntry) {
      if (active.matches('[data-custom-favorite]') && direction === 'right') {
        focusElement(customEntry.querySelector<HTMLElement>('[data-custom-load]') ?? undefined);
        return true;
      }
      if (active.matches('[data-custom-load]')) {
        if (direction === 'left') focusElement(customEntry.querySelector<HTMLElement>('[data-custom-favorite]') ?? undefined);
        else if (direction === 'right') focusElement(customEntry.querySelector<HTMLElement>('[data-custom-delete]') ?? undefined);
        else return false;
        return true;
      }
      if (active.matches('[data-custom-delete]') && direction === 'left') {
        focusElement(customEntry.querySelector<HTMLElement>('[data-custom-load]') ?? undefined);
        return true;
      }
    }

    const favoriteSavedCommand = active.closest<HTMLElement>('.favorite-saved-command');
    if (favoriteSavedCommand && active.matches('[data-favorite-custom-toggle]') && direction === 'right') {
      focusElement(favoriteSavedCommand.querySelector<HTMLElement>('[data-favorite-custom-load]') ?? undefined);
      return true;
    }
    if (favoriteSavedCommand && active.matches('[data-favorite-custom-load]') && direction === 'left') {
      focusElement(favoriteSavedCommand.querySelector<HTMLElement>('[data-favorite-custom-toggle]') ?? undefined);
      return true;
    }
    if (favoriteSavedCommand && active.matches('[data-favorite-id-toggle]') && direction === 'right') {
      focusElement(favoriteSavedCommand.querySelector<HTMLElement>('[data-open-favorite-id]') ?? undefined);
      return true;
    }
    if (favoriteSavedCommand && active.matches('[data-open-favorite-id]') && direction === 'left') {
      focusElement(favoriteSavedCommand.querySelector<HTMLElement>('[data-favorite-id-toggle]') ?? undefined);
      return true;
    }

    if (active.matches('#clear-activity') && direction === 'down') {
      focusElement(document.querySelector<HTMLElement>('.activity-list .activity-entry') ?? undefined);
      return true;
    }

    const favoriteButton = active.closest<HTMLElement>('.command-detail-panel .favorite-button');
    if (favoriteButton && direction === 'right') {
      focusElement(document.querySelector<HTMLElement>('.command-detail-panel .execute-button:not([disabled])') ?? undefined);
      return true;
    }

    const executeButton = active.closest<HTMLElement>('.command-detail-panel .execute-button');
    if (executeButton && direction === 'left') {
      const commandCard = executeButton.closest<HTMLElement>('.command-card');
      const target = executeButton.classList.contains('execute-button--secondary')
        ? commandCard?.querySelector<HTMLElement>('.execute-button:not(.execute-button--secondary):not([disabled])')
        : commandCard?.querySelector<HTMLElement>('.favorite-button');
      focusElement(target ?? undefined);
      return true;
    }

    const activityEntry = active.closest<HTMLElement>('.activity-entry');
    if (activityEntry && (direction === 'up' || direction === 'down')) {
      const entries = [...document.querySelectorAll<HTMLElement>('.activity-list .activity-entry')].filter(isVisible);
      const next = directionalCandidate(activityEntry, entries, direction);
      if (next) focusElement(next);
      else if (direction === 'up' && entries[0] === activityEntry) {
        focusElement(document.querySelector<HTMLElement>('#clear-activity:not([disabled])') ?? undefined);
      }
      return true;
    }

    const idDetail = active.closest<HTMLElement>('.id-browser-selection');
    if (idDetail) {
      const next = directionalCandidate(active, focusableElements(idDetail), direction);
      if (next) focusElement(next);
      return true;
    }

    const questDetail = active.closest<HTMLElement>('.quest-browser-selection');
    if (questDetail) {
      const inspect = active.closest<HTMLElement>('[data-quest-inspect]');
      const copy = active.closest<HTMLElement>('[data-copy-text]');
      const action = active.closest<HTMLElement>('[data-quest-action]');
      if (inspect) {
        if (direction === 'right') focusElement(questDetail.querySelector<HTMLElement>('[data-copy-text]') ?? undefined);
        else if (direction === 'down') focusElement(questDetail.querySelector<HTMLElement>('[data-quest-action="start"]') ?? undefined);
        return true;
      }
      if (copy) {
        if (direction === 'left') focusElement(questDetail.querySelector<HTMLElement>('[data-quest-inspect]') ?? undefined);
        else if (direction === 'down') focusElement(questDetail.querySelector<HTMLElement>('[data-quest-action="stop"]') ?? undefined);
        return true;
      }
      if (action) {
        const actionName = action.dataset.questAction;
        const actionMap: Record<string, Partial<Record<'up' | 'down' | 'left' | 'right', string>>> = {
          start: { up: '[data-quest-inspect]', right: '[data-quest-action="stop"]', down: '[data-quest-action="complete"]' },
          stop: { up: '[data-copy-text]', left: '[data-quest-action="start"]', down: '[data-quest-action="reset"]' },
          complete: { up: '[data-quest-action="start"]', right: '[data-quest-action="reset"]', down: '.quest-stage-button:not([disabled])' },
          reset: { up: '[data-quest-action="stop"]', left: '[data-quest-action="complete"]', down: '.quest-stage-button:not([disabled])' },
        };
        const selector = actionName ? actionMap[actionName]?.[direction] : undefined;
        if (selector) focusElement(questDetail.querySelector<HTMLElement>(selector) ?? undefined);
        return true;
      }
      const next = directionalCandidate(active, focusableElements(questDetail), direction);
      if (next) focusElement(next);
      return true;
    }

    const questRow = active.closest<HTMLElement>('.quest-browser-row');
    if (questRow) {
      const rows = [...document.querySelectorAll<HTMLElement>('#command-list .quest-browser-row')].filter(isVisible);
      if (direction === 'up' || direction === 'down') {
        focusElement(directionalCandidate(active, rows, direction));
      }
      return true;
    }

    const commandRow = active.closest<HTMLElement>('.command-list-row');
    if (commandRow) {
      const rows = [...document.querySelectorAll<HTMLElement>('#command-list .command-list-row')].filter(isVisible);
      if (direction === 'up' || direction === 'down') {
        focusElement(directionalCandidate(active, rows, direction));
      }
      return true;
    }

    const commandCard = active.closest<HTMLElement>('.command-card');
    if (commandCard) {
      if (active === commandCard) {
        const cards = [...document.querySelectorAll<HTMLElement>('#command-list .command-card[tabindex]')].filter(isVisible);
        focusElement(directionalCandidate(active, cards, direction));
      } else {
        focusElement(directionalCandidate(active, focusableElements(commandCard), direction));
      }
      return true;
    }

    const navigation = active.closest<HTMLElement>('#navigation');
    if (navigation) {
      const buttons = focusableElements(navigation);
      const index = buttons.indexOf(active);
      if (direction === 'up' || direction === 'down') {
        const next = buttons[index + (direction === 'up' ? -1 : 1)];
        if (next) focusElement(next);
        else if (direction === 'up') {
          focusElement(document.querySelector<HTMLElement>('.utility-nav-bar .nav-button.is-active, .utility-nav-bar .nav-button') ?? undefined);
        }
        return true;
      }
      return true;
    }

    const utilityBar = active.closest<HTMLElement>('.utility-nav-bar');
    if (utilityBar) {
      const buttons = focusableElements(utilityBar);
      const index = buttons.indexOf(active);
      if (direction === 'left' || direction === 'right') {
        focusElement(buttons[index + (direction === 'left' ? -1 : 1)]);
      } else if (direction === 'down') {
        const sidebarButtons = document.querySelectorAll<HTMLElement>('#navigation .nav-button');
        focusElement(document.querySelector<HTMLElement>('#navigation .nav-button.is-active') ?? sidebarButtons[0]);
      }
      return true;
    }

    if (contentMode && active.closest('.content')) {
      const content = active.closest<HTMLElement>('.content');
      if (content) focusElement(directionalCandidate(active, focusableElements(content), direction));
      return true;
    }
    return false;
  }

  function moveFocus(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (moveKeyboardGridFocus(direction)) return;
    const scope = currentScope(keyboard);
    let elements = focusableElements(scope);
    if (elements.length === 0) return;
    const active = document.activeElement instanceof HTMLElement && elements.includes(document.activeElement)
      ? document.activeElement
      : undefined;
    if (!active) {
      focusElement(preferredInitialFocus(elements));
      return;
    }
    if (moveMappedRegion(active, direction)) return;
    if (direction === 'up' || direction === 'down') {
      const verticalLane = active.closest<HTMLElement>('#navigation, .command-list, .utility-nav-bar');
      if (verticalLane) elements = focusableElements(verticalLane);
    }
    focusElement(directionalCandidate(active, elements, direction));
  }

  function ensureControllerFocus(): void {
    if (!controllerActive) return;
    const scope = currentScope(keyboard);
    const elements = focusableElements(scope);
    const active = document.activeElement instanceof HTMLElement && elements.includes(document.activeElement)
      ? document.activeElement
      : undefined;
    if (scope === document) {
      if (contentMode) {
        if (active?.closest('.content')) return;
        focusElement(commandAreaTarget());
      } else {
        if (active?.closest('#navigation, .utility-nav-bar')) return;
        focusElement(activeNavigationButton());
      }
      return;
    }
    if (active) return;
    focusElement(preferredInitialFocus(elements));
  }

  function activateFocusedControl(): void {
    ensureControllerFocus();
    const active = document.activeElement;
    if (isEditable(active) && keyboard.hidden) {
      openKeyboard(active);
      return;
    }
    if (active instanceof HTMLElement && active.matches('.command-card')) {
      const execute = active.querySelector<HTMLElement>('.execute-button:not([disabled])');
      focusElement(execute ?? focusableElements(active)[0]);
      return;
    }
    if (active instanceof HTMLElement && active.matches('.command-list-row')) {
      active.click();
      const execute = document.querySelector<HTMLElement>('.command-detail-panel .execute-button:not([disabled])');
      focusElement(execute ?? document.querySelector<HTMLElement>('.command-detail-panel .favorite-button') ?? undefined);
      return;
    }
    if (active instanceof HTMLElement && active.matches('.id-browser-row')) {
      active.click();
      requestAnimationFrame(() => focusElement(idDetailTarget() ?? active));
      return;
    }
    if (active instanceof HTMLElement && active.matches('.quest-browser-row')) {
      active.click();
      requestAnimationFrame(() => focusElement(questDetailTarget() ?? active));
      return;
    }
    if (active instanceof HTMLElement && active.matches('.activity-entry')) {
      focusElement(active.querySelector<HTMLElement>('[data-show-result]') ?? active);
      return;
    }
    if (active instanceof HTMLElement && active.matches('.custom-saved-panel')) {
      focusElement(active.querySelector<HTMLElement>('.custom-saved-list [data-custom-load], #custom-command-name, #custom-save-form button') ?? active);
      return;
    }
    if (active instanceof HTMLElement && active.matches('#navigation .nav-button')) {
      active.click();
      contentMode = true;
      requestAnimationFrame(() => focusElement(commandAreaTarget()));
      return;
    }
    if (active instanceof HTMLElement && active.matches('.utility-nav-bar .nav-button')) {
      active.click();
      const view = active.dataset.view;
      const categoryDriven = view === 'commands' || view === 'id-browser' || view === 'mod-browser' || view === 'quest-browser';
      contentMode = !categoryDriven;
      requestAnimationFrame(() => focusElement(utilityViewTarget(view)));
      return;
    }
    if (active instanceof HTMLElement) active.click();
  }

  function controllerBack(): void {
    if (!keyboard.hidden) {
      closeKeyboard(false);
      return;
    }
    if (currentScope(keyboard) !== document) {
      const returnTarget = lastPageFocus?.isConnected ? lastPageFocus : null;
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true,
        cancelable: true,
      }));
      if (returnTarget) requestAnimationFrame(() => focusElement(returnTarget));
      return;
    }
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const commandCard = active?.closest<HTMLElement>('.command-card');
    if (commandCard?.closest('.command-detail-panel')) {
      const selectedRow = document.querySelector<HTMLElement>('#command-list .command-list-row[aria-selected="true"]');
      if (selectedRow) {
        focusElement(selectedRow);
        return;
      }
    }
    if (commandCard && active !== commandCard) {
      focusElement(commandCard);
      return;
    }
    if (active?.closest('.quest-browser-selection')) {
      const selectedQuestRow = document.querySelector<HTMLElement>('#command-list .quest-browser-row[aria-selected="true"]');
      if (selectedQuestRow) {
        focusElement(selectedQuestRow);
        return;
      }
    }
    if (active?.closest('.id-browser-selection')) {
      const selectedIdRow = document.querySelector<HTMLElement>('#id-browser-results .id-browser-row.is-selected');
      if (selectedIdRow) {
        focusElement(selectedIdRow);
        return;
      }
    }
    const activityEntry = active?.closest<HTMLElement>('.activity-entry');
    if (activityEntry && active !== activityEntry) {
      focusElement(activityEntry);
      return;
    }
    if (contentMode) {
      contentMode = false;
      focusElement(activeNavigationButton() ?? firstCategoryButton());
      return;
    }
    closeControllerView();
  }

  function closeControllerView(): void {
    document.querySelector<HTMLButtonElement>('#close-view')?.click();
  }

  function beginControllerBackPress(): void {
    if (bPressStartedAt !== null) return;
    bPressStartedAt = performance.now();
    bLongPressHandled = false;
    bLongPressTimer = window.setTimeout(() => {
      bLongPressHandled = true;
      closeControllerView();
    }, B_LONG_PRESS_MS);
  }

  function endControllerBackPress(): void {
    if (bPressStartedAt === null) return;
    if (bLongPressTimer !== null) window.clearTimeout(bLongPressTimer);
    const wasLongPress = bLongPressHandled || performance.now() - bPressStartedAt >= B_LONG_PRESS_MS;
    bPressStartedAt = null;
    bLongPressTimer = null;
    if (wasLongPress) {
      if (!bLongPressHandled) closeControllerView();
      bLongPressHandled = false;
      return;
    }
    controllerBack();
  }

  function openCommandSearch(): void {
    if (!keyboard.hidden || currentScope(keyboard) !== document) return;
    const search = document.querySelector<HTMLInputElement>('#search');
    if (!search) return;
    if (!isVisible(search)) {
      document.querySelector<HTMLButtonElement>('#navigation [data-view="recent"]')?.click();
    }
    requestAnimationFrame(() => {
      contentMode = true;
      focusElement(search);
      openKeyboard(search);
    });
  }

  function openContextualHelp(): void {
    if (!keyboard.hidden || currentScope(keyboard) !== document) return;
    document.querySelector<HTMLButtonElement>('#open-help')?.click();
  }

  function cycleUtilityView(delta: -1 | 1): void {
    if (!keyboard.hidden || currentScope(keyboard) !== document) return;
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('.utility-nav-bar [data-view]')].filter(isVisible);
    if (buttons.length === 0) return;
    const activeIndex = buttons.findIndex((button) => button.classList.contains('is-active'));
    const nextIndex = (Math.max(0, activeIndex) + delta + buttons.length) % buttons.length;
    const nextButton = buttons[nextIndex];
    nextButton.click();
    const view = nextButton.dataset.view;
    const categoryDriven = view === 'commands' || view === 'id-browser' || view === 'mod-browser' || view === 'quest-browser';
    contentMode = !categoryDriven;
    requestAnimationFrame(() => focusElement(utilityViewTarget(view)));
  }

  function stickDirection(axes: OSFUIGamepadStickEvent['axes']): 'up' | 'down' | 'left' | 'right' | null {
    const horizontal = Math.abs(axes.lx);
    const vertical = Math.abs(axes.ly);
    if (Math.max(horizontal, vertical) < STICK_DEAD_ZONE) return null;
    if (horizontal > vertical) return axes.lx < 0 ? 'left' : 'right';
    return axes.ly > 0 ? 'up' : 'down';
  }

  function dpadDirection(buttonId: number): 'up' | 'down' | 'left' | 'right' | null {
    if (buttonId === BUTTON_DPAD_UP) return 'up';
    if (buttonId === BUTTON_DPAD_DOWN) return 'down';
    if (buttonId === BUTTON_DPAD_LEFT) return 'left';
    if (buttonId === BUTTON_DPAD_RIGHT) return 'right';
    return null;
  }

  function stopDirectionalRepeat(source?: 'dpad' | 'stick'): void {
    if (source && heldNavigationSource !== source) return;
    if (directionRepeatDelayTimer !== null) window.clearTimeout(directionRepeatDelayTimer);
    if (directionRepeatTimer !== null) window.clearInterval(directionRepeatTimer);
    directionRepeatDelayTimer = null;
    directionRepeatTimer = null;
    heldNavigationDirection = null;
    heldNavigationSource = null;
  }

  function beginDirectionalRepeat(direction: 'up' | 'down' | 'left' | 'right', source: 'dpad' | 'stick'): void {
    if (heldNavigationDirection === direction && heldNavigationSource === source) return;
    stopDirectionalRepeat();
    heldNavigationDirection = direction;
    heldNavigationSource = source;
    moveFocus(direction);
    directionRepeatDelayTimer = window.setTimeout(() => {
      directionRepeatTimer = window.setInterval(() => moveFocus(direction), DIRECTION_REPEAT_MS);
    }, DIRECTION_REPEAT_DELAY_MS);
  }

  function scrollWithRightStick(axisY: number): void {
    if (Math.abs(axisY) < 0.2) return;
    const scope = currentScope(keyboard);
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const candidates: HTMLElement[] = [];
    let ancestor = active;
    while (ancestor) {
      candidates.push(ancestor);
      ancestor = ancestor.parentElement;
    }
    candidates.push(...scope.querySelectorAll<HTMLElement>('#results-output:not([hidden]), .inventory-results:not([hidden]), .help-dialog, .quest-browser-selection-scroll, .activity-list, .custom-saved-list, .navigation-categories'));
    const target = candidates.find((element) => isVisible(element) && element.scrollHeight > element.clientHeight + 2);
    if (target) target.scrollTop += -axisY * 46;
  }

  keyboard.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const key = target?.closest<HTMLButtonElement>('[data-controller-key]')?.dataset.controllerKey;
    if (key !== undefined) insertText(key);
    else if (target?.closest('[data-controller-keyboard-backspace]')) backspace();
    else if (target?.closest('[data-controller-keyboard-newline]')) insertText('\n');
    else if (target?.closest('[data-controller-keyboard-clear]')) {
      keyboardValue = '';
      keyboardCursor = 0;
      updateKeyboardValue();
    } else if (target?.closest('[data-controller-keyboard-shift]')) {
      keyboardShift = !keyboardShift;
      renderKeyboard();
      focusElement(shiftButton);
    } else if (target?.closest('[data-controller-keyboard-mode]')) {
      keyboardMode = keyboardMode === 'symbols' ? 'alpha' : 'symbols';
      renderKeyboard();
      focusElement(modeButton);
    } else if (target?.closest('[data-controller-keyboard-done]')) closeKeyboard(true);
    else if (target?.closest('[data-controller-keyboard-cancel]')) closeKeyboard(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !keyboard.hidden) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeKeyboard(false);
      return;
    }

    const direction = event.key === 'ArrowUp' ? 'up'
      : event.key === 'ArrowDown' ? 'down'
        : event.key === 'ArrowLeft' ? 'left'
          : event.key === 'ArrowRight' ? 'right'
            : null;
    if (direction) {
      const active = document.activeElement;
      if (active instanceof HTMLSelectElement && (direction === 'up' || direction === 'down')) return;
      if (isEditable(active) && !gamepadRecentlyActive() && keyboard.hidden) return;
      event.preventDefault();
      moveFocus(direction);
      return;
    }

    if (event.key === 'Enter' && keyboard.hidden && gamepadRecentlyActive() && isEditable(document.activeElement)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openKeyboard(document.activeElement);
    }
  }, true);

  document.addEventListener('pointerdown', () => {
    controllerActive = false;
    contentMode = false;
    document.body.classList.remove('controller-active');
  }, true);

  document.addEventListener('focusin', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && !target.closest('dialog, .help-backdrop, .welcome-backdrop, .id-picker-backdrop, .confirm-backdrop, .controller-keyboard-backdrop')) {
      lastPageFocus = target;
    }
  }, true);

  const observer = new MutationObserver(() => requestAnimationFrame(ensureControllerFocus));
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open'] });

  if (bridge) {
    bridge.send('osfui.gamepadRaw', { raw: true });
    bridge.send('osfui.handleBack', { handle: true });
    bridge.on<GamepadPayload>('ui.gamepad', (payload) => {
      controllerActive = true;
      lastGamepadEvent = performance.now();
      document.body.classList.add('controller-active');
      if (payload.kind === 'button' && payload.button.id === BUTTON_B) {
        if (payload.button.down) beginControllerBackPress();
        else endControllerBackPress();
      } else if (payload.kind === 'button' && dpadDirection(payload.button.id)) {
        const direction = dpadDirection(payload.button.id)!;
        if (payload.button.down) beginDirectionalRepeat(direction, 'dpad');
        else stopDirectionalRepeat('dpad');
      } else if (payload.kind === 'button' && payload.button.down) {
        if (payload.button.id === BUTTON_START) openCommandSearch();
        else if (payload.button.id === BUTTON_SELECT) openContextualHelp();
        else if (payload.button.id === BUTTON_A) activateFocusedControl();
        else if (!keyboard.hidden && payload.button.id === BUTTON_X) backspace();
        else if (!keyboard.hidden && payload.button.id === BUTTON_Y) insertText(' ');
        else if (payload.button.id === BUTTON_LB) {
          if (!keyboard.hidden) moveCursor(-1);
          else cycleUtilityView(-1);
        }
        else if (payload.button.id === BUTTON_RB) {
          if (!keyboard.hidden) moveCursor(1);
          else cycleUtilityView(1);
        }
      } else if (payload.kind === 'stick') {
        scrollWithRightStick(payload.axes.ry);
        const direction = stickDirection(payload.axes);
        if (!direction) {
          stopDirectionalRepeat('stick');
        } else beginDirectionalRepeat(direction, 'stick');
      }
      requestAnimationFrame(ensureControllerFocus);
    });
  }
}
