import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import { devFeedbackButton } from '../src/views/console.command-center/main/dev-feedback.ts';
const source = readFileSync(new URL('../src/views/console.command-center/main/main.ts', import.meta.url), 'utf8');
const names = new Set(['renderQuestBrowserSelection', 'questBrowserVariantLabel', 'escapeHtml']);
const functions = [...source.matchAll(/^(?:async )?function (\w+)\b[\s\S]*?^}/gm)].filter(match => names.has(match[1])).map(match => match[0]);
const context = vm.createContext({ uiPreferences: { advanced: true }, devFeedbackButton, nativeBackendReady: true, activeCatalogPicker: null, questProgressSnapshots: new Map(), normalizedQuestId: id => id.toUpperCase() });
vm.runInContext(stripTypeScriptTypes(functions.join('\n')), context);
const quest = { quest: 'Mod Quest', editorId: 'ExampleQuest', questId: 'FE123800', stages: [], source: 'Example.esm', requirement: null, category: 'Quests', internal: false };
test('mod quest selection uses runtime ID, live inspection, and confirmed stage entry instead of an invented stage list', () => {
  const html = context.renderQuestBrowserSelection(quest, true);
  assert.match(html, /data-quest-inspect="stage"/);
  assert.match(html, /data-quest-id="FE123800"/);
  for (const action of ['start', 'stop', 'complete', 'reset']) assert.ok(html.includes('data-quest-action="' + action + '"'));
  assert.match(html, /data-mod-quest-stage-input/);
  assert.match(html, /data-mod-quest-set-stage/);
  assert.doesNotMatch(html, /class="quest-stage-grid"/);
  assert.match(html, /Stage data is unavailable/);
});
test('packaged quest selection retains stage history and its recorded stage buttons', () => {
  const html = context.renderQuestBrowserSelection({ ...quest, source: 'Base Game', stages: [0, 10, 100] });
  assert.match(html, /data-quest-inspect="history"/);
  assert.match(html, /data-quest-command="setstage FE123800 100"/);
  assert.doesNotMatch(html, /data-mod-quest-stage-input/);
});

test('scanned mod quest stages use the runtime ID and enable full stage history', () => {
  const html = context.renderQuestBrowserSelection({ ...quest, stages: [0, 10, 100], stagesScanned: true }, true);
  assert.match(html, /data-quest-inspect="history"/);
  assert.match(html, /data-quest-command="setstage FE123800 100"/);
  assert.match(html, /ALL RECORDED STAGES/);
});

test('inactive official quest entries disable inspection, copy, stage, and state-changing controls', () => {
  const html = context.renderQuestBrowserSelection({ ...quest, source: 'Terran Armada', available: false, stages: [10] });
  for (const action of ['start', 'stop', 'complete', 'reset']) assert.ok(new RegExp('data-quest-action="' + action + '"[^>]* disabled').test(html));
  assert.match(html, /data-quest-inspect="history"[^>]* disabled/);
  assert.match(html, /data-copy-text="FE123800"[^>]* disabled/);
  assert.match(html, /data-quest-stage="10"[^>]* disabled/);
});

test('ordinary quest details retain source, stages and copy actions while hiding technical metadata',()=>{
 context.uiPreferences.advanced=false;
 try{const html=context.renderQuestBrowserSelection(quest,true);assert.doesNotMatch(html,/<dt>(?:Category|Form ID|Editor ID)<\/dt>/);assert.match(html,/<dt>Source<\/dt>/);assert.match(html,/<dt>Stages<\/dt>/);assert.match(html,/Copy Quest ID/);assert.match(html,/Inspect Quest State/);}finally{context.uiPreferences.advanced=true;}
});
