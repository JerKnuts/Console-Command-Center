import test from 'node:test';
import assert from 'node:assert/strict';
import {proposeAreaName,validAreaName} from '../src/views/console.command-center/main/area-identification.ts';
import {applyAreaNameOverride,commitAreaNameChange} from '../src/views/console.command-center/main/area-name-overrides.ts';
import {formatDevFeedback,devFeedbackOutcome} from '../src/views/console.command-center/main/dev-feedback.ts';
const record={kind:'ID',name:'AHPOI01Ext',id:'01070E19',localId:'070E19',source:'ShatteredSpace.esm',recordType:'CELL'};
const cell={id:'01070E19',editorId:'AHPOI01Ext',name:''};
const world={id:'010470CB',editorId:'SFBGS001DazraWorld',name:'Dazra'};
const location={id:'01001000',editorId:'ActualLocation',name:'Nearby Landmark'};
test('current-area proposal prefers the actual named location and exposes its scope',()=>{
 const p=proposeAreaName(record,{ok:true,cell,locations:[location],world});assert.equal(p.name,'Nearby Landmark');assert.equal(p.matches,true);assert.equal(p.basis,'Current location');assert.match(p.message,/several cells/);
 const parent=proposeAreaName(record,{ok:true,cell,locations:[{...location,name:''},location],world});assert.equal(parent.basis,'Parent location');
});
test('broader names retain the cell identifier and no missing name is invented',()=>{
 assert.equal(proposeAreaName(record,{ok:true,cell,locations:[],world}).name,'Dazra — AHPOI01Ext');
 assert.equal(proposeAreaName(record,{ok:true,cell:{...cell,name:'Named Cell'},locations:[],world}).name,'Named Cell');
 assert.equal(proposeAreaName(record,{ok:true,cell,locations:[],world:null}).name,'');
});
test('selected/current cell mismatch prevents a rename even when Editor IDs look alike',()=>{
 const p=proposeAreaName(record,{ok:true,cell:{...cell,id:'00070E19'},locations:[location],world});assert.equal(p.matches,false);assert.equal(p.name,'');
 assert.equal(proposeAreaName({...record,recordType:'LCTN'},{ok:true,cell,locations:[location],world}).matches,false);
 for(const value of ['', '   ', '???', 'Bad\nName', 'A'.repeat(161)])assert.equal(validAreaName(value),false);
 assert.equal(validAreaName('Dazra — Landmark'),true);
});
test('accepted names persist with an exportable report, retain searchable originals and survive export',async()=>{
 const saved=new Map();globalThis.localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
 const row={label:record.name,value:record.id,localFormId:record.localId,plugin:record.source,type:'CELL',keywords:['AHPOI01Ext']};
 const report={...record,version:'1.3.10',time:'now',status:'Name Change Accepted',comment:'Accepted',originalName:record.name,acceptedName:'Nearby Landmark',nameBasis:'Current location',area:{ok:true,cell,locations:[location],world}};
 const reports=commitAreaNameChange(row,report.acceptedName,[],report);assert.equal(reports.length,1);assert.equal(devFeedbackOutcome(report.status),'');
 const alias=applyAreaNameOverride(row);assert.equal(alias.label,'Nearby Landmark');assert.equal(alias.originalName,'AHPOI01Ext');assert.ok(alias.keywords.includes('AHPOI01Ext'));
 assert.equal(applyAreaNameOverride({...row,plugin:'Other.esm'}).label,'AHPOI01Ext');
 const text=formatDevFeedback(reports);for(const value of ['Original name: AHPOI01Ext','Accepted name: Nearby Landmark','Area evidence:',cell.id,location.id])assert.ok(text.includes(value));
 saved.set('ccc.dev-feedback.v1','[]');const reloaded=await import('../src/views/console.command-center/main/area-name-overrides.ts?reload-test');assert.equal(reloaded.applyAreaNameOverride(row).label,'Nearby Landmark');
 const before=saved.get('ccc.dev-feedback.v1');const write=globalThis.localStorage.setItem;globalThis.localStorage.setItem=(k,v)=>{if(k==='ccc.area-names.v1')throw new Error('full');write(k,v);};
 assert.throws(()=>commitAreaNameChange(row,'Different Name',[],report));assert.equal(saved.get('ccc.dev-feedback.v1'),before);assert.equal(applyAreaNameOverride(row).label,'Nearby Landmark');
 delete globalThis.localStorage;
});
