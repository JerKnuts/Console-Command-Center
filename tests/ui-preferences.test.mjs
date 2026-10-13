import test from 'node:test';
import assert from 'node:assert/strict';
import {parseUiPreferences,uiPreferences,installUiSettings,visibleIdCategory,visibleIdRecord,visibleQuestRecord,visibleCommandRecord} from '../src/views/console.command-center/main/ui-preferences.ts';
import {reviewedReferenceNote,applyReviewedFindings} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
test('basic preferences hide advanced categories and records while preserving ordinary content',()=>{
 assert.deepEqual(parseUiPreferences(null),{advanced:false,theme:'dark'});
 assert.deepEqual(parseUiPreferences({advanced:'true',theme:'other'}),{advanced:false,theme:'dark'});
 for(const category of ['cells','ship-parts','game-settings']){assert.equal(visibleIdCategory(category,false),false);assert.equal(visibleIdCategory(category,true),true);}
 assert.equal(visibleIdCategory('locations',false),true);
 assert.equal(visibleIdRecord({type:'CELL',category:'Cells'},false),false);
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
 assert.deepEqual(JSON.parse(saved),{advanced:true,theme:'light'});
 assert.equal(document.documentElement.dataset.cccTheme,'light');assert.equal(changed,2);
 handlers.get('close')();assert.equal(removed,true);
 uiPreferences.advanced=false;uiPreferences.theme='dark';
 delete globalThis.document;delete globalThis.localStorage;
});
