import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return next(s.startsWith('.')&&!/\.[a-z]+$/i.test(s)?s+'.ts':s,c);}});
const {CATEGORY_ORDER}=await import('../src/views/console.command-center/main/commands.ts');
const {ID_BROWSER_CATEGORIES}=await import('../src/views/console.command-center/main/id-catalog.ts');
const {QUEST_BROWSER_CATEGORY_ORDER}=await import('../src/views/console.command-center/main/catalog-metadata.ts');
test('category lists are alphabetical with WIP and Game Settings pinned last',()=>{
 const sorted=xs=>[...xs].sort((a,b)=>a.localeCompare(b));
 assert.equal(CATEGORY_ORDER.at(-1),'Untested');
 assert.deepEqual(CATEGORY_ORDER.slice(0,-1),sorted(CATEGORY_ORDER.slice(0,-1)));
 assert.deepEqual([...QUEST_BROWSER_CATEGORY_ORDER],sorted(QUEST_BROWSER_CATEGORY_ORDER));
 assert.equal(ID_BROWSER_CATEGORIES.at(-1).value,'game-settings');
 const labels=ID_BROWSER_CATEGORIES.filter(x=>x.value!=='all'&&x.value!=='game-settings').map(x=>x.label);
 assert.deepEqual(labels,sorted(labels));
});
