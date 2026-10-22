import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import {applyReviewedFindings} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
import {applyArmorFindings, armorReferenceNote} from '../src/views/console.command-center/main/armor-test-findings.ts';

test('selection controls bind only inside the active panel, including quantity and favorite toggle',()=>{
  const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
  const fn=source.match(/^function bindIdBrowserSelectionActions\b[\s\S]*?^}/m)[0];
  const control=(value)=>({value,handlers:{},addEventListener(name,fn){this.handlers[name]=fn;}});
  const quantity=control('4'),add=control(),favorite=control();
  const root={querySelector(selector){return {'#id-browser-quantity':quantity,'[data-id-browser-action]':add,'[data-id-favorite-toggle]':favorite}[selector]??null;},querySelectorAll(){return [];}};
  const commands=[],favorites=[],entry={value:'0016D15B'};
  const context=vm.createContext({customPanel:root,document:{querySelector(){throw Error('Used hidden panel');}},idBrowserSelected:entry,idBrowserQuantity:1,idBrowserAction:()=> 'additem',requestIdBrowserQuickAction:(e,q)=>commands.push([e,q]),toggleIdFavorite:e=>favorites.push(e),setStatus:()=>{throw Error('Invalid quantity');}});
  vm.runInContext(stripTypeScriptTypes(fn),context);
  context.bindIdBrowserSelectionActions(root);
  quantity.handlers.input();add.handlers.click();favorite.handlers.click();
  assert.equal(context.idBrowserQuantity,4);assert.deepEqual(commands,[[entry,4]]);assert.deepEqual(favorites,[entry]);
  assert.match(source,/selectedFavoriteIdKey\) bindIdBrowserSelectionActions\(commandList\)/);
});

test('non-playable Deepseeker variants are restricted without clearing earlier tested findings',()=>{
  for(const id of ['000FBA03','0019228E','00192290','00255521']) {
    const entry=applyArmorFindings({type:'ARMO',value:id,plugin:'Starfield.esm'});
    assert.equal(entry.referenceOnly,true);assert.match(entry.detail,/Non-playable/);
    assert.doesNotMatch(entry.detail,/In-game testing/);
  }
  for(const id of ['0016D15B','0016D15C','0016D2C4']) assert.equal(armorReferenceNote({type:'ARMO',value:id,plugin:'Starfield.esm'}),null);
  assert.equal(applyReviewedFindings(applyArmorFindings({type:'ARMO',value:'0016D2C4',localFormId:'16D2C4',plugin:'Starfield.esm',label:'Deepseeker Spacesuit'})).referenceOnly,false);
  assert.equal(applyArmorFindings({type:'ARMO',value:'0016D15B',plugin:'Starfield.esm',label:'Deepseeker'}).label,'Deepseeker Pack');
  assert.equal(armorReferenceNote({type:'ARMO',value:'AB19228E',localFormId:'19228E',plugin:'Other.esm'}),null);
  assert.match(armorReferenceNote({type:'ARMO',value:'0219228E',localFormId:'19228E',plugin:'Starfield.esm'}),/Non-playable/);
  assert.equal(armorReferenceNote({type:'MISC',value:'0019228E',plugin:'Starfield.esm'}),null);
});
