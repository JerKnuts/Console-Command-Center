import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)?specifier+'.ts':specifier,context);}});
const {resolveFavoriteIds}=await import('../src/views/console.command-center/main/favorite-id-resolution.ts');
const mod=(plugin,local,value,kind='full')=>({favoriteKey:'stable:'+plugin,label:'Same item name',value,type:'MISC',category:'Resources',plugin,localFormId:local,pluginKind:kind,source:'mod',savedFrom:'mod-browser',available:true});

test('saved mod favorites use current full, medium and small slots without changing stable identity',()=>{
 const favorites=[mod('Full.esm','001234','05001234'),mod('Medium.esm','0234','FD020234','medium'),mod('Small.esm','234','FE002234','small')];
 const original=structuredClone(favorites);
 const result=resolveFavoriteIds(favorites,[],{ok:true,plugins:[{plugin:'FULL.ESM',pluginKind:'full',index:7},{plugin:'Medium.esm',pluginKind:'medium',index:6},{plugin:'Small.esm',pluginKind:'small',index:5}]});
 assert.deepEqual(result.map(e=>e.value),['07001234','FD060234','FE005234']);
 assert.deepEqual(result.map(e=>e.favoriteKey),favorites.map(e=>e.favoriteKey));
 assert.ok(result.every(e=>e.available));assert.deepEqual(favorites,original);
});

test('official favorites refresh catalog corrections by owner and local ID, including legacy aliases',()=>{
 const favorite={favoriteKey:'legacy',label:'Old name',value:'01000123',type:'WEAP',category:'Weapons',plugin:'DLC.esm',localFormId:'000123',source:'Shattered Space',savedFrom:'id-browser'};
 const catalog=[{...favorite,label:'Correct name',value:'01000456',localFormId:'000456',alternateFormIds:['01000123']},{...favorite,plugin:'Other.esm',label:'Wrong owner'}];
 const [result]=resolveFavoriteIds([favorite],catalog,{ok:true,plugins:[{plugin:'DLC.esm',pluginKind:'full',index:3}]});
 assert.equal(result.label,'Correct name');assert.equal(result.value,'03000456');assert.equal(result.favoriteKey,'legacy');
});

test('missing owners, incompatible legacy IDs, invalid slots and unknown load order cannot use saved runtime IDs',()=>{
 const removed=mod('Removed.esm','001234','08001234');
 const noLocal={...mod('Present.esm','001234','FE005234'),localFormId:undefined};
 const tooLarge=mod('Small.esm','1234','FE002234','small');
 const result=resolveFavoriteIds([removed,noLocal,tooLarge],[],{ok:true,plugins:[{plugin:'Present.esm',pluginKind:'full',index:5},{plugin:'Small.esm',pluginKind:'small',index:2}]});
 assert.ok(result.every(e=>e.available===false));
 assert.equal(resolveFavoriteIds([removed],[],null)[0].available,false);
 assert.equal(resolveFavoriteIds([removed],[],{ok:false,plugins:[{plugin:'Removed.esm',pluginKind:'full',index:8}]})[0].available,false);
});

test('removed plugins become usable again when present, and names never substitute for record identity',()=>{
 const entry={...mod('Return.esm','001234','08001234'),available:false};
 const [resolved]=resolveFavoriteIds([entry],[{...entry,plugin:'Other.esm',value:'01000001',localFormId:'000001',label:entry.label}],{ok:true,plugins:[{plugin:'Return.esm',pluginKind:'full',index:4}]});
 assert.equal(resolved.available,true);assert.equal(resolved.value,'04001234');assert.equal(resolved.localFormId,'001234');
});

test('legacy mod favorites recover local identity from the saved slot format then resolve the current owner slot',()=>{
 const favorites=[{...mod('Full.esm','001234','05001234'),localFormId:undefined},{...mod('Medium.esm','1234','FD021234','medium'),localFormId:undefined},{...mod('Small.esm','234','FE002234','small'),localFormId:undefined}];
 const result=resolveFavoriteIds(favorites,[],{ok:true,plugins:[{plugin:'Full.esm',pluginKind:'full',index:7},{plugin:'Medium.esm',pluginKind:'medium',index:6},{plugin:'Small.esm',pluginKind:'small',index:5}]});
 assert.deepEqual(result.map(x=>x.value),['07001234','FD061234','FE005234']);assert.deepEqual(result.map(x=>x.localFormId),['001234','1234','234']);assert.ok(result.every(x=>x.available));
});

test('legacy Mod Browser provenance remains mod-owned and favorites without an owner stay unavailable',()=>{
 const old={...mod('Mod.esm','001234','05001234'),source:undefined};const reply={ok:true,plugins:[{plugin:'Mod.esm',pluginKind:'full',index:8}]};assert.equal(resolveFavoriteIds([old],[],reply)[0].source,'mod');assert.equal(resolveFavoriteIds([{...old,plugin:undefined}],[],reply)[0].available,false);
});
