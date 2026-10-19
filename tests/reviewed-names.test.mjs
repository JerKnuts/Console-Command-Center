import test from 'node:test';
import assert from 'node:assert/strict';
import { applyReviewedFindings, reviewedDuplicate } from '../src/views/console.command-center/main/reviewed-id-findings.ts';
import { readFileSync } from 'node:fs';

test('reviewed names retain searchable originals and match plugin/local identity', () => {
 const original={label:'Clothes Ship Crewman',value:'0307E666',localFormId:'07E666',plugin:'SFBGS050.esm',keywords:['crew']};
 const renamed=applyReviewedFindings(original);
 assert.equal(renamed.label,'Crewman Outfit');
 assert.equal(renamed.originalName,original.label);
 assert.ok(renamed.keywords.includes(original.label));
 assert.deepEqual(applyReviewedFindings(renamed),renamed);
 assert.equal(applyReviewedFindings({...original,plugin:'Other.esm'}).label,original.label);
 assert.equal(applyReviewedFindings({...original,value:'0907E666'}).label,'Crewman Outfit');
 const data=readFileSync(new URL('../src/views/console.command-center/main/id-browser-data.ts',import.meta.url),'utf8');
 const records=JSON.parse(data.match(/String.raw`([\s\S]*?)`/)[1]);
 const renamedRecords=records.map(applyReviewedFindings).filter(r=>r.originalName);
 assert.equal(renamedRecords.length,520);
 assert.equal(new Set(renamedRecords.map(r=>r.plugin+':'+r.localFormId)).size,520);
});


test('reported branch and piggy-bank duplicates retain alternate IDs scoped to the owning plugin',()=>{
 for(const [keep,alias] of [['139E6B','092FEA'],['1AC09E','094BE5']]){
  const primary={label:'Example',value:'00'+keep,plugin:'Starfield.esm',localFormId:keep};
  const merged=applyReviewedFindings(primary);
  assert.deepEqual(merged.alternateFormIds,['00'+alias]);assert.ok(merged.keywords.includes('00'+alias));
  assert.equal(reviewedDuplicate({...primary,value:'00'+alias,localFormId:alias}),true);
  assert.equal(reviewedDuplicate({...primary,plugin:'Other.esm',value:'00'+alias,localFormId:alias}),false);
  assert.deepEqual(applyReviewedFindings({...primary,plugin:'Other.esm'}),{...primary,plugin:'Other.esm'});
 }
});
