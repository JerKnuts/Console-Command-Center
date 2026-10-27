import test from 'node:test';
import assert from 'node:assert/strict';
import {previewShadowMatrix,createPreviewShadow,previewShadowSize} from '../src/views/console.command-center/main/preview-lighting.ts';

const transform=(m,p)=>[0,1,2].map(row=>m[row]*p[0]+m[row+4]*p[1]+m[row+8]*p[2]+m[row+12]);
test('shadow camera contains the normalized model from side, overhead and orbiting light positions',()=>{
  for(const light of [[0,1.8,0],[0,-1.8,0],[1.8,0,0],[0,0,-1.8],[-.64,1.02,1.34]]){
    const matrix=previewShadowMatrix(light);
    assert.ok([...matrix].every(Number.isFinite));
    for(let y=0;y<=12;y++)for(let x=0;x<24;x++){
      const pitch=y*Math.PI/12,yaw=x*Math.PI/12;
      const point=[Math.sin(pitch)*Math.cos(yaw),Math.cos(pitch),Math.sin(pitch)*Math.sin(yaw)];
      assert.ok(transform(matrix,point).every(v=>Math.abs(v)<1),'Model clipped by light projection');
    }
    assert.ok(transform(matrix,[0,0,0]).every(v=>Math.abs(v)<1e-6));
    const direction=light.map(v=>v/Math.hypot(...light));
    assert.ok(transform(matrix,direction)[2]<transform(matrix,direction.map(v=>-v))[2],'Near/far shadow depth is inverted');
  }
});
test('invalid shadow lights are rejected before uploading a corrupt projection',()=>{
  for(const light of [[0,0,0],[NaN,1,0],[0,Infinity,1],[1,2]])assert.throws(()=>previewShadowMatrix(light));
});
test('unavailable shadow target falls back and restores the previous scene framebuffer',()=>{
  const previous={},deleted=[],bindings=[];
  const gl={FRAMEBUFFER_BINDING:1,FRAMEBUFFER:2,TEXTURE_2D:3,DEPTH_COMPONENT24:4,DEPTH_COMPONENT:5,UNSIGNED_INT:6,
    createFramebuffer:()=>({}),createTexture:()=>({}),getParameter:()=>previous,bindTexture:()=>{},texImage2D:()=>{},texParameteri:()=>{},framebufferTexture2D:()=>{},drawBuffers:()=>{},readBuffer:()=>{},
    bindFramebuffer:(_target,value)=>bindings.push(value),checkFramebufferStatus:()=>0,FRAMEBUFFER_COMPLETE:42,
    deleteFramebuffer:value=>deleted.push(value),deleteTexture:value=>deleted.push(value)};
  assert.equal(createPreviewShadow(gl,512),null);assert.equal(bindings.at(-1),previous);assert.equal(deleted.length,2);
});

test('shadow quality increases resolution within the GPU texture limit',()=>{
 assert.deepEqual(['low','medium','high','ultra'].map(q=>previewShadowSize(q)),[1024,1536,2048,4096]);assert.equal(previewShadowSize('ultra',2048),2048);assert.equal(previewShadowSize('high',1024),1024);
});
