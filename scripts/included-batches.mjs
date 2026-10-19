import {mkdir,readFile,writeFile,readdir,stat,copyFile,unlink} from 'node:fs/promises';
import {constants} from 'node:fs';
import {join,resolve} from 'node:path';
import {homedir} from 'node:os';
export function batchLines(content){return content.split(/\r?\n/).map(line=>{let quoted=false,escaped=false;for(let i=0;i<line.length;i++){const ch=line[i];if(escaped){escaped=false;continue}if(quoted&&ch==='\\'){escaped=true;continue}if(ch==='"'){quoted=!quoted;continue}if(!quoted&&(ch==='#'||ch===';'))return line.slice(0,i).trim()}return line.trim()}).filter(Boolean)}
export function includedBatchStore(directory){
 const root=resolve(directory),marker=join(root,'.ccc-included-v1.json');
 const namePath=name=>{if(typeof name!=='string'||!name.trim()||name!==name.trim()||name.length>120||/[<>:"/\\|?*\x00-\x1f]/.test(name)||/[. ]$/.test(name)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))throw Error('Invalid batch filename.');return join(root,name+'.txt')};
 const read=async path=>{if((await stat(path)).size>1024*1024)throw Error('Batch exceeds 1 MB.');return (await readFile(path,'utf8')).replace(/^\uFEFF/,'')};
 return async payload=>{
  await mkdir(root,{recursive:true});
  if(payload.samples!==undefined){
   if(!Array.isArray(payload.samples)||payload.samples.length>100)throw Error('Invalid included batch list.');
   let installed=[];try{installed=JSON.parse(await read(marker))}catch(e){if(e.code!=='ENOENT')throw e}
   if(!Array.isArray(installed)||installed.length>1000)throw Error('Invalid included installation record.');
   for(const item of payload.samples){
    const file=namePath(item.name);if(typeof item.commands!=='string'||Buffer.byteLength(item.commands)>1024*1024||!batchLines(item.commands).length)throw Error('Invalid batch contents.');
    const key=item.name.toLowerCase();if(installed.includes(key))continue;
    if(item.previousName){
     const previous=namePath(item.previousName);
     if(previous===file)throw Error('Invalid batch rename.');
     try{await copyFile(previous,file,constants.COPYFILE_EXCL);await unlink(previous);installed.push(key);continue}
     catch(e){if(e.code!=='ENOENT'&&e.code!=='EEXIST')throw e;if(e.code==='EEXIST'||installed.includes(item.previousName.toLowerCase())){installed.push(key);continue}}
    }
    try{await writeFile(file,item.commands,{encoding:'utf8',flag:'wx'})}catch(e){if(e.code!=='EEXIST')throw e}installed.push(key)
   }
   await writeFile(marker,JSON.stringify(installed,null,2),'utf8');
  }
  const reply={ok:true,directory:root};
  if(payload.name){const commands=await read(namePath(payload.name));reply.entry={name:payload.name,file:payload.name+'.txt',commands,commandCount:batchLines(commands).length,valid:batchLines(commands).length>0}}
  else{reply.entries=[];for(const file of (await readdir(root)).filter(f=>/\.txt$/i.test(f)).sort((a,b)=>a.localeCompare(b)).slice(0,100)){try{const name=file.slice(0,-4),commands=await read(namePath(name));reply.entries.push({name,file,commandCount:batchLines(commands).length,valid:batchLines(commands).length>0})}catch{}}}
  return reply;
 };
}
export function cccIncludedBatchesPlugin(){
 const store=includedBatchStore(join(homedir(),'Documents','My Games','Starfield','Console Command Center','Included Batches'));let queue=Promise.resolve();
 return {name:'ccc-included-batches',apply:'serve',configureServer(server){server.middlewares.use(async(req,res,next)=>{
  if((req.url??'').split('?')[0]!=='/__ccc/included-batches')return next();
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
  try{if(req.method!=='POST')throw Error('Use POST.');if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)throw Error('Invalid request origin.');let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>1024*1024)throw Error('Request exceeds 1 MB.')}const payload=JSON.parse(text);const run=queue.then(()=>store(payload));queue=run.catch(()=>{});res.end(JSON.stringify(await run))}catch(e){res.statusCode=400;res.end(JSON.stringify({ok:false,error:String(e.message??e)}))}
 })}};
}
