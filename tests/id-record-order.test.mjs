import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return next(s.startsWith('.')&&!/\.[a-z]+$/i.test(s)?s+'.ts':s,c);}});
const {orderIdEntries}=await import('../src/views/console.command-center/main/id-record-order.ts');
test('reference-only entries of all types sort below normal records, alphabetically within both groups',()=>{
 const rows=[{label:'Boneshell Hopper',type:'ARMO',value:'00208D95'}, {label:'Z Normal',type:'ARMO',value:'00000100'}, {label:'A Internal',type:'GBFM',value:'00000200',referenceOnly:true}, {label:'A Normal',type:'MISC',value:'0000000F'}, {label:'Companion Ammo',type:'AMMO',value:'00231B1B'}];
 assert.deepEqual(orderIdEntries(rows).map(x=>x.label),['A Normal','Z Normal','A Internal','Boneshell Hopper','Companion Ammo']);
 assert.equal(rows[0].label,'Boneshell Hopper');
 assert.deepEqual(orderIdEntries(orderIdEntries(rows)),orderIdEntries(rows));
});
