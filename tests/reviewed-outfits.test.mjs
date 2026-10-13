import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)?specifier+'.ts':specifier,context);}});
const {mergeGeneratedIdCatalog,resolvePackagedIdCatalog}=await import('../src/views/console.command-center/main/id-catalog.ts');
const {GENERATED_ID_CATALOG}=await import('../src/views/console.command-center/main/id-browser-data.ts');
const {reviewedWasTested}=await import('../src/views/console.command-center/main/reviewed-id-findings.ts');
test('only the two tested duplicate outfit pairs collapse and retain alternate IDs',()=>{
 const entries=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 for(const [name,primary,alternate] of [["Andreja's Outfit",'001341E4','001C8E09'],["Barrett's Outfit",'0001D1DB','001C8E07']]){
   const outfits=entries.filter(entry=>entry.label===name);
   assert.equal(outfits.length,1);assert.equal(outfits[0].value,primary);assert.deepEqual(outfits[0].alternateFormIds,[alternate]);
   assert.ok(outfits[0].keywords.includes(alternate));
   const resolved=resolvePackagedIdCatalog(outfits,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:2}]})[0];
   assert.equal(resolved.alternateFormIds[0],'02'+alternate.slice(2));
 }
 assert.equal(entries.find(entry=>entry.value==='003E3D51').label,'Freestar Ambassador Suit');
 assert.equal(entries.find(entry=>entry.value==='001C0F34').label,'Bounty Hunter Seek Pack');
 assert.equal(reviewedWasTested({value:'0012B4B3',plugin:'Starfield.esm'}),true);
 assert.equal(reviewedWasTested({value:'0012B4B3',plugin:'Other.esm'}),false);
});
