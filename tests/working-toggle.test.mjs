import test from 'node:test';
import assert from 'node:assert/strict';
import {installDevFeedback,devFeedbackRow,devFeedbackCommandOutcome,devFeedbackCommandCategory,devFeedbackTestedClass} from '../src/views/console.command-center/main/dev-feedback.ts';
import {CONFIRMED_READOUT_COMMANDS} from '../src/views/console.command-center/main/confirmed-readout-commands.ts';

test('all 25 revised commands start without a shipped Working designation',()=>{
 assert.equal(CONFIRMED_READOUT_COMMANDS.length,25);
 for(const card of CONFIRMED_READOUT_COMMANDS)assert.notEqual(card.testStatus,'verified',card.title);
});

test('Working toggles off, persists through restart/export, and can be marked again without losing notes',async()=>{
 const record={kind:'Command',name:'Get Level',id:'engine-getlevel-627',category:'Player',alreadyTested:true};
 const note={...record,status:'Working',comment:'Keep this earlier note',time:'2025-01-01T00:00:00Z',version:'old'};
 const storage=new Map([['ccc.dev-feedback.v1',JSON.stringify([note])]]);
 let toggle,click,exportClick,exported='';
 const dot={classList:{toggle(){}},setAttribute(){},addEventListener:(_n,f)=>toggle=f};
 const exportButton={disabled:false,addEventListener:(_n,f)=>exportClick=f};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 globalThis.document={querySelector:s=>s==='#dev-mode-dot'?dot:s==='#dev-feedback-export'?exportButton:null,addEventListener:(_n,f)=>click=f};
 const install=()=>installDevFeedback({version:'test',rerender(){},status(){},exportText:async text=>{exported=text;return 'test.txt';}});
 const mode=()=>{for(let i=0;i<5;i++)toggle();};
 const working=()=>click({target:{closest:()=>({dataset:{devRecord:JSON.stringify(record),devAction:'Working'}})}});
 try {
  install();mode();
  assert.match(devFeedbackRow('',record),/data-dev-action="Working" aria-pressed="true"/);
  working();
  assert.equal(devFeedbackCommandOutcome(record.id),'unreviewed');
  assert.equal(devFeedbackTestedClass(record,true),'');
  assert.ok(!JSON.parse(storage.get('ccc.dev-tested.v1')).includes('Command:'+record.id));
  assert.match(devFeedbackRow('',record),/data-dev-action="Working" aria-pressed="false"/);
  assert.ok(JSON.parse(storage.get('ccc.dev-feedback.v1')).some(r=>r.comment===note.comment));
  mode();install();mode();
  assert.equal(devFeedbackTestedClass(record,true),'');
  assert.equal(devFeedbackCommandCategory(record.id),'Player');
  assert.ok(!JSON.parse(storage.get('ccc.dev-tested.v1')).includes('Command:'+record.id));
  await exportClick();assert.match(exported,/Keep this earlier note/);assert.match(exported,/Result: Unreviewed/);
  mode();install();mode();assert.equal(devFeedbackTestedClass(record,true),'');
  working();assert.equal(devFeedbackCommandOutcome(record.id),'working');assert.equal(devFeedbackTestedClass(record,true),' dev-tested dev-working');
  working();assert.equal(devFeedbackTestedClass(record,true),'');
 } finally {mode();delete globalThis.document;delete globalThis.localStorage;}
});
