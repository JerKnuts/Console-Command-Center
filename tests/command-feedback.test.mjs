import test from 'node:test';
import assert from 'node:assert/strict';
import {applyCommandFeedback,workingCommandCategory,wipCommandOutcome} from '../src/views/console.command-center/main/command-feedback.ts';

test('reviewed WIP groups have default issue colors available to Dev Mode without requiring a local report',()=>{
 assert.equal(wipCommandOutcome({...command,intakeGroup:'Executed — Effect Unconfirmed'}),'uncertain');
 for(const intakeGroup of ['Executed — Issues','Blocked — Known Crash'])assert.equal(wipCommandOutcome({...command,intakeGroup}),'issues');
 assert.equal(wipCommandOutcome(command),undefined);
 assert.equal(wipCommandOutcome({...command,category:'Gameplay',intakeGroup:'Executed — Issues'}),undefined);
});

const command={id:'raw-test',title:'Raw command',command:'ToggleMenus {arguments}',category:'Untested',description:'Test',testStatus:'untested',warning:'Keep the warning.',risk:'caution',intakeGroup:'Engine Console Commands'};
test('working commands leave WIP for their functional category without losing inputs or warnings',()=>{
 for(const [syntax,category] of [['ToggleMenus','Gameplay'],['Help','Gameplay'],['ShowSubtitle 0','Gameplay'],['sexchange','Player'],['player.kill','Player'],['player.additem 0000000F 1','Inventory'],['AddPerk 00000001','Skills'],['GetStage 00000001','Quests'],['PickClosestShip','Targets'],['RefuelSpaceship','Ship'],['ToggleWireframe','Camera'],['SetWeather','World']]) {
  const raw={...command,command:syntax};const result=applyCommandFeedback(raw,'working');
  assert.equal(workingCommandCategory(raw),category);assert.equal(result.category,category);assert.equal(result.testStatus,'verified');assert.equal(result.intakeGroup,undefined);assert.equal(result.warning,raw.warning);assert.equal(raw.category,'Untested');
 }
});
test('issues and uncertain outcomes regroup both WIP and established commands and can be changed back',()=>{
 const raw={...command,category:'Camera',command:'ToggleFlyCam',testStatus:'verified'};
 assert.equal(applyCommandFeedback(raw,'working').category,'Camera');
 const issue=applyCommandFeedback(raw,'issues');assert.equal(issue.category,'Untested');assert.equal(issue.intakeGroup,'Executed — Issues');assert.equal(issue.testStatus,'needs-adjustment');
 const uncertain=applyCommandFeedback(raw,'uncertain');assert.equal(uncertain.intakeGroup,'Executed — Effect Unconfirmed');assert.equal(uncertain.testStatus,'inconclusive');
 assert.equal(applyCommandFeedback(raw).category,'Camera');assert.equal(applyCommandFeedback(raw,'working').category,'Camera');
});
test('a working report never bypasses a disabled command or known crash path',()=>{
 const blocked={...command,unavailableReason:'Known crash.',intakeGroup:'Blocked — Known Crash'};
 for(const outcome of ['working','issues','uncertain']) assert.deepEqual(applyCommandFeedback(blocked,outcome),blocked);
});


test('WIP colors and test labels are gated by Dev Mode while warnings remain visible',async()=>{
 const {readFileSync}=await import('node:fs');const {stripTypeScriptTypes}=await import('node:module');const vm=await import('node:vm');
 const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
 let dev=false;
 const context=vm.createContext({isDevModeEnabled:()=>dev,wipCommandOutcome,devFeedbackTestedClass:()=> ' dev-tested dev-working',selectedCommandId:'raw-test',escapeHtml:s=>s});
 for(const fn of ['commandTestedClass','renderCommandListRow'])vm.runInContext(stripTypeScriptTypes(source.match(new RegExp('^function '+fn+'\\([\\s\\S]*?^}', 'm'))[0]),context);
 const row={...command,intakeGroup:'Executed — Issues',testStatus:'needs-adjustment'};
 let html=context.renderCommandListRow(row);assert.doesNotMatch(html,/dev-tested|wip-status|<span>ISSUE<\/span>/);assert.match(html,/CAUTION/);
 dev=true;html=context.renderCommandListRow(row);assert.match(html,/wip-status/);assert.match(html,/<span>ISSUE<\/span>/);
 dev=false;assert.equal(context.commandTestedClass(row),'');
});
