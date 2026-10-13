import test from 'node:test';
import assert from 'node:assert/strict';
import {GAME_SETTINGS} from '../src/views/console.command-center/main/game-settings-data.ts';
import {gameSettingGroup,gameSettingMatches,gameSettingInspectCommand} from '../src/views/console.command-center/main/game-settings-catalog.ts';
test('game settings preserve unique names, missing references, and supplied IDs',()=>{
 assert.equal(GAME_SETTINGS.length,8705);
 assert.equal(new Set(GAME_SETTINGS.map(x=>x.name.toLowerCase())).size,8705);
 assert.equal(GAME_SETTINGS.filter(x=>x.formId).length,2312);
 const base=GAME_SETTINGS.find(x=>x.name==='fHandScannerBaseRange');
 assert.equal(base.formId,null);
 assert.equal(base.masterValue,null);
 assert.equal(base.referenceValue,50);
 assert.equal(GAME_SETTINGS.find(x=>x.name==='fHandScannerScanRange').formId,'000DF135');
});
test('settings search and read-only commands use names rather than Form IDs',()=>{
 const setting=GAME_SETTINGS.find(x=>x.name==='uSpaceshipMaximumOwnedSpaceships');
 assert.equal(gameSettingGroup(setting),'MAIN / Ships');
 assert.ok(gameSettingMatches(setting,'ships unsigned'));
 assert.ok(gameSettingMatches(setting,'0010C4AA'));
 assert.equal(gameSettingInspectCommand(setting),'getgs uSpaceshipMaximumOwnedSpaceships');
 assert.throws(()=>gameSettingInspectCommand({...setting,name:'anything\nsetgs test 1'}));
 assert.equal(gameSettingGroup(GAME_SETTINGS.find(x=>x.name==='fHandScannerScanRange')),'MAIN / Scanner');
});

test('spreadsheet categories remain intact outside MAIN',()=>{
 for(const setting of GAME_SETTINGS.filter(x=>x.category.toUpperCase()!=='MAIN')) assert.equal(gameSettingGroup(setting),setting.category);
 assert.equal(gameSettingGroup({name:'fWeaponDamage',category:'AimModel'}),'AimModel');
 assert.equal(gameSettingGroup({name:'fSomeCamera',category:'CameraShot'}),'CameraShot');
 assert.ok(GAME_SETTINGS.some(x=>gameSettingGroup(x)==='BoostPack'));
});
