import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {GENERATED_ID_CATALOG} from '../src/views/console.command-center/main/id-browser-data.ts';
import {applyReviewedFindings,reviewedWasTested} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
import {cellReferenceNote} from '../src/views/console.command-center/main/cell-reference.ts';
import {visibleIdRecord} from '../src/views/console.command-center/main/ui-preferences.ts';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)?specifier+'.ts':specifier,context);}});
const {mergeGeneratedIdCatalog,resolvePackagedIdCatalog}=await import('../src/views/console.command-center/main/id-catalog.ts');
const findings=JSON.parse(readFileSync(new URL('./fixtures/feedback-1320-catalog.json',import.meta.url),'utf8'));
const key=r=>(r.plugin??'Starfield.esm').toLowerCase()+':'+(r.localFormId??r.value).slice(-6).toUpperCase();
const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
const find=(k,rows=catalog)=>{const r=rows.find(r=>key(r)===k);assert.ok(r,'Missing feedback record '+k);assert.equal(r.type,'CELL');return r;};

test('both new feedback exports apply the latest names by exact identity and retain searchable originals',()=>{
 assert.equal(findings.reportCount,100);assert.equal(Object.keys(findings.renamed).length,34);
 const remapped=resolvePackagedIdCatalog(catalog,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:0},{plugin:'ShatteredSpace.esm',pluginKind:'full',index:8},{plugin:'SFBGS00D.esm',pluginKind:'full',index:9},{plugin:'SFBGS050.esm',pluginKind:'full',index:10}]});
 for(const [k,expected]of Object.entries(findings.renamed)){
  const r=find(k);assert.equal(r.label,expected.label);assert.ok(r.keywords.includes(expected.previous));assert.equal(find(k,remapped).label,expected.label);assert.deepEqual(applyReviewedFindings(r),r);
  assert.equal(applyReviewedFindings({...r,plugin:'Other.esm',label:'Unrelated'}).label,'Unrelated');
 }
 for(const local of ['0EDF49','0EDF4C','0EDF4B','0EDF4D'])assert.equal(find('shatteredspace.esm:'+local).label,'Dazra Outskirts');
});

test('all 61 newly reported reference cells remain available for advanced exploration and reported cells count as tested',()=>{
 assert.equal(findings.reference.length,61);assert.equal(findings.tested.length,95);
 for(const k of findings.reference){const r=find(k);assert.equal(r.referenceOnly,true);assert.equal(visibleIdRecord(r,false),false);assert.equal(visibleIdRecord(r,true),true);assert.match(cellReferenceNote(r),/exploration teleport is available/);assert.equal(cellReferenceNote({...r,type:'BOOK'}),null);}
 for(const k of findings.tested)assert.equal(reviewedWasTested(find(k)),true);
});
