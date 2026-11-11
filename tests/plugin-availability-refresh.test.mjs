import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {registerHooks,stripTypeScriptTypes} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&!/\.[a-z]+$/i.test(s)?s+'.ts':s,c);}});
const {GENERATED_ID_CATALOG}=await import('../src/views/console.command-center/main/id-browser-data.ts');
const {resolvePackagedIdCatalog}=await import('../src/views/console.command-center/main/id-catalog.ts');
const {resolveFavoriteIds}=await import('../src/views/console.command-center/main/favorite-id-resolution.ts');
const {sameActivityItem}=await import('../src/views/console.command-center/main/activity-items.ts');
const {canPreviewModel}=await import('../src/views/console.command-center/main/model-preview.ts');
const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
const fn=stripTypeScriptTypes(source.match(/^async function refreshUnavailableId\b[\s\S]*?^}/m)[0]);
const helmets=GENERATED_ID_CATALOG.filter(e=>['Armada Armored Space Helmet','Armada Space Helmet'].includes(e.label));

test('a fresh active-owner lookup restores both reported helmets after cached missing-plugin state',async()=>{
 assert.equal(helmets.length,2);
 for(const helmet of helmets){
  const unavailable=resolvePackagedIdCatalog(helmets,{ok:true,plugins:[]});
  const selected=unavailable.find(e=>e.value===helmet.value),calls=[],messages=[];let renders=0;
  assert.equal(selected.available,false);
  const reply={ok:true,plugins:[{plugin:'SFBGS050.esm',pluginKind:'full',index:7}]};
  const c=vm.createContext({window:{osfui:{request:async(name,payload)=>{calls.push([name,payload]);return reply;}}},officialEntryRefreshToken:0,
   CONSOLE_COMMAND_CENTER_VERSION:'test',setStatus:(m,k)=>messages.push([m,k]),resolvePackagedIdCatalog,resolveFavoriteIds,sameActivityItem,
   packagedIdCatalog:unavailable,idCatalog:unavailable,modCatalogs:[],idFavorites:[selected],idBrowserSelected:selected,
   officialLoadOrderLoading:null,idCatalogLoadOrderKnown:false,recordDiagnostic(){},writeFavoriteIds(){},render(){renders++;},rerenderKeepingPosition:fn=>fn(),describe:String});
  vm.runInContext(fn,c);await c.refreshUnavailableId(selected);
  assert.equal(c.idBrowserSelected.available,true);assert.equal(c.idBrowserSelected.value,'07'+helmet.localFormId);
  assert.ok(canPreviewModel(c.idBrowserSelected));assert.ok(c.idFavorites[0].available);assert.ok(c.packagedIdCatalog.every(e=>e.available));
  assert.equal(renders,1);assert.equal(calls.length,1);assert.equal(calls[0][0],'console.command-center.pluginLoadOrder');assert.equal(calls[0][1].plugin,'SFBGS050.esm');
  assert.equal(messages.at(-1)[1],'normal');
  c.window.osfui.request=async()=>({ok:true,plugins:[]});await c.refreshUnavailableId(c.idBrowserSelected);
  assert.equal(c.idBrowserSelected.available,false);assert.equal(canPreviewModel(c.idBrowserSelected),false);assert.equal(messages.at(-1)[1],'error');
 }
});
