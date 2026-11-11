import {resolveFavoriteIds} from './favorite-id-resolution';
import type {IdCatalogEntry, PluginLoadOrderReply} from './id-catalog';

type Request = (name:string, payload:Record<string,string|number>, options?:{timeoutMs:number})=>Promise<unknown>;
type Options = {version:string; request:Request; error:(message:string)=>void};
const evidence:IdCatalogEntry={label:'Request Denied (Evidence)',type:'BOOK',category:'Books / Notes',value:'001DEDB1',plugin:'Starfield.esm',localFormId:'1DEDB1',source:'Base Game'};
const mod:IdCatalogEntry={...evidence,label:'Diagnostic test item',plugin:'CCC-Test-Missing.esm',source:'mod',value:'05001234',localFormId:'001234'};
const checkResolution=(item:IdCatalogEntry,reply:PluginLoadOrderReply|null,available:boolean)=>{
  const result=resolveFavoriteIds([item],[],reply)[0];
  if(Boolean(result.available)!==available)throw Error('Unexpected item availability');
  return JSON.stringify({item,reply,resolved:result});
};

// Every live request in this harness is read-only, or writes only to the log.
// No console execution, inventory change, scan, quest change or crash request.
export const DIAGNOSTIC_TEST_CASES = [
  {id:'base-fallback',name:'Base item / missing load order',run:async(_:Options)=>checkResolution(evidence,null,true)},
  {id:'empty-load-order',name:'Mod item / empty load order',run:async(_:Options)=>checkResolution(mod,{ok:true,plugins:[]},false)},
  {id:'failed-load-order',name:'Mod item / failed load order',run:async(_:Options)=>checkResolution(mod,{ok:false,plugins:[]},false)},
  {id:'missing-dlc',name:'DLC owner unavailable',run:async(_:Options)=>checkResolution({...mod,source:'Shattered Space',plugin:'ShatteredSpace.esm'},{ok:true,plugins:[{plugin:'Starfield.esm',pluginKind:'full',index:0}]},false)},
  {id:'invalid-local-id',name:'Invalid local ID for small plugin',run:async(_:Options)=>checkResolution({...mod,localFormId:'1234'},{ok:true,plugins:[{plugin:mod.plugin!,pluginKind:'small',index:2}]},false)},
  {id:'slot-remap',name:'Changed load-order slot (control)',run:async(_:Options)=>{
    const result=resolveFavoriteIds([mod],[],{ok:true,plugins:[{plugin:mod.plugin!,pluginKind:'full',index:9}]})[0];
    if(!result.available||result.value!=='09001234')throw Error('Current slot was not used');
    return JSON.stringify({oldId:mod.value,resolvedId:result.value,plugin:mod.plugin});
  }},
  {id:'native-rejection',name:'Native diagnostic request rejected',run:async(o:Options)=>{
    try{await o.request('console.command-center.diagnostic',{event:42},{timeoutMs:3000});}catch(e){const reason=String((e as {code?:string})?.code??'')+' '+String(e);if(!/invalid-diagnostic|Invalid diagnostic fields/.test(reason))throw e;return 'Expected native rejection: '+reason;}
    throw Error('Malformed diagnostic request was unexpectedly accepted');
  }},
  {id:'invalid-record',name:'Native item inspection rejected',run:async(o:Options)=>{
    try{await o.request('console.command-center.inspectRecord',{formId:'NOTHEX!!'},{timeoutMs:3000});}catch(e){const reason=String((e as {code?:string})?.code??'')+' '+String(e);if(!/Invalid Form ID/.test(reason))throw e;return 'Expected native inspection rejection: '+reason;}
    throw Error('Invalid record was unexpectedly accepted');
  }},
  {id:'empty-query',name:'Empty query result (simulated)',run:async(_:Options)=>'No readable result was returned. This does not mean the value is zero or the inventory is empty.'},
  {id:'query-zero',name:'Zero query result (control)',run:async(_:Options)=>'Result: 0 — a valid result, not a timeout.'},
  {id:'request-timeout',name:'Request timeout (simulated, 1 second)',run:async(_:Options)=>{await new Promise(resolve=>setTimeout(resolve,1000));return 'query-timeout: simulated request timed out after 1000ms. No game request was stalled.';}},
  {id:'version-mismatch',name:'Interface/native version mismatch',run:async(o:Options)=>{
    const reply=await o.request('console.command-center.ping',{}, {timeoutMs:3000});
    return JSON.stringify({actualPing:reply,syntheticUiVersion:'0.0.0-test',actualUiVersion:o.version});
  }},
  {id:'unicode-error',name:'Unicode and multiline error',run:async(_:Options)=>'Simulated error: café / 設定 / ошибка\nSecond line\twith tab'},
  {id:'long-error',name:'Oversized diagnostic text',run:async(_:Options)=>'Simulated long error: '+'detail '.repeat(500)},
] as const;

export async function runDiagnosticTest(id:string,options:Options,runId:string) {
  const scenario=DIAGNOSTIC_TEST_CASES.find(test=>test.id===id);
  if(!scenario)throw Error('Unknown diagnostic test');
  let passed=true,detail='';
  try{detail=await scenario.run(options);}catch(error){passed=false;detail=String(error);}
  const control=['base-fallback','slot-remap','query-zero'].includes(id);
  if(!control)options.error(`[DIAGNOSTIC TEST ${runId}/${id}] ${detail.slice(0,400)}`);
  let logged=false,logError='';
  try{
    const reply=await options.request('console.command-center.diagnostic',{
      event:'test-case-result',uiVersion:options.version,
      detail:JSON.stringify({runId,case:id,passed,synthetic:!['native-rejection','invalid-record'].includes(id),detail:detail.slice(0,1600)}),
    },{timeoutMs:3000}) as {ok?:boolean};
    logged=reply?.ok===true;
    if(!logged)logError='Native logger did not acknowledge this case';
  }catch(error){logError=String(error);}
  return {id,passed,logged,logError,detail};
}

export function installDiagnosticTests(options:Options):void {
  const launch=document.createElement('button');launch.className='osf-btn osf-btn--sm';launch.textContent='DIAGNOSTIC TEST BUILD';
  launch.style.cssText='position:fixed;bottom:48px;right:24px;z-index:1000;border-color:#e3ab45';document.body.append(launch);
  launch.addEventListener('click',()=>{
    const dialog=document.createElement('dialog');dialog.className='osf-panel diagnostic-test-dialog';dialog.style.cssText='width:min(900px,90vw);max-height:85vh;overflow:auto;padding:24px;background:var(--osf-bg,#0b1a21);color:var(--osf-text,#dde7ea)';
    const title=document.createElement('h3');title.textContent='CCC Diagnostic Tests — v'+options.version;
    const help=document.createElement('p');help.textContent='Controlled test failures. Simulations are labelled. No commands run and no inventory or quest changes are made. After testing, send Console Command Center.log before restarting the game.';
    const runAll=document.createElement('button');runAll.className='osf-btn osf-btn--sm';runAll.textContent='Run All Tests';
    const close=document.createElement('button');close.className='osf-btn osf-btn--sm';close.textContent='Close';close.style.marginLeft='12px';
    const list=document.createElement('div');list.style.marginTop='16px';
    const runId=new Date().toISOString();const controls:HTMLButtonElement[]=[runAll];const rows=new Map<string,HTMLElement>();
    const run=async(id:string)=>{
      const row=rows.get(id)!;row.textContent='Running…';
      const result=await runDiagnosticTest(id,options,runId);
      row.textContent=`${result.passed?'Expected behavior':'UNEXPECTED behavior'} / ${result.logged?'Native log acknowledged':'LOG NOT CONFIRMED: '+result.logError}`;
      row.title=result.detail;
    };
    const busy=(value:boolean)=>controls.forEach(button=>button.disabled=value);
    for(const scenario of DIAGNOSTIC_TEST_CASES){
      const row=document.createElement('div');row.style.cssText='padding:10px 0;border-top:1px solid #667780';
      const button=document.createElement('button');button.className='osf-btn osf-btn--sm';button.textContent=scenario.name;controls.push(button);
      const result=document.createElement('p');result.textContent='Not run';rows.set(scenario.id,result);row.append(button,result);list.append(row);
      button.addEventListener('click',async()=>{busy(true);try{await run(scenario.id);}finally{busy(false);}});
    }
    runAll.addEventListener('click',async()=>{busy(true);try{for(const scenario of DIAGNOSTIC_TEST_CASES){if(!dialog.open)break;await run(scenario.id);}}finally{busy(false);}});
    close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{dialog.remove();launch.focus();});
    dialog.append(title,help,runAll,close,list);document.body.append(dialog);dialog.showModal();runAll.focus();
  });
}
