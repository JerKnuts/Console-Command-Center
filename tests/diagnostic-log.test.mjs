import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return next(s.startsWith('.')&&!/\.[a-z]+$/i.test(s)?s+'.ts':s,c);}});
const {createDiagnosticLog}=await import('../src/views/console.command-center/main/diagnostic-log.ts');
const {DIAGNOSTIC_TEST_CASES,runDiagnosticTest}=await import('../src/views/console.command-center/main/diagnostic-test.ts');

test('automatic diagnostic delivery is bounded, deduplicated and tolerates unavailable bridges',async()=>{
 const calls=[];const log=createDiagnosticLog(async(...args)=>{calls.push(args);throw Error('disconnected');},'1.4.3');
 log('item-resolution','owner=Missing.esm');log('item-resolution','owner=Missing.esm');
 assert.equal(calls.length,1);assert.equal(calls[0][0],'console.command-center.diagnostic');assert.equal(calls[0][1].uiVersion,'1.4.3');
 log('long','x'.repeat(9000));assert.equal(calls[1][1].detail.length,2048);
 for(let i=0;i<120;i++)log('error',String(i));assert.equal(calls.length,100);
 assert.doesNotThrow(()=>createDiagnosticLog(()=>{throw Error('missing bridge');},'test')('test','x'));
 await new Promise(resolve=>setTimeout(resolve,0));
});

test('all diagnostic scenarios exercise read-only requests and require native acknowledgement',async()=>{
 const calls=[],errors=[];
 const options={version:'1.4.3',error:message=>errors.push(message),request:async(name,payload)=>{
  calls.push({name,payload});
  if(name==='console.command-center.ping')return {ok:true,build:'1.4.3'};
  if(name==='console.command-center.inspectRecord')throw Error('Invalid Form ID.');
  if(name==='console.command-center.diagnostic'&&payload.event===42)throw Error('Invalid diagnostic fields.');
  if(name==='console.command-center.diagnostic')return {ok:true};
  throw Error('Unsafe or unexpected route: '+name);
 }};
 assert.equal(DIAGNOSTIC_TEST_CASES.length,14);
 for(const scenario of DIAGNOSTIC_TEST_CASES){const result=await runDiagnosticTest(scenario.id,options,'known-run');assert.equal(result.passed,true,scenario.id+': '+result.detail);assert.equal(result.logged,true);}
 const records=calls.filter(call=>call.payload.event==='test-case-result');
 assert.equal(records.length,14);assert.equal(new Set(records.map(call=>JSON.parse(call.payload.detail).case)).size,14);
 assert.ok(records.every(call=>JSON.parse(call.payload.detail).runId==='known-run'&&call.payload.detail.length<2048));
 assert.ok(errors.every(error=>error.startsWith('[DIAGNOSTIC TEST known-run/')));
 const offline=await runDiagnosticTest('native-rejection',{...options,request:async()=>{throw Error('unknown request');}},'offline');
 assert.equal(offline.passed,false);assert.equal(offline.logged,false);
 const missingAck=await runDiagnosticTest('base-fallback',{...options,request:async()=>({ok:false})},'no-ack');
 assert.equal(missingAck.logged,false);
});
