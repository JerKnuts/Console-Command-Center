import test from 'node:test';
import assert from 'node:assert/strict';
import {reportExportChunks,exportReportText} from '../src/views/console.command-center/main/report-export.ts';

test('large Unicode reports transfer under the WebView 64 KiB limit and finish as one exact document',async()=>{
 const content='a'.repeat(8191)+'😀\r\n'+('报告 😀 "quoted" \\ tab\t\u0001\r\n'.repeat(9000));
 assert.ok(Buffer.byteLength(content)>65536);const chunks=reportExportChunks(content);assert.equal(chunks.join(''),content);
 for(const chunk of reportExportChunks('\u0001'.repeat(100000)))assert.ok(Buffer.byteLength(JSON.stringify({name:'console.command-center.devFeedbackExport',payload:{action:'append',upload:'token',index:100,content:chunk}}))<65536);
 let received='',next=0,finished=false;
 const path=await exportReportText(async(name,payload)=>{
  assert.ok(Buffer.byteLength(JSON.stringify({type:'request',requestId:999999,name,payload}))<65536);
  if(payload.action==='begin'){assert.equal(payload.bytes,Buffer.byteLength(content));return {ok:true,upload:'token'};}
  assert.equal(payload.upload,'token');
  if(payload.action==='append'){assert.equal(payload.index,next);assert.equal(JSON.parse(JSON.stringify(payload)).content,payload.content);assert.ok(!/[\uD800-\uDBFF]$/.test(payload.content));received+=payload.content;return {ok:true,next:++next};}
  assert.equal(payload.action,'finish');assert.equal(received,content);finished=true;return {ok:true,path:'report.txt'};
 },content);
 assert.equal(path,'report.txt');assert.ok(finished);assert.ok(next>1);
});

test('interrupted uploads and failed file writes cancel without reporting success',async()=>{
 for(const failure of ['append','finish']){
  const actions=[];
  await assert.rejects(exportReportText(async(name,payload)=>{
   actions.push(payload.action);
   if(payload.action==='begin')return {ok:true,upload:'token'};
   if(payload.action===failure)throw Error('test failure');
   return payload.action==='append'?{ok:true,next:payload.index+1}:{ok:true};
  },'Report\r\n'),/test failure/);
  assert.equal(actions.at(-1),'cancel');
 }
});

test('oversized reports are rejected before upload and malformed replies never count as saved',async()=>{
 await assert.rejects(exportReportText(()=>assert.fail('must not send'),'中'.repeat(1500000)),/4 MB/);
 await assert.rejects(exportReportText(async()=>({ok:true,path:'old-plugin.txt'}),'Report'),/matching CCC DLL/);
});
