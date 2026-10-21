import test from 'node:test';
import assert from 'node:assert/strict';
import {parseUiPreferences,setPreviewResolution,uiPreferences,installUiSettings,visibleIdCategory,visibleIdRecord,visibleQuestRecord,visibleCommandRecord} from '../src/views/console.command-center/main/ui-preferences.ts';
import {reviewedReferenceNote,applyReviewedFindings} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
test('preview quality defaults high and preserves only supported saved choices',()=>{
 assert.equal(parseUiPreferences({advanced:true,theme:'dark'}).previewResolution,'high');
 for(const previewResolution of ['low','medium','high','ultra'])assert.equal(parseUiPreferences({previewResolution}).previewResolution,previewResolution);
 assert.equal(parseUiPreferences({previewResolution:'invalid'}).previewResolution,'high');assert.equal(parseUiPreferences({previewResolution:'ultra'}).previewResolution,'ultra');
});
test('basic preferences hide advanced categories and records while preserving ordinary content',()=>{
 assert.deepEqual(parseUiPreferences(null),{advanced:false,theme:'dark',previewResolution:'high'});
 assert.deepEqual(parseUiPreferences({advanced:'true',theme:'other'}),{advanced:false,theme:'dark',previewResolution:'high'});
 for(const category of ['locations','ship-parts','game-settings']){assert.equal(visibleIdCategory(category,false),false);assert.equal(visibleIdCategory(category,true),true);}
 assert.equal(visibleIdCategory('cells',false),true);
 assert.equal(visibleIdRecord({type:'CELL',category:'Cells'},false),true);
 assert.equal(visibleIdRecord({type:'GBFM',category:'Ship Parts & Other Forms'},false),false);
 assert.equal(visibleIdRecord({type:'GBFM',category:'Ships'},false),true);
 assert.equal(visibleIdRecord({type:'ARMO',category:'Apparel',referenceOnly:true},false),false);
 assert.equal(visibleIdRecord({type:'ARMO',category:'Apparel',referenceOnly:true},true),true);
 assert.equal(visibleIdRecord({type:'AMMO',category:'Ammo',referenceOnly:false},false),true);
 assert.equal(visibleQuestRecord({category:'Internal / System',internal:true},false),false);
 assert.equal(visibleQuestRecord({category:'Main Quests',internal:false},false),true);
 assert.equal(visibleCommandRecord({category:'Untested'},false),false);
 assert.equal(visibleCommandRecord({category:'World'},false),true);
});
test('exported findings use exact plugin/local IDs and correct the working pack name',()=>{
 const r={label:'Beanie',value:'0025021C',plugin:'Starfield.esm',localFormId:'25021C'};
 assert.equal(applyReviewedFindings(r).referenceOnly,true);
 assert.equal(reviewedReferenceNote({...r,plugin:'Other.esm'}),null);
 assert.equal(applyReviewedFindings({...r,label:'Cydonia',value:'0003B423',localFormId:'03B423'}).label,'Cydonia Pack');
 assert.ok(reviewedReferenceNote({...r,value:'010CD168',localFormId:'0CD168',plugin:'ShatteredSpace.esm'}));
});
test('Settings popup toggles persist advanced and theme selections',()=>{
 const handlers=new Map(); const events=new Map();let saved='';let changed=0;let removed=false;
 const control=name=>({textContent:'',setAttribute(){},addEventListener:(event,fn)=>handlers.set(name,fn)});
 const advanced=control('advanced');const theme=control('theme');const close=control('close');
 const dialog={className:'',innerHTML:'',setAttribute(){},showModal(){},remove(){removed=true;},addEventListener:(event,fn)=>events.set(event,fn),close(){events.get('close')();},querySelector:s=>s.includes('advanced')?advanced:s.includes('theme')?theme:close};
 const opener={addEventListener:(event,fn)=>handlers.set('open',fn),focus(){}};
 globalThis.document={documentElement:{dataset:{}},querySelector:s=>s==='#open-settings'?opener:null,createElement:()=>dialog,body:{append(){}}};
 globalThis.localStorage={setItem:(k,v)=>saved=v};
 uiPreferences.advanced=false;uiPreferences.theme='dark';
 installUiSettings({changed:()=>changed++,status(){}});
 handlers.get('open')();handlers.get('advanced')();handlers.get('theme')();
 assert.deepEqual(JSON.parse(saved),{advanced:true,theme:'light',previewResolution:'high'});
 assert.equal(document.documentElement.dataset.cccTheme,'light');assert.equal(changed,2);
 handlers.get('close')();assert.equal(removed,true);
 uiPreferences.advanced=false;uiPreferences.theme='dark';
 delete globalThis.document;delete globalThis.localStorage;
});

test('viewer quality updates shared settings and persists the same preference',()=>{
 let saved;const states={};globalThis.localStorage={setItem:(k,v)=>saved=JSON.parse(v)};
 globalThis.document={querySelectorAll:()=>['low','medium','high','ultra'].map(q=>({dataset:{previewQuality:q},setAttribute:(k,v)=>states[q]=v,classList:{toggle(){}}}))};
 try{for(const q of ['low','medium','high','ultra']){
 assert.equal(setPreviewResolution(q),true);assert.equal(uiPreferences.previewResolution,q);assert.equal(saved.previewResolution,q);
 for(const key of Object.keys(states))assert.equal(states[key],String(key===q));
 }}finally{uiPreferences.previewResolution='high';delete globalThis.document;delete globalThis.localStorage;}
});


test('location records are reference only across all plugins while cells stay ordinary',()=>{
 for(const plugin of ['Starfield.esm','ShatteredSpace.esm','OtherMod.esm']){
  const row=applyReviewedFindings({label:'Area',type:'LCTN',category:'Locations',value:'01000123',plugin});
  assert.equal(row.referenceOnly,true);assert.match(row.detail,/Reference Only/);
  assert.equal(visibleIdRecord(row,false),false);assert.equal(visibleIdRecord(row,true),true);
 }
 assert.equal(visibleIdRecord({type:'LCTN',category:'Locations'},false),false);
 assert.equal(applyReviewedFindings({label:'Room',type:'CELL',category:'Cells',value:'01000123'}).referenceOnly,undefined);
});
