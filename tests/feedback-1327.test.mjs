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
const feedback=JSON.parse(readFileSync(new URL('./fixtures/feedback-1327-catalog.json',import.meta.url),'utf8'));
const key=r=>(r.plugin??'Starfield.esm').toLowerCase()+':'+(r.localFormId??r.value).slice(-6).toUpperCase();
const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
const find=(id,rows=catalog)=>{const row=rows.find(r=>key(r)===id);assert.ok(row,'Missing '+id);assert.equal(row.type,'CELL');return row;};
test('October 20 third export applies every accepted name with original search labels and load-order independent identities',()=>{
 assert.equal(feedback.reportCount,17);assert.equal(Object.keys(feedback.renamed).length,17);
 const remapped=resolvePackagedIdCatalog(catalog,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:0},{plugin:'ShatteredSpace.esm',pluginKind:'full',index:8},{plugin:'SFBGS00D.esm',pluginKind:'full',index:9},{plugin:'SFBGS050.esm',pluginKind:'full',index:10}]});
 for(const [id,expected]of Object.entries(feedback.renamed)){const row=find(id);assert.equal(row.label,expected.label);assert.ok(row.keywords.includes(expected.previous));assert.equal(find(id,remapped).label,expected.label);assert.deepEqual(applyReviewedFindings(row),row);assert.equal(applyReviewedFindings({...row,plugin:'Unrelated.esm',label:'Unrelated'}).label,'Unrelated');}
});
