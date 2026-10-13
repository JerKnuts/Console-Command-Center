import test from 'node:test';
import assert from 'node:assert/strict';
import {orderAmmoEntries} from '../src/views/console.command-center/main/ammo-test-findings.ts';
test('normal ammo comes before companion and reference-only ammo without mutating the catalog',()=>{
 const rows=[{label:'A Companion',value:'00231B1B',type:'AMMO'},{label:'Z Normal',value:'002B5599',type:'AMMO'}, {label:'B Internal',value:'00012345',type:'AMMO',referenceOnly:true},{label:'A Normal',value:'002B5598',type:'AMMO'}];
 assert.deepEqual(orderAmmoEntries(rows).map(x=>x.label),['A Normal','Z Normal','A Companion','B Internal']);
 assert.equal(rows[0].label,'A Companion');
 const mixed=[...rows,{label:'Item',value:'0000000F',type:'MISC'}];
 assert.equal(orderAmmoEntries(mixed),mixed);
});
