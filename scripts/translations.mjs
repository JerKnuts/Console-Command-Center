import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {parseAst} from 'rolldown/parseAst';
import {parseTranslationPack} from '../src/views/console.command-center/main/translations.ts';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const displayFields=new Set(['label','title','description','warning','hint','detail','text','buttonLabel','executeLabel','unavailableReason','requirement','quest','category','source','intakeGroup']);
const protectedFields=new Set(['command','id','key','value','name','plugin','editorId','formId','localFormId','sourcePrefix','pattern','defaultValue','original','originalName']);
const decode=text=>text.replace(/&(?:amp|lt|gt|quot|apos|nbsp);|&#(?:x[\da-f]+|\d+);/gi,entity=>{
 const named={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '};
 if(entity in named)return named[entity];const number=entity.slice(2,-1);return String.fromCodePoint(number[0].toLowerCase()==='x'?parseInt(number.slice(1),16):parseInt(number,10));
});
const id=text=>createHash('sha256').update(text).digest('hex').slice(0,16);
const plain=text=>decode(text).trim().replace(/\s+/g,' ');
function human(text){return text.length>=2&&text.length<=8192&&/[A-Za-z]/.test(text)&&!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text)&&!/^([.#/\\]|https?:|[\w.-]+\.(?:ts|json|esm|dll|nif|mat|dds)$)/i.test(text)&&!(/^[a-z_\d.:/-]+$/i.test(text)&&!/[A-Z]/.test(text));}
export function displayFragments(value){
 const result=[];
 if(!/<\/?[a-z][^>]*>/i.test(value))return [plain(value)];
 const tokens=value.match(/<[^>]*>|[^<]+/g)??[];let protectedDepth=0;
 for(const token of tokens){
  if(token.startsWith('<')){
   const close=/^<\//.test(token),tag=token.match(/^<\/?([\w-]+)/)?.[1]?.toLowerCase();
   if(['code','pre','textarea','script','style'].includes(tag)){if(close)protectedDepth=Math.max(0,protectedDepth-1);else protectedDepth++;}
   if(!protectedDepth)for(const m of token.matchAll(/\b(?:title|aria-label|placeholder)\s*=\s*(["'])(.*?)\1/gs))result.push(plain(m[2]));
  }else if(!protectedDepth)result.push(plain(token));
 }
 return result;
}
async function filesAt(directory,extension){let files=[];for(const entry of await readdir(directory,{withFileTypes:true})){if(['lib','node_modules'].includes(entry.name))continue;const path=resolve(directory,entry.name);if(entry.isDirectory())files.push(...await filesAt(path,extension));else if(path.endsWith(extension))files.push(path);}return files.sort();}
export async function exportStrings(){
 const entries=new Map();
 const add=(english,group,context,force=false)=>{
  english=plain(english);if(!human(english)&&!force)return;if(!english||english.length>8192||/^\{\d+\}$/.test(english))return;
  let entry=entries.get(english);if(!entry){entry={id:id(english),english,group,contexts:new Set()};entries.set(english,entry);}
  if(entry.contexts.size<6)entry.contexts.add(context);
 };
 const scanData=(value,context)=>{
  if(Array.isArray(value)){value.forEach((r,i)=>scanData(r,context+':'+(r?.plugin??'')+':'+(r?.localFormId??r?.questId??i)));return;}
  if(!value||typeof value!=='object')return;
  for(const [field,text]of Object.entries(value))if(displayFields.has(field)&&typeof text==='string')add(text,'catalog',context+'.'+field,true);
 };
 for(const file of await filesAt(resolve(root,'src/views/console.command-center/main'),'.ts')){
  const source=await readFile(file,'utf8'),name=relative(root,file).replaceAll('\\','/');
  if(name.endsWith('/translations.ts'))continue;
  const ast=parseAst(source,{lang:'ts'},name);
  const visit=(node,parent)=>{
   if(!node||typeof node!=='object')return;
   if(node.type==='TaggedTemplateExpression'&&node.tag?.type==='MemberExpression'&&node.tag.object?.name==='String'&&node.tag.property?.name==='raw'){
    const raw=node.quasi?.quasis?.[0]?.value?.raw;
    if(raw&&raw[0]==='['){scanData(JSON.parse(raw),name);return;}
   }
   if(node.type==='Literal'&&typeof node.value==='string'){
    const key=parent?.type==='Property'?(parent.key?.name??parent.key?.value):'';
    if(protectedFields.has(key)||['ImportDeclaration','ExportAllDeclaration','ExportNamedDeclaration','TSLiteralType'].includes(parent?.type))return;
    const context=name+':'+(source.slice(0,node.start).match(/\n/g)?.length+1||1);
    const group=/(?:reviewed-|findings|reference-ids|ship-catalog|vehicle-catalog|mod-display-names)/.test(name)?'catalog':/(?:commands|engine-command-library)\.ts$/.test(name)?'commands':'ui';
    if(node.value.length<=8192)for(const fragment of displayFragments(node.value))add(fragment,group,context,displayFields.has(key));
   }else if(node.type==='TemplateLiteral'){
    const text=node.quasis.map((q,i)=>(q.value.cooked??q.value.raw)+(i<node.expressions.length?'{'+i+'}':'')).join('');
    if(text.length<=200000){const context=name+':'+(source.slice(0,node.start).match(/\n/g)?.length+1||1);for(const fragment of displayFragments(text))add(fragment,'ui',context);}
   }
   for(const [key,value]of Object.entries(node))if(!['start','end','value','raw','type'].includes(key)){
    if(Array.isArray(value))value.forEach(child=>visit(child,node));else if(value&&typeof value==='object')visit(value,node);
   }
  };
  visit(ast,null);
 }
 // Native messages are optional: game/plugin-generated values may remain in the game's language.
 for(const file of [...await filesAt(resolve(root,'native/src'),'.cpp'),...await filesAt(resolve(root,'native/include'),'.h')]){
  const source=await readFile(file,'utf8'),name=relative(root,file).replaceAll('\\','/');
  for(const match of source.matchAll(/"((?:[^"\\\r\n]|\\.){3,8192})"/g)){
   let text;try{text=JSON.parse('"'+match[1]+'"');}catch{continue;}
   if(/\s/.test(text)&&!/[{}<>]/.test(text)&&!/^#|\\|\//.test(text))add(text,'native',name);
  }
 }
 for(const file of await filesAt(resolve(root,'batches/included'),'.txt')){
  add(file.split(/[\\/]/).pop().slice(0,-4),'batches',relative(root,file),true);
  const source=await readFile(file,'utf8');for(const line of source.split(/\r?\n/))if(/^\s*#/.test(line))add(line.replace(/^\s*#\s*/,''),'batch comments',relative(root,file));
 }
 for(const text of ['Language','English','Reload Translation','Missing text uses English. The Chinese example is partial.','Add JSON files here, then reload (inside your Starfield folder):','Browser preview: use the source project’s translations/ folder.','Translations could not be loaded. English is active; check the translation files.','Low','Medium','High','Ultra'])add(text,'ui','translations.ts',true);
 return [...entries.values()].sort((a,b)=>a.english.localeCompare(b.english)).map(entry=>({...entry,contexts:[...entry.contexts]}));
}
export function sectionedTranslationPack(entries){
 const sections=Object.fromEntries(['Interface','Commands','Game Settings','Items','Quests','Game Messages','Batch Labels and Comments'].map(name=>[name,Object.create(null)]));
 for(const entry of entries){
  const contexts=entry.contexts.join(' ');
  const section=entry.group==='commands'?'Commands':entry.group==='native'?'Game Messages':entry.group.startsWith('batch')?'Batch Labels and Comments':entry.group==='catalog'?(/game-settings/.test(contexts)?'Game Settings':/quest/i.test(contexts)?'Quests':'Items'):'Interface';
  sections[section][entry.english]='';
 }
 return {schemaVersion:1,locale:'zh-CN',languageName:'简体中文',messages:sections};
}
export function csvWrite(rows){return '\ufeff'+rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';}
export function csvRead(source){
 source=source.replace(/^\ufeff/,'');let rows=[],row=[],cell='',quoted=false;
 for(let i=0;i<source.length;i++){const ch=source[i];if(ch==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&ch===','){row.push(cell);cell='';}else if(!quoted&&(ch==='\n'||ch==='\r')){if(ch==='\r'&&source[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=ch;}
 if(quoted)throw Error('Unclosed CSV quote.');if(cell||row.length){row.push(cell);rows.push(row);}return rows;
}
export function importCsv(source){
 const rows=csvRead(source);if(rows[0]?.join('|')!=='ID|English|Translation|Group|Context')throw Error('CSV header does not match the translator template.');
 const messages=Object.create(null);
 for(const row of rows.slice(1)){if(row.every(v=>!v))continue;if(row.length!==5||id(row[1])!==row[0])throw Error('English text or message ID changed. Edit only Translation.');if(row[1] in messages)throw Error('Duplicate CSV message.');messages[row[1]]=row[2];}
 return parseTranslationPack({schemaVersion:1,locale:'zh-CN',languageName:'简体中文',messages});
}
async function main(){
 const [action='export',arg,out]=process.argv.slice(2);
 if(action==='import-csv'){if(!arg||!out)throw Error('Usage: node scripts/translations.mjs import-csv INPUT.csv OUTPUT.json');await writeFile(resolve(out),JSON.stringify(importCsv(await readFile(resolve(arg),'utf8')),null,2)+'\n','utf8');return;}
 if(action==='validate'){const pack=parseTranslationPack(JSON.parse(await readFile(resolve(arg),'utf8')));console.log(pack.locale+': '+Object.values(pack.messages).filter(Boolean).length+' translated messages.');return;}
 if(action!=='export')throw Error('Choose export, import-csv, or validate.');
 const version=JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).version,directory=resolve(arg??resolve(root,'artifacts','translator-kit-v'+version));
 await mkdir(directory,{recursive:true});const entries=await exportStrings();
 const pack=sectionedTranslationPack(entries);
 await writeFile(resolve(directory,'Translation.json'),JSON.stringify(pack,null,2)+'\n','utf8');
 await writeFile(resolve(directory,'README.md'),await readFile(resolve(root,'docs/TRANSLATION_GUIDE.md'),'utf8'),'utf8');
 console.log('Exported '+entries.length+' unique messages to '+directory);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
