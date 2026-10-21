import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GENERATED_ID_CATALOG} from '../src/views/console.command-center/main/id-browser-data.ts';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)?specifier+'.ts':specifier,context);}});
const {mergeGeneratedIdCatalog,resolvePackagedIdCatalog}=await import('../src/views/console.command-center/main/id-catalog.ts');
import {applyReviewedFindings,reviewedReferenceNote} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
const findings=JSON.parse(readFileSync(new URL('./fixtures/feedback-1282-catalog.json',import.meta.url),'utf8'));
const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
const key=e=>(e.plugin??'Starfield.esm').toLowerCase()+':'+(e.localFormId??e.value).slice(-6).toUpperCase().padStart(6,'0');
const entry=k=>{const e=catalog.find(e=>key(e)===k);assert.ok(e,'Reported identity missing: '+k);return e;};
test('latest report moves all three child outfits into Apparel and scopes corrections to their plugins',()=>{
 assert.equal(findings.apparel.length,3);
 for(const k of findings.apparel){const e=entry(k);assert.equal(e.category,'Apparel');assert.equal(applyReviewedFindings({...e,plugin:'Other.esm',category:'Spacesuits'}).category,'Spacesuits');}
});
test('all 17 reported records disable inventory actions through reference-only findings',()=>{
 assert.equal(findings.reference.length,17);
 for(const k of findings.reference){const [plugin,localFormId]=k.split(':');const e=applyReviewedFindings({value:'FEABC'+localFormId.slice(-3),plugin,localFormId:localFormId.replace(/^0+/,''),label:'Reported item'});assert.equal(e.referenceOnly,true,k);assert.ok(reviewedReferenceNote(e));assert.equal(reviewedReferenceNote({...e,plugin:'Other.esm'}),null);}
 for(const k of findings.reference)assert.equal(entry(k).referenceOnly,true);
});

