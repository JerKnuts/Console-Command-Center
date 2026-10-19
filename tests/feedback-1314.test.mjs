import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {GENERATED_ID_CATALOG} from '../src/views/console.command-center/main/id-browser-data.ts';
import {applyReviewedFindings} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
import {cellReferenceNote} from '../src/views/console.command-center/main/cell-reference.ts';
import {visibleIdRecord} from '../src/views/console.command-center/main/ui-preferences.ts';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)?specifier+'.ts':specifier,context);}});
const {mergeGeneratedIdCatalog,resolvePackagedIdCatalog}=await import('../src/views/console.command-center/main/id-catalog.ts');
const findings=JSON.parse(readFileSync(new URL('./fixtures/feedback-1314-catalog.json',import.meta.url),'utf8'));
const key=r=>(r.plugin??'Starfield.esm').toLowerCase()+':'+(r.localFormId??r.value).slice(-6).toUpperCase();
const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
const find=(k,rows=catalog)=>{const r=rows.find(r=>key(r)===k);assert.ok(r,'Missing feedback record '+k);assert.equal(r.type,'CELL');return r;};

test('four reported cell name corrections survive DLC remapping and retain searchable originals',()=>{
 assert.equal(Object.keys(findings.renamed).length,4);
 const remapped=resolvePackagedIdCatalog(catalog,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:0},{plugin:'ShatteredSpace.esm',pluginKind:'full',index:8},{plugin:'SFBGS00D.esm',pluginKind:'full',index:9},{plugin:'SFBGS050.esm',pluginKind:'full',index:10}]});
 for(const [k,expected] of Object.entries(findings.renamed)){
  const r=find(k);assert.equal(r.label,expected.label);assert.equal(r.originalName,expected.original);assert.ok(r.keywords.includes(expected.original));
  assert.equal(find(k,remapped).label,expected.label);
  assert.equal(applyReviewedFindings({...r,plugin:'Other.esm',label:expected.original}).label,expected.original);
 }
});

test('all 24 reported reference cells are hidden in basic mode and scoped to their plugin and record type',()=>{
 assert.equal(findings.reference.length,24);assert.equal(new Set(findings.reference).size,24);
 for(const k of findings.reference){
  const r=find(k);assert.equal(r.referenceOnly,true);assert.match(cellReferenceNote(r),/Advanced Options/);
  assert.equal(visibleIdRecord(r,false),false);assert.equal(visibleIdRecord(r,true),true);
  assert.equal(cellReferenceNote({...r,plugin:'Other.esm'}),null);
  assert.equal(cellReferenceNote({...r,type:'BOOK'}),null);
 }

});

test('all 310 audited cell names retain identity, searchable original labels and authored evidence',()=>{
 assert.equal(findings.audit.length,310);
 const counts={};
 for(const expected of findings.audit){
  const r=find(expected.key);assert.equal(r.label,expected.label);assert.equal(r.originalName,expected.original);assert.ok(r.keywords.includes(expected.original));
  assert.ok(r.label.startsWith(expected.source.name+' — '));counts[expected.basis]=(counts[expected.basis]??0)+1;
  assert.deepEqual(applyReviewedFindings(r),r);
  assert.equal(applyReviewedFindings({...r,plugin:'Other.esm',label:expected.original}).label,expected.original);
  assert.equal(applyReviewedFindings({...r,type:'BOOK',label:expected.original}).label,expected.original);
 }
 assert.deepEqual(counts,{'Linked location':141,'Parent location':35,'Worldspace':134});
 assert.match(find('shatteredspace.esm:080404').label,/^Shadow Station Epsilon — Exterior/);
 assert.equal(find('sfbgs050.esm:02B45B').label,'Terran Repeater — Interior');
});

test('100 cells without authored names retain their identifiers and the category includes spaced separators',()=>{
 assert.equal(findings.unresolved.length,100);
 for(const expected of findings.unresolved)assert.equal(find(expected.key).label,expected.original);
 const source=readFileSync(new URL('../src/views/console.command-center/main/id-catalog.ts',import.meta.url),'utf8');
 assert.ok(source.includes("label: 'Cells / Teleport'"));assert.ok(!source.includes('Cells/Teleport'));
});
