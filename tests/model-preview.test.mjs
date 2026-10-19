import test from 'node:test';
import assert from 'node:assert/strict';
import {decodePreview,orbitState,smoothNormals,previewAlphaMode,previewCanvasSize} from '../src/views/console.command-center/main/preview-renderer.ts';
import {canPreviewModel,fetchPreview,defaultPreviewMannequin} from '../src/views/console.command-center/main/model-preview.ts';
import {deflateSync} from 'node:zlib';

test('compressed cutout edges remain in the solid depth pass instead of glass',()=>{
 const pixels=new Uint8Array(100*4).fill(255);for(let i=0;i<6;i++)pixels[i*4+3]=0;for(let i=6;i<12;i++)pixels[i*4+3]=127;
 assert.equal(previewAlphaMode(pixels),'cutout');
 assert.equal(previewAlphaMode(new Uint8Array(40).fill(255)),'opaque');
 assert.equal(previewAlphaMode(new Uint8Array(40)),'cutout');
});
test('broad fractional opacity still uses transparent blending for glass and pouches',()=>{
 const pixels=new Uint8Array(100*4).fill(255);for(let i=0;i<60;i++)pixels[i*4+3]=80;
 assert.equal(previewAlphaMode(pixels),'blend');
});

function triangle(){
 const b=new ArrayBuffer(68),v=new DataView(b);let p=0;
 const u=n=>{v.setUint32(p,n,true);p+=4;};
 [0x50504343,1,1,3,3].forEach(u);
 for(const n of [0,0,0,2,0,0,0,2,0]){v.setFloat32(p,n,true);p+=4;}
 [0,1,2].forEach(u);return b;
}

test('version 9 transports metal maps separately and rejects invalid references and truncated data',()=>{
 const bytes=new Uint8Array(136),v=new DataView(bytes.buffer);bytes.set(new Uint8Array(triangle()));
 v.setUint32(4,9,true); // header + geometry = 68 bytes
 v.setUint32(88,0,true);v.setUint32(92,1,true); // normal and metal IDs
 v.setUint32(120,1,true);v.setUint32(124,1,true);v.setUint32(128,1,true);bytes.set([231,231,231,255],132);
 const [mesh]=decodePreview(bytes.buffer);assert.equal(mesh.normalTexture,undefined);assert.equal(mesh.metalTexture.width,1);assert.deepEqual([...mesh.metalTexture.pixels],[231,231,231,255]);
 v.setUint32(92,2,true);assert.throws(()=>decodePreview(bytes.buffer),/metal texture reference/);v.setUint32(92,1,true);
 assert.throws(()=>decodePreview(bytes.buffer.slice(0,-1)),/texture/);
 assert.equal(decodePreview(triangle())[0].metalTexture,undefined);
});
test('geometry decodes, centers and converts engine Z-up to screen Y-up',()=>{
 const [m]=decodePreview(triangle());assert.equal(m.indices.length,3);
 assert.deepEqual([...m.indices],[0,1,2]);
 assert.ok(Math.abs(m.positions[0]+Math.SQRT1_2)<1e-6);
 assert.equal(m.positions[1],0);assert.ok(m.positions[2]>0);
});
test('geometry rejects truncation, invalid triangles, non-finite positions and trailing bytes',()=>{
 assert.throws(()=>decodePreview(triangle().slice(0,64)));
 const bad=triangle();new DataView(bad).setUint32(64,3,true);assert.throws(()=>decodePreview(bad),/triangle/);
 const nan=triangle();new DataView(nan).setFloat32(20,NaN,true);assert.throws(()=>decodePreview(nan),/coordinates/);
 const trailing=new Uint8Array(72);trailing.set(new Uint8Array(triangle()));assert.throws(()=>decodePreview(trailing.buffer),/Unexpected/);
});
test('orbit controls bound zoom and tilt and tolerate invalid input',()=>{
 assert.deepEqual(orbitState(NaN,Infinity,NaN),{yaw:0,pitch:0,zoom:1});
 assert.equal(orbitState(0,99,99).zoom,20);assert.equal(orbitState(0,-99,0).pitch,-1.5);
});
test('color transfer validates UVs, texture sizes and mannequin flags',()=>{
 const base=new Uint8Array(triangle());new DataView(base.buffer).setUint32(4,2,true);
 const bytes=new Uint8Array(108);bytes.set(base);const v=new DataView(bytes.buffer);
 v.setUint32(68,1,true);v.setUint32(72,1,true);v.setUint32(76,1,true);bytes.set([210,45,20,255],104);
 const [mesh]=decodePreview(bytes.buffer);assert.equal(mesh.mannequin,true);assert.deepEqual([...mesh.texture.pixels],[210,45,20,255]);assert.equal(mesh.uv.length,6);
 v.setUint32(72,4097,true);assert.throws(()=>decodePreview(bytes.buffer),/texture/);v.setUint32(72,1,true);
 v.setFloat32(80,Infinity,true);assert.throws(()=>decodePreview(bytes.buffer),/coordinates/);
});
test('preview buttons require Advanced Options, supported type and an available runtime ID',()=>{
 const item={value:'0000000F',label:'Credits',type:'MISC'};
 assert.equal(canPreviewModel(item,true),true);assert.equal(canPreviewModel(item,false),false);
 assert.equal(canPreviewModel({...item,available:false},true),false);
 assert.equal(canPreviewModel({...item,type:'QUST'},true),false);
 assert.equal(canPreviewModel({...item,type:'BOOK'},true),false);
 assert.equal(canPreviewModel({...item,value:'xx00000F'},true),false);
});
test('shared texture transfer reads one pool entry and rejects missing references',()=>{
 const bytes=new Uint8Array(116);bytes.set(new Uint8Array(triangle()));const v=new DataView(bytes.buffer);v.setUint32(4,3,true);v.setUint32(68,0,true);v.setUint32(72,1,true);v.setUint32(100,1,true);v.setUint32(104,1,true);v.setUint32(108,1,true);bytes.set([120,60,20,255],112);
 const [mesh]=decodePreview(bytes.buffer);assert.deepEqual([...mesh.texture.pixels],[120,60,20,255]);
 v.setUint32(72,2,true);assert.throws(()=>decodePreview(bytes.buffer),/reference/);
});
test('Ultra accepts a full 4K texture above the ordinary decoded-data limit without copying its pixels',()=>{
 const bytes=new Uint8Array(112+4096*4096*4);bytes.set(new Uint8Array(triangle()));const v=new DataView(bytes.buffer);v.setUint32(4,3,true);v.setUint32(72,1,true);v.setUint32(100,1,true);v.setUint32(104,4096,true);v.setUint32(108,4096,true);
 assert.throws(()=>decodePreview(bytes.buffer),/size/);
 const [mesh]=decodePreview(bytes.buffer,'ultra');assert.equal(mesh.texture.width,4096);assert.equal(mesh.texture.pixels.buffer,bytes.buffer);assert.equal(mesh.texture.pixels.length,4096*4096*4);
});
test('smooth normals average shared vertices and keep degenerate triangles finite',()=>{
 const n=smoothNormals({positions:new Float32Array([0,0,0,1,0,0,0,1,0,0,0,1]),indices:new Uint32Array([0,1,2,0,3,1])});
 assert.ok(n[1]>0&&n[2]>0);assert.ok(Math.abs(Math.hypot(n[0],n[1],n[2])-1)<1e-6);
 assert.ok([...smoothNormals({positions:new Float32Array(9),indices:new Uint32Array([0,1,2])})].every(Number.isFinite));
});
test('chunk transfer assembles exact model data and stops after the dialog closes',async()=>{
 const original=Buffer.from(triangle());let calls=0;
 const request=async(name,payload)=>{
  calls++;if(name.endsWith('previewModel'))return{ok:true,ticket:'1',bytes:original.length};
  return{ok:true,offset:payload.offset,data:original.subarray(payload.offset,payload.offset+17).toString('base64')};
 };
 assert.deepEqual(Buffer.from(await fetchPreview(request,'0000000F',()=>true)),original);
 assert.equal(calls,5);calls=0;
 await assert.rejects(fetchPreview(request,'0000000F',()=>false),/closed/);assert.equal(calls,1);
});
test('chunk transfer rejects non-progress, wrong offsets and oversized metadata',async()=>{
 for(const chunk of [{ok:true,offset:0,data:''},{ok:true,offset:1,data:'AA=='}]){
  await assert.rejects(fetchPreview(async name=>name.endsWith('previewModel')?{ok:true,ticket:'1',bytes:12}:chunk,'0000000F',()=>true));
 }
 await assert.rejects(fetchPreview(async()=>({ok:true,ticket:'1',bytes:70000000}),'0000000F',()=>true),/invalid model response/);
});
test('compressed model transfer retries a timed-out chunk and preserves selected quality',async()=>{
 const raw=Buffer.from(triangle()),compressed=deflateSync(raw);let chunks=0;
 const result=await fetchPreview(async(name,payload)=>{
  if(name.endsWith('previewModel')){assert.equal(payload.quality,'low');return{ok:true,ticket:'compressed',bytes:compressed.length,compression:'deflate',decodedBytes:raw.length};}
  if(++chunks===1)throw new Error('chunk timeout');assert.ok(payload.maxBytes<=32768);return{ok:true,offset:0,data:compressed.toString('base64')};
 },'0000000F',()=>true,false,'low');
 assert.deepEqual(Buffer.from(result),raw);assert.equal(chunks,2);
});

test('quality canvas caps preserve wide and tall proportions',()=>{
 for(const [w,h] of [[2400,700],[700,2400],[1280,720]])for(const limit of [512,1024,4096]){
 const size=previewCanvasSize(w,h,2,limit);
 assert.ok(size.width<=limit&&size.height<=limit);
 assert.ok(Math.abs(size.width/size.height-w/h)<.02);
 }
});

test('every category defaults to a standalone preview',()=>{
 for(const label of ['Homesteader Scout Hat','Batball Cap','Mantis Space Helmet','Sanctum Priest Headwear','Spacesuit Armada Backpack','Mantis Pack'])assert.equal(defaultPreviewMannequin('ARMO',label),false);
 for(const category of ['Helmets','Packs'])assert.equal(defaultPreviewMannequin('ARMO','Unusual item',category),false);
 assert.equal(defaultPreviewMannequin('ARMO','Green Neocity Formwear','Apparel'),false);
 assert.equal(defaultPreviewMannequin('ARMO','Mantis Spacesuit','Suits'),false);
 assert.equal(defaultPreviewMannequin('ALCH','Trauma Pack'),false);
});

test('material transfer keeps glass and shared normal maps with validated references',()=>{
 const bytes=new Uint8Array(144);bytes.set(new Uint8Array(triangle()));const v=new DataView(bytes.buffer);
 v.setUint32(4,5,true);v.setUint32(68,4,true);v.setUint32(72,1,true);for(const at of [76,80,84])v.setFloat32(at,1,true);v.setUint32(88,2,true);
 v.setUint32(116,2,true);v.setUint32(120,1,true);v.setUint32(124,1,true);bytes.set([100,125,140,90],128);v.setUint32(132,1,true);v.setUint32(136,1,true);bytes.set([127,127,255,255],140);
 const [mesh]=decodePreview(bytes.buffer);assert.equal(mesh.glass,true);assert.deepEqual([...mesh.normalTexture.pixels],[127,127,255,255]);assert.equal(previewAlphaMode(mesh.texture.pixels),'blend');
 v.setUint32(88,3,true);assert.throws(()=>decodePreview(bytes.buffer),/normal texture reference/);
});

test('workshop and ship assembly types expose previews without enabling unrelated forms',()=>{
 for(const type of ['FURN','STAT','MSTT','ACTI','CONT','DOOR','GBFM','PKIN','COBJ'])assert.equal(canPreviewModel({value:'0003059B',label:'Build object',type},true),true);
 assert.equal(canPreviewModel({value:'0003059B',label:'Build object',type:'GBFM'},false),false);
 assert.equal(canPreviewModel({value:'0003059B',label:'Quest',type:'QUST'},true),false);
});
test('model transfer pipelines two small bounded ranges and accepts out-of-order replies',async()=>{
 const bytes=Buffer.alloc(300000);for(let i=0;i<bytes.length;++i)bytes[i]=i%251;let pending=0,peak=0;
 const result=await fetchPreview(async(name,p)=>{if(name.endsWith('previewModel'))return{ok:true,ticket:'parallel',bytes:bytes.length};assert.ok(p.maxBytes<=32768);peak=Math.max(peak,++pending);await new Promise(resolve=>setTimeout(resolve,p.offset===0?8:1));--pending;return{ok:true,offset:p.offset,data:bytes.subarray(p.offset,p.offset+p.maxBytes).toString('base64')};},'00000001',()=>true);
 assert.deepEqual(Buffer.from(result),bytes);assert.equal(peak,2);
});

test('geometry-first requests explicitly omit expensive textures',async()=>{
 const data=Buffer.from(triangle());let payload;
 await fetchPreview(async(name,p)=>{if(name.endsWith('previewModel')){payload=p;return{ok:true,ticket:'basic',bytes:data.length};}return{ok:true,offset:p.offset,data:data.toString('base64')};},'00000001',()=>true,false,'high','male',true);
 assert.equal(payload.stage,'geometry');assert.equal(payload.quality,'high');
});

test('version six keeps decal metadata separate from glass and rejects unknown flags',()=>{
 const bytes=new Uint8Array(120);bytes.set(new Uint8Array(triangle()));const v=new DataView(bytes.buffer);v.setUint32(4,6,true);v.setUint32(68,8,true);
 const [mesh]=decodePreview(bytes.buffer);assert.equal(mesh.decal,true);assert.equal(mesh.glass,false);
 v.setUint32(68,16,true);assert.throws(()=>decodePreview(bytes.buffer),/texture/);
});


test('failed transfer shrinks retries and drains outstanding replies before returning',async()=>{
 const bytes=Buffer.alloc(70000);let pending=0;const sizes=[];
 await assert.rejects(fetchPreview(async(name,p)=>{
  if(name.endsWith('previewModel'))return{ok:true,ticket:'retry',bytes:bytes.length};
  if(p.offset===0){sizes.push(p.maxBytes);throw new Error('simulated timeout');}
  ++pending;await new Promise(resolve=>setTimeout(resolve,20));--pending;
  return{ok:true,offset:p.offset,data:bytes.subarray(p.offset,p.offset+p.maxBytes).toString('base64')};
 },'00000001',()=>true),/simulated timeout/);
 assert.deepEqual(sizes,[32768,16384,8192]);assert.equal(pending,0);
});


test('supported mod assets expose previews in ordinary mode with full, medium and small runtime IDs',()=>{
 for(const value of ['05001234','FD020123','FE005ABC'])for(const type of ['WEAP','ARMO','MISC','FURN','STAT','GBFM'])assert.equal(canPreviewModel({source:'mod',value,type,label:'Mod asset'},false),true);
 for(const type of ['QUST','BOOK','NPC_'])assert.equal(canPreviewModel({source:'mod',value:'05001234',type,label:'No model'},false),false);
 assert.equal(canPreviewModel({source:'mod',available:false,value:'05001234',type:'WEAP',label:'Not loaded'},false),false);
});


test('version seven carries incomplete material metadata and rejects unknown flags',()=>{
 const bytes=new Uint8Array(120);bytes.set(new Uint8Array(triangle()));const v=new DataView(bytes.buffer);v.setUint32(4,7,true);v.setUint32(68,16,true);
 assert.equal(decodePreview(bytes.buffer)[0].incompleteMaterial,true);
 v.setUint32(68,32,true);assert.throws(()=>decodePreview(bytes.buffer),/texture/);
 v.setUint32(4,6,true);v.setUint32(68,16,true);assert.throws(()=>decodePreview(bytes.buffer),/texture/);
});


test('version eight carries only valid normal-only overlays while older packets retain their flag limits',()=>{
 const bytes=new Uint8Array(144);bytes.set(new Uint8Array(triangle()));const v=new DataView(bytes.buffer);
 for(const [at,n]of[[4,8],[68,40],[72,1],[88,2],[116,2],[120,1],[124,1],[132,1],[136,1]])v.setUint32(at,n,true);
 bytes.set([255,255,255,180],128);bytes.set([127,127,255,166],140);
 assert.equal(decodePreview(bytes.buffer)[0].normalOnly,true);
 v.setUint32(4,7,true);assert.throws(()=>decodePreview(bytes.buffer),/texture/);
 v.setUint32(4,8,true);v.setUint32(88,0,true);assert.throws(()=>decodePreview(bytes.buffer),/normal-only/);
 v.setUint32(88,2,true);v.setUint32(68,32,true);assert.throws(()=>decodePreview(bytes.buffer),/normal-only/);
});


test('Ultra rendering has a bounded pixel budget while preserving display proportions',()=>{
 const size=previewCanvasSize(3440,1440,4,8192,24*1024*1024);
 assert.ok(size.width*size.height<=24*1024*1024+size.width+size.height);assert.ok(size.width<=8192);assert.ok(Math.abs(size.width/size.height-3440/1440)<.002);
});

test('Ultra transport accepts compressed full-resolution payloads above the normal 64 MiB limit',async()=>{
 const raw=Buffer.alloc(64*1024*1024+16),compressed=deflateSync(raw);let requested;
 const request=async(name,p)=>{if(name.endsWith('previewModel')){requested=p;return{ok:true,ticket:'ultra',bytes:compressed.length,decodedBytes:raw.length,compression:'deflate'};}return{ok:true,offset:p.offset,data:compressed.subarray(p.offset,p.offset+p.maxBytes).toString('base64')};};
 await assert.rejects(fetchPreview(request,'00000001',()=>true,false,'high'),/compressed model response/);
 const buffer=await fetchPreview(request,'00000001',()=>true,false,'ultra');assert.equal(buffer.byteLength,raw.length);assert.equal(requested.quality,'ultra');assert.equal(new Uint8Array(buffer).at(-1),0);
});
