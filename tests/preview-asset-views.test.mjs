import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {previewOrientation,orientPreviewMeshes} from '../src/views/console.command-center/main/preview-orientation.ts';
const rows=JSON.parse(fs.readFileSync(new URL('./fixtures/preview-asset-views.json',import.meta.url),'utf8'));

test('audited aid/food assets share camera presets across renamed records and older native replies',()=>{
  assert.ok(rows.length>=63);
  for(const row of rows){
    const native=previewOrientation(row.type,'Aid','Localized mod item','UnrelatedEditor',row.model);
    assert.deepEqual(native,previewOrientation(row.type,'Aid','Localized',row.editorId));
    assert.deepEqual(native,previewOrientation(row.type,'Aid','','','Meshes/'+row.model.replaceAll('\\','/').toUpperCase()));
  }
  assert.deepEqual(previewOrientation('ALCH','Aid','','Aid_Affl_Immobilizer_01','items/mod/replaced.nif'),{yawOffset:0,pitch:-.08});
  assert.deepEqual(previewOrientation('WEAP','Weapons','','Aid_Affl_Immobilizer_01'),{yawOffset:0,pitch:-.08});
});

test('medical pouch preset stands the label upright while preserving buffers and topology',()=>{
  const orientation=previewOrientation('ALCH','Aid','','Aid_Affl_Immobilizer_01');
  const positions=new Float32Array([0,.1,-1,0,.1,1]),indices=new Uint32Array([0,1]),uv=new Float32Array([0,0,1,1]);
  const mesh={positions,indices,uv};
  orientPreviewMeshes([mesh],orientation);
  assert.ok(positions[1]<-.99&&positions[4]>.99);
  assert.equal(positions[2],positions[5]);
  assert.equal(mesh.indices,indices);assert.equal(mesh.uv,uv);
  assert.equal(orientation.yaw,0);assert.equal(orientation.pitch,0);
});
