import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function activeCommands()'),source.indexOf('function viewTitle()'));
test('Command Browser sorts category, search and WIP while saved views retain order',()=>{
 const items=[{id:'z',title:'Zulu',category:'World'},{id:'b',title:'beta',category:'World'},{id:'a',title:'Alpha',category:'World'},{id:'w2',title:'WIP 10',category:'Untested'},{id:'w1',title:'WIP 2',category:'Untested'}];
 const context=vm.createContext({activeView:'commands',commandCategory:'World',currentCommands:()=>items,visibleCommandRecord:()=>true,commandMatches:()=>true,uiPreferences:{advanced:false},query:'',untestedQuery:'',favorites:['z','a'],recent:['b','z']});vm.runInContext(stripTypeScriptTypes(fn),context);
 const ids=()=>Array.from(context.activeCommands(),x=>x.id);assert.deepEqual(ids(),['a','b','z']);context.commandCategory='Untested';assert.deepEqual(ids(),['w1','w2']);context.query='match';assert.deepEqual(ids(),['a','b','w1','w2','z']);context.query='';context.activeView='favorites';assert.deepEqual(ids(),['z','a']);context.activeView='recent';assert.deepEqual(ids(),['b','z']);
});
