import test from 'node:test';
import assert from 'node:assert/strict';
import {modCategoryCounts,modCategoryMatches} from '../src/views/console.command-center/main/mod-browser-layout.ts';
const rows=[{source:'mod',plugin:'A.esm',category:'Weapons'},{source:'mod',plugin:'B.esm',category:'Weapons'},{source:'mod',plugin:'B.esm',category:'Armor'},{source:'mod',category:'Cells',referenceOnly:true},{source:'Base Game',category:'Weapons'}];
test('category sorting combines scanned plugins and respects reference visibility without including packaged records',()=>{
 assert.deepEqual(modCategoryCounts(rows,false),[{name:'Armor',count:1},{name:'Weapons',count:2}]);
 assert.deepEqual(modCategoryCounts(rows,true),[{name:'Armor',count:1},{name:'Cells',count:1},{name:'Weapons',count:2}]);
 assert.equal(rows.filter(r=>modCategoryMatches(r,'Weapons')).length,2);
 assert.equal(rows.filter(r=>modCategoryMatches(r,'')).length,4);
 assert.deepEqual(modCategoryCounts([],false),[]);
});
