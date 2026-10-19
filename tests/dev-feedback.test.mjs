import test from 'node:test';
import assert from 'node:assert/strict';
import {formatDevFeedback,devFeedbackButton,installDevFeedback,devFeedbackResults,devFeedbackExportable} from '../src/views/console.command-center/main/dev-feedback.ts';
import {armorReferenceNote,applyArmorFindings} from '../src/views/console.command-center/main/armor-test-findings.ts';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
test('tested armor is reference-only and restrictions do not cross plugin ownership',()=>{
 const record={label:'Ankylosaurus',type:'ARMO',value:'001EB731'};
 const reviewed=applyArmorFindings(record);
 assert.equal(reviewed.referenceOnly,true);
 assert.ok(/reference only/.test(reviewed.detail));
 assert.deepEqual(applyArmorFindings(reviewed),reviewed);
 assert.equal(armorReferenceNote({...record,plugin:'Other.esm'}),null);
 assert.equal(armorReferenceNote({...record,type:'WEAP'}),null);
});
test('feedback export preserves record identity, all results, Unicode and multiline comments',()=>{
 const text=formatDevFeedback([{kind:'ID',name:'Test armor',id:'001EB731',localId:'1EB731',source:'Starfield.esm',category:'Armor',command:'player.additem 001EB731 1',version:'1.2.31',time:'2026-10-12T00:00:00Z',status:'Not working',comment:'No item\nTried twice â€” same result.'},{kind:'Quest',name:'Test quest',version:'1.2.31',time:'now',status:'',comment:'Need to retry'}]);
 for(const value of ['ID: 001EB731','Local ID: 1EB731','Source: Starfield.esm','Not working','Tried twice â€” same result.','Comment only','Report 2']) assert.ok(text.includes(value));
});
test('five clicks toggle Dev Mode and export uses the persisted report collection',async()=>{
 const events=new Map(); const exportEvents=new Map();let rendered=0;let exported='';
 const dot={addEventListener:(name,fn)=>events.set(name,fn),classList:{toggle(){}},setAttribute(){}};
 const button={hidden:true,disabled:false,addEventListener:(name,fn)=>exportEvents.set(name,fn)};
 const report={kind:'Command',name:'God Mode',version:'1.2.31',time:'now',status:'Working',comment:'OK'};
 globalThis.document={querySelector:s=>s==='#dev-mode-dot'?dot:s==='#dev-feedback-export'?button:null,addEventListener(){}};
 let saved=JSON.stringify([report]);
 globalThis.localStorage={getItem:k=>k==='ccc.dev-feedback.v1'?saved:null,setItem:(key,value)=>{if(key==='ccc.dev-feedback.v1')saved=value;}};
 assert.equal(devFeedbackButton({kind:'ID',name:'Test'}),'');
 installDevFeedback({version:'1.2.31',rerender:()=>rendered++,status(){},exportText:async t=>{exported=t;return 'file.txt';}});
 for(let i=0;i<4;i++) events.get('click')();
 assert.equal(rendered,0);assert.equal(button.hidden,true);
 events.get('click')();assert.equal(rendered,1);assert.equal(button.hidden,false);
 const escaped=devFeedbackButton({kind:'ID',name:'<test "quoted">'});
 assert.ok(escaped.includes('&lt;test'));
 assert.ok(escaped.includes('&quot;'));
 assert.ok(!escaped.includes('<test'));
 await exportEvents.get('click')();assert.ok(exported.includes('God Mode'));assert.equal(button.disabled,false);
 assert.deepEqual(JSON.parse(saved),[]);
 exported='';await exportEvents.get('click')();assert.equal(exported,'');
 for(let i=0;i<5;i++) events.get('click')();assert.equal(rendered,2);assert.equal(button.hidden,true);
 assert.equal(devFeedbackButton({kind:'ID',name:'Test'}),'');
 delete globalThis.document;delete globalThis.localStorage;
});

test('Settings sidebar has no counter and Escape closes a dev report without closing CCC',()=>{
 const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
 const functions=[...source.matchAll(/^function (\w+)\b[\s\S]*?^}/gm)].filter(m=>['sidebarCategoryButton','escapeHtml'].includes(m[1])).map(m=>m[0]);
 const context=vm.createContext({});vm.runInContext(stripTypeScriptTypes(functions.join('\n')),context);
 assert.doesNotMatch(context.sidebarCategoryButton('command','Advanced Settings','Advanced Settings',8705,false),/nav-count|8,705/);
 assert.match(context.sidebarCategoryButton('id','ammo','Ammo',66,false),/nav-count/);
 let closed=0;
 context.document={querySelector:()=>({close:()=>closed++})};
 context.resultsDialog={open:true,close:()=>assert.fail('Results must not close')};
 const body=source.match(/document.addEventListener\('keydown', \(event\) => \{([\s\S]*?)^\}\);/m)[1];
 vm.runInContext(stripTypeScriptTypes(`function key(event: KeyboardEvent){${body}}`),context);
 context.key({key:'Escape',preventDefault(){},stopPropagation(){}});
 assert.equal(closed,1);
});

test('popup saves selected status and comment while Cancel leaves saved reports unchanged',()=>{
 const dotEvents=new Map();const documentEvents=new Map();let saved='[]';let lastDialog;
 const dot={addEventListener:(n,f)=>dotEvents.set(n,f),classList:{toggle(){}},setAttribute(){}};
 const exportButton={addEventListener(){},hidden:true};
 const recordButton={dataset:{devRecord:JSON.stringify({kind:'ID',name:'Aceles',id:'00123456'})},isConnected:true,focus(){}};
 const makeDialog=()=>{
   const events=new Map();const formEvents=new Map();const cancelEvents=new Map();
   const resultEvents=new Map();
   const resultButtons=devFeedbackResults('ID').map(value=>({dataset:{devResult:value},addEventListener:(name,fn)=>resultEvents.set(value,fn),setAttribute(){},classList:{toggle(){}}}));
   const dialog={className:'',setAttribute(){},innerHTML:'',showModal(){},remove(){},addEventListener:(n,f)=>events.set(n,f),close(){events.get('close')?.();},querySelector(s){
     if(s==='form')return {addEventListener:(n,f)=>formEvents.set(n,f)};
     if(s==='[data-cancel-report]')return {addEventListener:(n,f)=>cancelEvents.set(n,f)};
     if(s==='input[name="result"]:checked')return {value:'Not working'};
     if(s==='textarea')return {value:'Tried twice\nNo inventory item'};
     if(s==='.dev-feedback-error')return {textContent:''};
     return null;
   },querySelectorAll:()=>resultButtons,formEvents,cancelEvents,resultEvents};return dialog;
 };
 globalThis.document={querySelector:s=>s==='#dev-mode-dot'?dot:s==='#dev-feedback-export'?exportButton:null,addEventListener:(n,f)=>documentEvents.set(n,f),createElement:()=>lastDialog=makeDialog(),body:{append(){}}};
 globalThis.localStorage={getItem:k=>k==='ccc.dev-feedback.v1'?saved:null,setItem:(k,v)=>{if(k==='ccc.dev-feedback.v1')saved=v;}};
 installDevFeedback({version:'1.2.31',rerender(){},status(){},exportText:async()=>''});
 for(let i=0;i<5;i++)dotEvents.get('click')();
 const click={target:{closest:()=>recordButton}};
 documentEvents.get('click')(click);
 lastDialog.resultEvents.get('Issues')();
 lastDialog.formEvents.get('submit')({preventDefault(){}});
 assert.equal(JSON.parse(saved)[0].status,'Issues');
 assert.equal(JSON.parse(saved)[0].comment,'Tried twice\nNo inventory item');
 assert.equal(JSON.parse(saved)[0].id,'00123456');
 documentEvents.get('click')(click);lastDialog.cancelEvents.get('click')();
 assert.equal(JSON.parse(saved).length,1);
 for(let i=0;i<5;i++)dotEvents.get('click')();
 delete globalThis.document;delete globalThis.localStorage;
});

test('item and command feedback offer distinct classifications with explicit export meanings',()=>{
 assert.ok(devFeedbackResults('ID').includes('Reference Only'));
 assert.ok(!devFeedbackResults('ID').includes('Executed (no effect)'));
 assert.deepEqual(devFeedbackResults('ID'),['Working','Issues','Reference Only']);
 assert.deepEqual(devFeedbackResults('Command'),['Working','Issues']);
 assert.ok(!devFeedbackResults('Command').includes('Reference Only'));
 assert.ok(!devFeedbackResults('Quest').includes('Reference Only'));
 const common={name:'Test',version:'1.2.33',time:'now',comment:''};
 const text=formatDevFeedback([{...common,kind:'ID',status:'Reference Only'},{...common,kind:'Command',status:'Executed (no effect)'}]);
 assert.ok(text.includes('Mark Reference Only, hide outside Advanced Options'));
 assert.ok(!text.includes('Nothing appeared in the player inventory'));
 assert.ok(text.includes('command executed, but no effect was observed'));
});

test('failed export keeps reports and a retry clears them only after saving',async()=>{
 const events=new Map();let saved=JSON.stringify([{kind:'ID',name:'Crewman Outfit',version:'1.2.36',time:'now',status:'Working',comment:'OK'}]);let fail=true;let calls=0;
 const button={disabled:false,addEventListener:(event,fn)=>events.set(event,fn)};
 globalThis.document={querySelector:s=>s==='#dev-feedback-export'?button:null,addEventListener(){}};
 globalThis.localStorage={getItem:k=>k==='ccc.dev-feedback.v1'?saved:null,setItem:(key,value)=>{if(key==='ccc.dev-feedback.v1')saved=value;}};
 installDevFeedback({version:'1.2.36',rerender(){},status(){},exportText:async()=>{calls++;if(fail)throw Error('disk error');return 'new-file.txt';}});
 await events.get('click')();assert.equal(JSON.parse(saved).length,1);assert.equal(button.disabled,false);
 fail=false;await events.get('click')();assert.deepEqual(JSON.parse(saved),[]);assert.equal(calls,2);
 await events.get('click')();assert.equal(calls,2);
 delete globalThis.document;delete globalThis.localStorage;
});


test('plain Working confirmations stay local while comments and issues remain exportable',()=>{
 const report={kind:'ID',name:'Example',version:'new',time:'now',status:'Working',comment:''};
 assert.equal(devFeedbackExportable(report),false);assert.equal(devFeedbackExportable({...report,comment:'   '}),false);
 assert.equal(devFeedbackExportable({...report,comment:'Useful detail'}),true);assert.equal(devFeedbackExportable({...report,status:'Issues'}),true);assert.equal(devFeedbackExportable({...report,status:'Reference Only'}),true);
 const output=formatDevFeedback([report,{...report,name:'Issue',status:'Issues'},{...report,name:'Working with comment',comment:'Extra detail'}]);
 assert.ok(!output.includes('Name: Example'));assert.ok(output.includes('Name: Issue'));assert.ok(output.includes('Working with comment'));assert.ok(output.includes('Report 2'));
});
