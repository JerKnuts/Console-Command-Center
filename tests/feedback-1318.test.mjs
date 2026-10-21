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
const findings=JSON.parse(readFileSync(new URL('./fixtures/feedback-1318-catalog.json',import.meta.url),'utf8'));
const key=r=>(r.plugin??'Starfield.esm').toLowerCase()+':'+(r.localFormId??r.value).slice(-6).toUpperCase();
const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
const find=(k,rows=catalog)=>{const r=rows.find(r=>key(r)===k);assert.ok(r,'Missing feedback record '+k);assert.equal(r.type,'CELL');return r;};

test('173 feedback reports apply 109 exact cell names and preserve identifiers, prior search labels and plugin remapping',()=>{
 assert.equal(findings.reportCount,173);assert.equal(findings.reportedRenames,80);assert.equal(Object.keys(findings.renamed).length,109);
 const remapped=resolvePackagedIdCatalog(catalog,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:0},{plugin:'ShatteredSpace.esm',pluginKind:'full',index:8},{plugin:'SFBGS00D.esm',pluginKind:'full',index:9},{plugin:'SFBGS050.esm',pluginKind:'full',index:10}]});
 for(const [k,expected]of Object.entries(findings.renamed)){
  const r=find(k);assert.equal(r.label,expected.label);assert.ok(r.keywords.includes(expected.previous));assert.equal(find(k,remapped).label,expected.label);
  assert.deepEqual(applyReviewedFindings(r),r);
  assert.equal(applyReviewedFindings({...r,plugin:'Other.esm',label:'Unrelated'}).label,'Unrelated');
  assert.equal(applyReviewedFindings({...r,type:'BOOK',label:'Unrelated'}).label,'Unrelated');
 }
 assert.equal(catalog.filter(r=>r.plugin?.toLowerCase()==='shatteredspace.esm'&&/^Dazra Outskirts — Exterior/.test(r.label)).length,0);
});

test('92 distinct reference cells hide in basic mode, retain exploration guidance, and keep overlapping name changes',()=>{
 assert.equal(findings.reference.length,92);assert.equal(new Set(findings.reference).size,92);
 for(const k of findings.reference){const r=find(k);assert.equal(r.referenceOnly,true);assert.equal(visibleIdRecord(r,false),false);assert.equal(visibleIdRecord(r,true),true);assert.match(cellReferenceNote(r),/exploration teleport is available/);assert.equal(cellReferenceNote({...r,plugin:'Other.esm'}),null);}
 const outpost=find('shatteredspace.esm:05F5D7');assert.equal(outpost.label,'Dazra Abandoned Outpost');assert.equal(outpost.referenceOnly,true);
 const alias=find('sfbgs050.esm:00F9F6');assert.equal(alias.label,'EC Robot Alias Cell');assert.equal(alias.referenceOnly,true);
});

test('only directly reported cells count as player-tested; the extra naming rule does not invent test results',()=>{
 assert.equal(findings.tested.length,170);
 for(const k of findings.tested)assert.equal(reviewedWasTested(find(k)),true);
 for(const k of Object.keys(findings.renamed).filter(k=>!findings.tested.includes(k)))assert.equal(reviewedWasTested(find(k)),false);
});
