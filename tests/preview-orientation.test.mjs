import test from 'node:test';
import assert from 'node:assert/strict';
import {previewOrientation} from '../src/views/console.command-center/main/preview-orientation.ts';

test('ammo uses a front and elevated camera independently of source/category labels',()=>{
  for(const category of ['Ammo','Ammunition','Other',''])assert.deepEqual(previewOrientation('AMMO',category),{yawOffset:Math.PI,pitch:.45});
  assert.deepEqual(previewOrientation('ammo'),previewOrientation('AMMO'));
  assert.deepEqual(previewOrientation('WEAP','Weapons'),{yawOffset:0,pitch:-.08});
  assert.deepEqual(previewOrientation('ARMO','Spacesuits'),{yawOffset:Math.PI,pitch:-.08});
});
