import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseTranslationPack,createTranslator,parseTranslationChoices,defaultTranslationFile,installTranslations} from '../src/views/console.command-center/main/translations.ts';
import {discoverTranslations} from '../scripts/translations-preview.mjs';
import {mkdtemp,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {csvRead,csvWrite,importCsv,displayFragments,sectionedTranslationPack} from '../scripts/translations.mjs';
import {createHash} from 'node:crypto';
const make=messages=>parseTranslationPack({schemaVersion:1,locale:'zh-CN',languageName:'简体中文',messages});
test('English-only mode leaves ordinary DOM updates alone instead of walking the document',async()=>{
 const frames=[];let callback,walks=0;
 const previous=Object.fromEntries(['document','localStorage','navigator','requestAnimationFrame','MutationObserver'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 try{
  Object.defineProperty(globalThis,'document',{configurable:true,value:{body:{},documentElement:{lang:'en'},querySelector:()=>null,querySelectorAll:()=>[],createTreeWalker(){walks++;throw Error('English should not walk DOM text');}}});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{languages:['en-US']}});
  globalThis.localStorage={getItem:()=>null};globalThis.requestAnimationFrame=fn=>{frames.push(fn);return frames.length;};
  globalThis.MutationObserver=class{constructor(fn){callback=fn;}observe(){}disconnect(){}};
  installTranslations(async()=>null);await Promise.resolve();while(frames.length)frames.shift()();
  for(let i=0;i<100;i++)callback([{type:'characterData'},{type:'childList'}]);
  assert.equal(walks,0);assert.equal(frames.length,0);
 }finally{for(const [key,descriptor]of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
test('sectioned templates load as the same translations while duplicate keys and deeper nesting are rejected',()=>{
 const entries=[{english:'Settings',group:'ui',contexts:['main.ts']},{english:'Add Item',group:'commands',contexts:['commands.ts']},{english:'Quest Name',group:'catalog',contexts:['quest-browser.ts']},{english:'Weapon Name',group:'catalog',contexts:['id-browser-data.ts']}];
 const grouped=sectionedTranslationPack(entries);
 assert.deepEqual(Object.keys(grouped.messages),['Interface','Commands','Game Settings','Items','Quests','Game Messages','Batch Labels and Comments']);
 assert.ok(Object.hasOwn(grouped.messages.Quests,'Quest Name'));assert.ok(Object.hasOwn(grouped.messages.Items,'Weapon Name'));
 grouped.messages.Interface.Settings='设置';grouped.messages.Commands['Add Item']='添加物品';
 const pack=parseTranslationPack(grouped);assert.equal(createTranslator(pack)('Settings'),'设置');assert.equal(createTranslator(pack)('Add Item'),'添加物品');
 assert.equal(Object.keys(pack.messages).length,entries.length);
 assert.throws(()=>make({Interface:{Settings:'设置'},Other:{Settings:'設定'}}),/Duplicate/);
 assert.throws(()=>make({Interface:{Nested:{Settings:'设置'}}}),/Invalid/);
 assert.throws(()=>make({Interface:{'Item {0}':'物品'}}),/placeholders/);
});
test('installed languages default automatically while saved choices and English-only installs are preserved',()=>{
 const example={file:'Chinese-example.json',pack:make({Settings:'设置'})};
 const chinese={file:'zh-CN.json',pack:make({Settings:'设置'})};
 const german={file:'de.json',pack:{...make({Settings:'Einstellungen'}),locale:'de',languageName:'Deutsch'}};
 assert.equal(defaultTranslationFile([example],'',true),'en');
 assert.equal(defaultTranslationFile([example,chinese],'',true),chinese.file);
 assert.equal(defaultTranslationFile([example,chinese,german],'',true,['de-DE']),german.file);
 assert.equal(defaultTranslationFile([chinese,german],chinese.file,true,['de-DE']),chinese.file);
 assert.equal(defaultTranslationFile([chinese],'en',true),'en');
 assert.equal(defaultTranslationFile([chinese],'',false),'en');
 assert.equal(defaultTranslationFile([chinese],'removed.json',true),chinese.file);
 assert.equal(defaultTranslationFile([],chinese.file,true),'en');
 assert.equal(defaultTranslationFile([example],example.file,true),example.file);
});
test('translation discovery lists named packs, ignores blank templates, and isolates malformed files',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'ccc-locales-'));
 try{
  await writeFile(join(directory,'Chinese-example.json'),JSON.stringify(make({Settings:'设置'})));
  await writeFile(join(directory,'繁體中文.json'),'\uFEFF'+JSON.stringify({...make({Settings:'設定'}),locale:'zh-TW',languageName:'繁體中文'}));
  await writeFile(join(directory,'Blank.json'),JSON.stringify(make({Settings:''})));
  await writeFile(join(directory,'broken.json'),'{');await writeFile(join(directory,'README.txt'),'Not a language');
  await mkdir(join(directory,'nested.json'));
  const result=parseTranslationChoices(await discoverTranslations(directory));
  assert.equal(result.choices.length,2);assert.deepEqual(result.errors,['broken.json']);
  assert.ok(result.choices.some(entry=>entry.file==='繁體中文.json'&&entry.pack.locale==='zh-TW'));
  assert.equal(parseTranslationChoices(null).choices.length,0);
  assert.equal(parseTranslationChoices(make({Settings:'设置'})).choices[0].file,'active.json');
  assert.equal(parseTranslationChoices({packs:[{file:'../bad.json',pack:make({Settings:'设置'})}]}).choices.length,0);
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('Chinese packs preserve Unicode, blank fallback and literal HTML without interpreting it',()=>{
 const translate=createTranslator(make({'Settings':'设置','Help':'','Close':'<b>关闭</b>'}));
 assert.equal(translate('  Settings\n'),'  设置\n');assert.equal(translate('Help'),'Help');assert.equal(translate('Unknown'),'Unknown');
 assert.equal(translate('Close'),'<b>关闭</b>');assert.equal(createTranslator(null)('Settings'),'Settings');
 const technical=createTranslator(make({'01070E19':'changed','Starfield.esm':'changed','WEAP':'changed'}));
 for(const value of ['01070E19','Starfield.esm','WEAP'])assert.equal(technical(value),value);
 for(const raw of [null,{}, {schemaVersion:1,locale:'../../x',languageName:'x',messages:{}},{schemaVersion:1,locale:'zh-CN',languageName:'x',messages:{A:null}}])assert.throws(()=>parseTranslationPack(raw));
});

test('numbered placeholders may reorder but must preserve repeated values and their counts',()=>{
 const translate=createTranslator(make({'Selected {0}: {1}':'{1}：已选择 {0}','Item {0} and {0}':'物品 {0} 和 {0}'}));
 assert.equal(translate('Selected Weapon: 01070E19'),'01070E19：已选择 Weapon');
 assert.equal(translate('Item A and A'),'物品 A 和 A');assert.equal(translate('Item A and B'),'Item A and B');
 assert.throws(()=>make({'Selected {0}: {1}':'已选择 {0}'}),/placeholders/);
 assert.throws(()=>make({'Item {0} and {0}':'物品 {0}'}),/placeholders/);
 assert.equal(translate('Selected '+ 'x'.repeat(5000)+': y'),'Selected '+'x'.repeat(5000)+': y');
});

test('CSV round trips quotes, newlines and Chinese; import rejects modified English and invalid placeholders',()=>{
 const english='Selected {0}: {1}',id=createHash('sha256').update(english).digest('hex').slice(0,16);
 const rows=[['ID','English','Translation','Group','Context'],[id,english,'已选择 {0}：{1}','ui','file:1']];
 assert.deepEqual(csvRead(csvWrite(rows)),rows);assert.equal(importCsv(csvWrite(rows)).messages[english],'已选择 {0}：{1}');
 assert.deepEqual(csvRead(csvWrite([['quoted "word"','line\n二行',',']])) ,[['quoted "word"','line\n二行',',']]);
 assert.throws(()=>importCsv(csvWrite([rows[0],[id,'Changed','','ui','file']])),/English/);
 assert.throws(()=>importCsv(csvWrite([rows[0],[id,english,'{0}','ui','file']])),/placeholders/);
});

test('HTML extraction includes visible text and accessible labels but excludes markup attributes and executable examples',()=>{
 assert.deepEqual(displayFragments('<button data-id="internal" title="Copy ID">Copy</button><code>player.additem 0000000F 10</code>'),['Copy ID','Copy']);
 const source=readFileSync(new URL('../src/views/console.command-center/main/translations.ts',import.meta.url),'utf8');
 assert.ok(source.includes('#results-output'));assert.ok(source.includes('textarea,input'));assert.ok(!source.includes('.innerHTML ='));
 const pack=make(JSON.parse(readFileSync(new URL('../translations/Chinese-example.json',import.meta.url),'utf8')).messages);
 assert.equal(createTranslator(pack)('Settings'),'设置');
});
