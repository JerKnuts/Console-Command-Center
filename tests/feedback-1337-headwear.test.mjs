import test from 'node:test';
import assert from 'node:assert/strict';
import {applyReviewedFindings} from '../src/views/console.command-center/main/reviewed-id-findings.ts';
const cases=[['SFBGS050.esm','093519','Crew Marine Helmet'],['Starfield.esm','21F3F4','First Soldier Helmet'],['Starfield.esm','3CD812','Generdyne Guard Helmet'],['Starfield.esm','1F73EF','Neon Security Helmet'],['Starfield.esm','37A34F','Ryujin Guard Helmet'],['Starfield.esm','165718','Security Guard Helmet'],['Starfield.esm','14E44E','Trident Guard Helmet'],['ShatteredSpace.esm','0C94CA',"Va’ruun Guard Elite Helmet"],['ShatteredSpace.esm','0C94CB',"Va’ruun Guard Helmet"]];
test('October 22 clothing helmets move to Apparel by exact owner/local identity across load orders',()=>{
 for(const [plugin,localFormId,label]of cases){const entry={plugin,localFormId,label,value:'08'+localFormId,type:'ARMO',category:'Helmets'};const result=applyReviewedFindings(entry);assert.equal(result.category,'Apparel',label);assert.equal(result.value,entry.value);assert.equal(result.referenceOnly,undefined);assert.equal(applyReviewedFindings({...entry,plugin:'Other.esm'}).category,'Helmets');}
});
test('UC AntiXeno Space Helmet remains a space helmet as confirmed after record verification',()=>{
 const entry={plugin:'Starfield.esm',localFormId:'10A25E',value:'0010A25E',label:'UC AntiXeno Space Helmet',type:'ARMO',category:'Helmets'};assert.equal(applyReviewedFindings(entry).category,'Helmets');
});
