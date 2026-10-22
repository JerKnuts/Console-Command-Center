import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import {installDevFeedback,devFeedbackIdReference,devFeedbackTestedClass} from '../src/views/console.command-center/main/dev-feedback.ts';
import {visibleIdRecord} from '../src/views/console.command-center/main/ui-preferences.ts';
import {orderIdEntries} from '../src/views/console.command-center/main/id-record-order.ts';
import {reviewedReferenceNote} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
import {armorReferenceNote} from '../src/views/console.command-center/main/armor-test-findings.ts';
import {ammoReferenceNote} from '../src/views/console.command-center/main/ammo-test-findings.ts';

test('Working clears a shipped reference restriction across actions, visibility, sorting, export and restart',async()=>{
 const storage=new Map();let toggle,click,exportClick;let text='';
 const dot={classList:{toggle(){}},setAttribute(){},addEventListener:(n,f)=>toggle=f};
 const exportButton={disabled:false,addEventListener:(n,f)=>exportClick=f};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 globalThis.document={querySelector:s=>s==='#dev-mode-dot'?dot:s==='#dev-feedback-export'?exportButton:null,addEventListener:(n,f)=>{if(n==='click')click=f;}};
 const install=()=>installDevFeedback({version:'test',rerender(){},status(){},exportText:async t=>{text=t;return 'report.txt';}});
 const entry={label:'Test armor',type:'ARMO',category:'Spacesuits',value:'0019228E',localFormId:'19228E',plugin:'Starfield.esm',referenceOnly:true};
 const record={kind:'ID',name:entry.label,id:entry.value,localId:entry.localFormId,source:entry.plugin,referenceOnly:true};
 const result=status=>click({target:{closest:()=>({dataset:{devRecord:JSON.stringify(record),devAction:status}})}});
 const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
 const context=vm.createContext({devFeedbackIdReference,reviewedReferenceNote,armorReferenceNote,ammoReferenceNote,uiPreferences:{advanced:false},visibleIdRecord,orderIdEntries,activeIdBrowserCategory:()=>({builtInCategories:['*']}),modCatalogs:[],idBrowserCategory:'all',activeCatalogPicker:null,idCatalog:[entry],activeView:'id-browser',idBrowserRecordTypeFilter:'',query:'',idBrowserTextMatches:()=>true});
 vm.runInContext(stripTypeScriptTypes(source.match(/^function idBrowserAction\b[\s\S]*?^}/m)[0]+'\n'+source.match(/^function matchingIds\b[\s\S]*?^}/m)[0]),context);
 try {
  install();for(let i=0;i<5;i++)toggle();
  assert.equal(visibleIdRecord(entry,false),false);assert.equal(context.idBrowserAction(entry),null);
  result('Working');
  assert.equal(devFeedbackIdReference(entry),false);assert.equal(visibleIdRecord(entry,false),true);assert.equal(context.idBrowserAction(entry),'additem');assert.equal(context.matchingIds().length,1);
  assert.equal(devFeedbackTestedClass(record),' dev-tested dev-working');
  assert.equal(orderIdEntries([entry,{...entry,label:'Z normal',value:'00000001',localFormId:'000001',referenceOnly:false}])[0],entry);
  assert.equal(devFeedbackIdReference({...entry,plugin:'Other.esm'}),undefined);
  assert.equal(devFeedbackIdReference({...entry,value:'0919228E'}),false);
  await exportClick();assert.match(text,/Result: Working/);assert.match(text,/clear Reference Only/);
  for(let i=0;i<5;i++)toggle();install();for(let i=0;i<5;i++)toggle();
  assert.equal(visibleIdRecord(entry,false),true);assert.equal(context.idBrowserAction(entry),'additem');assert.equal(context.matchingIds().length,1);
  result('Reference Only');assert.equal(visibleIdRecord(entry,false),false);assert.equal(context.idBrowserAction(entry),null);
  result('Working');assert.equal(visibleIdRecord(entry,false),true);
 } finally {for(let i=0;i<5;i++)toggle();delete globalThis.document;delete globalThis.localStorage;}
});
