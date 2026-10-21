import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cellReferenceNote} from '../src/views/console.command-center/main/cell-reference.ts';
import {applyReviewedFindings} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
import {orderIdEntries} from '../src/views/console.command-center/main/id-record-order.ts';
import {visibleIdRecord} from '../src/views/console.command-center/main/ui-preferences.ts';

test('reviewed marker, placeholder, and failed cells are reference only by exact identity',()=>{
 for(const [plugin,localFormId] of [['Starfield.esm','012998'],['ShatteredSpace.esm','012998'],['ShatteredSpace.esm','10DE32'],['Starfield.esm','02EE21'],['Starfield.esm','15FF09']]){
  const row={label:'Destination',value:'09000000',localFormId,plugin,type:'CELL',category:'Cells'};
  assert.ok(cellReferenceNote(row));assert.equal(cellReferenceNote({...row,plugin:'Other.esm'}),null);
  const reviewed=applyReviewedFindings(row);assert.equal(reviewed.referenceOnly,true);assert.equal(visibleIdRecord(reviewed,false),false);assert.equal(visibleIdRecord(reviewed,true),true);
  assert.equal(cellReferenceNote({...row,type:'BOOK'}),null);
 }
});

test('storage and holding metadata rules do not infer test cells from ordinary names',()=>{
 const row={label:'Room',type:'CELL',category:'Cells',value:'02000001',plugin:'Example.esm'};
 for(const editorId of ['PackInShipRoomStorageCell','PackInStorageCellDUPLICATE000DUPLICATE001','PackInShipStorageCellCOPY0000','MQHoldingCell'])assert.ok(cellReferenceNote({...row,editorId}));
 for(const editorId of ['CityNeonWarehouse01','RL082TAWarehouse01','LC165BuriedTemple03','CityAkilaTheRock01','MyLegitimateLocation'])assert.equal(cellReferenceNote({...row,label:'??? Test Warehouse',editorId}),null);
});

test('reviewed cell corpus keeps ordinary destinations first and reference cells hidden in basic mode',()=>{
 const source=readFileSync(new URL('../src/views/console.command-center/main/id-browser-data.ts',import.meta.url),'utf8');
 const rows=JSON.parse(source.match(/String.raw`([\s\S]*?)`/)[1]).filter(r=>r.type==='CELL').map(applyReviewedFindings);
 const refs=rows.filter(r=>r.referenceOnly);assert.equal(rows.filter(cellReferenceNote).length,2058);assert.equal(refs.length,2083);
 const sorted=orderIdEntries(rows);const firstRef=sorted.findIndex(r=>r.referenceOnly);assert.ok(firstRef>0);assert.ok(sorted.slice(firstRef).every(r=>r.referenceOnly));
 assert.ok(refs.every(r=>!visibleIdRecord(r,false)));assert.ok(rows.filter(r=>!r.referenceOnly).every(r=>visibleIdRecord(r,false)));
});


test('reviewed raw sc labels and reported minefields are reference-only without a blanket sc prefix rule',()=>{
 for(const [plugin,localFormId] of [['ShatteredSpace.esm','02B9D9'],['ShatteredSpace.esm','00849C'],['SFBGS00D.esm','03B6B4'],['SFBGS00D.esm','093977'],['SFBGS00D.esm','05C376'],['SFBGS00D.esm','071138'],['SFBGS050.esm','0213DB']]){
  const row={label:'Area',value:'09000000',plugin,localFormId,type:'CELL',category:'Cells'};
  assert.equal(applyReviewedFindings(row).referenceOnly,true);assert.equal(cellReferenceNote({...row,plugin:'Other.esm'}),null);
 }
 // The Beagle is now explicitly reported as reference; its sc prefix alone still has no effect on other identities.
 assert.match(cellReferenceNote({type:'CELL',value:'0024CBC4',plugin:'Starfield.esm',localFormId:'24CBC4',keywords:['scMS02TheBeagle']}),/Player-reported/);
 assert.equal(cellReferenceNote({type:'CELL',value:'0024CBC4',plugin:'Other.esm',localFormId:'24CBC4',keywords:['scMS02TheBeagle']}),null);
});
