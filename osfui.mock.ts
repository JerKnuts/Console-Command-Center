import type { JsonObject, JsonValue, OSFUIBridge } from './src/osfui';
import type { MockContext, ToolSpec } from '@osfui/cli';

type Listener = (payload: JsonValue) => void;

const PAD_BUTTONS: Record<string, number> = {
  'pad-up': 0x0001,
  'pad-down': 0x0002,
  'pad-left': 0x0004,
  'pad-right': 0x0008,
  'pad-start': 0x0010,
  'pad-select': 0x0020,
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

const SAMPLE_COMMAND_BATCHES: ReadonlyArray<readonly [string, string]> = [
  ['Sample - Basic Supplies', `# SAMPLE: Basic Supplies
# Adds a modest set of commonly used supplies.
# Edit the quantity at the end of any command before running.

# 10,000 credits
player.additem 0000000F 10000

# 25 digipicks
player.additem 0000000A 25

# 10 med packs
player.additem 0000ABF9 10

# 10 ship parts
player.additem 0003FB19 10
`],
  ['Sample - Workshop Materials', `# SAMPLE: Workshop Materials
# Adds 25 each of five useful base-game crafting resources.
# Edit the quantities to suit your project before running.

# Aluminum
player.additem 0000557D 25

# Adhesive
player.additem 000055B1 25

# Sealant
player.additem 000055CC 25

# Titanium
player.additem 0000556D 25

# Tungsten
player.additem 0000556B 25
`],
  ['Sample - Ballistic Starter Kit', `# SAMPLE: Ballistic Starter Kit
# Adds one base-game Grendel and 500 rounds of 7.77mm Caseless ammunition.
# This is an example loadout; edit or remove either command before running.

# Grendel
player.additem 00028A02 1

# 7.77mm Caseless ammunition
player.additem 0004AD3E 500
`],
];

function inventoryFixture(): string {
  return ['CCC_INVENTORY_V1', 'TYPE\tID\tCOUNT\tNAME',
    ...Array.from({ length: 40 }, (_, index) => `WEAP\t${(0x4716c + index).toString(16).padStart(8, '0').toUpperCase()}\t${index + 1}\tBrowser Test Item ${index + 1}`),
    'SUMMARY\t40'].join('\n');
}

async function previewModCatalogRequest(name: string, payload?: JsonObject): Promise<JsonValue | null> {
  const route = name === 'console.command-center.modCatalogs'
    ? '/__ccc/mod-catalogs'
    : name === 'console.command-center.modCatalogRecords'
      ? `/__ccc/mod-catalog-records?plugin=${encodeURIComponent(String(payload?.plugin ?? ''))}`
      : name === 'console.command-center.pluginLoadOrder'
        ? '/__ccc/plugin-load-order'
      : null;
  if (!route) return null;
  const response = await fetch(route, { cache: 'no-store' });
  if (!response.ok) {
    const failure = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(failure.error || `Preview mod scanner returned HTTP ${response.status}.`);
  }
  return await response.json() as JsonValue;
}

export function install(ctx: MockContext): void {
  const listeners = new Map<string, Set<Listener>>();
  let failRequests = false;
  let gamepadRaw = false;
  const commandBatches = new Map<string, string>(SAMPLE_COMMAND_BATCHES);
  let commandBatchAutoRunEnabled = false;
  const commandBatchAutoRunNames = new Set<string>();

  const batchEntries = (): JsonValue[] => [...commandBatches.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([name, commands]) => ({
    id: name.toLowerCase(),
    name,
    file: `${name}.txt`,
    commands,
    commandCount: commands.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#')).length,
    valid: true,
  }));

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
          reply = { ok: true, backend: 'Browser test fixture', build: '1.2.18', executor: 'native', runtime: 'browser', testedRuntime: '1.16.244', runtimeSupported: true };
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
        case 'console.command-center.modCatalogRecords':
        case 'console.command-center.modCatalogCache':
        case 'console.command-center.modCatalogs': {
          const localCatalog = await previewModCatalogRequest(name, payload);
          if (localCatalog) {
            reply = localCatalog;
            break;
          }
          const includeRecords = name === 'console.command-center.modCatalogRecords';
          reply = {
            ok: true,
            directory: 'Data/SFSE/Plugins/ConsoleCommandCenter/catalogs',
            directoryExists: true,
            totalRecords: 3,
            catalogs: [{
              file: 'browser-fixture.json',
              loaded: true,
              name: 'Browser Fixture Arsenal',
              plugin: 'BrowserFixture.esm',
              pluginKind: 'small',
              recordsLoaded: includeRecords,
              cached: true,
              count: 3,
              skipped: 0,
              errors: [],
              records: includeRecords ? [
                { label: 'Fixture Laser Rifle', value: 'FE042800', localFormId: '800', type: 'WEAP', category: 'Weapons', editorId: 'CCC_FixtureLaserRifle', detail: 'Browser preview weapon' },
                { label: 'Fixture Spacesuit', value: 'FE042801', localFormId: '801', type: 'ARMO', category: 'Armor', editorId: 'CCC_FixtureSpacesuit', detail: 'Browser preview armor' },
                { label: 'Fixture Med Pack', value: 'FE042802', localFormId: '802', type: 'ALCH', category: 'Aid', editorId: 'CCC_FixtureMedPack', detail: 'Browser preview aid item' },
              ] : [],
            }],
          };
          break;
        }
        case 'console.command-center.pluginLoadOrder': {
          const localLoadOrder = await previewModCatalogRequest(name, payload);
          reply = localLoadOrder ?? {
            ok: true,
            plugins: [
              { plugin: 'Starfield.esm', pluginKind: 'full', index: 0 },
              { plugin: 'ShatteredSpace.esm', pluginKind: 'full', index: 1 },
              { plugin: 'SFBGS00D.esm', pluginKind: 'full', index: 2 },
              { plugin: 'SFBGS050.esm', pluginKind: 'full', index: 3 },
              { plugin: 'SFBGS004.esm', pluginKind: 'small', index: 0 },
              { plugin: 'SFBGS047.esm', pluginKind: 'small', index: 1 },
            ],
          };
          break;
        }
        case 'console.command-center.commandBatchList': {
          const legacy = Array.isArray(payload?.legacyBatches) ? payload.legacyBatches : [];
          for (const candidate of legacy) {
            if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;
            const item = candidate as JsonObject;
            const name = String(item.name ?? '').trim();
            const commands = String(item.commands ?? '');
            if (name && commands && !commandBatches.has(name)) commandBatches.set(name, commands);
          }
          reply = { ok: true, directory: 'Documents\\My Games\\Starfield\\Console Command Center\\Command Batches', entries: batchEntries(), warnings: [], migrated: legacy.length, migrationComplete: true };
          break;
        }
        case 'console.command-center.commandBatchSave': {
          const name = String(payload?.name ?? '').trim();
          const content = String(payload?.content ?? '');
          if (!name || !content) throw new Error('A filename and at least one command are required.');
          commandBatches.set(name, content);
          reply = { ok: true };
          break;
        }
        case 'console.command-center.commandBatchDelete':
          commandBatchAutoRunNames.delete(String(payload?.name ?? '').toLowerCase());
          reply = { ok: true, removed: commandBatches.delete(String(payload?.name ?? '')) };
          break;
        case 'console.command-center.commandBatchDeleteAll': {
          const removed = commandBatches.size;
          commandBatches.clear();
          commandBatchAutoRunNames.clear();
          reply = { ok: true, removed };
          break;
        }
        case 'console.command-center.commandBatchAutoRunGet':
          reply = { ok: true, enabled: commandBatchAutoRunEnabled, batches: [...commandBatchAutoRunNames], delaySeconds: 3 };
          break;
        case 'console.command-center.commandBatchAutoRunEnable':
          commandBatchAutoRunEnabled = payload?.enabled === true;
          reply = { ok: true, enabled: commandBatchAutoRunEnabled, batches: [...commandBatchAutoRunNames], delaySeconds: 3 };
          break;
        case 'console.command-center.commandBatchAutoRunBatch': {
          const name = String(payload?.name ?? '').trim();
          if (payload?.enabled === true) commandBatchAutoRunNames.add(name.toLowerCase());
          else commandBatchAutoRunNames.delete(name.toLowerCase());
          reply = { ok: true, enabled: commandBatchAutoRunEnabled, batches: [...commandBatchAutoRunNames], delaySeconds: 3 };
          break;
        }
        case 'console.command-center.commandBatchAutoRunReports':
          reply = { ok: true, reports: [] };
          break;
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
