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
test('issues and uncertain outcomes stay in their category and can be changed back',()=>{
 const raw={...command,category:'Camera',command:'ToggleFlyCam',testStatus:'verified'};
 assert.equal(applyCommandFeedback(raw,'working').category,'Camera');
 const issue=applyCommandFeedback(raw,'issues');assert.equal(issue.category,'Camera');assert.equal(issue.intakeGroup,'Executed — Issues');assert.equal(issue.testStatus,'needs-adjustment');
 const uncertain=applyCommandFeedback(raw,'uncertain');assert.equal(uncertain.category,'Camera');assert.equal(uncertain.intakeGroup,'Executed — Effect Unconfirmed');assert.equal(uncertain.testStatus,'inconclusive');
 assert.equal(applyCommandFeedback(raw).category,'Camera');assert.equal(applyCommandFeedback(raw,'working').category,'Camera');
});

test('a promoted WIP command keeps its reported category on issue or reset, while new WIP reports stay in WIP',()=>{
 for(const outcome of ['issues','uncertain','unreviewed']){
  assert.equal(applyCommandFeedback(command,outcome,'Gameplay').category,'Gameplay');
  assert.equal(applyCommandFeedback(command,outcome,'Untested').category,'Untested');
  assert.equal(applyCommandFeedback(command,outcome,'invalid').category,'Untested');
 }
});

test('clearing Working overrides a shipped green designation without changing its category or inputs',()=>{
 const raw={...command,category:'Player',testStatus:'verified'};
 const cleared=applyCommandFeedback(raw,'unreviewed');
 assert.equal(cleared.testStatus,'untested');assert.equal(cleared.category,'Player');
 assert.equal(cleared.command,raw.command);assert.equal(raw.testStatus,'verified');
 assert.equal(applyCommandFeedback(raw,'working').testStatus,'verified');
});

test('an explicit exported move into WIP Issues survives an older category recorded in local reports',()=>{
 const moved={...command,category:'Untested',intakeGroup:'Executed — Issues',testStatus:'needs-adjustment'};
 const result=applyCommandFeedback(moved,'issues','World');
 assert.equal(result.category,'Untested');assert.equal(result.intakeGroup,'Executed — Issues');
 assert.equal(applyCommandFeedback(moved,'working','World').testStatus,'verified');
});
test('a working report never bypasses a disabled command or known crash path',()=>{
 const blocked={...command,unavailableReason:'Known crash.',intakeGroup:'Blocked — Known Crash'};
 for(const outcome of ['working','issues','uncertain']) assert.deepEqual(applyCommandFeedback(blocked,outcome),blocked);
});


test('command rows have no risk tags and expose sibling Working and Issues actions only in Dev Mode',async()=>{
 const {readFileSync}=await import('node:fs');const {stripTypeScriptTypes}=await import('node:module');const vm=await import('node:vm');
 const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
 const {devFeedbackRow,installDevFeedback,isDevModeEnabled}=await import('../src/views/console.command-center/main/dev-feedback.ts');
 let toggle;const dot={classList:{toggle(){}},setAttribute(){},addEventListener:(_n,f)=>toggle=f};
 const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 globalThis.document={querySelector:s=>s==='#dev-mode-dot'?dot:null,addEventListener(){}};
 installDevFeedback({version:'test',rerender(){},status(){},exportText:async()=>''});
 const mode=()=>{for(let i=0;i<5;i++)toggle();};
 const context=vm.createContext({isDevModeEnabled,wipCommandOutcome,devFeedbackTestedClass:()=> ' dev-tested dev-working',devFeedbackRow,selectedCommandId:'raw-test',favorites:[],escapeHtml:s=>s});
 for(const fn of ['commandTestedClass','renderCommandListRow'])vm.runInContext(stripTypeScriptTypes(source.match(new RegExp('^function '+fn+'\\([\\s\\S]*?^}', 'm'))[0]),context);
 const row={...command,intakeGroup:'Executed — Issues',testStatus:'needs-adjustment'};
 try{
 let html=context.renderCommandListRow(row);assert.doesNotMatch(html,/dev-tested|wip-status|<span>ISSUE<\/span>|CAUTION|DANGER|data-dev-action/);
 mode();html=context.renderCommandListRow(row);assert.match(html,/wip-status/);assert.match(html,/<span>ISSUE<\/span>/);assert.match(html,/data-dev-action="Working"/);assert.match(html,/data-dev-action="Issues"/);
 assert.match(html,/<\/button><span class="dev-feedback-row-actions"/);
 context.favorites=['raw-test'];assert.match(context.renderCommandListRow(row),/row-favorite-star[^>]*>★<\/span>Raw command/);
 context.favorites=[];assert.doesNotMatch(context.renderCommandListRow(row),/row-favorite-star/);
 mode();assert.equal(context.commandTestedClass(row),'');
 }finally{if(isDevModeEnabled())mode();delete globalThis.document;delete globalThis.localStorage;}
});
