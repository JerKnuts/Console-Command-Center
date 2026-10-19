import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {applyReviewedFindings,reviewedReferenceNote} from '../src/views/console.command-center/main/reviewed-id-findings.ts';

test('workshop furniture and supported physical objects expose spawning while references stay blocked',()=>{
 const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
 const fn=source.match(/^function idBrowserAction\([\s\S]*?^}/m)[0];
 const context=vm.createContext({reviewedReferenceNote,ammoReferenceNote:()=>null,armorReferenceNote:()=>null});vm.runInContext(stripTypeScriptTypes(fn),context);
 for(const type of ['FURN','STAT','MSTT','CONT']){
  const row={label:'Furniture',value:'0203B6BA',plugin:'SFBGS00D.esm',type,category:'Workshop / Outpost Objects'};
  assert.equal(context.idBrowserAction(row),'spawn');assert.equal(context.idBrowserAction({...row,available:false}),null);assert.equal(context.idBrowserAction({...row,referenceOnly:true}),null);
 }
 assert.equal(context.idBrowserAction({value:'00000001',type:'COBJ',category:'Workshop / Outpost Objects'}),null);
});

test('latest weapon feedback corrections are scoped by owning plugin and local ID',()=>{
 for(const [plugin,localFormId] of [['Starfield.esm','343C01'],['SFBGS00D.esm','088729']]){
  const record={label:'Weapon',value:'00000000',plugin,localFormId};assert.equal(applyReviewedFindings(record).referenceOnly,true);assert.equal(applyReviewedFindings({...record,plugin:'Other.esm'}).referenceOnly,undefined);
 }
 for(const [localFormId,label] of [['0AC60A',"Officer's Particle Machine Gun"],['0AC60B',"Officer's Particle Machine Gun"],['0AC60C','Modified Particle Machine Gun']])assert.equal(applyReviewedFindings({label:'Particle Machine Gun',value:'01000000',plugin:'ShatteredSpace.esm',localFormId}).label,label);
 assert.equal(applyReviewedFindings({label:'XM-2311',value:'0024561C',plugin:'Starfield.esm',localFormId:'24561C'}).label,'Modified XM-2311');
});


test('authored invisible furniture markers stay reference only without hiding real chairs',()=>{
 for(const [plugin,localFormId] of [['Starfield.esm','0CC45B'],['Starfield.esm','139C83'],['SFBGS00D.esm','02F08C'],['ShatteredSpace.esm','0F9D83'],['SFBGS050.esm','03C79D']]){
  const row={label:'Furniture',value:'09000000',plugin,localFormId};
  assert.equal(applyReviewedFindings(row).referenceOnly,true);
  assert.match(reviewedReferenceNote(row),/Invisible interaction marker/);
  assert.equal(applyReviewedFindings({...row,plugin:'Other.esm'}).referenceOnly,undefined);
 }
 assert.equal(applyReviewedFindings({label:'Chair',value:'003551B9',plugin:'Starfield.esm',localFormId:'3551B9'}).referenceOnly,undefined);
});


test('reference cells allow exploration only in Advanced Options without enabling other reference actions',()=>{
 const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
 const fn=source.match(/^function idBrowserAction\([\s\S]*?^}/m)[0];
 const uiPreferences={advanced:false};const context=vm.createContext({uiPreferences,reviewedReferenceNote,ammoReferenceNote:()=>null,armorReferenceNote:()=>null});vm.runInContext(stripTypeScriptTypes(fn),context);
 const cell={label:'Markers',type:'CELL',category:'Cells',value:'00012998',plugin:'Starfield.esm',localFormId:'012998',editorId:'aaaMarkers'};
 assert.equal(context.idBrowserAction(cell),null);uiPreferences.advanced=true;assert.equal(context.idBrowserAction(cell),'teleport');
 assert.equal(context.idBrowserAction({...cell,available:false}),null);assert.equal(context.idBrowserAction({...cell,editorId:undefined}),null);
 assert.equal(context.idBrowserAction({...cell,type:'LCTN'}),null);assert.equal(context.idBrowserAction({...cell,type:'FURN',referenceOnly:true}),null);
});
