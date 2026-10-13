import test from 'node:test';
import assert from 'node:assert/strict';
import {ammoReferenceNote,applyAmmoFindings} from '../src/views/console.command-center/main/ammo-test-findings.ts';
test('tested companion ammo is reference-only while normal ammo and other plugins remain actionable',()=>{
 const companion={label:'.43 Ultramag',type:'AMMO',value:'00231B1B',plugin:'Starfield.esm',localFormId:'231B1B'};
 const reviewed=applyAmmoFindings(companion);
 assert.equal(reviewed.label,'.43 Ultramag (Companion)');
 assert.equal(reviewed.referenceOnly,true);
 assert.deepEqual(applyAmmoFindings(reviewed),reviewed);
 assert.equal(ammoReferenceNote({...companion,value:'002B5599',localFormId:'2B5599'}),null);
 assert.equal(ammoReferenceNote({...companion,plugin:'Other.esm'}),null);
 assert.equal(ammoReferenceNote({...companion,type:'MISC'}),null);
});
test('tested special-effect ammo stays restricted after runtime ID remapping',()=>{
 for(const localFormId of ['06497E','087588','2F3F22','2F3F23','030B2F','249FE8','0B2CCD','091157','19B892','1AD730','2197C1']) assert.ok(ammoReferenceNote({type:'AMMO',value:'09249700',localFormId,plugin:'Starfield.esm'}));
});
