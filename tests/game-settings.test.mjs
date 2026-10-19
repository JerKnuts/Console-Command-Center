import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {GAME_SETTINGS} from '../src/views/console.command-center/main/game-settings-data.ts';
import {gameSettingGroup,gameSettingMatches,gameSettingInspectCommand,gameSettingWriteCommand,gameSettingResetValue} from '../src/views/console.command-center/main/game-settings-catalog.ts';
import {visibleCommandRecord} from '../src/views/console.command-center/main/ui-preferences.ts';

test('settings controls review writes through execution and inspect through the read-only query route',()=>{
 const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
 const fn=source.match(/^function renderGameSettingsPanel\(\): void \{[\s\S]*?^}/m)[0];
 const handlers=new Map(), requests=[], errors=[];let value='25';
 const setting=GAME_SETTINGS.find(x=>x.name==='fHandScannerScanRange');
 const customPanel={innerHTML:'',querySelector(selector){if(selector==='#game-settings-results')return null;if(selector==='[data-setting-value]')return {value};return {addEventListener:(name,callback)=>handlers.set(selector,callback)};}};
 const context=vm.createContext({customPanel,resultCount:{},gameSettingsError:null,gameSettingsLoaded:true,gameSettings:[setting],query:'ScanRange',selectedGameSetting:setting.name,gameSettingLimits:new Map(),openGameSettingGroups:new Set(),gameSettingMatches,gameSettingGroup,gameSettingInspectCommand,gameSettingResetValue,gameSettingWriteCommand,nativeBackendReady:true,escapeHtml:String,devFeedbackTestedClass:()=>'',devFeedbackButton:()=>'',requestExecution:request=>requests.push(request),setStatus:error=>errors.push(error),describe:String});
 vm.runInContext(stripTypeScriptTypes(fn),context);context.renderGameSettingsPanel();
 handlers.get('[data-apply-setting]')();assert.equal(requests[0].command,'setgs fHandScannerScanRange 25');assert.equal(requests[0].definition.captureOutput,undefined);assert.equal(requests[0].definition.risk,'caution');
 handlers.get('[data-reset-setting]')();assert.equal(requests[1].command,'setgs fHandScannerScanRange 10');assert.equal(requests[1].definition.captureOutput,undefined);
 handlers.get('[data-inspect-setting]')();assert.equal(requests[2].command,'getgs fHandScannerScanRange');assert.equal(requests[2].definition.captureOutput,true);
 value='1; player.kill';handlers.get('[data-apply-setting]')();assert.equal(requests.length,3);assert.equal(errors.length,1);
});

test('advanced settings are gated and numeric changes reject injection and invalid types',()=>{
 assert.equal(visibleCommandRecord({category:'Advanced Settings'},false),false);
 assert.equal(visibleCommandRecord({category:'Advanced Settings'},true),true);
 const setting=GAME_SETTINGS.find(x=>x.name==='fHandScannerScanRange');
 assert.equal(gameSettingResetValue(setting),10);
 assert.equal(gameSettingWriteCommand(setting,'50'),'setgs fHandScannerScanRange 50');
 for(const raw of ['', '1; player.kill', '1\nplayer.kill', 'NaN', 'Infinity']) assert.throws(()=>gameSettingWriteCommand(setting,raw));
 assert.throws(()=>gameSettingWriteCommand({...setting,type:'Integer'},1.5));
 assert.throws(()=>gameSettingWriteCommand({...setting,type:'Unsigned Integer'},-1));
 assert.throws(()=>gameSettingWriteCommand({...setting,type:'Boolean'},2));
 assert.throws(()=>gameSettingWriteCommand({...setting,type:'String'},1));
 assert.equal(gameSettingResetValue({...setting,masterValue:null,engineValue:null,referenceValue:null}),null);
 assert.equal(gameSettingResetValue({...setting,masterValue:8,engineValue:4,referenceValue:2}),8);
});
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
