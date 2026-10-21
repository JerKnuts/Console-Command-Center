import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GENERATED_ID_CATALOG} from '../src/views/console.command-center/main/id-browser-data.ts';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)?specifier+'.ts':specifier,context);}});
const {mergeGeneratedIdCatalog,resolvePackagedIdCatalog}=await import('../src/views/console.command-center/main/id-catalog.ts');
import {applyReviewedFindings,reviewedReferenceNote} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
const findings=JSON.parse(readFileSync(new URL('./fixtures/feedback-1281-catalog.json',import.meta.url),'utf8'));
const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
const key=e=>(e.plugin??'Starfield.esm').toLowerCase()+':'+(e.localFormId??e.value).slice(-6).toUpperCase();
const entry=k=>{const e=catalog.find(e=>key(e)===k);assert.ok(e,'Reported identity missing: '+k);return e;};
test('all 68 reported clothing entries move to Apparel without changing identity or item action',()=>{
 assert.equal(findings.apparel.length,68);
 for(const k of findings.apparel){const e=entry(k);assert.equal(e.category,'Apparel',e.label);assert.equal(e.type,'ARMO');assert.equal(Boolean(e.referenceOnly),['0A6FFA','0A701C','2074B5','37033F','37033E','37033D','220B07','0A7021','0A6FEF','0A7001','0A7018','223430','362F13','362F14','362F15'].includes(e.localFormId));const [plugin,localFormId]=k.split(':');assert.equal(applyReviewedFindings({...e,plugin:'Other.esm',category:'Spacesuits'}).category,'Spacesuits');assert.equal(key(e),plugin+':'+localFormId);}
});
test('25 unique reported non-inventory spacesuits are reference-only and plugin-scoped',()=>{
 assert.equal(findings.reference.length,25);
 for(const k of findings.reference){const e=entry(k);assert.equal(e.referenceOnly,true,e.label);assert.ok(reviewedReferenceNote(e));assert.equal(reviewedReferenceNote({...e,plugin:'Other.esm'}),null);}
});
test('20 reported suit names retain searchable original names and survive DLC load-order changes',()=>{
 assert.equal(Object.keys(findings.renamed).length,20);
 const remapped=resolvePackagedIdCatalog(catalog,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:0},{plugin:'ShatteredSpace.esm',pluginKind:'full',index:8},{plugin:'SFBGS00D.esm',pluginKind:'full',index:9},{plugin:'SFBGS050.esm',pluginKind:'full',index:10}]});
 for(const[k,expected]of Object.entries(findings.renamed)){const e=entry(k);assert.equal(e.label,expected.label);assert.equal(e.originalName,expected.original);assert.ok(e.keywords.includes(expected.original));assert.equal(remapped.find(e=>key(e)===k).label,expected.label);assert.equal(applyReviewedFindings({...e,plugin:'Other.esm',label:expected.original}).label,expected.original);}
 assert.equal(entry('shatteredspace.esm:0C0AE9').label,"Va'ruun Mining Spacesuit");
});
