import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const devScript = readFileSync(new URL('../scripts/dev-game.mjs', import.meta.url), 'utf8');
const mockSource = readFileSync(new URL('../osfui.mock.ts', import.meta.url), 'utf8');
const configSource = readFileSync(new URL('../osfui.config.ts', import.meta.url), 'utf8');

test('dev:game starts the browser harness and deploys the modern view and compiled mod', () => {
  assert.equal(packageJson.scripts['dev:game'], 'node scripts/dev-game.mjs');
  assert.match(devScript, /@osfui\/cli\/src\/cli\.mjs/);
  assert.match(devScript, /mod\/SFSE\/Plugins\/OSF\/UI\/views\/console\.command-center\/main/);
  assert.doesNotMatch(devScript, /OSFUI\/views/);
  assert.match(devScript, /watch\(sourceRoot, \{ recursive: true \},/);
  assert.match(devScript, /The browser preview dependency is missing\. Run/);
  assert.match(devScript, /\.osfui\/local\.json/);
  assert.match(devScript, /mirrorTree\(resolve\(projectRoot, 'dist'\), externalModRoot\)/);
  assert.match(devScript, /mirrorTree\(distView, externalView\)/);
  assert.match(devScript, /Compiled mod deployed to/);
  assert.match(devScript, /Starfield has the DLL locked; updated the UI/);
  assert.match(devScript, /\.author-mode\.json/);
});

test('browser preview supplies native fixtures and controller controls', () => {
  assert.match(configSource, /mock: 'osfui\.mock\.ts'/);
  assert.match(mockSource, /Browser test fixture/);
  assert.match(mockSource, /console\.command-center\.execute/);
  assert.match(mockSource, /console\.command-center\.query/);
  assert.match(mockSource, /pad-up/);
  assert.match(mockSource, /pad-a/);
  assert.match(mockSource, /pad-start/);
  assert.match(mockSource, /pad-select/);
  assert.match(mockSource, /ui\.gamepad/);
});
