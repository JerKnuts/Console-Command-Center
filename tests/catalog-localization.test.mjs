import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { refreshCatalogNames } from '../scripts/refresh-catalog-names.mjs';
import { GENERATED_ID_CATALOG } from '../src/views/console.command-center/main/id-browser-data.ts';

test('Terran Armada Mauling Axe uses its localized item name instead of its Editor ID prefix',()=>{
 const row=GENERATED_ID_CATALOG.find(entry=>entry.plugin==='SFBGS050.esm'&&entry.localFormId==='00D2D4'&&entry.type==='WEAP');
 assert.equal(row.label,'Mauling Axe');assert.ok(row.keywords.includes('SFBGS050_FendingMaulingAxe'));assert.equal(row.source,'Terran Armada');
});

test('Free Lanes slate uses its localized title and retains its source and identity',()=>{
 const row=GENERATED_ID_CATALOG.find(entry=>entry.plugin==='SFBGS00D.esm'&&entry.localFormId==='070441'&&entry.type==='BOOK');
 assert.equal(row.label,"Chief Engineer's Final Log");assert.equal(row.source,'Free Lanes');assert.equal(row.action,'additem');
 assert.ok(row.keywords.includes('SFFL_Anchorpoint_AudioSlate_FinalReport'));
});

test('Shattered Space reported titles resolve without changing their record identity', () => {
  for (const [localFormId, label] of Object.entries({'15E713':'An Unknown Ally','0337DF':'One Step Closer','010EF7':'RE: Modulator Installation','11CC3F':'Misthaze Patrol Log','05EAC5':"Misthaze Spacer Captain's Note #1",'01D263':"Misthaze Spacer Grunt's Note"})) {
    const entry = GENERATED_ID_CATALOG.find(row => row.plugin === 'ShatteredSpace.esm' && row.localFormId === localFormId && row.type === 'BOOK');
    assert.equal(entry?.label, label);
    assert.equal(entry.action, 'additem');
  }
});

test('label refresh requires matching provenance and ownership and preserves reviewed fields', () => {
  const entry = {plugin:'ShatteredSpace.esm',localFormId:'000001',type:'BOOK',label:'Internal name',action:null,referenceOnly:true,category:'Books & Notes'};
  const other = {...entry,plugin:'Other.esm'};
  const record = {ownerPlugin:'ShatteredSpace.esm',formID:'01000001',type:'BOOK',name:'Proper title'};
  assert.throws(() => refreshCatalogNames([entry],{records:[record]},'ShatteredSpace.esm'));
  const dataset = {localizationPlugin:'ShatteredSpace.esm',records:[record]};
  const result = refreshCatalogNames([entry,other],dataset,'ShatteredSpace.esm');
  assert.deepEqual(result.entries,[{...entry,label:'Proper title'},other]);
  assert.equal(result.changes.length,1);
  assert.equal(refreshCatalogNames([entry],{...dataset,records:[{...record,ownerPlugin:'Starfield.esm'}]},'ShatteredSpace.esm').changes.length,0);
  assert.equal(refreshCatalogNames(result.entries,dataset,'ShatteredSpace.esm').changes.length,0);
});

test('extractor selects only the owning plugin English STRINGS, ignoring colliding keys', async () => {
  const directory = await mkdtemp(join(tmpdir(),'ccc-localization-'));
  const field = (tag, bytes) => {const header=Buffer.alloc(6);header.write(tag);header.writeUInt16LE(bytes.length,4);return Buffer.concat([header,bytes]);};
  const record = (tag, bytes, id=0) => {const header=Buffer.alloc(24);header.write(tag);header.writeUInt32LE(bytes.length,4);header.writeUInt32LE(id,12);return Buffer.concat([header,bytes]);};
  try {
    const plugin=join(directory,'ShatteredSpace.esm');
    const full=Buffer.alloc(4);full.writeUInt32LE(1);
    await writeFile(plugin,Buffer.concat([record('TES4',field('MAST',Buffer.from('Starfield.esm\0'))),record('BOOK',Buffer.concat([field('EDID',Buffer.from('InternalSlate\0')),field('FULL',full)]),0x01000001)]));
    const tables=[['strings/starfield_en.strings','Wrong base name'],['strings/shatteredspace_en.strings','Correct DLC title'],['strings/shatteredspace_en.dlstrings','Wrong dialogue'],['strings/shatteredspace_fr.strings','Wrong language']];
    const tableData=tables.map(([,value])=>{const text=Buffer.from(value+'\0');const data=Buffer.alloc(16+text.length);data.writeUInt32LE(1);data.writeUInt32LE(text.length,4);data.writeUInt32LE(1,8);text.copy(data,16);return data;});
    const names=Buffer.concat(tables.map(([name])=>{const bytes=Buffer.from(name),size=Buffer.alloc(2);size.writeUInt16LE(bytes.length);return Buffer.concat([size,bytes]);}));
    const header=Buffer.alloc(24);header.write('BTDX');header.writeUInt32LE(1,4);header.write('GNRL',8);header.writeUInt32LE(tables.length,12);header.writeBigUInt64LE(BigInt(24+tables.length*36),16);
    let offset=24+tables.length*36+names.length;
    const records=tableData.map(data=>{const bytes=Buffer.alloc(36);bytes.writeBigUInt64LE(BigInt(offset),16);bytes.writeUInt32LE(data.length,28);offset+=data.length;return bytes;});
    const archive=join(directory,'Localization.ba2');await writeFile(archive,Buffer.concat([header,...records,names,...tableData]));
    const output=join(directory,'records.json');execFileSync(process.execPath,['scripts/extract-id-records.mjs',plugin,archive,'--output='+output],{cwd:new URL('..',import.meta.url)});
    const result=JSON.parse(await readFile(output,'utf8'));
    assert.equal(result.localizationPlugin,'ShatteredSpace.esm');assert.equal(result.records[0].name,'Correct DLC title');assert.equal(result.records[0].ownerPlugin,'ShatteredSpace.esm');
  } finally { await rm(directory,{recursive:true,force:true}); }
});
