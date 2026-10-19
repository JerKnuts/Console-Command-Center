import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenizeCommandLine, parseBatchCommands, highlightCommands, updateCommandHighlight, syncCommandHighlight } from '../src/views/console.command-center/main/command-syntax.ts';
import { batchLines } from '../scripts/included-batches.mjs';

test('syntax recognizes targets, commands, IDs, values and italic comments without rewriting text', () => {
  for (const line of ['player.additem 0000ABF9 10 # Med packs', 'set 002CCFCB to 75 ; value', '  getgs "a;#b"', 'player.setav speedmult -1.5e2', 'cgf "A\\\\B\\\";#" 1', 'command "unfinished ; #', '<img src=x onerror=alert(1)>', '\t# Unicode: café']) {
    assert.equal(tokenizeCommandLine(line).map(token => token.text).join(''), line);
  }
  const tokens = tokenizeCommandLine('player.additem 0000ABF9 10 # note');
  for (const [text, kind] of [['player','target'], ['additem','command'], ['0000ABF9','id'], ['10','number'], ['# note','comment']]) {
    assert.ok(tokens.some(token => token.text === text && token.kind === kind));
  }
  assert.ok(tokenizeCommandLine('getgs "literal;#"').some(token => token.kind === 'string' && token.text === '"literal;#"'));
});

test('comments agree with file execution and HTML is escaped', () => {
  const text = '# Heading\r\n; Older comment\r\nplayer.additem 0000ABF9 10 ; end\r\ngetgs "a;#b" # note\n';
  assert.deepEqual(parseBatchCommands(text), ['player.additem 0000ABF9 10', 'getgs "a;#b"']);
  assert.deepEqual(parseBatchCommands(text), batchLines(text));
  const html = highlightCommands('command "<img onerror=x>" # <script>alert(1)</script>');
  assert.ok(!html.includes('<img') && !html.includes('<script>'));
  assert.ok(html.includes('&lt;img') && html.includes('command-syntax-comment'));
});

test('mirror tracks both scroll axes, viewport and shrinking drafts', () => {
  const classes = new Set(), mirror = { style: {}, classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } } }, clip = { style: {} };
  const host = { querySelector(selector) { return selector.endsWith('-content') ? mirror : clip; } };
  const input = { value: Array.from({length:150}, () => 'player.additem 0000ABF9 10').join('\n'), placeholder:'# example', scrollTop:800, scrollLeft:225, clientWidth:600, clientHeight:400, closest() { return host; } };
  updateCommandHighlight(input);
  assert.equal(mirror.style.transform, 'translate(-225px, -800px)');
  assert.equal(clip.style.width, '600px'); assert.equal(clip.style.height, '400px');
  input.value = ''; input.scrollTop = input.scrollLeft = 0; input.clientWidth = 350;
  updateCommandHighlight(input); syncCommandHighlight(input);
  assert.ok(classes.has('is-placeholder')); assert.ok(mirror.innerHTML.includes('# example'));
  assert.equal(mirror.style.transform, 'translate(0px, 0px)'); assert.equal(clip.style.width, '350px');
});
