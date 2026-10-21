type Request = (name: string, payload: Record<string,string>) => Promise<unknown>;
export function validateBookReply(reply: unknown, id: string): string {
  const result=reply as {ok?:boolean;formId?:string;bookText?:string};
  if(!result?.ok||result.formId?.toUpperCase()!==id.toUpperCase()||typeof result.bookText!=='string'||result.bookText.length>262144)throw Error('The book text could not be loaded.');
  return result.bookText;
}
// Keep basic book formatting, without inserting game-provided HTML or loading images.
export function renderBookText(host: HTMLElement, value: string): void {
  host.replaceChildren();
  const text=value.slice(0,262144).replace(/^<ID=[\dA-F]{8}>/i,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
  const allowed=new Set(['p','div','span','b','strong','i','em','u','br','hr','ul','ol','li','h1','h2','h3','blockquote']);
  const stack:HTMLElement[]=[host];
  for(const token of text.match(/<[^>]*>|[^<]+|</g)??[]){
    if(token.startsWith('<')&&token.endsWith('>')){
      const match=token.match(/^<(\/)?\s*([a-z][\w-]*)\b/i);if(!match)continue;
      const closing=!!match[1],tag=match[2].toLowerCase();
      if(tag==='img'&&!closing){stack.at(-1)!.append(document.createTextNode('[Illustration]'));continue;}
      if(tag==='pagebreak'&&!closing){stack.at(-1)!.append(document.createElement('hr'));continue;}
      if(!allowed.has(tag))continue;
      if(closing){for(let i=stack.length-1;i>0;--i)if(stack[i].tagName.toLowerCase()===tag){stack.length=i;break;}continue;}
      const node=document.createElement(tag);stack.at(-1)!.append(node);
      if(!['br','hr'].includes(tag)&&!token.endsWith('/>')&&stack.length<32)stack.push(node);
    }else{
      // Escape angle brackets first so entity decoding cannot create elements.
      const decoder=document.createElement('textarea');decoder.innerHTML=token.replaceAll('<','&lt;').replaceAll('>','&gt;');
      stack.at(-1)!.append(document.createTextNode(decoder.value));
    }
  }
  if(!host.textContent?.trim())host.textContent='No readable text is stored for this item. Some slates contain only audio or images.';
}
export function installBookReader(request: Request, options: {available:()=>boolean}): void {
  const cache=new Map<string,string>();
  document.addEventListener('click',event=>{
    const button=(event.target as Element|null)?.closest<HTMLButtonElement>('[data-read-book]');
    if(!button||button.disabled||document.querySelector('.book-reader-dialog[open]'))return;
    const id=button.dataset.readBook;if(!id||!/^[\dA-F]{8}$/i.test(id))return;
    const dialog=document.createElement('dialog');dialog.className='book-reader-dialog osf-card';dialog.tabIndex=-1;
    const header=document.createElement('header'),title=document.createElement('h3'),close=document.createElement('button');
    title.textContent=button.dataset.bookTitle??'Book / Note';dialog.setAttribute('aria-label',title.textContent);
    close.textContent='Close';close.type='button';close.className='osf-btn osf-btn--sm';header.append(title,close);
    const body=document.createElement('article');body.className='book-reader-text';body.tabIndex=0;body.setAttribute('aria-label','Book text');body.setAttribute('aria-live','polite');
    const note=document.createElement('small');note.textContent='Reading here does not add the item or grant skill-book rewards.';
    dialog.append(header,body,note);document.body.append(dialog);
    const finish=()=>{dialog.close();dialog.remove();if(button.isConnected)button.focus({preventScroll:true});};
    close.addEventListener('click',finish);dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
    const load=async()=>{
      if(!options.available()){body.textContent='Book and note text is available in-game with the CCC plugin.';return;}
      body.textContent='Loading text…';
      try{
        let text=cache.get(id);
        if(text===undefined){text=validateBookReply(await request('console.command-center.inspectRecord',{formId:id,operation:'read-book'}),id);cache.set(id,text);while(cache.size>12)cache.delete(cache.keys().next().value!);}
        if(!dialog.isConnected)return;renderBookText(body,text);body.focus({preventScroll:true});
      }catch{
        if(!dialog.isConnected)return;body.textContent='The book text could not be loaded. ';const retry=document.createElement('button');retry.type='button';retry.className='osf-btn osf-btn--sm';retry.textContent='Retry';retry.addEventListener('click',()=>void load(),{once:true});body.append(retry);
      }
    };
    dialog.showModal();dialog.focus();void load();
  });
}
