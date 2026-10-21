import {proposeAreaName,editedAreaProposal,type AreaRecord,type CurrentArea,type AreaProposal} from './area-identification.ts';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export async function showAreaIdentification(record:AreaRecord,options:{identify:()=>Promise<CurrentArea>;accept:(name:string,area:CurrentArea,proposal:AreaProposal)=>void;closed?:()=>void}):Promise<void>{
 const dialog=document.createElement('dialog');dialog.className='dev-feedback-dialog area-identification-dialog osf-card';dialog.setAttribute('aria-label','Identify Current Area');
 dialog.innerHTML='<h3>Identify Current Area</h3><p data-area-state>Reading the current area from the game…</p><button class="osf-btn osf-btn--sm" type="button" data-area-decline>Decline / Close</button>';
 const close=()=>dialog.close();dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',()=>{dialog.remove();options.closed?.();});
 document.body.append(dialog);dialog.querySelector('[data-area-decline]')?.addEventListener('click',close);dialog.showModal();
 try{
  const area=await options.identify();if(!dialog.isConnected||!dialog.open)return;
  const proposal=proposeAreaName(record,area);
  const form=(value:{name:string;id:string;editorId:string}|null)=>value?`${value.name||'(no display name)'} · ${value.id} · ${value.editorId||'(no Editor ID)'}`:'Not available';
  dialog.innerHTML=`<h3>Identify Current Area</h3><dl class="area-identification-evidence"><div><dt>Selected item</dt><dd>${escape(record.name)} · ${escape(record.id??'')}</dd></div><div><dt>Current cell</dt><dd>${escape(form(area.cell))}</dd></div>${area.locations.map((location,i)=>`<div><dt>${i===0?'Current location':'Parent area'}</dt><dd>${escape(form(location))}</dd></div>`).join('')}<div><dt>Worldspace</dt><dd>${escape(form(area.world))}</dd></div></dl><p>${escape(proposal.message)}</p><label>Name<input class="osf-input" data-area-proposed aria-label="Area name" maxlength="160" placeholder="Enter a name" value="${escape(proposal.name)}"></label><p>Edit the suggested name or enter your own. Accepted changes appear in Export Reports.</p><p data-area-source></p><p data-area-error role="alert"></p><div class="dev-feedback-actions"><button class="osf-btn osf-btn--sm" type="button" data-area-decline>Decline</button><button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="button" data-area-accept disabled>Accept Name Change</button></div>`;
  const input=dialog.querySelector<HTMLInputElement>('[data-area-proposed]')!,accept=dialog.querySelector<HTMLButtonElement>('[data-area-accept]')!;
  const sync=()=>{
   const edited=editedAreaProposal(record,proposal,input.value);accept.disabled=!edited;
   dialog.querySelector('[data-area-source]')!.textContent='Source: '+(edited?.basis??proposal.basis);
   dialog.querySelector('[data-area-error]')!.textContent='';
  };
  input.addEventListener('input',sync);input.addEventListener('change',sync);sync();
  dialog.querySelector('[data-area-decline]')?.addEventListener('click',close);
  dialog.querySelector<HTMLButtonElement>('[data-area-accept]')?.addEventListener('click',()=>{
   const edited=editedAreaProposal(record,proposal,input.value);if(!edited)return;
   try{options.accept(edited.name,area,edited);close();}catch{dialog.querySelector('[data-area-error]')!.textContent='The name change and report could not be saved. Free storage and try again.';}
  });
  dialog.querySelector<HTMLButtonElement>('[data-area-decline]')?.focus();
 }catch(error){if(dialog.isConnected&&dialog.open){const state=dialog.querySelector('[data-area-state]')??dialog.querySelector('[data-area-error]');if(state)state.textContent=error instanceof Error?error.message:'The current area could not be read.';}}
}
