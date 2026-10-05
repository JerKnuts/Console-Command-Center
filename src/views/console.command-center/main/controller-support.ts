import type { OSFUIBridge, OSFUIGamepadButtonEvent, OSFUIGamepadStickEvent } from '../../../osfui';

type GamepadPayload = OSFUIGamepadButtonEvent | OSFUIGamepadStickEvent;

type EditableTarget = HTMLInputElement | HTMLTextAreaElement;

const BUTTON_DPAD_UP = 0x0001;
const BUTTON_DPAD_DOWN = 0x0002;
const BUTTON_DPAD_LEFT = 0x0004;
const BUTTON_DPAD_RIGHT = 0x0008;
const BUTTON_START = 0x0010;
const BUTTON_A = 0x1000;
const BUTTON_B = 0x2000;
const BUTTON_X = 0x4000;
const BUTTON_Y = 0x8000;
const BUTTON_LB = 0x0100;
const BUTTON_RB = 0x0200;
const CONTROLLER_EVENT_WINDOW_MS = 750;
const STICK_DEAD_ZONE = 0.55;
const STICK_REPEAT_MS = 180;
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
  let heldStickDirection: 'up' | 'down' | 'left' | 'right' | null = null;
  let nextStickMoveAt = 0;

  const keyboard = document.createElement('div');
  keyboard.className = 'controller-keyboard-backdrop';
  keyboard.hidden = true;
  keyboard.innerHTML = `
    <section class="controller-keyboard osf-card" role="dialog" aria-modal="true" aria-labelledby="controller-keyboard-title">
      <div class="osf-tricolor popup-stripe" aria-hidden="true"></div>
      <div class="controller-keyboard-head">
        <div><p class="osf-eyebrow">CONTROLLER TEXT ENTRY</p><h2 id="controller-keyboard-title">Enter text</h2></div>
        <button class="osf-btn osf-btn--sm osf-btn--ghost" type="button" data-controller-keyboard-cancel>Cancel</button>
      </div>
      <div class="controller-keyboard-value" data-controller-keyboard-value aria-live="polite"></div>
      <div class="controller-keyboard-grid" data-controller-keyboard-grid></div>
      <div class="controller-keyboard-actions">
        <button class="osf-btn" type="button" data-controller-keyboard-mode>Symbols</button>
        <button class="osf-btn" type="button" data-controller-keyboard-shift>Shift</button>
        <button class="osf-btn controller-keyboard-space" type="button" data-controller-key=" ">Space</button>
        <button class="osf-btn" type="button" data-controller-keyboard-newline hidden>New Line</button>
        <button class="osf-btn" type="button" data-controller-keyboard-backspace>Backspace</button>
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
      focusElement(focusableElements(keyboardActions)[0]);
      return true;
    }
    const nextKeys = nextRow ? [...nextRow.querySelectorAll<HTMLButtonElement>('[data-controller-key]')] : [];
    focusElement(nextKeys[Math.min(columnIndex, nextKeys.length - 1)]);
    return true;
  }

  function activeNavigationButton(): HTMLElement | undefined {
    return document.querySelector<HTMLElement>('#navigation .nav-button.is-active, .utility-nav-bar .nav-button.is-active')
      ?? document.querySelector<HTMLElement>('#navigation .nav-button')
      ?? undefined;
  }

  function commandAreaTarget(): HTMLElement | undefined {
    const commandList = document.querySelector<HTMLElement>('#command-list');
    const customPanel = document.querySelector<HTMLElement>('#custom-panel');
    return commandList?.querySelector<HTMLElement>('.command-card[tabindex]')
      ?? (customPanel && !customPanel.hidden ? focusableElements(customPanel)[0] : undefined)
      ?? document.querySelector<HTMLElement>('#search')
      ?? undefined;
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
        else if (direction === 'down') {
          focusElement(document.querySelector<HTMLElement>('.utility-nav-bar .nav-button') ?? undefined);
        }
        return true;
      }
      if (direction === 'right') focusElement(commandAreaTarget());
      return true;
    }

    const utilityBar = active.closest<HTMLElement>('.utility-nav-bar');
    if (utilityBar) {
      const buttons = focusableElements(utilityBar);
      const index = buttons.indexOf(active);
      if (direction === 'left' || direction === 'right') {
        focusElement(buttons[index + (direction === 'left' ? -1 : 1)]);
      } else if (direction === 'up') {
        const sidebarButtons = document.querySelectorAll<HTMLElement>('#navigation .nav-button');
        focusElement(sidebarButtons[sidebarButtons.length - 1]);
      }
      return true;
    }

    if (active.closest('.content') && direction === 'left') {
      focusElement(activeNavigationButton());
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
    const elements = focusableElements(currentScope(keyboard));
    if (document.activeElement instanceof HTMLElement && elements.includes(document.activeElement)) return;
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
    if (active instanceof HTMLElement) active.click();
  }

  function controllerBack(): void {
    if (!keyboard.hidden) {
      closeKeyboard(false);
      return;
    }
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const commandCard = active?.closest<HTMLElement>('.command-card');
    if (commandCard) {
      focusElement(active === commandCard ? activeNavigationButton() : commandCard);
      return;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
    }));
  }

  function openCommandSearch(): void {
    if (!keyboard.hidden || currentScope(keyboard) !== document) return;
    const search = document.querySelector<HTMLInputElement>('#search');
    if (!search) return;
    if (!isVisible(search)) {
      document.querySelector<HTMLButtonElement>('#navigation [data-view="recent"]')?.click();
    }
    requestAnimationFrame(() => {
      focusElement(search);
      openKeyboard(search);
    });
  }

  function stickDirection(axes: OSFUIGamepadStickEvent['axes']): 'up' | 'down' | 'left' | 'right' | null {
    const horizontal = Math.abs(axes.lx);
    const vertical = Math.abs(axes.ly);
    if (Math.max(horizontal, vertical) < STICK_DEAD_ZONE) return null;
    if (horizontal > vertical) return axes.lx < 0 ? 'left' : 'right';
    return axes.ly > 0 ? 'up' : 'down';
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
    document.body.classList.remove('controller-active');
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
      if (payload.kind === 'button' && payload.button.down) {
        if (payload.button.id === BUTTON_DPAD_UP) moveFocus('up');
        else if (payload.button.id === BUTTON_DPAD_DOWN) moveFocus('down');
        else if (payload.button.id === BUTTON_DPAD_LEFT) moveFocus('left');
        else if (payload.button.id === BUTTON_DPAD_RIGHT) moveFocus('right');
        else if (payload.button.id === BUTTON_START) openCommandSearch();
        else if (payload.button.id === BUTTON_A) activateFocusedControl();
        else if (payload.button.id === BUTTON_B) controllerBack();
        else if (!keyboard.hidden && payload.button.id === BUTTON_X) backspace();
        else if (!keyboard.hidden && payload.button.id === BUTTON_Y) insertText(' ');
        else if (!keyboard.hidden && payload.button.id === BUTTON_LB) moveCursor(-1);
        else if (!keyboard.hidden && payload.button.id === BUTTON_RB) moveCursor(1);
      } else if (payload.kind === 'stick') {
        const direction = stickDirection(payload.axes);
        const now = performance.now();
        if (!direction) {
          heldStickDirection = null;
        } else if (!heldStickDirection) {
          moveFocus(direction);
          heldStickDirection = direction;
          nextStickMoveAt = now + STICK_REPEAT_MS;
        } else if (direction === heldStickDirection && now >= nextStickMoveAt) {
          moveFocus(direction);
          nextStickMoveAt = now + STICK_REPEAT_MS;
        }
      }
      requestAnimationFrame(ensureControllerFocus);
    });
  }
}
