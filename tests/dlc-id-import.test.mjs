import test from 'node:test';
import assert from 'node:assert/strict';
import {GENERATED_ID_CATALOG as entries} from '../src/views/console.command-center/main/id-browser-data.ts';
test('complete DLC catalogs contain named owned records in every supported category',()=>{
 for(const [source,count,plugin] of [['Free Lanes',1666,'SFBGS00D.esm'],['Terran Armada',2043,'SFBGS050.esm']]){
  const rows=entries.filter(x=>x.source===source);
  assert.equal(rows.length,count);
  assert.ok(rows.every(x=>x.plugin===plugin&&x.category!=='Other'));
  for(const type of ['PERK','SPEL']) assert.ok(rows.some(x=>x.type===type));
  assert.ok(rows.filter(x=>x.referenceOnly).every(x=>!x.action&&/reference only/.test(x.detail)));
 }
 assert.ok(!entries.some(x=>x.source==='Free Lanes'&&x.keywords.includes('PlayerFaction')),'base-game override must not receive a DLC runtime prefix');
});

test('packaged quests are excluded from the ID Browser',()=>{assert.ok(entries.every(x=>x.type!=='QUST'));});
