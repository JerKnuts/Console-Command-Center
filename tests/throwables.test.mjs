import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {GENERATED_ID_CATALOG} from '../src/views/console.command-center/main/id-browser-data.ts';
import {throwableKind} from '../src/views/console.command-center/main/throwables.ts';
import {previewOrientation,orientPreviewMeshes} from '../src/views/console.command-center/main/preview-orientation.ts';
registerHooks({resolve(s,c,next){return next(s.startsWith('.')&&!/\.[a-z]+$/i.test(s)?s+'.ts':s,c);}});
const {mergeGeneratedIdCatalog,ID_BROWSER_CATEGORIES,idCategoryForRecordType}=await import('../src/views/console.command-center/main/id-catalog.ts');
const {modRecordCategory}=await import('../src/views/console.command-center/main/mod-catalog.ts');

test('throwables have their own group while weapon pickers retain both groups',()=>{
 const catalog=mergeGeneratedIdCatalog(GENERATED_ID_CATALOG);
 for(const local of ['389F34','0115EF','04A41A','26D89F','26F180','389F33','26D89D','3C23E3','3C23E4']){
  const entry=catalog.find(e=>e.plugin==='Starfield.esm'&&e.localFormId===local);assert.ok(entry,local);assert.equal(entry.category,'Throwables');assert.equal(entry.action,'additem');
 }
 assert.ok(catalog.filter(e=>e.category==='Throwables').length>=16);
 assert.deepEqual(ID_BROWSER_CATEGORIES.find(c=>c.value==='throwables').builtInCategories,['Throwables']);
 assert.equal(idCategoryForRecordType('WEAP'),'all');
 for(const label of ['Mine','Terrormorph Grenade'])assert.equal(catalog.find(e=>e.label===label&&e.type==='AMMO').category,'Ammo');
});

test('mod and localized labels use item identity without moving launchers or ammo',()=>{
 assert.equal(modRecordCategory({type:'WEAP',category:'Weapons',label:'Granada',editorId:'Mod_FragGrenade'}),'Throwables');
 assert.equal(throwableKind({type:'WEAP',label:'Localized name',editorId:'TeslaMine'}),'mine');
 for(const row of [{type:'AMMO',label:'Grenade'},{type:'WEAP',label:'Grenade Launcher',editorId:'Mod_GrenadeLauncher'},{type:'WEAP',label:'Mining Laser',editorId:'MineLauncher'},{type:'STAT',label:'Frag Mine'}])assert.equal(throwableKind(row),undefined);
});

test('grenade orientation makes the authored long axis upright without changing topology',()=>{
 const orientation=previewOrientation('WEAP','Throwables','Frag Grenade','FragGrenade');
 const positions=new Float32Array([-1,.2,.3,1,.2,.3]),mesh={positions,indices:new Uint32Array([0,1])};
 orientPreviewMeshes([mesh],orientation);
 assert.ok(Math.abs(positions[0]+.2)<1e-6);assert.ok(Math.abs(positions[1]+1)<1e-6);assert.ok(Math.abs(positions[4]-1)<1e-6);assert.equal(positions[2],positions[5]);assert.deepEqual([...mesh.indices],[0,1]);
 assert.equal(orientation.yaw,0);assert.ok(orientation.pitch>0&&orientation.pitch<.2);
 const mine=previewOrientation('WEAP','Throwables','Cryo Mine','CryoMine');assert.ok(mine.pitch>.4);assert.equal(mine.roll,undefined);
 assert.deepEqual(previewOrientation('AMMO','Ammo','Mine','AmmoSpaceshipMineLauncher'),{yawOffset:Math.PI,pitch:.45});
});
