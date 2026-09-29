import { defineMock, type MockContext } from '@osfui/cli';

// Browser-only fixtures. These never execute game commands or ship in the mod.
export default defineMock({});
export function install(ctx: MockContext) {
  let failQuery = false;
  ctx.registerTools([{ id: 'fail-query', kind: 'toggle', label: 'Fail inspections', value: false }], (_id, value) => {
    failQuery = value === true;
  });
  ctx.onCommand((command, payload, reply) => {
    if (command === 'console.command-center.ping') {
      reply('console.command-center.pingResult', { ok: true, backend: 'Browser test fixture', executor: 'native' });
      return true;
    }
    if (command === 'console.command-center.query') {
      if (failQuery) {
        reply('ui.error', { code: 'query-failed', message: 'Test fixture: reference unavailable.' });
        return true;
      }
      const text = String(payload.consoleCommand ?? '');
      const output = text.startsWith('help ')
        ? 'WEAP: (0004716C) Beowulf'
        : text.includes('showinventory')
          ? Array.from({ length: 250 }, (_, i) => `000${i.toString(16).padStart(5, '0')}  1  Test item ${i + 1}`).join('\n')
          : text.includes('getspaceship') ? 'Current spaceship Reference ID: FF001234'
          : 'Value >> 0.000000';
      reply('console.command-center.queryResult', { ok: true, command: text, output });
      return true;
    }
    if (command === 'console.command-center.execute') {
      reply('console.command-center.executeResult', { ok: true, command: String(payload.consoleCommand ?? '') });
      return true;
    }
    if (command === 'console.command-center.questStatus') {
      reply('console.command-center.questStatusResult', { ok: true, questId: 'test', currentStage: 20, completedStages: [10, 20] });
      return true;
    }
    if (command === 'console.command-center.close') {
      reply('console.command-center.closeResult', { ok: true });
      return true;
    }
  });
}
