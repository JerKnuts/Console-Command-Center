import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { prepareSampleCommands } from '../src/views/console.command-center/main/batch-library.ts';
import { parseBatchCommands } from '../src/views/console.command-center/main/command-syntax.ts';
import { GENERATED_ID_CATALOG } from '../src/views/console.command-center/main/id-browser-data.ts';

const directory = new URL('../batches/included/', import.meta.url);
const names = await readdir(directory);
const read = async name => (await readFile(new URL(name + '.txt', directory), 'utf8')).replace(/\r\n/g,'\n');

test('included library contains real, documented .txt batches and all four weapon kits', async () => {
  assert.equal(names.filter(name => name.endsWith('.txt')).length, 25);
  for (const name of names) {
    const content = await readFile(new URL(name, directory), 'utf8');
    assert.ok(content.trimStart().startsWith('#'), name);
    assert.ok(parseBatchCommands(content).length > 0, name);
  }
  assert.deepEqual(parseBatchCommands(await read('Weapon Test Kit - Ballistic')), [
    'player.additem 000476C4 1', 'player.additem 00028A02 1', 'player.additem 0004AD3E 500',
  ]);
  for (const kind of ['Laser','Particle','Melee']) assert.ok(names.includes(`Weapon Test Kit - ${kind}.txt`));
  for (const stem of ['Quick Surveying','Scanner Visibility','Boostpack Explosions']) assert.ok(names.includes(`${stem} RESET.txt`));
});

test('All Playing Cards adds exactly one complete 52-card deck with named comments',async()=>{
 const content=await read('All Playing Cards'),commands=parseBatchCommands(content);
 assert.equal(commands.length,52);assert.equal(new Set(commands).size,52);
 const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
 const expected=[];
 for(const suit of ['Club','Diamond','Heart','Spade'])for(const rank of ranks){
  const row=GENERATED_ID_CATALOG.find(r=>r.type==='MISC'&&r.keywords?.includes(`ExoticPlayingCard_${suit}_${rank}`));
  assert.ok(row);assert.equal(row.plugin,'Starfield.esm');
  expected.push(`player.additem ${row.value} 1`);assert.ok(content.includes(`# ${row.label}\n`));
 }
 assert.deepEqual(commands,expected);
});

test('All Baseball Caps adds all ten wearable cap variants once without equipping or unrelated hats',async()=>{
 const content=await read('All Baseball Caps'),commands=parseBatchCommands(content);
 const caps=GENERATED_ID_CATALOG.filter(r=>r.type==='ARMO'&&r.keywords?.some(k=>/^Clothes_Baseball_Cap_01(?:_\w+)?$/.test(k)));
 assert.equal(caps.length,10);assert.equal(commands.length,10);assert.equal(new Set(commands).size,10);
 assert.deepEqual(new Set(commands),new Set(caps.map(r=>`player.additem ${r.value} 1`)));
 for(const row of caps){assert.equal(row.plugin,'Starfield.esm');assert.ok(content.includes(`# ${row.label}\n`));}
});

test('settings presets and reset files use explicit checked values', async () => {
  assert.deepEqual(parseBatchCommands(await read('Quick Surveying')), ['setgs iHandScannerPlantsCountBase 1','setgs iHandScannerAnimalCountBase 1']);
  assert.deepEqual(parseBatchCommands(await read('Quick Surveying RESET')), ['setgs iHandScannerPlantsCountBase 8','setgs iHandScannerAnimalCountBase 8']);
  assert.deepEqual(parseBatchCommands(await read('Boostpack Explosions')), ['set 002CCFCB to 75']);
  assert.deepEqual(parseBatchCommands(await read('Boostpack Explosions RESET')), ['set 002CCFCB to 25']);
});

test('official batch IDs follow plugin ownership without changing base-game IDs or unrelated edits', () => {
  const sample = { name:'Mixed', commands:'player.additem 0000ABF9 10\nplayer.additem 0102C475 500', plugin:'ShatteredSpace.esm', sourcePrefix:'01' };
  const plugins = [{plugin:'ShatteredSpace.esm',pluginKind:'full',index:7}];
  assert.equal(prepareSampleCommands(sample, plugins), 'player.additem 0000ABF9 10\nplayer.additem 0702C475 500');
  assert.throws(() => prepareSampleCommands(sample, []), /Load ShatteredSpace/);
  assert.equal(prepareSampleCommands(sample, [], 'player.additem 0000ABF9 20'), 'player.additem 0000ABF9 20');
  assert.equal(prepareSampleCommands(sample, plugins, '# CCC plugin: ShatteredSpace.esm\nplayer.additem 0302C475 12'), '# CCC plugin: ShatteredSpace.esm\nplayer.additem 0702C475 12');
});
