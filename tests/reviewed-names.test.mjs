import test from 'node:test';
import assert from 'node:assert/strict';
import { applyReviewedFindings } from '../src/views/console.command-center/main/reviewed-id-findings.ts';
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
 assert.equal(renamedRecords.length,25);
 assert.equal(new Set(renamedRecords.map(r=>r.plugin+':'+r.localFormId)).size,25);
});
