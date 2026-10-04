import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const nativeHeader = read('../native/include/OSFUI.h');
const nativeSource = read('../native/src/main.cpp');
const browserSource = read('../src/views/console.command-center/main/main.ts');
const buildSource = read('../scripts/build-ui.mjs');
const packageSource = read('../scripts/package-mod.ps1');

test('native plugin targets the OSF UI 2.0 API and initializes at PostPostLoad', () => {
  assert.match(nativeHeader, /kVersion\s*=\s*0x00020000u/);
  assert.match(nativeHeader, /OSFUI_RequestAPI/);
  assert.match(nativeSource, /kPostPostLoad/);
  assert.doesNotMatch(nativeSource, /OSFUI_RequestBridge|OSFUI_API\.h/);
});

test('browser integration uses the OSF UI 2.0 request contract', () => {
  assert.match(browserSource, /window\.osfui\.request/);
  assert.doesNotMatch(browserSource, /window\.osfui\.call|window\.osfui\?\.ready/);
});

test('production view uses the modern path and launcher manifest', () => {
  assert.match(buildSource, /SFSE\/Plugins\/OSF\/UI\/views\/console\.command-center\/main/);
  assert.match(buildSource, /manifestVersion:\s*1/);
  assert.match(buildSource, /launcher:\s*true/);
  assert.doesNotMatch(buildSource, /Plugins\/OSFUI\/views/);
});

test('release packaging rejects a legacy CCC view', () => {
  assert.match(packageSource, /OSF\\UI\\views\\console\.command-center/);
  assert.match(packageSource, /OSFUI\\views\\console\.command-center/);
  assert.match(packageSource, /Legacy OSF UI view files remain in dist/);
});
