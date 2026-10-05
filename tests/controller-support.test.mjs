import test from 'node:test';
import assert from 'node:assert/strict';
import { controllerDirectionalScore } from '../src/views/console.command-center/main/controller-support.ts';

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
