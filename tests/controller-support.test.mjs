import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { controllerDirectionalScore } from '../src/views/console.command-center/main/controller-support.ts';

const controllerSource = readFileSync(new URL('../src/views/console.command-center/main/controller-support.ts', import.meta.url), 'utf8');

test('controller spatial navigation rejects controls behind the requested direction', () => {
  assert.equal(controllerDirectionalScore({ x: 100, y: 100 }, { x: 80, y: 100 }, 'right'), null);
  assert.equal(controllerDirectionalScore({ x: 100, y: 100 }, { x: 100, y: 80 }, 'down'), null);
});

test('controller spatial navigation prefers aligned controls', () => {
  const aligned = controllerDirectionalScore({ x: 100, y: 100 }, { x: 200, y: 100 }, 'right');
  const diagonal = controllerDirectionalScore({ x: 100, y: 100 }, { x: 200, y: 180 }, 'right');
  assert.ok(aligned !== null && diagonal !== null);
  assert.ok(aligned < diagonal);
});

test('controller spatial navigation prefers the nearer aligned control', () => {
  const near = controllerDirectionalScore({ x: 100, y: 100 }, { x: 100, y: 150 }, 'down');
  const far = controllerDirectionalScore({ x: 100, y: 100 }, { x: 100, y: 300 }, 'down');
  assert.ok(near !== null && far !== null);
  assert.ok(near < far);
});

test('controller enters selected command details and B returns to its title row', () => {
  assert.match(controllerSource, /active\.matches\('\.command-list-row'\)/);
  assert.match(controllerSource, /\.command-detail-panel \.execute-button:not\(\[disabled\]\)/);
  assert.match(controllerSource, /commandCard\?\.closest\('\.command-detail-panel'\)/);
  assert.match(controllerSource, /\.command-list-row\[aria-selected="true"\]/);
});

test('controller enters selected quest details and B returns to its title row', () => {
  assert.match(controllerSource, /active\.matches\('\.quest-browser-row'\)/);
  assert.match(controllerSource, /\.quest-browser-selection \.osf-btn:not\(\[disabled\]\)/);
  assert.match(controllerSource, /active\?\.closest\('\.quest-browser-selection'\)/);
  assert.match(controllerSource, /\.quest-browser-row\[aria-selected="true"\]/);
});

test('controller page cycling returns category-driven pages to their first category', () => {
  assert.match(controllerSource, /function firstCategoryButton\(\)/);
  assert.match(controllerSource, /const categoryDriven = view === 'commands' \|\| view === 'id-browser' \|\| view === 'mod-browser' \|\| view === 'quest-browser'/);
  assert.match(controllerSource, /:not\(\[data-scan-mod-catalogs\]\)/);
  assert.match(controllerSource, /focusElement\(utilityViewTarget\(view\)\)/);
  assert.doesNotMatch(controllerSource, /if \(direction === 'right'\) focusElement\(commandAreaTarget\(\)\)/);
});

test('controller B backs through detail, list, and category layers and supports hold-to-close', () => {
  assert.match(controllerSource, /B_LONG_PRESS_MS = 700/);
  assert.match(controllerSource, /active\?\.closest\('\.id-browser-selection'\)/);
  assert.match(controllerSource, /focusElement\(activeNavigationButton\(\) \?\? firstCategoryButton\(\)\)/);
  assert.match(controllerSource, /function beginControllerBackPress\(\)/);
  assert.match(controllerSource, /function endControllerBackPress\(\)/);
  assert.match(controllerSource, /querySelector<HTMLButtonElement>\('#close-view'\)\?\.click\(\)/);
});

test('controller uses explicit detail and keyboard lanes for uneven controls', () => {
  assert.match(controllerSource, /favoriteButton && direction === 'right'/);
  assert.match(controllerSource, /executeButton && direction === 'left'/);
  assert.match(controllerSource, /data-quest-action=\"start\"/);
  assert.match(controllerSource, /focusElement\(directionalCandidate\(active, nextKeys, direction\)\)/);
  assert.match(controllerSource, /directionalCandidate\(active, focusableElements\(keyboardActions\), 'down'\)/);
});

test('controller enters reusable custom commands and the newest activity entry', () => {
  assert.match(controllerSource, /view === 'custom'[\s\S]*?\.custom-saved-list \[data-custom-load\]/);
  assert.match(controllerSource, /view === 'activity'[\s\S]*?\.activity-list \.activity-entry/);
  assert.match(controllerSource, /active\.matches\('\.activity-entry'\)/);
  assert.match(controllerSource, /active\.matches\('\[data-custom-favorite\]'\) && direction === 'right'/);
  assert.match(controllerSource, /active\.matches\('\[data-custom-load\]'\)[\s\S]*?direction === 'left'[\s\S]*?direction === 'right'/);
  assert.match(controllerSource, /customEntry\.querySelector<HTMLElement>\('\[data-custom-delete\]'\)/);
  assert.match(controllerSource, /data-favorite-custom-toggle/);
  assert.match(controllerSource, /data-favorite-id-toggle/);
  assert.match(controllerSource, /data-open-favorite-id/);
});

test('controller repeats held directions, scrolls dialogs, and traps quest detail focus', () => {
  assert.match(controllerSource, /DIRECTION_REPEAT_DELAY_MS = 260/);
  assert.match(controllerSource, /window\.setInterval\(\(\) => moveFocus\(direction\), DIRECTION_REPEAT_MS\)/);
  assert.match(controllerSource, /scrollWithRightStick\(payload\.axes\.ry\)/);
  assert.match(controllerSource, /const next = directionalCandidate\(active, focusableElements\(questDetail\), direction\)/);
  assert.match(controllerSource, /const returnTarget = lastPageFocus\?\.isConnected/);
  assert.match(controllerSource, /bridge\?\.send\('osfui\.gamepadRaw', \{ raw: true \}\)/);
});

test('controller traps ID details and links the newest activity entry to Clear Log', () => {
  assert.match(controllerSource, /const idDetail = active\.closest<HTMLElement>\('\.id-browser-selection'\)/);
  assert.match(controllerSource, /directionalCandidate\(active, focusableElements\(idDetail\), direction\)/);
  assert.match(controllerSource, /direction === 'up' && entries\[0\] === activityEntry/);
  assert.match(controllerSource, /#clear-activity:not\(\[disabled\]\)/);
  assert.match(controllerSource, /active\.matches\('#clear-activity'\) && direction === 'down'/);
});
