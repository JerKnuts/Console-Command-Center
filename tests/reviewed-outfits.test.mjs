import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)?specifier+'.ts':specifier,context);}});
const {mergeGeneratedIdCatalog,resolvePackagedIdCatalog}=await import('../src/views/console.command-center/main/id-catalog.ts');
const {GENERATED_ID_CATALOG}=await import('../src/views/console.command-center/main/id-browser-data.ts');
const {reviewedWasTested}=await import('../src/views/console.command-center/main/reviewed-id-findings.ts');
test('tested companion outfit pairs collapse and retain alternate IDs',()=>{
 const entries=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 for(const [name,primary,alternate] of [["Andreja's Outfit",'001341E4','001C8E09'],["Barrett's Outfit",'0001D1DB','001C8E07'],["Sam Coe's Outfit",'0001D1DE','001C8E06'],["Sarah Morgan's Outfit",'00055905','001C8E08']]){
   const outfits=entries.filter(entry=>entry.label===name);
   assert.equal(outfits.length,1);assert.equal(outfits[0].value,primary);assert.deepEqual(outfits[0].alternateFormIds,[alternate]);
   assert.ok(outfits[0].keywords.includes(alternate));
   const resolved=resolvePackagedIdCatalog(outfits,{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:2}]})[0];
   assert.equal(resolved.alternateFormIds[0],'02'+alternate.slice(2));
 }
 assert.equal(entries.find(entry=>entry.value==='003E3D51').label,'Freestar Ambassador Suit');
 assert.equal(entries.find(entry=>entry.value==='001C0F34').label,'Bounty Hunter Seek Pack');
 assert.equal(reviewedWasTested({value:'0012B4B3',plugin:'Starfield.esm'}),true);
 assert.equal(reviewedWasTested({value:'0012B4B3',plugin:'Other.esm'}),false);
});


test('October 14 aid feedback merges only confirmed duplicate records and retains alternate searches',()=>{
 const entries=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 for(const [label,id,alternate] of [['Antibiotic Paste','0003D3AE','00299590'],['Dwarf Star Heart','00299599','00122EB6'],['Giant Heart','0029959A','00122EA3'],['Repairing Immobilizer','00224D61','0003D3B1']]){
  const found=entries.filter(e=>e.label===label);assert.equal(found.length,1);assert.equal(found[0].value,id);assert.deepEqual(found[0].alternateFormIds,[alternate]);assert.ok(found[0].keywords.includes(alternate));assert.equal(entries.some(e=>e.value===alternate),false);
 }
 for(const id of ['0003D8B2','002EE09E','00313266','00313281','002EE09C','002EE801','002EE98F','00260A16']){const entry=entries.find(e=>e.value===id);assert.ok(entry?.referenceOnly,id);assert.match(entry.detail,/Add to Player is disabled/);}
 assert.equal(entries.filter(e=>e.label==='Fed').length,3);assert.equal(entries.filter(e=>e.label==='Hydrated').length,3);
 assert.equal(entries.find(e=>e.value==='0003D3B2').referenceOnly,undefined);
});

test('October 14 names follow owning plugins and keep original names searchable',()=>{
 const entries=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 for(const [id,label] of [['0107DFC6',"Mal'siir"],['0204AE38','Food?'],['0113F220','Remain Vigilant'],['0113F314',"The Zealot's Plan"],['01141E42','EOD Report'],['011498BA','Shadow'],['0114DE2F','Climbing Routes (2/6)'],['0114DFF7','Climbing Routes (3/6)'],['011452FB','Dead Drop Note']]){
  const entry=entries.find(e=>e.plugin===(id.startsWith('02')?'SFBGS00D.esm':'ShatteredSpace.esm')&&e.localFormId===id.slice(-6));assert.equal(entry?.label,label,id);assert.ok(entry.keywords.includes(entry.originalName));
 }
});


test('late October 14 helmet feedback restricts only the exact reported records',()=>{
 const entries=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 for(const id of ['25176A','192298','192292','16E0B5','192295','1ED06C','1ED06E','1E2AC1','192299','108A8E'])assert.equal(entries.find(e=>e.value==='00'+id)?.referenceOnly,true,id);
 for(const id of ['052792','169F54'])assert.equal(entries.find(e=>e.value==='00'+id)?.referenceOnly,undefined,id);
 for(const [localFormId,label] of [['0B732B',"Va'ruun Memorial Helmet"],['0AC80F',"Valrak's Battle Helmet"],['0300D0',"Va'ruun Assault Helmet"],['00083E','Zealot Assault Helmet']])assert.equal(entries.find(e=>e.plugin==='ShatteredSpace.esm'&&e.localFormId===localFormId)?.label,label);
});


test('22:55 pack report applies exact records, working variants, names and ordering', async()=>{
 const {applyReviewedFindings}=await import('../src/views/console.command-center/main/reviewed-id-findings.ts');
 const {orderIdEntries}=await import('../src/views/console.command-center/main/id-record-order.ts');
 const entries=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 const refs=["starfield.esm:105EAD", "starfield.esm:192296", "starfield.esm:255548", "starfield.esm:192291", "starfield.esm:255544", "starfield.esm:10462F", "starfield.esm:19228F", "starfield.esm:255545", "starfield.esm:108DB9", "starfield.esm:19229A", "starfield.esm:12AAC6", "starfield.esm:10738A", "starfield.esm:20FFAF", "starfield.esm:052793", "starfield.esm:104635"];
 const works=["starfield.esm:2EDF1F", "starfield.esm:16E0B6", "starfield.esm:1E2AF7", "shatteredspace.esm:0EADF0", "starfield.esm:003E90"];
 const find=key=>{const [plugin,local]=key.split(':');return entries.find(e=>e.plugin?.toLowerCase()===plugin&&e.localFormId===local);};
 for(const key of refs){const entry=find(key);assert.equal(entry?.referenceOnly,true,key);assert.match(entry.detail,/Add to Player is disabled/);assert.equal(applyReviewedFindings({...entry,plugin:'Other.esm',referenceOnly:undefined}).referenceOnly,undefined);}
 for(const key of works){const entry=find(key);assert.ok(entry,key);assert.equal(entry.referenceOnly,undefined,key);assert.equal(reviewedWasTested(entry),true,key);}
 const names=[["shatteredspace.esm:0EADF0", "Va'ruun Power Pack"], ["shatteredspace.esm:0300CE", "Va'ruun Assault Pack"], ["shatteredspace.esm:00085C", "Zealot Assault Pack"], ["starfield.esm:1773BD", "SY-920 Pilot Pack"], ["starfield.esm:398105", "SysDef Pack"], ["starfield.esm:2AAF43", "SysDef Pilot Pack"], ["starfield.esm:029C7A", "Tunnel Mining Pack"], ["starfield.esm:10A25D", "Armor-Plated UC AntiXeno Pack"], ["starfield.esm:20612F", "UC AntiXeno Pack"], ["starfield.esm:3E3D4F", "UC Vanguard Pilot Pack"]];
 for(const [key,label] of names){const entry=find(key);assert.equal(entry?.label,label,key);assert.ok(entry.keywords.includes(entry.originalName));const moved=applyReviewedFindings({...entry,value:'09'+entry.localFormId});assert.equal(moved.label,label);}
 const sorted=orderIdEntries([...refs,...works].map(find));assert.equal(sorted.slice(0,works.length).every(e=>!e.referenceOnly),true);assert.equal(sorted.slice(works.length).every(e=>e.referenceOnly),true);
});


test('October 15 helmet feedback is scoped to exact records and moves apparel headwear', async()=>{
 const {applyReviewedFindings}=await import('../src/views/console.command-center/main/reviewed-id-findings.ts');
 const entries=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 assert.equal(entries.find(e=>e.value==='00192290').referenceOnly,true);
 assert.equal(entries.find(e=>e.value==='0016D15C').referenceOnly,undefined);
 for(const id of ["1466F8", "1466F9", "0781F7", "1466FC", "0781F8", "1466FD", "1466F7", "1466FB"]){const entry=entries.find(e=>e.value==='00'+id);assert.equal(entry.category,'Apparel');assert.equal(reviewedWasTested(entry),true);assert.equal(applyReviewedFindings({value:'00'+id,localFormId:id,plugin:'Other.esm',label:'Helmet',category:'Helmets'}).category,'Helmets');}
 assert.equal(entries.find(e=>e.value==='001466F8').label,'Gray Graviplas Helmet');assert.equal(entries.find(e=>e.value==='001466F9').label,'Teal Graviplas Helmet');
 for(const key of ["starfield.esm:2EDE9C", "starfield.esm:1466F8", "starfield.esm:1466F9", "starfield.esm:0781F7", "starfield.esm:1466FC", "starfield.esm:0781F8", "starfield.esm:1466FD", "starfield.esm:1C0F32", "starfield.esm:1466F7", "starfield.esm:1466FB", "starfield.esm:1E2B17", "starfield.esm:03B424", "starfield.esm:169F54", "starfield.esm:06ABFF", "starfield.esm:16D15C", "starfield.esm:13F97B", "starfield.esm:066827", "starfield.esm:066829", "starfield.esm:06682B", "sfbgs050.esm:081767", "shatteredspace.esm:018183", "starfield.esm:25E8D5", "starfield.esm:16D3D1"]){const [plugin,localFormId]=key.split(':');const entry=entries.find(e=>e.plugin?.toLowerCase()===plugin&&e.localFormId===localFormId);assert.ok(entry,key);assert.equal(reviewedWasTested(entry),true,key);assert.equal(entry.referenceOnly,undefined,key);}
});


test('black Graviplas headwear follows the October 15 Apparel correction',()=>{
 const entries=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 for(const id of ['001466F6','001466FA'])assert.equal(entries.find(e=>e.value===id).category,'Apparel');
});
