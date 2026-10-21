import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function discoverTranslations(directory) {
 const packs=[],errors=[];let bytes=0;
 let files;try{files=await readdir(directory,{withFileTypes:true});}catch(error){if(error.code==='ENOENT')return {ok:true,packs,errors};throw error;}
 for(const entry of files.filter(entry=>entry.isFile()&&entry.name.endsWith('.json')).slice(0,64)){
  try{const path=resolve(directory,entry.name),size=(await stat(path)).size;
   if(size>16*1024*1024||bytes+size>64*1024*1024)throw Error('Translation size limit.');bytes+=size;
   const pack=JSON.parse((await readFile(path,'utf8')).replace(/^\uFEFF/,''));
   packs.push({file:entry.name,pack});
  }catch{errors.push(entry.name);}
 }
 return {ok:true,packs,errors};
}
export function cccTranslationsPlugin(projectRoot) {
 return {name:'ccc-preview-translations',configureServer(server){server.middlewares.use('/__ccc/translations',async(request,response)=>{
  if(request.method!=='GET'){response.statusCode=405;response.end();return;}
  response.setHeader('Content-Type','application/json; charset=utf-8');response.setHeader('Cache-Control','no-store');
  try{response.end(JSON.stringify(await discoverTranslations(resolve(projectRoot,'translations'))));}
  catch{response.statusCode=500;response.end(JSON.stringify({ok:false}));}
 });}};
}
