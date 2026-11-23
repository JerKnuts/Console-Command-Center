import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAPYRUS_INSPECTIONS, PAPYRUS_INSPECTION_SPECS, papyrusInspectionRequest } from '../src/views/console.command-center/main/papyrus-inspections.ts';

test('Papyrus cards provide valid requests and remain unverified', () => {
  assert.equal(PAPYRUS_INSPECTIONS.length, 10);
  for (const card of PAPYRUS_INSPECTIONS) {
    assert.equal(card.testStatus, 'untested');
    assert.equal(card.category, 'Untested');
    assert.equal(card.captureOutput, true);
    assert.equal(card.secondaryAction, undefined);
    let command = card.command;
    for (const input of card.inputs) {
      const value = input.defaultValue ?? (input.key === 'plugin' ? 'Example Mod.esm' : '0000000F');
      assert.match(String(value), new RegExp(input.pattern));
      command = command.replace(`{${input.key}}`, value);
    }
    assert.equal(papyrusInspectionRequest(card.inspection, command).operation, card.inspection);
  }
});

test('script requests retain placed targets and item IDs and accept plugin filenames with spaces', () => {
  assert.deepEqual(papyrusInspectionRequest('itemCount', 'ObjectReference.GetItemCount 00000014 0000000F'), {
    operation: 'itemCount', target: '00000014', item: '0000000F',
  });
  assert.deepEqual(papyrusInspectionRequest('pluginInstalled', 'Game.IsPluginInstalled Example Mod.esm'), {
    operation: 'pluginInstalled', plugin: 'Example Mod.esm',
  });
  for (const command of ['Game.IsPluginInstalled ../Example.esm', 'Game.IsPluginInstalled Example.esm\nQuitGame', 'Game.IsPluginInstalled Example.txt']) {
    assert.throws(() => papyrusInspectionRequest('pluginInstalled', command));
  }
  assert.throws(() => papyrusInspectionRequest('scale', 'ObjectReference.GetScale player extra'));
  assert.throws(() => papyrusInspectionRequest('scale', 'Actor.Kill player'));
  assert.throws(() => papyrusInspectionRequest('itemCount', 'ObjectReference.GetItemCount player credits'));
  assert.throws(() => papyrusInspectionRequest('followers', 'Game.GetPlayerFollowers player'));
});

test('every inspection uses a native allowlisted method and an inspection-only execution path', () => {
  const native = readFileSync(new URL('../native/src/main.cpp', import.meta.url), 'utf8');
  const ui = readFileSync(new URL('../src/views/console.command-center/main/main.ts', import.meta.url), 'utf8');
  for (const [operation, spec] of Object.entries(PAPYRUS_INSPECTION_SPECS)) {
    const [owner, method] = spec.method.split('.');
    assert.ok(native.includes(`InspectionSpec{ "${operation}", "${owner}", "${method}"`));
  }
  assert.ok(ui.includes("request<QueryReply>('console.command-center.papyrusRead'"));
  assert.ok(ui.includes("const addToBatchControl = command.inspection ? ''"));
  const batch = ui.slice(ui.indexOf('function appendCommandToBatch'), ui.indexOf('async function executeCustomBatch'));
  assert.ok(batch.includes('if (command.inspection)'));
  assert.ok(native.includes('state->generation != g_loadGeneration.load()'));
  assert.ok(native.includes('papyrus-read-timeout'));
});
