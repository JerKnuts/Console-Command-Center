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
const findings=JSON.parse(readFileSync(new URL('./fixtures/feedback-1312-catalog.json',import.meta.url),'utf8'));
const key=r=>(r.plugin??'Starfield.esm').toLowerCase()+':'+(r.localFormId??r.value).slice(-6).toUpperCase();
const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
const find=(k,rows=catalog)=>{const r=rows.find(r=>key(r)===k);assert.ok(r,'Missing feedback record '+k);assert.equal(r.type,'CELL');return r;};

test('twelve reported cell name corrections survive DLC remapping and retain searchable originals',()=>{
 assert.equal(Object.keys(findings.renamed).length,12);
 const remapped=resolvePackagedIdCatalog(catalog,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:0},{plugin:'ShatteredSpace.esm',pluginKind:'full',index:8},{plugin:'SFBGS00D.esm',pluginKind:'full',index:9},{plugin:'SFBGS050.esm',pluginKind:'full',index:10}]});
 for(const [k,expected] of Object.entries(findings.renamed)){
  const r=find(k);assert.equal(r.label,expected.label);assert.equal(r.originalName,expected.original);assert.ok(r.keywords.includes(expected.original));
  assert.equal(find(k,remapped).label,expected.label);
  assert.equal(applyReviewedFindings({...r,plugin:'Other.esm',label:expected.original}).label,expected.original);
 }
});

test('all 69 reported reference cells are hidden in basic mode and scoped to their plugin and record type',()=>{
 assert.equal(findings.reference.length,69);assert.equal(new Set(findings.reference).size,69);
 for(const k of findings.reference){
  const r=find(k);assert.equal(r.referenceOnly,true);assert.match(cellReferenceNote(r),/Advanced Options/);
  assert.equal(visibleIdRecord(r,false),false);assert.equal(visibleIdRecord(r,true),true);
  assert.equal(cellReferenceNote({...r,plugin:'Other.esm'}),null);
  assert.equal(cellReferenceNote({...r,type:'BOOK'}),null);
 }
 // Reports renamed this cell and then classified it; both findings must survive.
 const mansion=find('starfield.esm:2A948F');assert.equal(mansion.label,'Chandra Vineyards Mansion');assert.equal(mansion.referenceOnly,true);
});

test('reported classifications do not hide other caves or other Armored Transport cells',()=>{
 const rows=catalog.filter(r=>r.type==='CELL');
 const unreportedCave=rows.find(r=>r.label==='Waterfall Cave'&&!r.referenceOnly&&!findings.reference.includes(key(r)));
 assert.ok(unreportedCave);assert.equal(cellReferenceNote(unreportedCave),null);
 assert.equal(cellReferenceNote({...unreportedCave,label:'Cave'}),null);
 assert.equal(Boolean(find('starfield.esm:2C12B5').referenceOnly),false);
 assert.equal(find('starfield.esm:2C12B5').label,'Deimos Armored Transport');
});
