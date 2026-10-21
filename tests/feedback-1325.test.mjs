import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {GENERATED_ID_CATALOG} from '../src/views/console.command-center/main/id-browser-data.ts';
import {applyReviewedFindings,reviewedWasTested} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
import {visibleIdRecord} from '../src/views/console.command-center/main/ui-preferences.ts';
import {cellReferenceNote} from '../src/views/console.command-center/main/cell-reference.ts';
import {orderIdEntries} from '../src/views/console.command-center/main/id-record-order.ts';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)?specifier+'.ts':specifier,context);}});
const {mergeGeneratedIdCatalog,resolvePackagedIdCatalog}=await import('../src/views/console.command-center/main/id-catalog.ts');
const feedback=JSON.parse(readFileSync(new URL('./fixtures/feedback-1325-catalog.json',import.meta.url),'utf8'));
const key=r=>(r.plugin??'Starfield.esm').toLowerCase()+':'+(r.localFormId??r.value).slice(-6).toUpperCase();
const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
const find=(id,rows=catalog)=>{const row=rows.find(r=>key(r)===id);assert.ok(row,'Missing '+id);assert.equal(row.type,'CELL');return row;};
test('October 20 export applies every accepted name with original search labels and load-order independent identities',()=>{
 assert.equal(feedback.reportCount,74);assert.equal(Object.keys(feedback.renamed).length,17);
 const remapped=resolvePackagedIdCatalog(catalog,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:0},{plugin:'ShatteredSpace.esm',pluginKind:'full',index:8},{plugin:'SFBGS00D.esm',pluginKind:'full',index:9},{plugin:'SFBGS050.esm',pluginKind:'full',index:10}]});
 for(const [id,expected]of Object.entries(feedback.renamed)){const row=find(id);assert.equal(row.label,expected.label);assert.ok(row.keywords.includes(expected.previous));assert.equal(find(id,remapped).label,expected.label);assert.deepEqual(applyReviewedFindings(row),row);assert.equal(applyReviewedFindings({...row,plugin:'Unrelated.esm',label:'Unrelated'}).label,'Unrelated');}
});
test('all 57 reference reports hide from ordinary browsing, sort last and retain advanced exploration',()=>{
 assert.equal(feedback.reference.length,57);assert.equal(new Set(feedback.tested).size,74);
 for(const id of feedback.reference){const row=find(id);assert.equal(row.referenceOnly,true);assert.equal(visibleIdRecord(row,false),false);assert.equal(visibleIdRecord(row,true),true);assert.match(cellReferenceNote(row),/exploration teleport is available/);assert.equal(cellReferenceNote({...row,type:'BOOK'}),null);const normal={...row,referenceOnly:false,plugin:'Unrelated.esm',label:'ZZZ normal'};assert.equal(orderIdEntries([row,normal])[0],normal);}
 for(const id of feedback.tested)assert.equal(reviewedWasTested(find(id)),true);
});
