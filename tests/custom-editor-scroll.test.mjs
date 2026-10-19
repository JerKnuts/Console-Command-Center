import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const source = readFileSync(new URL('../src/views/console.command-center/main/main.ts', import.meta.url), 'utf8');
const names = new Set(['syncCustomCommandLineNumbers', 'updateCustomCommandLineNumbers']);
const functions = [...source.matchAll(/^(?:async )?function (\w+)\b[\s\S]*?^}/gm)].filter(match => names.has(match[1])).map(match => match[0]);
class Element { constructor() { this.style = {}; } }
const context = vm.createContext({ HTMLElement: Element, syncCommandHighlight() {}, updateCommandHighlight() {} });
vm.runInContext(stripTypeScriptTypes(functions.join('\n')), context);
function fixture() {
  const properties = {};
  const gutter = { firstElementChild: new Element(), innerHTML: '', scrollTop: 0 };
  const input = { value: '', scrollTop: 0, closest: () => ({ style: { setProperty: (key, value) => { properties[key] = value; } } }) };
  return { input, gutter, properties };
}
test('line-number contents follow the text scroll offset even when the gutter cannot scroll', () => {
  const { input, gutter } = fixture();
  input.value = Array.from({ length: 200 }, (_, index) => 'command ' + index).join('\n');
  context.updateCustomCommandLineNumbers(input, gutter);
  for (const offset of [0, 350, 4000]) {
    input.scrollTop = offset;
    context.syncCustomCommandLineNumbers(input, gutter);
    assert.equal(gutter.scrollTop, 0);
    assert.equal(gutter.firstElementChild.style.transform, 'translateY(-' + offset + 'px)');
  }
});
test('number gutter expands for long batches and resets when the draft shrinks', () => {
  const { input, gutter, properties } = fixture();
  input.value = Array.from({ length: 1000 }, () => 'tgm').join('\n');
  context.updateCustomCommandLineNumbers(input, gutter);
  assert.equal(properties['--custom-gutter-width'], 'calc(4ch + 16px)');
  assert.ok(gutter.innerHTML.includes('custom-command-line-number">1000</span>'));
  input.value = 'tgm\ntcl'; input.scrollTop = 0;
  context.updateCustomCommandLineNumbers(input, gutter);
  assert.equal(properties['--custom-gutter-width'], 'calc(2ch + 16px)');
  assert.ok(gutter.innerHTML.includes('custom-command-line-number">2</span>'));
  assert.equal(gutter.firstElementChild.style.transform, 'translateY(-0px)');
});
