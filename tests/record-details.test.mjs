import test from 'node:test';
import assert from 'node:assert/strict';
import {canInspectRecord,descriptionText,validateDetails,createDetailsLoader} from '../src/views/console.command-center/main/record-details.ts';
const details=id=>({ok:true,formId:id,description:'Overview',stats:[],effects:[]});
test('aid, armor, skills, traits and powers are inspectable without enabling Advanced Options',()=>{
 for(const type of ['ALCH','ARMO','WEAP','PERK','SPEL','MGEF','AMMO','MISC','BOOK'])assert.equal(canInspectRecord({type,value:'0029A851'}),true);
 for(const entry of [{type:'CELL',value:'00001234'},{type:'ARMO',value:'00001234',available:false},{type:'PERK',value:'../oops'}])assert.equal(canInspectRecord(entry),false);
});
test('effect text substitutes real values and preserves percent units supplied by the game',()=>{
 assert.equal(descriptionText('<ID=00000001><b>Damage</b> +<mag>%<br>for <dur> seconds.',{magnitude:25,duration:120}),'Damage +25%\nfor 120 seconds.');
 assert.equal(descriptionText('Magnitude <mag>, duration <dur>'), 'Magnitude [varies], duration [varies]');
 assert.equal(descriptionText('Area <area>',{area:4}),'Area 4');
});
test('wrong IDs, nonfinite stats and malformed effects/ranks cannot populate another selection',()=>{
 assert.throws(()=>validateDetails(details('00000001'),'00000002'));
 assert.throws(()=>validateDetails({...details('00000001'),stats:[{label:'Damage',value:NaN}]},'00000001'));
 assert.throws(()=>validateDetails({...details('00000001'),effects:[{description:{html:'bad'}}]},'00000001'));
 assert.throws(()=>validateDetails({...details('00000001'),ranks:[{rank:0,description:'bad'}]},'00000001'));
});
test('inspection requests serialize, discard queued stale selections, cache successful reads and retry errors',async()=>{
 const calls=[];let release;const gate=new Promise(r=>release=r);
 const loader=createDetailsLoader(async(name,{formId})=>{calls.push([name,formId]);if(formId==='00000001')await gate;if(formId==='00000003'&&calls.filter(c=>c[1]===formId).length===1)throw Error('busy');return details(formId);});
 const first=loader('00000001',()=>true);await Promise.resolve();let current=true;const second=loader('00000002',()=>current);const rejected=assert.rejects(second,/Selection changed/);current=false;release();await first;await rejected;
 await loader('00000001',()=>true);assert.equal(calls.length,1);
 await assert.rejects(loader('00000003',()=>true),/busy/);await loader('00000003',()=>true);assert.equal(calls.length,3);
 assert.ok(calls.every(c=>c[0]==='console.command-center.inspectRecord'));
});

test('the live inspection request explicitly includes the inspect operation',async()=>{
 const load=createDetailsLoader(async(name,payload)=>{assert.equal(name,'console.command-center.inspectRecord');assert.deepEqual(payload,{formId:'0029A851',operation:'inspect'});return details(payload.formId);});
 await load('0029a851',()=>true);
});
