import { defineMock, type MockContext } from '@osfui/cli';

// The browser harness mirrors native/src/main.cpp so every round trip works
// without launching Starfield. This file stays at project root and never ships.
const state = {
  count: 0,
  enabled: true,
  greeting: 'Hello from the mocked C++ plugin',
  lastAction: 'Browser mock initialized',
  features: ['typed JSON', 'commands', 'requests', 'native pushes', 'settings', 'hotkeys'],
};

export default defineMock({
  locales: { en: { title: 'Native bridge example' } },
});

export function install(ctx: MockContext) {
  const pushState = () => ctx.send({
    type: 'console.command-center.state',
    payload: { ...state, features: [...state.features] },
  });
  const notice = (message: string) => ctx.send({
    type: 'console.command-center.notice', payload: { message },
  });

  ctx.onCommand((command, payload, reply) => {
    if (command === 'console.command-center.getState') {
      reply('console.command-center.state', { ...state, features: [...state.features] });
      return true;
    }
    if (command === 'console.command-center.increment') {
      const requested = Number(payload.amount);
      const amount = Number.isFinite(requested) ? Math.max(-10, Math.min(10, requested)) : 1;
      if (state.enabled) {
        state.count += amount;
        state.lastAction = 'JavaScript sent a fire-and-forget command';
        pushState();
      } else {
        notice('The native counter is disabled in Mod Settings');
      }
      return true;
    }
    if (command === 'console.command-center.greet') {
      const name = typeof payload.name === 'string' ? payload.name : '';
      if (!name) {
        reply('ui.error', { code: 'invalid-payload', message: 'name is required' });
        return true;
      }
      const excited = payload.excited === true;
      reply('console.command-center.greeting', {
        message: state.greeting + ', ' + name + (excited ? '!!' : '!'),
        receivedFromJs: { name, excited },
        nativeCount: state.count,
      });
      return true;
    }
  });

  ctx.registerTools([
    { id: 'native-enabled', kind: 'toggle', label: 'Native enabled', value: true },
    { id: 'native-hotkey', kind: 'button', label: 'Fire hotkey callback' },
  ], (id, value) => {
    if (id === 'native-enabled') {
      state.enabled = value === true;
      state.lastAction = 'Mocked C++ settings callback applied a value';
      pushState();
    } else if (id === 'native-hotkey') {
      state.lastAction = 'Mocked C++ hotkey callback fired';
      pushState();
      notice('The native open-view hotkey fired');
    }
  });
}
