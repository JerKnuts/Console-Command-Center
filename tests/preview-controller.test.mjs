import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewController} from '../src/views/console.command-center/main/preview-controller.ts';

const rounded=calls=>calls.map(call=>call.map(value=>typeof value==='number'?Math.round(value*1e8)/1e8||0:value));
function fixture(lighting=true){
 const calls=[];const actions=Object.fromEntries(['mannequin','body','textures','close','quality','mode','pan','rotate','zoom','light','brightness'].map(name=>[name,(...args)=>calls.push([name,...args])]));
 const pad=createPreviewController({...actions,lightingAvailable:()=>lighting});
 const button=(id,down=true)=>pad.handle({kind:'button',button:{id,down}});
 const axes=(lx=0,ly=0,rx=0,ry=0)=>pad.handle({kind:'stick',axes:{lx,ly,rx,ry}});
 return{pad,calls,button,axes};
}
test('preview controller maps bumpers and textures directly and ignores held repeats',()=>{
 const f=fixture();for(const id of [0x100,0x200,0x4000]){f.button(id);f.button(id);f.button(id,false);}
 assert.deepEqual(f.calls,[['mannequin'],['body'],['textures']]);
 f.button(1);f.button(0x1000);assert.equal(f.calls.length,3);
});
test('preview sticks pan and rotate continuously with a dead zone and frame-rate-independent speed',()=>{
 const f=fixture();f.axes(.1,-.1,.15,0);f.pad.step(.02);assert.deepEqual(f.calls,[]);
 f.axes(1,1,-1,-1);f.pad.step(.02);assert.deepEqual(rounded(f.calls),[['pan',8,-8],['rotate',-.036,.036]]);
 f.pad.reset();f.pad.step(.02);assert.equal(f.calls.length,2);
 f.axes(NaN,Infinity,0,0);f.pad.step(.02);assert.equal(f.calls.length,2);
});
test('preview triggers zoom while held, cancel each other and stop on release',()=>{
 const f=fixture();f.button(0xA);f.pad.step(.05);assert.ok(f.calls[0][1]>1);
 f.button(0x9);f.pad.step(.05);assert.equal(f.calls.length,1);
 f.button(0xA,false);f.pad.step(.05);assert.ok(f.calls[1][1]<1);
 f.button(0x9,false);f.pad.step(.05);assert.equal(f.calls.length,2);
});
test('native analog triggers work without any raw trigger button events',()=>{
 const f=fixture();const analog=(lt,rt)=>f.pad.handle({kind:'triggers',axes:{lt,rt}});
 analog(.1,0);f.pad.step(.05);assert.deepEqual(f.calls,[]);
 analog(0,.5);f.pad.step(.05);const gradual=f.calls.at(-1)[1];assert.ok(gradual>1);
 analog(0,1);f.pad.step(.05);assert.ok(f.calls.at(-1)[1]>gradual);
 analog(1,0);f.pad.step(.05);assert.ok(f.calls.at(-1)[1]<1);
 analog(1,1);const count=f.calls.length;f.pad.step(.05);assert.equal(f.calls.length,count);
 analog(0,0);f.pad.step(.05);assert.equal(f.calls.length,count);
});
test('native trigger input expires, resets and cannot zoom while choosing quality',()=>{
 const f=fixture();f.pad.handle({kind:'triggers',axes:{lt:0,rt:1}});f.pad.step(.05);const count=f.calls.length;
 f.pad.step(.4);assert.equal(f.calls.length,count);
 f.pad.handle({kind:'triggers',axes:{lt:0,rt:1}});f.pad.reset();f.pad.step(.05);assert.equal(f.calls.length,count);
 f.button(0x8000);f.pad.handle({kind:'triggers',axes:{lt:0,rt:1}});const before=f.calls.length;f.pad.step(.05);assert.equal(f.calls.length,before);
 f.pad.handle({kind:'triggers',axes:{lt:NaN,rt:Infinity}});f.button(0x2000);f.pad.step(.05);assert.equal(f.calls.at(-1)[0],'quality');
});
test('quality chooser consumes navigation and B without closing the preview or moving the object',()=>{
 const f=fixture();f.button(0x8000);f.button(2);f.axes(0,-1);f.axes(0,-1);f.pad.step(.05);
 assert.deepEqual(f.calls,[['quality',true],['quality',true,1],['quality',true,1]]);
 f.button(0x1000);assert.deepEqual(f.calls.at(-1),['quality',false,0,true]);
 f.button(0x8000,false);f.button(0x8000);f.button(0x2000);assert.deepEqual(f.calls.at(-1),['quality',false]);
 f.button(0x2000,false);f.button(0x2000);assert.deepEqual(f.calls.at(-1),['close']);
});
test('stick clicks switch light and brightness modes without losing right-stick rotation',()=>{
 const f=fixture();f.button(0x80);f.axes(1,1,1,0);f.pad.step(.05);
 assert.deepEqual(f.calls[0],['mode','light']);assert.deepEqual(rounded(f.calls)[1],['light',6.5,-6.5]);assert.equal(f.calls[2][0],'rotate');
 f.button(0x40);f.pad.step(.05);assert.deepEqual(f.calls[3],['mode','brightness']);assert.deepEqual(rounded(f.calls)[4],['brightness',.06]);
 f.button(0x40,false);f.button(0x40);assert.deepEqual(f.calls.at(-1),['mode','object']);
 const low=fixture(false);low.button(0x40);low.button(0x80);low.axes(1);low.pad.step(.02);assert.deepEqual(rounded(low.calls),[['pan',8,0]]);
});
