type Stat = {label: string; value: number; curve?: boolean};
export type RecordEffect = {name?: string; description?: string; magnitude?: number; duration?: number; area?: number; conditional?: boolean};
export type RecordDetails = {ok: boolean; formId: string; description?: string; ammo?: string; stats?: Stat[]; ranks?: {rank: number; description: string}[]; effects?: RecordEffect[]};
type Request = (name: string, payload: Record<string,string>) => Promise<unknown>;
const types = new Set(['ALCH','ARMO','WEAP','AMMO','MISC','PERK','SPEL','MGEF','BOOK']);
export function canInspectRecord(entry: {type: string; value: string; available?: boolean}): boolean {
  return entry.available !== false && /^[\dA-F]{8}$/i.test(entry.value) && types.has(entry.type.toUpperCase());
}
const number = (value: number) => new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(value);
export function descriptionText(value: string, effect?: RecordEffect): string {
  let text = value.slice(0,16384).replace(/^<ID=[\dA-F]{8}>/i,'');
  for (const [token,key] of [['mag','magnitude'],['dur','duration'],['area','area']] as const) {
    const value = effect?.[key];
    text = text.replace(new RegExp(`<${token}>`,'gi'), typeof value === 'number' && Number.isFinite(value) ? number(value) : '[varies]');
  }
  return text.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/?(?:font|b|i|u|p)(?:\s[^>]*)?>/gi,'').trim();
}
export function validateDetails(value: unknown, id: string): RecordDetails {
  const result = value as RecordDetails;
  if (!result?.ok || result.formId?.toUpperCase() !== id.toUpperCase() || !Array.isArray(result.stats) || !Array.isArray(result.effects) || result.stats.length > 200 || result.effects.length > 128) throw Error('Item details are unavailable.');
  if (result.stats.some(row=>!row||typeof row.label!=='string'||typeof row.value!=='number'||!Number.isFinite(row.value))) throw Error('Invalid item stats.');
  if (result.effects.some(row=>!row||['name','description'].some(key=>row[key as keyof RecordEffect]!==undefined&&typeof row[key as keyof RecordEffect]!=='string')||['magnitude','duration','area'].some(key=>row[key as keyof RecordEffect]!==undefined&&(typeof row[key as keyof RecordEffect]!=='number'||!Number.isFinite(row[key as keyof RecordEffect] as number))))) throw Error('Invalid item effects.');
  if(result.ranks!==undefined&&(!Array.isArray(result.ranks)||result.ranks.length>32||result.ranks.some(row=>!row||!Number.isInteger(row.rank)||row.rank<1||typeof row.description!=='string')))throw Error('Invalid perk ranks.');
  return result;
}
export function createDetailsLoader(request: Request) {
  const cache = new Map<string,RecordDetails>();
  let queue: Promise<unknown> = Promise.resolve();
  return (id: string, current: ()=>boolean): Promise<RecordDetails> => {
    const key=id.toUpperCase();const hit=cache.get(key);if(hit)return Promise.resolve(hit);
    const next=queue.catch(()=>{}).then(async()=>{
      if(!current())throw Error('Selection changed.');const hit=cache.get(key);if(hit)return hit;
      const details=validateDetails(await request('console.command-center.inspectRecord',{formId:key,operation:'inspect'}),key);
      cache.set(key,details);while(cache.size>100)cache.delete(cache.keys().next().value!);return details;
    });queue=next.catch(()=>{});return next;
  };
}
export function renderRecordDetails(host: HTMLElement, details: RecordDetails): void {
  host.replaceChildren();
  const add=(tag:string,text:string,parent:HTMLElement=host)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
  const description=descriptionText(typeof details.description==='string'?details.description:'');
  if(description)add('p',description);
  if(details.ranks?.length){add('h4','Ranks');const list=add('ul','');for(const rank of details.ranks){const row=add('li','',list);add('strong','Rank '+rank.rank,row);add('span',descriptionText(rank.description),row);}}
  const effects=(details.effects??[]).filter(effect=>effect.name||effect.description);
  if(effects.length){add('h4','Effects');const list=add('ul','');for(const effect of effects){
    const row=add('li','',list);const text=descriptionText(effect.description??'',effect);if(effect.name)add('strong',descriptionText(effect.name),row);
    if(text)add('span',text,row);
    const values:string[]=[];if(!text&&effect.magnitude!==undefined&&effect.magnitude!==0)values.push('Magnitude: '+number(effect.magnitude));
    if(effect.duration!==undefined&&effect.duration>0)values.push(number(effect.duration)+' sec');
    if(effect.area!==undefined&&effect.area>0)values.push('Area: '+number(effect.area));
    if(effect.conditional)values.push('Conditional');if(values.length)add('small',values.join(' · '),row);
  }}
  const stats=[...new Map((details.stats??[]).map(row=>[row.label,row])).values()];
  if(stats.length||details.ammo){add('h4','Base stats');const list=add('dl','');for(const stat of stats){const row=add('div','',list);add('dt',stat.label,row);add('dd',number(stat.value)+(stat.curve?' (scales)':''),row);}if(details.ammo){const row=add('div','',list);add('dt','Ammo',row);add('dd',details.ammo,row);}}
  if(!description&&!effects.length&&!stats.length&&!details.ammo&&!details.ranks?.length)add('p','No description or stats are supplied by this record.');
  if(['ARMO','WEAP'].includes(host.dataset.recordType??''))add('small','Base record values. Upgrades, legendary effects, scaling, and player skills can change the gear you receive.');
  else if(effects.length)add('small','Effects shown from the installed record. Rank, conditions, and player bonuses may change the result.');
}
export function installRecordDetails(request: Request, options?: { available: () => boolean }): void {
  const load=createDetailsLoader(request);
  const mount=()=>document.querySelectorAll<HTMLElement>('[data-record-details]:not([data-details-mounted])').forEach(host=>{
    host.dataset.detailsMounted='true';host.textContent='Loading description and stats…';
    const id=host.dataset.recordDetails!;
    const run=()=>{if(options && !options.available()){host.textContent='Descriptions and stats are available in-game with the CCC plugin.';return;}host.textContent='Loading description and stats…';void load(id,()=>host.isConnected).then(details=>{if(host.isConnected)renderRecordDetails(host,details);}).catch((error:unknown)=>{
      if(!host.isConnected)return;const reason=error instanceof Error?error.message.slice(0,240):'';host.textContent='Description and stats could not be loaded.'+(reason?' '+reason:'')+' ';const retry=document.createElement('button');retry.type='button';retry.className='osf-btn osf-btn--sm';retry.textContent='Retry';retry.addEventListener('click',run,{once:true});host.append(retry);
    });};setTimeout(()=>{if(host.isConnected)run();},250);
  });
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});mount();
}
