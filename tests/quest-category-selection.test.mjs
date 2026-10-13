import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import {QUEST_BROWSER_CATEGORY_ORDER} from '../src/views/console.command-center/main/catalog-metadata.ts';
const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
const fn=source.match(/^function selectQuestBrowserCategory\b[\s\S]*?^}/m)[0];
const context=vm.createContext({QUEST_BROWSER_CATEGORY_ORDER,questBrowserSource:'Base Game',questBrowserCategory:'Main Quests',selectedQuestKey:'old',renderCalls:0,render(){context.renderCalls++;}});
vm.runInContext(stripTypeScriptTypes(fn),context);
test('click selection accepts all four packaged quest sources and clears stale quest details',()=>{
 assert.match(source,/if \(questButton\) selectQuestBrowserCategory\(questButton.dataset.questSource, questButton.dataset.questCategory\)/);
 for(const source of ['Base Game','Shattered Space','Free Lanes','Terran Armada']){
  context.selectedQuestKey='old';
  assert.equal(context.selectQuestBrowserCategory(source,'Side Quests & Encounters'),true);
  assert.equal(context.questBrowserSource,source);
  assert.equal(context.questBrowserCategory,'Side Quests & Encounters');
  assert.equal(context.selectedQuestKey,null);
 }
 assert.equal(context.renderCalls,4);
});
test('invalid quest source or category leaves selection unchanged',()=>{
 const before=context.questBrowserSource;
 assert.equal(context.selectQuestBrowserCategory('Unknown','Main Quests'),false);
 assert.equal(context.selectQuestBrowserCategory('Free Lanes','Invalid Category'),false);
 assert.equal(context.selectQuestBrowserCategory(undefined,'Main Quests'),false);
 assert.equal(context.questBrowserSource,before);
 assert.equal(context.renderCalls,4);
});
