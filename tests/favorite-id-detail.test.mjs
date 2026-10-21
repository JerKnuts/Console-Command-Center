import {devFeedbackRow} from '../src/views/console.command-center/main/dev-feedback.ts';
import {uiPreferences,visibleIdRecord} from '../src/views/console.command-center/main/ui-preferences.ts';
import {orderIdEntries} from '../src/views/console.command-center/main/id-record-order.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
const names=new Set(['renderIdFavorites','renderCompactCommandLayout','escapeHtml']);
const funcs=[...source.matchAll(/^function (\w+)\b[\s\S]*?^}/gm)].filter(m=>names.has(m[1])).map(m=>m[0]);
const item={favoriteKey:'ammo:1',label:'Test Ammo',value:'002B5597',type:'AMMO'};
const context=vm.createContext({devFeedbackRow,uiPreferences,visibleIdRecord,orderIdEntries,idTestedClass:()=>'',activeView:'favorites',selectedCommandId:null,selectedFavoriteIdKey:'ammo:1',idFavorites:[item],idBrowserSelected:null,renderSavedCommandFavorites:()=>'',renderCommandListRow:c=>`<button>${c.title}</button>`,renderCommandDetail:()=>'<aside>Command</aside>',renderIdBrowserSelection:()=>'<aside>Selected ID controls</aside>',viewTitle:()=> 'Favorites'});
vm.runInContext(stripTypeScriptTypes(funcs.join('\n')),context);
test('favorite ID list shows only clickable names and keeps its controls in the detail pane',()=>{
 const rows=context.renderIdFavorites();
 assert.match(rows,/data-select-favorite-id="ammo:1"/);
 assert.match(rows,/aria-selected="true"/);
 assert.doesNotMatch(rows,/input|Add to Player|data-open-favorite-id|data-favorite-id-toggle|002B5597/);
 const html=context.renderCompactCommandLayout([]);
 assert.match(html,/<aside class="command-detail-panel favorite-id-detail"[^>]*><aside>Selected ID controls/);
 assert.equal(context.idBrowserSelected,item);
});
test('command selections keep the command detail panel when no ID favorite is selected',()=>{
 context.selectedFavoriteIdKey=null;
 assert.match(context.renderCompactCommandLayout([]),/<aside>Command<\/aside>/);
});

