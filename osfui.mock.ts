import type { JsonObject, JsonValue, OSFUIBridge } from './src/osfui';
import type { MockContext, ToolSpec } from '@osfui/cli';

type Listener = (payload: JsonValue) => void;

const PAD_BUTTONS: Record<string, number> = {
  'pad-up': 0x0001,
  'pad-down': 0x0002,
  'pad-left': 0x0004,
  'pad-right': 0x0008,
  'pad-a': 0x1000,
  'pad-b': 0x2000,
  'pad-x': 0x4000,
  'pad-y': 0x8000,
  'pad-lb': 0x0100,
  'pad-rb': 0x0200,
};

const PAD_KEYS: Record<string, string> = {
  'pad-up': 'ArrowUp',
  'pad-down': 'ArrowDown',
  'pad-left': 'ArrowLeft',
  'pad-right': 'ArrowRight',
  'pad-a': 'Enter',
  'pad-b': 'Escape',
};

function inventoryFixture(): string {
  return ['CCC_INVENTORY_V1', 'TYPE\tID\tCOUNT\tNAME',
    ...Array.from({ length: 40 }, (_, index) => `WEAP\t${(0x4716c + index).toString(16).padStart(8, '0').toUpperCase()}\t${index + 1}\tBrowser Test Item ${index + 1}`),
    'SUMMARY\t40'].join('\n');
}

export function install(ctx: MockContext): void {
  const listeners = new Map<string, Set<Listener>>();
  let failRequests = false;
  let gamepadRaw = false;

  const emit = (name: string, payload: JsonValue): void => {
    for (const listener of listeners.get(name) ?? []) listener(payload);
  };

  const tools: ToolSpec[] = [
    { id: 'fail-requests', kind: 'toggle', label: 'Fail Requests', value: false },
    ...Object.keys(PAD_BUTTONS).map((id) => ({
      id,
      kind: 'button' as const,
      label: id.replace('pad-', '').toUpperCase(),
      title: `Simulate controller ${id.replace('pad-', '').toUpperCase()}`,
    })),
    { id: 'scroll-up', kind: 'button', label: 'SCROLL ▲' },
    { id: 'scroll-down', kind: 'button', label: 'SCROLL ▼' },
  ];

  const dispatchPad = (id: string): void => {
    const buttonId = PAD_BUTTONS[id];
    emit('ui.gamepad', { kind: 'button', button: { id: buttonId, down: true } });
    const activate = (): void => {
      const key = PAD_KEYS[id];
      if (key && !gamepadRaw) {
        const target = document.activeElement instanceof HTMLElement ? document.activeElement : document.body;
        if (id === 'pad-a' && !(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
          target.click();
        } else {
          target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
          target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
        }
      }
      emit('ui.gamepad', { kind: 'button', button: { id: buttonId, down: false } });
    };
    if (id === 'pad-a') requestAnimationFrame(activate);
    else activate();
  };

  ctx.registerTools(tools, (id, value) => {
    if (id === 'fail-requests') {
      failRequests = value === true;
      return;
    }
    if (id === 'scroll-up' || id === 'scroll-down') {
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : document.body;
      const scroller = active.closest<HTMLElement>('.content, .command-list, .utility-panel, [class$="-results"]')
        ?? document.scrollingElement;
      scroller?.scrollBy({ top: id === 'scroll-up' ? -420 : 420, behavior: 'smooth' });
      return;
    }
    if (id in PAD_BUTTONS) dispatchPad(id);
  });

  const bridge: OSFUIBridge = {
    postMessage(json: string): void {
      ctx.log({ direction: 'view-to-mock', json });
    },
    send(name: string, payload?: JsonObject): boolean {
      ctx.log({ send: name, payload: payload ?? {} });
      if (name === 'osfui.gamepadRaw') gamepadRaw = payload?.raw === true;
      return true;
    },
    async request<T extends JsonValue = JsonValue>(name: string, payload?: JsonObject): Promise<T> {
      ctx.log({ request: name, payload: payload ?? {} });
      if (failRequests && name !== 'console.command-center.ping') throw Object.assign(new Error('Browser fixture rejected this request.'), { code: 'mock-failure' });
      const command = String(payload?.consoleCommand ?? '');
      let reply: JsonValue;
      switch (name) {
        case 'console.command-center.ping':
          reply = { ok: true, backend: 'Browser test fixture', build: '1.1.0', executor: 'native', runtime: 'browser', testedRuntime: '1.16.244', runtimeSupported: true };
          break;
        case 'console.command-center.execute':
          reply = { ok: true, command };
          break;
        case 'console.command-center.query':
          reply = { ok: true, command, output: command.toLowerCase().includes('showinventory') ? inventoryFixture() : command.toLowerCase().includes('getspaceship') ? 'Current spaceship Reference ID: FF001234' : 'Value >> 100.000000' };
          break;
        case 'console.command-center.questRead': {
          const operation = String(payload?.operation ?? 'currentStage');
          reply = { ok: true, questId: String(payload?.questId ?? '00000000'), operation, stage: Number(payload?.stage ?? 20), value: operation === 'currentStage' ? 20 : true };
          break;
        }
        case 'console.command-center.setEffectiveActorValue': {
          const desiredTotal = Number(payload?.desiredTotal ?? 100);
          reply = { ok: true, applied: payload?.apply === true, target: String(payload?.target ?? 'player'), actorValue: String(payload?.actorValue ?? 'Health'), desiredTotal, currentBase: 100, currentEffective: 100, modifierContribution: 0, calculatedBase: desiredTotal, resultingEffective: desiredTotal, command: `setav ${String(payload?.actorValue ?? 'Health')} ${desiredTotal}` };
          break;
        }
        case 'console.command-center.close':
          reply = { ok: true };
          break;
        default:
          throw Object.assign(new Error(`No browser fixture is configured for ${name}.`), { code: 'mock-unhandled' });
      }
      return reply as T;
    },
    on<T extends JsonValue = JsonValue>(name: string, handler: (payload: T) => void): () => void {
      const set = listeners.get(name) ?? new Set<Listener>();
      listeners.set(name, set);
      set.add(handler as Listener);
      return () => set.delete(handler as Listener);
    },
    state: {
      get: () => undefined,
      on: () => () => {},
    },
  };

  bridge.onMessage = (json: string): void => {
    try {
      const message = JSON.parse(json) as { type?: string; payload?: JsonValue };
      if (message.type) emit(message.type, message.payload ?? {});
    } catch (error) {
      ctx.log(error instanceof Error ? error.message : String(error), 'warn');
    }
  };
  window.osfui = bridge;
  (window as Window & { __CCC_RESOLVE_PREVIEW_READY__?: () => void }).__CCC_RESOLVE_PREVIEW_READY__?.();
}
