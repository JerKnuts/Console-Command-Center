export type TranslationPack = {schemaVersion:1;locale:string;languageName:string;messages:Record<string,string>};
const placeholders=(text:string)=>[...text.matchAll(/\{(\d+)\}/g)].map(m=>m[1]).sort().join(',');
const canonical=(text:string)=>text.trim().replace(/\s+/g,' ');
export function parseTranslationPack(raw:unknown):TranslationPack {
 const data=raw as TranslationPack;
 if(!data||data.schemaVersion!==1||!/^([a-z]{2,3})(-[a-z\d]{2,8})*$/i.test(data.locale)||typeof data.languageName!=='string'||!data.languageName.trim()||data.languageName.length>80||!data.messages||typeof data.messages!=='object'||Array.isArray(data.messages))throw Error('Invalid translation pack metadata.');
 const entries:Array<[string,unknown]>=[];
 for(const [key,value]of Object.entries(data.messages)){
  if(value&&typeof value==='object'&&!Array.isArray(value))entries.push(...Object.entries(value));
  else entries.push([key,value]);
 }
 if(entries.length>100000)throw Error('Translation pack has too many messages.');
 const messages:Record<string,string>=Object.create(null);
 for(const [english,translated]of entries){
  if(typeof translated!=='string'||english.length>8192||translated.length>8192||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(english+translated))throw Error('Invalid translation text.');
  if(Object.hasOwn(messages,english))throw Error('Duplicate translation key: '+english.slice(0,120));
  if(translated.trim()&&placeholders(english)!==placeholders(translated))throw Error('Translation placeholders do not match: '+english.slice(0,120));
  messages[english]=translated;
 }
 return {schemaVersion:1,locale:data.locale,languageName:data.languageName,messages};
}
export function createTranslator(pack:TranslationPack|null):(text:string)=>string {
 if(!pack)return text=>text;
 const exact=new Map<string,string>();
 const templates:Array<{parts:string[];value:string;prefix:string;numbers:string[]}>=[];
 for(const [source,value]of Object.entries(pack.messages)){
  if(!value.trim())continue;
  const key=canonical(source);exact.set(key,value);
  const tokens=[...key.matchAll(/\{(\d+)\}/g)];
  if(!tokens.length||tokens.length>4||templates.length>=2048||key.replace(/\{\d+\}/g,'').length<8)continue;
  const parts=key.split(/\{\d+\}/g);if(parts.slice(1,-1).some(part=>!part))continue;
  templates.push({parts,value,numbers:tokens.map(token=>token[1]),prefix:parts[0]});
 }
 const cache=new Map<string,string>();
 return text=>{
  const key=canonical(text);if(!key||key.length>4096)return text;
  if(/^[\da-f]{6,8}$/i.test(key)||/\.(esm|esp|esl|dll)$/i.test(key)||['WEAP','ARMO','AMMO','ALCH','MISC','BOOK','PERK','SPEL','NPC_','QUST','CELL','LCTN','FURN','STAT','MSTT','CONT','WTHR','GBFM'].includes(key))return text;
  let translated=exact.get(key)??cache.get(key);
  if(translated===undefined){
   for(const entry of templates){
    if(entry.prefix&&!key.startsWith(entry.prefix))continue;
    let cursor=entry.prefix.length,valid=true;const captures=new Map<string,string>();
    for(let i=0;i<entry.numbers.length;i++){
     const next=entry.parts[i+1],last=i===entry.numbers.length-1;
     const end=last?(next&& !key.endsWith(next)?-1:key.length-next.length):key.indexOf(next,cursor);
     if(end<cursor||end-cursor>2048){valid=false;break;}
     const capture=key.slice(cursor,end),number=entry.numbers[i];
     if(!capture||(captures.has(number)&&captures.get(number)!==capture)){valid=false;break;}
     captures.set(number,capture);cursor=end+next.length;
    }
    if(!valid||cursor!==key.length)continue;
    translated=entry.value.replace(/\{(\d+)\}/g,(_,n)=>captures.get(n)??'{'+n+'}');break;
   }
   if(cache.size>5000)cache.clear();cache.set(key,translated??key);
  }
  if(translated===undefined||translated===key)return text;
  return (text.match(/^\s*/)?.[0]??'')+translated+(text.match(/\s*$/)?.[0]??'');
 };
}

const PROTECTED='script,style,code,pre,textarea,input,[contenteditable="true"],[translate="no"],.command-detail-syntax,.confirm-command,#results-output,.custom-command-highlight';
let currentTranslator=(text:string)=>text;
export function translateUiText(text:string):string{return currentTranslator(text);}
export function parseTranslationChoices(raw:unknown):{choices:Array<{file:string;pack:TranslationPack}>;errors:string[]} {
 const data=raw as {packs?:Array<{file:string;pack:unknown}>;errors?:string[]};
 const choices:Array<{file:string;pack:TranslationPack}>=[],errors:string[]=Array.isArray(data?.errors)?data.errors.filter(value=>typeof value==='string'):[];
 // Accept the original single-pack response from older installations too.
 const entries=Array.isArray(data?.packs)?data.packs:raw?[{file:'active.json',pack:raw}]:[];
 for(const entry of entries.slice(0,64)){
  try{if(typeof entry.file!=='string'||!entry.file.endsWith('.json')||/[\\/]/.test(entry.file))throw Error();
   const pack=parseTranslationPack(entry.pack);
   if(Object.values(pack.messages).some(value=>value.trim()))choices.push({file:entry.file,pack});
  }catch{errors.push(typeof entry?.file==='string'?entry.file:'Unknown file');}
 }
 choices.sort((a,b)=>a.pack.languageName.localeCompare(b.pack.languageName)||a.file.localeCompare(b.file));
 return {choices,errors};
}
export function defaultTranslationFile(choices:Array<{file:string;pack:TranslationPack}>,saved:string,enabled:boolean,languages:readonly string[]=[]):string {
 if(saved==='en'||!enabled)return 'en';
 if(choices.some(entry=>entry.file===saved))return saved;
 // The bundled demonstration must not change the language of an English installation.
 const installed=choices.filter(entry=>entry.file.toLowerCase()!=='chinese-example.json'&&!/^en(?:-|$)/i.test(entry.pack.locale));
 for(const language of languages){const match=installed.find(entry=>entry.pack.locale.toLowerCase()===language.toLowerCase());if(match)return match.file;}
 for(const language of languages){const match=installed.find(entry=>entry.pack.locale.split('-')[0].toLowerCase()===language.split('-')[0].toLowerCase());if(match)return match.file;}
 return (installed.find(entry=>entry.file==='active.json')??installed[0])?.file??'en';
}
export function installTranslations(load:()=>Promise<unknown>,changed:()=>void=()=>{}):void {
 let pack:TranslationPack|null=null,enabled=true,translate=(text:string)=>text,queued=false,restorePending=false,error='',selected='',choices:Array<{file:string;pack:TranslationPack}>=[];
 try{enabled=localStorage.getItem('ccc.translation-enabled.v1')!=='false';}catch{}
 try{selected=localStorage.getItem('ccc.translation-file.v1')??'';}catch{}
 const texts=new WeakMap<Text,{source:string;display:string}>();
 const attributes=new WeakMap<Element,Map<string,{source:string;display:string}>>();
 const update=()=>{
  queued=false;observer.disconnect();let addedControls=false;
  try{
  const language=enabled&&pack?pack.locale:'en';if(document.documentElement.lang!==language)document.documentElement.lang=language;
  if((enabled&&pack)||restorePending){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node:Node|null;
  while((node=walker.nextNode())){
   const text=node as Text;if(text.parentElement?.closest(PROTECTED))continue;
   const old=texts.get(text),source=old&&text.data===old.display?old.source:text.data;
   const display=translate(source);texts.set(text,{source,display});if(text.data!==display)text.data=display;
  }
  document.querySelectorAll<HTMLElement>('[title],[aria-label],[placeholder]').forEach(element=>{
   let saved=attributes.get(element);if(!saved){saved=new Map();attributes.set(element,saved);}
   for(const name of ['title','aria-label','placeholder']){
    const current=element.getAttribute(name);if(current===null)continue;
    const old=saved.get(name),source=old&&current===old.display?old.source:current,display=translate(source);
    saved.set(name,{source,display});if(current!==display)element.setAttribute(name,display);
   }
  });
  }
  restorePending=false;
  document.querySelectorAll<HTMLDialogElement>('.ui-settings-dialog').forEach(dialog=>{
   if(dialog.querySelector('[data-ccc-language-controls]'))return;
   const panel=document.createElement('div');panel.className='ui-settings-option';panel.dataset.cccLanguageControls='';
   const info=document.createElement('div'),title=document.createElement('strong'),description=document.createElement('p');
   title.textContent='Language';description.textContent=error||'Missing text uses English. The Chinese example is partial.';info.append(title,description);
   const controls=document.createElement('div'),select=document.createElement('select'),reload=document.createElement('button');controls.className='ui-language-actions';select.className='osf-input';select.setAttribute('aria-label','Language');
   const english=new Option('English','en');select.add(english);for(const entry of choices)select.add(new Option(entry.pack.languageName+' — '+entry.file,entry.file));
   select.value=enabled&&pack?selected:'en';select.addEventListener('change',()=>{const wasTranslated=Boolean(enabled&&pack);selected=select.value;pack=choices.find(entry=>entry.file===selected)?.pack??null;enabled=!!pack;restorePending=restorePending||(wasTranslated&&!enabled);translate=createTranslator(pack);currentTranslator=translate;try{localStorage.setItem('ccc.translation-enabled.v1',String(enabled));localStorage.setItem('ccc.translation-file.v1',selected);}catch{}changed();schedule();});
   reload.type='button';reload.className='osf-btn osf-btn--sm';reload.textContent='Reload Translation';reload.addEventListener('click',()=>void refresh());controls.append(select,reload);
   const location=document.createElement('p'),path=document.createElement('code');location.className='ui-language-location';
   location.textContent='Add JSON files here, then reload (inside your Starfield folder):';path.textContent='Data/SFSE/Plugins/OSF/UI/views/console.command-center/main/translations/';location.append(path);
   const previewNote=document.createElement('span');previewNote.textContent='Browser preview: use the source project’s translations/ folder.';location.append(previewNote);
   panel.append(info,controls,location);dialog.append(panel);addedControls=true;
  });
  }finally{observe();if(addedControls&&enabled&&pack)schedule();}
 };
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
 const observer=new MutationObserver(mutations=>{
  if(!enabled||!pack){
   const dialog=document.querySelector('.ui-settings-dialog');
   if(restorePending||(dialog&&!dialog.querySelector('[data-ccc-language-controls]')))schedule();
   return;
  }
  if(mutations.some(m=>m.type==='childList'||m.type==='characterData'||['title','aria-label','placeholder'].includes(m.attributeName??'')))schedule();
 });
 const observe=()=>observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
 observe();
 async function refresh(){
  const wasTranslated=Boolean(enabled&&pack);
  try{const result=parseTranslationChoices(await load());choices=result.choices;
   const file=defaultTranslationFile(choices,selected,enabled,navigator.languages);
   pack=choices.find(entry=>entry.file===file)?.pack??null;
   // Keep automatic selection separate from a deliberate, saved language choice.
   const activeFile=pack?file:'en';
   if(pack&&!selected)selected=activeFile;
   else if(pack&&selected!=='en'&&!choices.some(entry=>entry.file===selected))selected=activeFile;
   error=result.errors.length?'Some translation files could not be loaded: '+result.errors.join(', '):'';
  }
  catch{pack=null;choices=[];error='Translations could not be loaded. English is active; check the translation files.';}
  restorePending=restorePending||(wasTranslated&&!(enabled&&pack));
  translate=createTranslator(enabled?pack:null);currentTranslator=translate;
  document.querySelectorAll('[data-ccc-language-controls]').forEach(element=>element.remove());changed();schedule();
 }
 schedule();void refresh();
}
