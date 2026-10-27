import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return next(s.startsWith('.')&&!/\.[a-z]+$/i.test(s)?s+'.ts':s,c);}});
const {CATEGORY_ORDER}=await import('../src/views/console.command-center/main/commands.ts');
const {ID_BROWSER_CATEGORIES}=await import('../src/views/console.command-center/main/id-catalog.ts');
const {QUEST_BROWSER_CATEGORY_ORDER}=await import('../src/views/console.command-center/main/catalog-metadata.ts');
test('category lists are alphabetical with MISC, Advanced Settings and WIP pinned last',()=>{
 const sorted=xs=>[...xs].sort((a,b)=>a.localeCompare(b));
 assert.equal(CATEGORY_ORDER.at(-1),'Untested');
 assert.deepEqual(CATEGORY_ORDER.slice(0,-3),sorted(CATEGORY_ORDER.slice(0,-3)));
 assert.equal(CATEGORY_ORDER.at(-3),'MISC');
 assert.deepEqual([...QUEST_BROWSER_CATEGORY_ORDER],sorted(QUEST_BROWSER_CATEGORY_ORDER));
 assert.equal(CATEGORY_ORDER.at(-2),'Advanced Settings');
 assert.ok(!ID_BROWSER_CATEGORIES.some(x=>x.value==='game-settings'));
 const labels=ID_BROWSER_CATEGORIES.filter(x=>x.value!=='all'&&x.value!=='game-settings').map(x=>x.label);
 assert.deepEqual(labels,sorted(labels));
});

test('Books / Notes combines reading categories without including Audio Slates',()=>{
 const group=ID_BROWSER_CATEGORIES.find(x=>x.label==='Books / Notes');assert.ok(group);
 for(const label of ['Books','Notes','Text Slates','Image Slates']){assert.ok(group.builtInCategories.includes(label));assert.ok(!ID_BROWSER_CATEGORIES.some(x=>x.label===label));}
 assert.ok(!group.builtInCategories.includes('Audio Slates'));
 assert.ok(ID_BROWSER_CATEGORIES.some(x=>x.label==='Audio Slates'));
});
