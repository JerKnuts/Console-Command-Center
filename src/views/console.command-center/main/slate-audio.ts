import {Buffer as BrowserBuffer} from 'buffer';
export type SlateTrack={index:number;text:string};
export type SlateRequest=(name:string,payload:Record<string,string|number>)=>Promise<unknown>;
export async function fetchSlateAudio(request:SlateRequest,id:string,track:number,current:()=>boolean):Promise<Uint8Array>{
 if(!/^[\dA-F]{8}$/i.test(id)||!Number.isInteger(track)||track<0||track>=256)throw Error('Invalid audio selection.');
 let bytes:Uint8Array|undefined,offset=0;
 do{
  if(!current())throw Error('Audio selection changed.');
  const r=await request('console.command-center.inspectRecord',{formId:id,operation:'read-slate-audio',track,offset,count:32768}) as {ok?:boolean;formId?:string;track?:number;offset?:number;totalBytes?:number;data?:string};
  if(!r?.ok||r.formId?.toUpperCase()!==id.toUpperCase()||r.track!==track||r.offset!==offset||!Number.isInteger(r.totalBytes)||r.totalBytes!<12||r.totalBytes!>8*1024*1024||typeof r.data!=='string'||r.data.length>43692||!/^[A-Za-z0-9+/]*={0,2}$/.test(r.data))throw Error('Invalid slate audio reply.');
  if(!bytes)bytes=new Uint8Array(r.totalBytes!);else if(bytes.length!==r.totalBytes)throw Error('Audio length changed during transfer.');
  const chunk=Uint8Array.from(atob(r.data),c=>c.charCodeAt(0));if(chunk.length!==Math.min(32768,bytes.length-offset))throw Error('Incomplete audio range.');bytes.set(chunk,offset);offset+=chunk.length;
  if(offset<bytes.length)await new Promise(resolve=>setTimeout(resolve,20));
 }while(offset<bytes.length);
 if(!current())throw Error('Audio selection changed.');return bytes;
}
export async function playableSlateAudio(bytes:Uint8Array):Promise<Blob>{
 if(bytes.length<32||bytes.length>8*1024*1024)throw Error('Invalid voice file size.');
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),text=(at:number)=>String.fromCharCode(...bytes.subarray(at,at+4));
 if(text(0)!=='RIFF'||text(8)!=='WAVE'||v.getUint32(4,true)+8>bytes.length)throw Error('Unsupported voice file.');
 let fmt=-1,fmtSize=0;
 for(let at=12;at+8<=bytes.length;){const n=v.getUint32(at+4,true);if(n>bytes.length-at-8)throw Error('Truncated voice file.');if(text(at)==='fmt '){fmt=at+8;fmtSize=n;}at+=8+n+(n&1);}
 if(fmt<0||fmtSize<28)throw Error('Missing voice format.');const channels=v.getUint16(fmt+2,true),rate=v.getUint32(fmt+4,true),samples=v.getUint32(fmt+24,true);
 if(channels<1||channels>2||rate<8000||rate>96000||!samples||samples>rate*300||samples*channels*4>96*1024*1024)throw Error('This voice line exceeds the audio player limit.');
 (globalThis as unknown as {Buffer:typeof BrowserBuffer}).Buffer??=BrowserBuffer;
 const converter=await import('ww2ogg-ts');let lastError:unknown;
 for(const variant of ['aoTuV_603','standard'] as const)try{const {ogg}=converter.convertWwiseRiffToOgg(bytes,{codebooks:converter.getPackedCodebooks(variant)});if(ogg.byteLength>12*1024*1024)throw Error('Converted recording is too large.');return new Blob([new Uint8Array(ogg)],{type:'audio/ogg'});}catch(error){lastError=error;}
 throw Error('This voice encoding could not be played: '+(lastError instanceof Error?lastError.message:'unsupported encoding'));
}
export function installSlateAudioPlayer(host:HTMLElement,request:SlateRequest,id:string,tracks:SlateTrack[]):()=>void{
 const audio=document.createElement('audio');audio.preload='metadata';audio.hidden=true;audio.controls=false;audio.setAttribute('controlslist','nodownload');
 const button=(label:string,icon:string)=>{const b=document.createElement('button');b.type='button';b.className='slate-audio-icon';b.setAttribute('aria-label',label);b.title=label;b.innerHTML=icon;return b;};
 const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>';
 const pauseIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z" fill="currentColor"/></svg>';
 const volumeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M16 8q5 4 0 8m3-11q8 7 0 14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
 const mutedIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="m16 9 6 6m0-6-6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
 const play=button('Play',playIcon),mute=button('Mute',volumeIcon);play.dataset.slatePlay='';play.dataset.controllerInitial='';mute.setAttribute('aria-pressed','false');
 const time=document.createElement('output');time.className='slate-audio-time';time.setAttribute('aria-label','Current line playback time');
 const seek=document.createElement('input');seek.type='range';seek.min='0';seek.max='1';seek.step='.01';seek.value='0';seek.disabled=true;seek.className='slate-audio-seek';seek.setAttribute('aria-label','Seek in current line');
 const volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='1';volume.step='.05';volume.value='1';volume.className='slate-audio-volume';volume.setAttribute('aria-label','Volume');
 const speed=document.createElement('select');speed.className='slate-audio-speed';speed.setAttribute('aria-label','Playback speed');for(const rate of [.5,.75,1,1.25,1.5,2]){const option=document.createElement('option');option.value=String(rate);option.textContent=rate+'×';option.selected=rate===1;speed.append(option);}
 const controls=document.createElement('div');controls.className='slate-audio-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Recording controls');controls.append(play,time,seek,mute,volume,speed);
 const status=document.createElement('p');status.className='slate-audio-status';status.setAttribute('role','status');
 const transcript=document.createElement('div');transcript.className='slate-audio-transcript';transcript.setAttribute('role','region');transcript.setAttribute('aria-label','Recording transcript. Select a line to play it.');transcript.tabIndex=0;
 const lines=document.createElement('div');lines.className='slate-audio-lines';const rows=tracks.map((track,index)=>{const row=document.createElement('button');row.type='button';row.className='slate-audio-line';row.textContent=track.text||'Recorded dialogue';row.dataset.line=String(index);row.setAttribute('aria-label',`Line ${index+1}: ${track.text||'Recorded dialogue'}`);lines.append(row);return row;});transcript.append(lines);host.append(audio,controls,status,transcript);
 let sequence=0,disposed=false,url:string|undefined,index=0,loadedIndex=-1,loading=false,wantsPlay=false,scrollFrame=0;
 const clock=(seconds:number)=>{const n=Number.isFinite(seconds)?Math.max(0,Math.floor(seconds)):0;return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
 const updateTime=()=>{const duration=Number.isFinite(audio.duration)?audio.duration:0;time.value=`${clock(audio.currentTime)} / ${duration?clock(duration):'—:——'}`;seek.disabled=!duration;seek.max=String(duration||1);seek.value=String(audio.currentTime||0);seek.style.setProperty('--slate-progress',`${duration?Math.min(100,Math.max(0,audio.currentTime/duration*100)):0}%`);seek.setAttribute('aria-valuetext',`${clock(audio.currentTime)} of ${clock(duration)}`);};
 const updatePlay=()=>{const playing=loading?wantsPlay:!audio.paused;play.innerHTML=playing?pauseIcon:playIcon;const label=playing?'Pause':'Play';play.setAttribute('aria-label',label);play.title=label;play.setAttribute('aria-busy',String(loading));};
 const follow=(smooth:boolean)=>{rows.forEach((row,i)=>{const distance=i-index;row.dataset.distance=String(Math.max(-3,Math.min(3,distance)));if(i===index)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');});cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{if(disposed||!host.isConnected)return;const row=rows[index];transcript.scrollTo({top:Math.max(0,row.offsetTop-transcript.clientHeight*.26),behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});});};
 const stop=()=>{audio.pause();audio.removeAttribute('src');audio.load();if(url)URL.revokeObjectURL(url);url=undefined;loadedIndex=-1;updateTime();};
 const load=async(next:number,autoPlay:boolean)=>{const currentSequence=++sequence,current=()=>!disposed&&host.isConnected&&sequence===currentSequence;index=next;wantsPlay=autoPlay;loading=true;stop();updatePlay();follow(true);status.textContent=`Loading line ${index+1} of ${tracks.length}…`;
  try{const bytes=await fetchSlateAudio(request,id,tracks[index].index,current);const blob=await playableSlateAudio(bytes);if(!current())return;url=URL.createObjectURL(blob);audio.src=url;loadedIndex=index;audio.defaultPlaybackRate=Number(speed.value);audio.playbackRate=Number(speed.value);status.textContent=`Line ${index+1} of ${tracks.length}`;
   if(wantsPlay)try{await audio.play();}catch{if(current()){wantsPlay=false;status.textContent+=' — press Play to listen.';}}
  }catch(error){if(current()){wantsPlay=false;status.textContent=error instanceof Error?error.message:'The recording could not be loaded.';}}
  finally{if(current()){loading=false;updatePlay();}}
 };
 play.addEventListener('click',()=>{if(loading){wantsPlay=!wantsPlay;updatePlay();return;}if(!audio.paused){wantsPlay=false;audio.pause();}else if(loadedIndex!==index){void load(index,true);}else {wantsPlay=true;if(audio.ended)audio.currentTime=0;void audio.play().catch(()=>{if(!disposed){wantsPlay=false;status.textContent='Press Play to listen.';updatePlay();}});}});
 rows.forEach((row,i)=>row.addEventListener('click',()=>void load(i,true)));
 seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,Math.max(0,Number(seek.value)));updateTime();});
 const updateVolume=()=>{const silent=audio.muted||audio.volume===0;mute.innerHTML=silent?mutedIcon:volumeIcon;mute.setAttribute('aria-pressed',String(silent));mute.setAttribute('aria-label',silent?'Unmute':'Mute');mute.title=silent?'Unmute':'Mute';volume.value=String(audio.volume);volume.style.setProperty('--slate-progress',`${audio.volume*100}%`);};
 mute.addEventListener('click',()=>{if(audio.volume===0){audio.volume=1;audio.muted=false;}else audio.muted=!audio.muted;updateVolume();});volume.addEventListener('input',()=>{audio.volume=Number(volume.value);audio.muted=false;updateVolume();});
 speed.addEventListener('change',()=>{audio.defaultPlaybackRate=Number(speed.value);audio.playbackRate=Number(speed.value);});
 audio.addEventListener('loadedmetadata',updateTime);audio.addEventListener('durationchange',updateTime);audio.addEventListener('timeupdate',updateTime);audio.addEventListener('play',updatePlay);audio.addEventListener('pause',updatePlay);audio.addEventListener('volumechange',updateVolume);
 audio.addEventListener('ended',()=>{if(index+1<tracks.length&&wantsPlay)void load(index+1,true);else {wantsPlay=false;updatePlay();status.textContent=`Recording finished · ${tracks.length} ${tracks.length===1?'line':'lines'}`;}});
 audio.addEventListener('error',()=>{if(!disposed&&url){wantsPlay=false;status.textContent='The audio decoder could not play this recording.';updatePlay();}});
 const visibility=()=>{if(document.hidden){++sequence;loading=false;wantsPlay=false;audio.pause();updatePlay();status.textContent='Recording paused.';}};document.addEventListener('visibilitychange',visibility);
 status.textContent=`Line 1 of ${tracks.length}`;updateTime();updatePlay();updateVolume();follow(false);
 return ()=>{disposed=true;++sequence;cancelAnimationFrame(scrollFrame);document.removeEventListener('visibilitychange',visibility);stop();host.replaceChildren();};
}
