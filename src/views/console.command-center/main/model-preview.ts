import { createPreviewController, type PreviewGamepadEvent } from './preview-controller.ts';
import { createLoadingRing } from './loading-ring.ts';
import { isDevModeEnabled } from './dev-feedback.ts';
type RecordForPreview = { value: string; label: string; type: string; available?: boolean; source?:string };
type RequestPreview = (name: string, payload: Record<string, string | number | boolean>) => Promise<unknown>;
export function canPreviewModel(entry: RecordForPreview, advanced: boolean): boolean {
  return (advanced||entry.source==='mod') && entry.available !== false && /^[\dA-F]{8}$/i.test(entry.value) && ['MISC', 'WEAP', 'ARMO', 'AMMO', 'ALCH', 'FURN', 'STAT', 'MSTT', 'ACTI', 'CONT', 'DOOR', 'GBFM', 'PKIN', 'COBJ'].includes(entry.type.toUpperCase());
}
export function defaultPreviewMannequin(type:string,label:string,category=''):boolean {
 return false;
}
export async function fetchPreview(request: RequestPreview, formId: string, current: () => boolean, mannequin = false, quality: 'low'|'medium'|'high'|'ultra' = 'high', sex: 'male'|'female' = 'female', geometryOnly=false): Promise<ArrayBuffer> {
  const transferLimit=(quality==='ultra'?256:64)*1024*1024;
  const reply = await request('console.command-center.previewModel', { formId, mannequin: mannequin ? 1 : 0, quality, sex, stage:geometryOnly?'geometry':'complete' }) as { ok?: boolean; ticket?: string; bytes?: number; compression?: string; decodedBytes?: number };
  if (!reply?.ok || typeof reply.ticket !== 'string' || !Number.isInteger(reply.bytes) || reply.bytes! < 12 || reply.bytes! > transferLimit) throw new Error('The native plugin returned an invalid model response.');
  const ticket=reply.ticket;
  const data = new Uint8Array(reply.bytes!);
  const range=async(start:number,end:number)=>{for(let offset=start;offset<end;){
    if(!current())throw new Error('Preview closed.');let chunk:{ok?:boolean;data?:string;offset?:number}|undefined;
    for(let attempt=0;attempt<3;++attempt){try{chunk=await request('console.command-center.previewChunk',{ticket,offset,maxBytes:Math.min(end-offset,attempt===0?32768:attempt===1?16384:8192)}) as typeof chunk;break;}catch(error){if(!current())throw new Error('Preview closed.');if(attempt===2)throw error;}}
    if(!chunk?.ok||chunk.offset!==offset||typeof chunk.data!=='string'||chunk.data.length>90000)throw new Error('Invalid model transfer chunk.');const bytes=atob(chunk.data);
    if(!bytes.length||bytes.length>65536||offset+bytes.length>end)throw new Error('Model transfer size mismatch.');for(let i=0;i<bytes.length;++i)data[offset+i]=bytes.charCodeAt(i);offset+=bytes.length;
  }};
  // Keep host messages small; drain both outstanding replies before advancing or retrying a preview.
  for(let start=0;start<data.length;start+=2*32768){const results=await Promise.allSettled(Array.from({length:Math.min(2,Math.ceil((data.length-start)/32768))},(_,i)=>range(start+i*32768,Math.min(data.length,start+(i+1)*32768))));const failure=results.find(result=>result.status==='rejected');if(failure?.status==='rejected')throw failure.reason;await new Promise(resolve=>setTimeout(resolve,0));}

  if(reply.compression){
    if(reply.compression!=='deflate'||!Number.isInteger(reply.decodedBytes)||reply.decodedBytes!<12||reply.decodedBytes!>transferLimit)throw new Error('Invalid compressed model response.');
    const decoded=new Uint8Array(reply.decodedBytes!);const reader=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();let offset=0;
    try{while(true){if(!current())throw new Error('Preview closed.');const part=await reader.read();if(part.done)break;if(offset+part.value.length>decoded.length)throw new Error('Model decompression size mismatch.');decoded.set(part.value,offset);offset+=part.value.length;}if(offset!==decoded.length)throw new Error('Model decompression size mismatch.');return decoded.buffer;}finally{await reader.cancel();}
  }
  return data.buffer;
}
export function installModelPreview(request: RequestPreview, options?: { quality: () => 'low'|'medium'|'high'|'ultra'; setQuality?: (quality:'low'|'medium'|'high'|'ultra') => void }): void {
  const renderers=new Set<ReturnType<typeof import('./preview-renderer')['createPreviewRenderer']>>();
  const track=(renderer:ReturnType<typeof import('./preview-renderer')['createPreviewRenderer']>)=>{renderers.add(renderer);renderer.showMissingTextures(isDevModeEnabled());const dispose=renderer.dispose;renderer.dispose=()=>{renderers.delete(renderer);dispose();};return renderer;};
  document.addEventListener('ccc-dev-mode-change',()=>{for(const renderer of renderers)renderer.showMissingTextures(isDevModeEnabled());});
  let transfer: Promise<unknown> = Promise.resolve();
  const queuedPreview = (...args: Parameters<typeof fetchPreview> extends [unknown, ...infer Rest] ? Rest : never) => {
    const result = transfer.catch(() => {}).then(() => { if (!args[1]()) throw new Error('Preview closed.'); return fetchPreview(request, ...args); });
    transfer = result.catch(() => {}); return result;
  };
  const inlineCache = new Map<string, ArrayBuffer>();
  const fullCache = new Map<string,ArrayBuffer>();
  const remember=(cacheKey:string,buffer:ArrayBuffer)=>{if(buffer.byteLength<=64*1024*1024){fullCache.delete(cacheKey);let bytes=buffer.byteLength;for(const value of fullCache.values())bytes+=value.byteLength;while(fullCache.size&&(fullCache.size>=2||bytes>64*1024*1024)){const oldest=fullCache.keys().next().value!;bytes-=fullCache.get(oldest)!.byteLength;fullCache.delete(oldest);}fullCache.set(cacheKey,buffer);}};
  document.addEventListener('click', async event => {
    const trigger = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-preview-model]');
    if (!trigger || document.querySelector('dialog.model-preview-dialog[open]')) return;
    const id = trigger.dataset.previewModel; if (!id || !/^[\dA-F]{8}$/i.test(id)) return;
    if (!trigger.isConnected || document.querySelector('dialog.model-preview-dialog[open]')) return;
    const dialog = document.createElement('dialog'); dialog.className = 'model-preview-dialog osf-card';dialog.tabIndex=-1;
    const title = document.createElement('h3'); title.textContent = trigger.dataset.previewLabel ?? 'Item model'; dialog.setAttribute('aria-label', title.textContent + ' 3D Viewer');
    const close = document.createElement('button'); close.className = 'osf-btn osf-btn--sm'; close.type = 'button'; close.textContent = 'Close';
    const header = document.createElement('header'); header.append(title, close);
    const status = document.createElement('p'); status.className = 'model-preview-status'; status.setAttribute('role', 'status'); status.textContent = 'Loading the installed item model…';
    const canvas = document.createElement('canvas'); canvas.className = 'model-preview-canvas'; canvas.hidden = true; canvas.tabIndex = 0; canvas.setAttribute('aria-label', 'Left-drag to move the model. Hold the mouse wheel and drag to orbit. Hold right mouse and drag up to zoom in or down to zoom out. Scroll to zoom. Shift plus arrow keys also moves the model.');
    const controls = document.createElement('div'); controls.className = 'model-preview-controls';
    const stage = document.createElement('div');stage.className = 'model-preview-stage';stage.append(canvas);
    const supportsMannequin = trigger.dataset.previewType === 'ARMO'; let mannequin = defaultPreviewMannequin(trigger.dataset.previewType??'',trigger.dataset.previewLabel??'',trigger.dataset.previewCategory);
    let sex: 'male'|'female' = trigger.dataset.previewSex === 'male' ? 'male' : 'female';
    const sexButton = document.createElement('button'); sexButton.type = 'button'; sexButton.className = 'osf-btn osf-btn--sm';
    const mannequinButton = document.createElement('button'); mannequinButton.type = 'button'; mannequinButton.className = 'osf-btn osf-btn--sm';
    if (supportsMannequin) controls.append(mannequinButton, sexButton);
    let renderer: ReturnType<typeof import('./preview-renderer')['createPreviewRenderer']> | undefined;
    const qualityLabel=document.createElement('label');qualityLabel.className='model-preview-quality';qualityLabel.textContent='Quality ';
    const qualitySelect=document.createElement('select');qualitySelect.className='osf-input';qualitySelect.setAttribute('aria-label','3D preview quality');
    for(const value of ['low','medium','high','ultra']){const option=document.createElement('option');option.value=value;option.textContent=value[0].toUpperCase()+value.slice(1);qualitySelect.append(option);}qualitySelect.value=options?.quality()??'high';qualityLabel.append(qualitySelect);controls.append(qualityLabel);
    let lightMode=false,texturesEnabled=true;
    const textureButton=document.createElement('button');textureButton.type='button';textureButton.className='osf-btn osf-btn--sm';textureButton.textContent='Textures: On';textureButton.setAttribute('aria-pressed','true');controls.append(textureButton);
    textureButton.addEventListener('click',()=>{texturesEnabled=!texturesEnabled;textureButton.textContent=`Textures: ${texturesEnabled?'On':'Off'}`;textureButton.setAttribute('aria-pressed',String(texturesEnabled));renderer?.showTextures(texturesEnabled);});
    const updateLightMarker=()=>renderer?.showLightMarker(lightMode&&!lighting.hidden);
    const loading=document.createElement('div');loading.className='model-preview-loading';loading.hidden=true;loading.setAttribute('role','status');loading.setAttribute('aria-label','Loading preview textures');
    loading.append(createLoadingRing());stage.append(loading);
    const lighting=document.createElement('div');lighting.className='model-preview-lighting';lighting.hidden=true;
    const moveLight=document.createElement('button');moveLight.type='button';moveLight.className='osf-btn osf-btn--sm';moveLight.textContent='Move Light';moveLight.setAttribute('aria-pressed','false');
    const brightness=document.createElement('label');brightness.textContent='Brightness ';
    const power=document.createElement('input');power.type='range';power.min='0.1';power.max='3';power.step='0.1';power.value='1';power.setAttribute('aria-label','Preview light brightness');brightness.append(power);
    const hint=document.createElement('span');hint.textContent='Left-drag places the light under the cursor. Hold Shift for the far side. Arrow keys also move it.';
    lighting.append(moveLight,brightness,hint);
    moveLight.addEventListener('click',()=>{lightMode=!lightMode;moveLight.setAttribute('aria-pressed',String(lightMode));moveLight.classList.toggle('osf-btn--osf-accent',lightMode);updateLightMarker();canvas.setAttribute('aria-label',lightMode?'Left-drag or arrow keys move the light. Middle-drag orbits. Right-drag or scroll zooms.':'Left-drag pans. Middle-drag orbits. Right-drag or scroll zooms.');});
    power.addEventListener('input',()=>renderer?.lightStrength(Number(power.value)));
    const toolbar=document.createElement('div');toolbar.className='model-preview-toolbar';toolbar.append(controls,lighting);header.replaceChildren(title,toolbar,close);
    const controllerHint=document.createElement('p');controllerHint.className='model-preview-controller-hint';
    const qualityMenu=document.createElement('div');qualityMenu.className='model-preview-controller-quality osf-card';qualityMenu.hidden=true;qualityMenu.setAttribute('role','status');qualityMenu.setAttribute('aria-label','Controller quality settings');
    dialog.append(header,status,controllerHint,qualityMenu,stage);document.body.append(dialog);
    close.dataset.controllerHint='B';mannequinButton.dataset.controllerHint='LB';sexButton.dataset.controllerHint='RB';qualityLabel.dataset.controllerHint='Y';textureButton.dataset.controllerHint='X';moveLight.dataset.controllerHint='R3';brightness.dataset.controllerHint='L3';
    let qualityIndex=qualitySelect.selectedIndex,controllerMode='object';
    const setControllerHint=()=>{controllerHint.textContent=qualityMenu.hidden
      ? `LB mannequin · RB body · Y quality · X textures · R3 light · L3 brightness · LS ${controllerMode==='light'?'move light':controllerMode==='brightness'?'up/down brightness':'move object'} · RS rotate · L2/R2 zoom · B close`
      : 'Quality: D-pad or left stick to choose · A apply · B cancel';};
    const pad=createPreviewController({
      mannequin:()=>{if(supportsMannequin)mannequinButton.click();},body:()=>{if(supportsMannequin)sexButton.click();},textures:()=>textureButton.click(),close:()=>dialog.close(),
      lightingAvailable:()=>!lighting.hidden&&Boolean(renderer),
      quality:(open,delta=0,apply=false)=>{
        if(open&&qualityMenu.hidden)qualityIndex=qualitySelect.selectedIndex;
        qualityIndex=Math.max(0,Math.min(qualitySelect.options.length-1,qualityIndex+delta));qualityMenu.hidden=!open;
        qualityMenu.replaceChildren(...Array.from(qualitySelect.options,(option,index)=>{const item=document.createElement('span');item.textContent=option.textContent;item.className=index===qualityIndex?'is-active':'';return item;}));
        if(apply&&qualitySelect.selectedIndex!==qualityIndex){qualitySelect.selectedIndex=qualityIndex;qualitySelect.dispatchEvent(new Event('change'));}setControllerHint();
      },
      mode:mode=>{controllerMode=mode;lightMode=mode==='light';moveLight.setAttribute('aria-pressed',String(lightMode));moveLight.classList.toggle('osf-btn--osf-accent',lightMode);updateLightMarker();setControllerHint();},
      pan:(x,y)=>renderer?.pan(x,y),rotate:(x,y)=>renderer?.move(x,y),zoom:factor=>renderer?.move(0,0,factor),light:(x,y)=>{renderer?.moveLight(x,y);updateLightMarker();},
      brightness:delta=>{const next=Math.max(.1,Math.min(3,(renderer?.getView().lightPower??Number(power.value))+delta));power.value=String(Math.round(next*100)/100);renderer?.lightStrength(next);},
    });
    const receiveGamepad=(event:Event)=>{pad.handle((event as CustomEvent<PreviewGamepadEvent>).detail);};
    dialog.addEventListener('ccc-preview-gamepad',receiveGamepad);
    const resetPad=()=>pad.reset();window.addEventListener('blur',resetPad);window.addEventListener('gamepaddisconnected',resetPad);document.addEventListener('visibilitychange',resetPad);dialog.addEventListener('pointerdown',resetPad);
    let triggerWatchStopped=false,triggerWatchPending=false;
    const watchTriggers=()=>{if(triggerWatchStopped||triggerWatchPending||!dialog.open)return;triggerWatchPending=true;void request('console.command-center.previewTriggerWatch',{watch:true}).catch(()=>{triggerWatchStopped=true;}).finally(()=>{triggerWatchPending=false;});};
    const triggerWatchTimer=window.setInterval(watchTriggers,750);
    const controllerVisibility=(event:Event)=>{pad.reset();if((event as CustomEvent<boolean>).detail)watchTriggers();};
    document.addEventListener('ccc-controller-visibility',controllerVisibility);
    dialog.addEventListener('close',()=>{triggerWatchStopped=true;window.clearInterval(triggerWatchTimer);document.removeEventListener('ccc-controller-visibility',controllerVisibility);void request('console.command-center.previewTriggerWatch',{watch:false}).catch(()=>{});});
    let controllerFrame=0,previousFrame=performance.now();
    const animateController=(time:number)=>{if(!dialog.isConnected||!dialog.open)return;pad.step((time-previousFrame)/1000);previousFrame=time;controllerFrame=requestAnimationFrame(animateController);};
    dialog.addEventListener('close',()=>{cancelAnimationFrame(controllerFrame);pad.reset();window.removeEventListener('blur',resetPad);window.removeEventListener('gamepaddisconnected',resetPad);document.removeEventListener('visibilitychange',resetPad);});
    setControllerHint();
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { renderer?.dispose(); dialog.remove(); if (trigger.isConnected) trigger.focus({ preventScroll: true }); });
    let dragButton: number | null = null, dragPointer: number | null = null, lastX = 0, lastY = 0;
    const stopDrag = () => { dragButton = dragPointer = null; canvas.style.cursor = ''; };
    canvas.addEventListener('pointerdown', e => { if ((e.button !== 0 && e.button !== 1 && e.button !== 2) || dragPointer !== null) return; e.preventDefault(); dragButton = e.button; dragPointer = e.pointerId; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.focus(); canvas.style.cursor = 'grabbing';if(lightMode&&e.button===0)renderer?.placeLight(e.clientX,e.clientY,e.shiftKey); });
    canvas.addEventListener('pointermove', e => { if (e.pointerId !== dragPointer) return; if (!(e.buttons & (dragButton === 1 ? 4 : dragButton === 2 ? 2 : 1))) { stopDrag(); return; } const dx = e.clientX - lastX, dy = e.clientY - lastY; if (dragButton === 0) {if(lightMode)renderer?.placeLight(e.clientX,e.clientY,e.shiftKey);else renderer?.pan(dx, dy);} else if(dragButton === 1)renderer?.move(dx * .008, dy * .008);else renderer?.move(0,0,Math.exp(-dy*.012)); lastX = e.clientX; lastY = e.clientY;updateLightMarker(); });
    canvas.addEventListener('pointerup', stopDrag); canvas.addEventListener('pointercancel', stopDrag); canvas.addEventListener('lostpointercapture', stopDrag);
    canvas.addEventListener('mousedown', e => { if (e.button === 1) e.preventDefault(); });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('auxclick', e => { if (e.button === 1) e.preventDefault(); });
    canvas.addEventListener('wheel', e => { e.preventDefault(); renderer?.zoomAt(e.clientX,e.clientY,e.deltaY < 0 ? 1.12 : 1 / 1.12);updateLightMarker(); }, { passive: false });
    canvas.addEventListener('dblclick', () => {renderer?.reset();updateLightMarker();});
    canvas.addEventListener('keydown', e => { const key = e.key; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '0'].includes(key)) { e.preventDefault(); e.stopPropagation(); if (key === '0') renderer?.reset();else if(lightMode&&key.startsWith('Arrow'))renderer?.moveLight(key==='ArrowLeft'?-12:key==='ArrowRight'?12:0,key==='ArrowUp'?-12:key==='ArrowDown'?12:0); else if(e.shiftKey && key.startsWith('Arrow'))renderer?.pan(key==='ArrowLeft'?-20:key==='ArrowRight'?20:0,key==='ArrowUp'?-20:key==='ArrowDown'?20:0); else renderer?.move(key === 'ArrowLeft' ? -.15 : key === 'ArrowRight' ? .15 : 0, key === 'ArrowUp' ? -.12 : key === 'ArrowDown' ? .12 : 0, key === '+' ? 1.15 : key === '-' ? 1 / 1.15 : 1);updateLightMarker(); } });
    dialog.showModal(); dialog.focus();watchTriggers();controllerFrame=requestAnimationFrame(animateController);
    let loadSequence=0,renderedKey='',geometryStage=false;
    const load = async () => {const sequence=++loadSequence,current=()=>dialog.isConnected&&dialog.open&&sequence===loadSequence; try {
      loading.hidden=false;stage.setAttribute('aria-busy','true');const previousView=renderer?.getView();status.textContent=renderer?'Updating preview quality…':'Loading the installed item model…';
      controls.querySelectorAll('button').forEach(button => { button.disabled = !renderer; });
      lighting.querySelectorAll<HTMLInputElement|HTMLButtonElement>('button,input').forEach(control=>{control.disabled=!renderer;});
      mannequinButton.textContent = `Mannequin: ${mannequin ? 'On' : 'Off'}`; mannequinButton.setAttribute('aria-pressed', String(mannequin));
      sexButton.textContent = `Body: ${sex === 'male' ? 'Male' : 'Female'}`;
      const quality=qualitySelect.value as 'low'|'medium'|'high'|'ultra';
      lighting.hidden=false;if(lighting.hidden){lightMode=false;moveLight.setAttribute('aria-pressed','false');moveLight.classList.remove('osf-btn--osf-accent');}renderer?.setQuality(quality);updateLightMarker();setControllerHint();
      const geometryKey=`${id}:${mannequin}:${sex}`,cacheKey=`${id}:${mannequin}:${quality}:${sex}`,lowKey=`${id}:${mannequin}:low:${sex}`;
      const selectedMannequin=mannequin,selectedSex=sex;
      const { decodePreview, createPreviewRenderer } = await import('./preview-renderer');if(!current())return;
      const paint=(buffer:ArrayBuffer,packetQuality:typeof quality,geometryOnly=false)=>{geometryStage=geometryOnly;const meshes=decodePreview(buffer,packetQuality);canvas.hidden=false;
        if(!renderer||renderedKey!==geometryKey||!renderer.updateMaterials(meshes)){const view=renderer?.getView()??previousView;renderer?.dispose();renderer=track(createPreviewRenderer(canvas,meshes,geometryOnly?'low':quality));if(view)renderer.restoreView(view);}
        renderedKey=geometryKey;renderer.showMissingTextures(!geometryOnly&&isDevModeEnabled());renderer.setQuality(geometryOnly?'low':quality);renderer.showTextures(texturesEnabled);updateLightMarker();controls.querySelectorAll('button').forEach(button=>{button.disabled=false;});lighting.querySelectorAll<HTMLInputElement|HTMLButtonElement>('button,input').forEach(control=>{control.disabled=false;});return meshes;};
      let buffer=fullCache.get(cacheKey);
      if(!buffer&&(!renderer||renderedKey!==geometryKey)){
        const geometryCacheKey=`${id}:${mannequin}:geometry:${sex}`;
        const geometry=fullCache.get(geometryCacheKey)??await queuedPreview(id,current,selectedMannequin,'low',selectedSex,true);if(!current())return;
        paint(geometry,'low',true);remember(geometryCacheKey,geometry);
        status.textContent='Model ready • Loading textures… You can move and zoom now.';
        await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));if(!current())return;
      }
      if(!buffer&&quality!=='low'&&geometryStage){
        const low=fullCache.get(lowKey)??(!selectedMannequin&&selectedSex==='male'?inlineCache.get(`${id}:male`):undefined)??await queuedPreview(id,current,selectedMannequin,'low',selectedSex);if(!current())return;
        const lowMeshes=paint(low,'low');remember(lowKey,low);if(low.byteLength<=16*1024*1024){while(inlineCache.size>=2)inlineCache.delete(inlineCache.keys().next().value!);if(!selectedMannequin&&selectedSex==='male')inlineCache.set(`${id}:male`,low);}
        status.textContent='Low textures ready • Loading sharper textures… You can move and zoom now.'+(lowMeshes.some(mesh=>mesh.incompleteMaterial)?' • Some material layers are unavailable.':'');
      }
      buffer??=await queuedPreview(id,current,selectedMannequin,quality,selectedSex);
      if(!current())return;
      remember(cacheKey,buffer);
      const meshes=paint(buffer,quality);
      lighting.querySelectorAll<HTMLInputElement|HTMLButtonElement>('button,input').forEach(control=>{control.disabled=false;});
      const textured = meshes.filter(mesh => mesh.texture).length;
      const incomplete=meshes.filter(mesh=>mesh.incompleteMaterial&&!mesh.mannequin).length;
      status.textContent = `Left: move • Hold wheel: orbit • Right up/down: zoom • Scroll: zoom • ${textured} textured ${textured === 1 ? 'piece' : 'pieces'}${incomplete ? ' • Some material layers are unavailable.' : ''}${mannequin && !meshes.some(mesh => mesh.mannequin) ? ' • Mannequin unavailable' : ''}`; controls.querySelectorAll('button').forEach(button => { button.disabled = false; });
    } catch (error) { if (current()) { canvas.hidden = !renderer; controls.querySelectorAll('button').forEach(button=>{button.disabled=false;});lighting.querySelectorAll<HTMLInputElement|HTMLButtonElement>('button,input').forEach(control=>{control.disabled=!renderer;});const message=error instanceof Error ? error.message : 'This item cannot be previewed yet.';status.textContent=renderer?'Preview retained • Texture upgrade unavailable: '+message:message; } } finally{if(current()){loading.hidden=true;stage.setAttribute('aria-busy','false');}} };
    qualitySelect.addEventListener('change',()=>{const quality=qualitySelect.value as 'low'|'medium'|'high'|'ultra';options?.setQuality?.(quality);void load();});
    mannequinButton.addEventListener('click', () => { mannequin = !mannequin; void load(); });
    sexButton.addEventListener('click', () => { sex = sex === 'female' ? 'male' : 'female'; void load(); });
    await load();
  });
  const active = new Map<HTMLElement, () => void>();
  const mount = (host: HTMLElement) => {
    let disposed = false, revision = 0;
    let renderer: ReturnType<typeof import('./preview-renderer')['createPreviewRenderer']> | undefined;
    const canvas = document.createElement('canvas'); canvas.className = 'inline-model-canvas'; canvas.tabIndex = 0; canvas.hidden = true;
    canvas.setAttribute('aria-label', 'Item preview. Left-drag to rotate; scroll to zoom. Arrow keys rotate; plus and minus zoom.');
    const status = document.createElement('p'); status.className = 'inline-model-status'; status.textContent = 'Loading preview…'; status.setAttribute('role', 'status');
    const fullButton = document.createElement('button'); fullButton.type = 'button'; fullButton.className = 'osf-btn osf-btn--sm'; fullButton.textContent = '3D Viewer';fullButton.dataset.controllerHint='Y';
    fullButton.dataset.previewModel = host.dataset.inlinePreview; fullButton.dataset.previewLabel = host.dataset.previewLabel ?? 'Item model'; fullButton.dataset.previewType = host.dataset.previewType; fullButton.dataset.previewSex = 'male'; fullButton.dataset.previewCategory=host.dataset.previewCategory;
    const armor = defaultPreviewMannequin(host.dataset.previewType??'',host.dataset.previewLabel??'',host.dataset.previewCategory);
    const inlineLoading=createLoadingRing('small');host.append(canvas, inlineLoading,status, fullButton);
    const load = async () => {
      const version = ++revision, current = () => !disposed && host.isConnected && version === revision;
      renderer?.dispose(); renderer = undefined; canvas.hidden = true;
      status.textContent = 'Loading preview…';inlineLoading.hidden=false;
      try {
        const id = host.dataset.inlinePreview!, key = `${id}:male`;
        const { decodePreview, createPreviewRenderer } = await import('./preview-renderer');if(!current())return;
        let buffer=inlineCache.get(key);
        if(!buffer){
          const geometryKey=`${id}:${armor}:geometry:male`;
          const geometry=fullCache.get(geometryKey)??await queuedPreview(id,current,armor,'low','male',true);if(!current())return;
          remember(geometryKey,geometry);canvas.hidden=false;renderer=track(createPreviewRenderer(canvas,decodePreview(geometry,'low'),'low'));renderer.showMissingTextures(false);
          status.textContent='Model ready • Loading textures…';
          await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));if(!current())return;
          buffer=await queuedPreview(id,current,armor,'low','male');
        }
        if(!current())return;
        if (!inlineCache.has(key)) { while (inlineCache.size >= 2) inlineCache.delete(inlineCache.keys().next().value!); if (buffer.byteLength <= 16*1024*1024) inlineCache.set(key, buffer); }
        const meshes=decodePreview(buffer,'low');
        if(!renderer||!renderer.updateMaterials(meshes)){const view=renderer?.getView();renderer?.dispose();renderer=track(createPreviewRenderer(canvas,meshes,'low'));if(view)renderer.restoreView(view);}
        renderer.showMissingTextures(isDevModeEnabled());canvas.hidden=false;
        status.textContent = 'Drag to rotate • Scroll to zoom';
      } catch { if (current()) status.textContent = renderer?'Model ready • Textures unavailable. Try 3D Viewer.':'Preview unavailable. Try 3D Viewer.'; }finally{if(current())inlineLoading.hidden=true;}
    };
    let pointer: number | null = null, x = 0, y = 0;
    canvas.addEventListener('pointerdown', e => { if (e.button !== 0) return; e.preventDefault(); pointer = e.pointerId; x = e.clientX; y = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.focus({preventScroll:true}); });
    canvas.addEventListener('pointermove', e => { if (pointer !== e.pointerId) return; if (!(e.buttons & 1)) { pointer = null; return; } renderer?.move((e.clientX-x)*.008, (e.clientY-y)*.008); x = e.clientX; y = e.clientY; });
    for (const name of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(name, () => { pointer = null; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); renderer?.zoomAt(e.clientX,e.clientY,e.deltaY<0?1.12:1/1.12); }, {passive:false});
    canvas.addEventListener('dblclick', () => renderer?.reset());
    canvas.addEventListener('keydown', e => { if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','0'].includes(e.key)) return; e.preventDefault(); e.stopPropagation(); if(e.key==='0')renderer?.reset();else renderer?.move(e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0,e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0,e.key==='+'?1.15:e.key==='-'?1/1.15:1); });
    const observer = new IntersectionObserver(entries => { if (entries.some(e=>e.isIntersecting)) { observer.disconnect(); void load(); } }); observer.observe(host);
    active.set(host, () => { disposed = true; ++revision; observer.disconnect(); renderer?.dispose(); });
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const sync = () => {
    for (const [host, cleanup] of active) if (!host.isConnected) { cleanup(); active.delete(host); }
    const hosts = [...document.querySelectorAll<HTMLElement>('[data-inline-preview]')].filter(host => !active.has(host));
    if (!hosts.length) return;
    clearTimeout(timer); timer = setTimeout(() => { for (const host of hosts) if (host.isConnected && !active.has(host)) mount(host); }, 250);
  };
  new MutationObserver(sync).observe(document.body, {childList:true,subtree:true}); sync();
}
