import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import {CONFIRMED_READOUT_COMMANDS as cards} from '../src/views/console.command-center/main/confirmed-readout-commands.ts';
import {ENGINE_COMMAND_LIBRARY} from '../src/views/console.command-center/main/engine-command-library.ts';

test('October 23 feedback keeps menu toggle parameterless and applies requested labels without marking Working',()=>{
  const toggle=ENGINE_COMMAND_LIBRARY.find(c=>c.id==='engine-togglemenus-21');
  assert.equal(toggle.title,'Toggle All Menus');
  assert.equal(toggle.command,'ToggleMenus');
  assert.equal(toggle.inputs,undefined);
  assert.equal(toggle.captureOutput,false);
  assert.equal(toggle.testStatus,'untested');
  assert.match(toggle.description,/console still works/i);
  for(const [id,title] of [['engine-getgold-595','Get Credit Count'],['engine-getdead-593','Are They Dead?'],['engine-getdisabled-582','Are They Disabled?'],['engine-getsleeping-596','Are They Sleeping?']]){
    const card=cards.find(c=>c.id===id);assert.equal(card.title,title);assert.equal(card.testStatus,'untested');
  }
});

const source = readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
const production = [...source.matchAll(/^function (buildCommandTemplate|validateCommand)\b[\s\S]*?^}/gm)].map(match=>match[0]);
assert.equal(production.length,2);

function form(card) {
  class Input {
    constructor(input){this.value=String(input.defaultValue??'');this.pattern=input.pattern;}
    checkValidity(){return !this.value || !this.pattern || new RegExp(this.pattern).test(this.value);}
  }
  const fields=new Map((card.inputs??[]).map(input=>[`${card.id}-${input.key}`,new Input(input)]));
  const context=vm.createContext({HTMLInputElement:Input,document:{getElementById:id=>fields.get(id)}});
  vm.runInContext(stripTypeScriptTypes(production.join('\n')),context);
  return {
    set(key,value){fields.get(`${card.id}-${key}`).value=value;},
    build(){return context.buildCommandTemplate(card,card.command);},
    validate(){return context.validateCommand(card);},
  };
}

test('readout pickers build explicit target prefixes and valid arguments using the production form builder',()=>{
  for(const card of cards){
    const state=form(card);
    if(card.id==='engine-getitemcount-594')state.set('arguments','0000ABF9');
    if(['engine-getlocked-552','engine-getlocklevel-612'].includes(card.id))state.set('target','FF123456');
    assert.equal(state.validate(),null,card.title);
    assert.doesNotMatch(state.build(),/[{}]|\.\.|^\./,card.title);
    for(const input of card.inputs??[]){
      for(const option of input.picker?.options??[]){
        state.set(input.key,option.value);
        assert.equal(state.validate(),null,`${card.title}: ${option.label}`);
        const built=state.build();
        if(input.key==='target')assert.ok(built.startsWith(option.value+'.'),built);
        else assert.ok(built.endsWith(' '+option.value),built);
      }
    }
  }
});

test('readouts require item, actor-value, global and axis arguments and reject malformed targets',()=>{
  for(const id of ['engine-getitemcount-594','engine-getvalue-getav-561','engine-getglobalvalue-621','engine-getstartingpos-557']){
    const card=cards.find(c=>c.id===id),state=form(card);
    state.set('arguments','');assert.match(state.validate(),/required/);
    state.set('arguments','x; quit');assert.match(state.validate(),/not valid/);
  }
  for(const card of cards.filter(c=>c.inputs?.some(i=>i.key==='target'))){
    const state=form(card);
    for(const bad of ['player.','player..','00000014.GetDead','player; quit']){
      state.set('target',bad);assert.match(state.validate(),/is not valid/);
    }
    state.set('target','FF123456');
    if(card.id==='engine-getitemcount-594')state.set('arguments','0000ABF9');
    assert.equal(state.validate(),null);assert.ok(state.build().startsWith('FF123456.'));
  }
});

test('parameterless queries have no irrelevant inputs and retain their exact engine command',()=>{
  for(const command of ['GetSFSEVersion','GetCurrentCell','IsRaining','IsSnowing','GetRandomPercent']){
    const card=cards.find(c=>c.command===command);assert.ok(card,command);
    assert.equal((card.inputs??[]).length,0);assert.equal(form(card).build(),command);
  }
  assert.equal(cards.find(c=>c.id==='engine-getrandompercent-624').title,'Get Random Percent');
  assert.equal(cards.find(c=>c.id==='engine-israining-609').title,'Is It Raining?');
  assert.equal(cards.find(c=>c.id==='engine-issnowing-622').title,'Is It Snowing?');
  const axis=cards.find(c=>c.id==='engine-getstartingpos-557').inputs.find(i=>i.key==='arguments');
  assert.deepEqual(axis.picker.options.map(o=>o.value),['x','y','z']);
  const item=cards.find(c=>c.id==='engine-getitemcount-594').inputs.find(i=>i.key==='arguments');
  assert.equal(item.browserPicker.browser,'id');assert.ok(item.browserPicker.allowedTypes.includes('WEAP'));
});
