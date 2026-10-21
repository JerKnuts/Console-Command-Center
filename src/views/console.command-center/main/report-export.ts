type Request=(name:string,payload:Record<string,string|number>,options?:{timeoutMs:number})=>Promise<unknown>;
const endpoint='console.command-center.devFeedbackExport';
export function reportExportChunks(content:string):string[]{
 const chunks:string[]=[];
 for(let start=0;start<content.length;){
  let end=Math.min(start+8192,content.length);
  if(end<content.length&&content.charCodeAt(end-1)>=0xd800&&content.charCodeAt(end-1)<=0xdbff)end--;
  chunks.push(content.slice(start,end));start=end;
 }
 return chunks;
}
export async function exportReportText(request:Request,content:string):Promise<string>{
 const bytes=new TextEncoder().encode(content).length;
 if(!bytes||bytes>4*1024*1024)throw Error('Report export must be between 1 byte and 4 MB.');
 let upload='';
 try{
  const begin=await request(endpoint,{action:'begin',bytes}) as {ok:boolean;upload:string};
  if(!begin?.ok||typeof begin.upload!=='string'||!begin.upload)throw Error('Report upload could not start. Install the matching CCC DLL and restart Starfield.');
  upload=begin.upload;
  for(const [index,chunk]of reportExportChunks(content).entries()){
   const reply=await request(endpoint,{action:'append',upload,index,content:chunk}) as {ok:boolean;next:number};
   if(!reply?.ok||reply.next!==index+1)throw Error('Report upload was interrupted. Retry Export Reports.');
  }
  const saved=await request(endpoint,{action:'finish',upload},{timeoutMs:30000}) as {ok:boolean;path:string};
  if(!saved?.ok||typeof saved.path!=='string'||!saved.path)throw Error('Report export did not return a saved file.');
  upload='';return saved.path;
 }catch(error){
  if(upload)try{await request(endpoint,{action:'cancel',upload},{timeoutMs:3000});}catch{}
  throw error;
 }
}
