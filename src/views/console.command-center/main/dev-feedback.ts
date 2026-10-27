import { showAreaIdentification } from './area-identification-dialog.ts';
import { commitAreaNameChange } from './area-name-overrides.ts';
import type { CurrentArea } from './area-identification.ts';
export type DevFeedbackRecord = { kind: string; name: string; id?: string; localId?: string; source?: string; category?: string; command?: string; referenceOnly?: boolean; recordType?: string; editorId?: string; alreadyTested?: boolean };
export type DevFeedbackReport = DevFeedbackRecord & { version: string; time: string; status: string; comment: string; originalName?:string; acceptedName?:string; area?:CurrentArea; nameBasis?:string };
let enabled = false;
export function isDevModeEnabled():boolean{return enabled;}
export function devFeedbackExportable(report:DevFeedbackReport):boolean{return report.status!=="Working"||Boolean(report.comment.trim());}
const STORAGE_KEY = 'ccc.dev-feedback.v1';
const TESTED_KEY = 'ccc.dev-tested.v1';
const OUTCOMES_KEY = 'ccc.dev-outcomes.v1';
let outcomes = new Map<string,{status:string;time:string;category?:string}>();
export function devFeedbackCommandOutcome(id: string): string | undefined {
  return outcomes.get(`Command:${id}`)?.status;
}
export function devFeedbackCommandCategory(id: string): string | undefined {
  return outcomes.get(`Command:${id}`)?.category;
}
export function hasEngineCommandFeedback(): boolean {
  return [...outcomes.keys()].some(key => key.startsWith('Command:engine-'));
}
export function devFeedbackOutcome(status:string):string {
  if(status==='Unreviewed')return 'unreviewed';
  if(status==='Working')return 'working';
  if(status==='Issues'||status==='Not working')return 'issues';
  if(status==='Not noticeable'||status==='Executed (no effect)')return 'uncertain';
  if(status==='Reference Only')return 'reference';
  return '';
}
let tested = new Set<string>();
const sourcePlugins: Record<string, string> = { 'base game': 'starfield.esm', 'built-in': 'starfield.esm', 'shattered space': 'shatteredspace.esm', 'free lanes': 'sfbgs00d.esm', 'terran armada': 'sfbgs050.esm' };
export function devFeedbackIdentity(record: DevFeedbackRecord): string {
  if (record.kind === 'Command') return `Command:${record.id ?? record.name}`;
  if (record.kind === 'Setting') return `Setting:${record.name}`;
  const source = (record.source ?? 'Starfield.esm').toLowerCase();
  const plugin = sourcePlugins[source] ?? source;
  return `${record.kind}:${plugin}:${(record.localId ?? record.id ?? record.name).toUpperCase().slice(-6)}`;
}
// A deliberate Working result can override a shipped reference classification.
export function devFeedbackIdReference(record: {value?:string;localFormId?:string;plugin?:string;source?:string}): boolean | undefined {
  if (!record.value) return undefined;
  const outcome=outcomes.get(devFeedbackIdentity({kind:'ID',name:'',id:record.value,localId:record.localFormId,source:record.plugin??record.source}))?.status;
  return outcome==='working'?false:outcome==='reference'?true:undefined;
}
export function devFeedbackTestedClass(record: DevFeedbackRecord, alreadyTested = false): string {
  if(!enabled)return '';
  const identity=devFeedbackIdentity(record);
  const selected=outcomes.get(identity)?.status;
  if(selected==='unreviewed')return record.referenceOnly?' dev-tested dev-reference':'';
  const outcome=record.kind==='ID'&&selected==='working'?'working':record.referenceOnly?'reference':selected??(alreadyTested?'working':'');
  return outcome?' dev-tested dev-'+outcome:tested.has(identity)?' dev-tested':'';
}

const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;');

export function devFeedbackResults(kind: string): string[] {
  return ['Working', 'Issues', ...(kind === 'ID' ? ['Reference Only'] : [])];
}

function isWorking(record:DevFeedbackRecord):boolean {
  const outcome=outcomes.get(devFeedbackIdentity(record))?.status;
  return outcome ? outcome==='working' : Boolean(record.alreadyTested && !record.referenceOnly);
}

export function devFeedbackButton(record: DevFeedbackRecord): string {
  if(!enabled)return '';
  const data=escape(JSON.stringify(record));
  return `<button class="osf-btn osf-btn--sm dev-feedback-button" type="button" data-dev-record="${data}">Test Report</button>`;
}

export function devFeedbackRow(row:string,record:DevFeedbackRecord):string {
  if(!enabled)return row;
  const outcome=outcomes.get(devFeedbackIdentity(record))?.status??(record.alreadyTested?'working':undefined);
  const buttons=devFeedbackResults(record.kind).map(value=>`<button class="osf-btn osf-btn--sm dev-feedback-row-button" type="button" data-dev-record="${escape(JSON.stringify(record))}" data-dev-action="${value}" aria-pressed="${devFeedbackOutcome(value)===outcome}">${value}</button>${value==='Working'&&record.kind==='ID'&&record.recordType==='CELL'?`<button class="osf-btn osf-btn--sm dev-feedback-row-button dev-identify-area" type="button" data-dev-record="${escape(JSON.stringify(record))}" data-dev-action="Identify Current Area">Identify Current Area</button>`:''}`).join('');
  return `<div class="dev-feedback-list-row">${row}<span class="dev-feedback-row-actions" role="group" aria-label="Test result for ${escape(record.name)}">${buttons}</span></div>`;
}

export function formatDevFeedback(reports: DevFeedbackReport[]): string {
  return 'Console Command Center — Test Feedback\r\n\r\n' + reports.filter(devFeedbackExportable).map((r, index) => [
    `Report ${index + 1}`, `Time: ${r.time}`, `CCC: ${r.version}`, `Kind: ${r.kind}`, `Name: ${r.name}`,
    ...(r.id ? [`ID: ${r.id}`] : []), ...(r.localId ? [`Local ID: ${r.localId}`] : []),
    ...(r.source ? [`Source: ${r.source}`] : []), ...(r.category ? [`Category: ${r.category}`] : []),
    ...(r.command ? [`Command: ${r.command}`] : []),
    ...(r.acceptedName ? [`Original name: ${r.originalName??r.name}`, `Accepted name: ${r.acceptedName}`, `Name source: ${r.nameBasis??'Current area'}`, `Area evidence: ${JSON.stringify(r.area)}`] : []), `Result: ${r.status || 'Comment only'}`,
    ...(r.status === 'Reference Only' ? ['Requested change: Mark Reference Only, hide outside Advanced Options, and sort below normal items.'] : []),
    ...(r.status === 'Executed (no effect)' ? ['Observation: The command executed, but no effect was observed.'] : []),
    'Comment:', r.comment || '(none)', '----------------------------------------', '',
  ].join('\r\n')).join('\r\n');
}

export function installDevFeedback(options: { version: string; rerender: () => void; status: (text: string, error?: boolean) => void; exportText: (text: string) => Promise<string>; identifyArea?:()=>Promise<CurrentArea>; nameChanged?:()=>void }): void {
  const dot = document.querySelector<HTMLButtonElement>('#dev-mode-dot');
  const exportButton = document.querySelector<HTMLButtonElement>('#dev-feedback-export');
  let reports: DevFeedbackReport[] = [];
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (Array.isArray(saved)) reports = saved.filter(r => r && typeof r.name === 'string' && typeof r.kind === 'string' && typeof r.comment === 'string' && typeof r.status === 'string' && typeof r.time === 'string' && typeof r.version === 'string');
  } catch { options.status('Saved test reports could not be read.', true); }
  try {
    const saved = JSON.parse(localStorage.getItem(TESTED_KEY) ?? '[]');
    tested = new Set(Array.isArray(saved) ? saved.filter(value => typeof value === 'string') : []);
  } catch { tested = new Set(); }
  try {
    const saved=JSON.parse(localStorage.getItem(OUTCOMES_KEY)??'{}');
    outcomes=new Map();
    for(const [key,value] of Object.entries(saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{})){
      const entry=typeof value==='string'?{status:value,time:'',category:undefined}:value as {status?:unknown;time?:unknown;category?:unknown};
      if(key.length<=512&&entry&&typeof entry.status==='string'&&['working','issues','uncertain','reference','unreviewed'].includes(entry.status))outcomes.set(key,{status:entry.status,time:typeof entry.time==='string'?entry.time:'',category:typeof entry.category==='string'?entry.category:undefined});
    }
  }catch{outcomes=new Map();}
  // Migrate pending reports from earlier builds without adding them to future exports.
  reports.filter(record=>record.status!=='Name Change Accepted').forEach(record => {const identity=devFeedbackIdentity(record);tested.add(identity);const outcome=devFeedbackOutcome(record.status);if(outcome&&(!outcomes.has(identity)||record.time>=outcomes.get(identity)!.time))outcomes.set(identity,{status:outcome,time:record.time,category:record.category});});
  for(const [identity,outcome] of outcomes)if(outcome.status==='unreviewed')tested.delete(identity);
  try{localStorage.setItem(OUTCOMES_KEY,JSON.stringify(Object.fromEntries(outcomes)));}catch{/* Pending reports retain outcomes until storage is available. */}
  try { localStorage.setItem(TESTED_KEY, JSON.stringify([...tested])); } catch { /* Pending reports still retain their identities. */ }
  reports=reports.filter(devFeedbackExportable);
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(reports));}catch{/* Existing reports remain available for a later export. */}
  let clicks = 0;
  dot?.addEventListener('click', () => {
    if (++clicks < 5) return;
    clicks = 0;
    enabled = !enabled;
    document.dispatchEvent?.(new Event('ccc-dev-mode-change'));
    dot.classList.toggle('is-active', enabled);
    dot.setAttribute('aria-pressed', String(enabled));
    if (exportButton) exportButton.hidden = !enabled;
    options.rerender();
    options.status(`Dev Mode ${enabled ? 'enabled. Use the result buttons on item rows; Export Reports saves all notes.' : 'disabled. Saved reports are kept.'}`);
  });
  exportButton?.addEventListener('click', async () => {
    if (exportButton.disabled) return;
    if (!reports.length) { options.status('No test reports to export.'); return; }
    exportButton.disabled = true;
    const batch = [...reports];
    try {
      const destination = await options.exportText(formatDevFeedback(batch));
      const remaining = reports.filter(report => !batch.includes(report));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining)); }
      catch { options.status(`Exported ${batch.length} test reports to ${destination}, but saved reports could not be cleared.`, true); return; }
      reports = remaining;
      options.status(`Exported ${batch.length} test reports to ${destination}. Exported reports cleared; ${reports.length} reports ready to export.`);
    }
    catch (error) { options.status(`Report export failed: ${error instanceof Error ? error.message : String(error)}. Your reports are still saved.`, true); }
    finally { exportButton.disabled = false; }
  });
  const saveFeedback=(record:DevFeedbackRecord,status:string,comment:string,error?:HTMLElement):boolean=>{
    if(record.kind==='ID'&&status==='Working'&&(record.referenceOnly||outcomes.get(devFeedbackIdentity(record))?.status==='reference')&&!comment) comment='Confirmed working; clear Reference Only.';
    const report={...record,status,comment,version:options.version,time:new Date().toISOString()};
    const next=devFeedbackExportable(report)?[...reports,report]:reports;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}
    catch{const message='The report could not be saved. Export existing reports or free browser storage and try again.';if(error)error.textContent=message;else options.status(message,true);return false;}
    reports=next;const identity=devFeedbackIdentity(record);if(status==='Unreviewed')tested.delete(identity);else tested.add(identity);
    const outcome=devFeedbackOutcome(status);if(outcome)outcomes.set(identity,{status:outcome,time:report.time,category:record.category});
    try{localStorage.setItem(OUTCOMES_KEY,JSON.stringify(Object.fromEntries(outcomes)));}catch{/* Saved reports restore outcomes on reload. */}
    try{localStorage.setItem(TESTED_KEY,JSON.stringify([...tested]));}catch{/* Saved reports retain their identities. */}
    options.status(status==='Unreviewed'?`Cleared Working for ${record.name}. It is ready to review again.`:status==='Working'&&!comment?`Marked ${record.name} working. Reference Only cleared; status saved.`:`Saved test report for ${record.name}. ${reports.length} reports ready to export.`);
    return true;
  };
  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-dev-record]');
    if (!button || !enabled || document.querySelector('dialog.dev-feedback-dialog[open]')) return;
    let record: DevFeedbackRecord;
    try { record = JSON.parse(button.dataset.devRecord!); } catch { return; }
    const action=button.dataset.devAction;
    if(action==='Identify Current Area'){
      if(record.kind!=='ID'||record.recordType!=='CELL'||document.querySelector('dialog.area-identification-dialog[open]'))return;
      void showAreaIdentification(record,{
        identify:async()=>{if(!options.identifyArea)throw new Error('Current-area identification requires the updated in-game plugin.');return options.identifyArea();},
        accept:(name,area,proposal)=>{
          const report:DevFeedbackReport={...record,status:'Name Change Accepted',comment:!proposal.matches?'Entered a custom name for the selected entry; the current cell differs.':proposal.basis==='Custom name'?'Entered a custom name after identifying the current game area.':'Accepted the name proposed from the current game area.',version:options.version,time:new Date().toISOString(),originalName:record.name,acceptedName:name,area,nameBasis:proposal.basis};
          reports=commitAreaNameChange({label:record.name,value:record.id??'',localFormId:record.localId,plugin:sourcePlugins[(record.source??'Starfield.esm').toLowerCase()]??record.source},name,reports,report);
          options.nameChanged?.();options.rerender();options.status(`Renamed ${record.name} to ${name}. Name-change entry saved for Export Reports.`);
        },closed:()=>{if(button.isConnected)button.focus({preventScroll:true});}
      });return;
    }
    if(action==='Working'||action==='Reference Only'){
      if(!devFeedbackResults(record.kind).includes(action))return;
      if(saveFeedback(record,action==='Working'&&isWorking(record)?'Unreviewed':action,''))options.rerender();
      return;
    }
    const directIssue=action==='Issues';
    const dialog = document.createElement('dialog');
    dialog.className = 'dev-feedback-dialog osf-card';
    let selectedStatus = directIssue?'Issues':'',selectedGroup=directIssue?'Issues':'';
    dialog.setAttribute('aria-label', 'Test report for ' + record.name);
    dialog.innerHTML = `<form method="dialog"><p class="osf-eyebrow">DEV MODE TEST REPORT</p><h3>${escape(record.name)}</h3><p>${escape(record.kind)}${record.id ? ' · ' + escape(record.id) : ''}</p>${directIssue?'':`<fieldset><legend>Result (optional)</legend>${devFeedbackResults(record.kind).map(value => `<button class="osf-btn osf-btn--sm" type="button" data-dev-result="${value}" aria-pressed="false">${value}</button>`).join('')}</fieldset>`}<label class="dev-feedback-issue-detail"${directIssue?'':' hidden'}>Issue result<select class="osf-input" data-issue-result aria-label="Issue result"><option value="Issues">Issue found</option><option value="Not noticeable">Not noticeable</option></select></label>${record.kind === 'ID'&&!directIssue ? '<p class="game-settings-reference-note">Reference Only: hide this entry outside Advanced Options and sort it below normal entries.</p>' : ''}<label class="dev-feedback-comment-label">Comment (optional)<textarea class="osf-input" name="comment" rows="5" maxlength="4000" aria-label="Test comment"></textarea></label><p class="dev-feedback-error" role="alert"></p><div class="dev-feedback-actions"><button class="osf-btn osf-btn--sm" type="button" data-cancel-report>Cancel</button><button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="submit">Save Report</button></div></form>`;
    document.body.append(dialog);
    const resultButtons = dialog.querySelectorAll<HTMLButtonElement>('[data-dev-result]');
    resultButtons.forEach((resultButton) => resultButton.addEventListener('click', () => {
      selectedGroup = selectedGroup === resultButton.dataset.devResult ? '' : resultButton.dataset.devResult!;
      const detail=dialog.querySelector<HTMLElement>('.dev-feedback-issue-detail');if(detail)detail.hidden=selectedGroup!=='Issues';
      selectedStatus=selectedGroup==='Issues'?(dialog.querySelector<HTMLSelectElement>('[data-issue-result]')?.value??'Issues'):selectedGroup;
      resultButtons.forEach((button) => {
        const active = button.dataset.devResult === selectedGroup;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('osf-btn--osf-accent', active);
      });
    }));
    dialog.querySelector<HTMLSelectElement>('[data-issue-result]')?.addEventListener('change',event=>{if(selectedGroup==='Issues')selectedStatus=(event.target as HTMLSelectElement).value;});
    dialog.querySelector('[data-cancel-report]')?.addEventListener('click', () => dialog.close());
    dialog.querySelector('form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = selectedStatus;
      const comment = dialog.querySelector<HTMLTextAreaElement>('textarea')?.value.trim() ?? '';
      const error = dialog.querySelector<HTMLElement>('.dev-feedback-error')!;
      if (!status && !comment) { error.textContent = 'Select a result or enter a comment.'; return; }
      if(!saveFeedback(record,status,comment,error))return;
      dialog.close();
      if(button.isConnected)button.focus({preventScroll:true});
      options.rerender();
    });
    dialog.addEventListener('close', () => { dialog.remove(); if (button.isConnected) button.focus(); });
    dialog.showModal();
  });
}
