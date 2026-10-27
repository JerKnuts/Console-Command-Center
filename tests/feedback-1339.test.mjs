import test from 'node:test';
import assert from 'node:assert/strict';
import {applyReviewedFindings} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
test('late October 22 pack findings preserve ownership across load orders',()=>{
 for(const local of ['06AC01','079206']){const entry={value:'08'+local,plugin:'Starfield.esm',localFormId:local,label:'Pack',category:'Packs',type:'ARMO'};assert.equal(applyReviewedFindings(entry).referenceOnly,true);assert.equal(applyReviewedFindings({...entry,plugin:'Other.esm'}).referenceOnly,undefined);}
 const entry={value:'0811BB99',localFormId:'11BB99',plugin:'ShatteredSpace.esm',label:"Fang's",category:'Packs',type:'ARMO'};assert.equal(applyReviewedFindings(entry).label,"Sturdy Fang's Balanced Pack");assert.equal(applyReviewedFindings({...entry,plugin:'Other.esm'}).label,"Fang's");
});
