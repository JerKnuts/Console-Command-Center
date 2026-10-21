import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile,rename,unlink} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {includedBatchStore,batchLines} from '../scripts/included-batches.mjs';
await mkdir(resolve('build'),{recursive:true});
test('browser included-file backend preserves edits/deletions and discovers renamed and new runnable files',async()=>{
 const directory=await mkdtemp(resolve('build/included-batches-test-')),store=includedBatchStore(directory),samples=[{name:'First',commands:'tgm ; note\n'},{name:'Second',commands:'tcl\n'}];
 assert.equal((await store({samples})).entries.length,2);
 await writeFile(join(directory,'First.txt'),'getgs "name;#" ; edited\n');
 await store({samples});assert.equal((await store({name:'First'})).entry.commands,'getgs "name;#" ; edited\n');
 await rename(join(directory,'First.txt'),join(directory,'Renamed.txt'));await writeFile(join(directory,'My Batch.txt'),'getgs fJumpHeightMin\n');await unlink(join(directory,'Second.txt'));
 const entries=(await store({samples})).entries;assert.deepEqual(entries.map(e=>e.name).sort(),['My Batch','Renamed']);
 assert.equal(entries.find(e=>e.name==='Renamed').commandCount,1);
 await assert.rejects(store({name:'../outside'}));await assert.rejects(store({samples:[{name:'Bad',commands:'; comments only\n'}]}));
 assert.deepEqual(batchLines(' ; heading\ntgm # note\ncommand "literal;#" ; end'),['tgm','command "literal;#"']);
});

test('renamed included batches preserve edits, honor deletions, avoid overwriting collisions and migrate once',async()=>{
 const directory=await mkdtemp(resolve('build/included-renames-test-')),store=includedBatchStore(directory);
 const old=['Reset Quick Surveying','Reset Scanner Visibility','Reset Boostpack Explosions','More Boostpack Explosions'];
 const fresh=['Quick Surveying RESET','Scanner Visibility RESET','Boostpack Explosions RESET','Boostpack Explosions'];
 await store({samples:old.map(name=>({name,commands:'tgm\n'}))});
 await writeFile(join(directory,old[0]+'.txt'),'# user edit\ntcl\n');
 await unlink(join(directory,old[1]+'.txt'));
 await writeFile(join(directory,fresh[2]+'.txt'),'# existing destination\ntfc\n');
 const samples=fresh.map((name,i)=>({name,previousName:old[i],commands:'getgs fJumpHeightMin\n'}));
 const reply=await store({samples});
 assert.equal((await store({name:fresh[0]})).entry.commands,'# user edit\ntcl\n');
 assert.ok(!reply.entries.some(e=>e.name===old[0]));
 assert.ok(!reply.entries.some(e=>e.name===fresh[1]));
 assert.equal((await store({name:fresh[2]})).entry.commands,'# existing destination\ntfc\n');
 assert.equal((await store({name:old[2]})).entry.commands,'tgm\n');
 await unlink(join(directory,fresh[0]+'.txt'));await store({samples});
 assert.ok(!(await store({})).entries.some(e=>e.name===fresh[0]));
 await assert.rejects(store({samples:[{name:'Bad',previousName:'../outside',commands:'tgm'}]}));
});
