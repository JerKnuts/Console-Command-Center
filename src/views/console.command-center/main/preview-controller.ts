import type { OSFUIGamepadButtonEvent, OSFUIGamepadStickEvent } from '../../../osfui';

export type PreviewTriggerEvent={kind:"triggers";axes:{lt:number;rt:number}};
export type PreviewGamepadEvent = OSFUIGamepadButtonEvent | OSFUIGamepadStickEvent | PreviewTriggerEvent;
export type PreviewControlMode = 'object' | 'light' | 'brightness';
export function createPreviewController(actions: {
  mannequin():void; body():void; textures():void; close():void;
  background?(delta:number):void;
  quality(open:boolean, delta?:number, apply?:boolean):void;
  mode(mode:PreviewControlMode):void; lightingAvailable():boolean;
  pan(x:number,y:number):void; rotate(x:number,y:number):void;
  zoom(factor:number):void; light(x:number,y:number):void; brightness(delta:number):void;
}) {
  let mode:PreviewControlMode='object',qualityOpen=false;
  let axes={lx:0,ly:0,rx:0,ry:0},qualityDirection=0;
  let lt=0,rt=0,triggerAge=0;
  const trigger=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,(n-.12)/.88)):0;
  const held=new Set<number>();
  const axis=(n:number)=>Number.isFinite(n)?Math.abs(n)<=.18?0:Math.sign(n)*(Math.min(1,Math.abs(n))-.18)/.82:0;
  const setMode=(next:PreviewControlMode)=>{mode=next;actions.mode(mode);};
  const reset=()=>{held.clear();axes={lx:0,ly:0,rx:0,ry:0};qualityDirection=0;lt=rt=0;triggerAge=0;};
  return {
    reset,
    handle(event:PreviewGamepadEvent) {
      if(event.kind==='triggers'){lt=trigger(event.axes.lt);rt=trigger(event.axes.rt);triggerAge=0;return;}
      if(event.kind==='stick') {
        axes={lx:axis(event.axes.lx),ly:axis(event.axes.ly),rx:axis(event.axes.rx),ry:axis(event.axes.ry)};
        const direction=Math.abs(axes.ly)>.5?(axes.ly>0?-1:1):Math.abs(axes.lx)>.5?(axes.lx>0?1:-1):0;
        if(qualityOpen&&direction&&direction!==qualityDirection)actions.quality(true,direction);
        qualityDirection=direction;return;
      }
      const {id,down}=event.button;
      if(!down){held.delete(id);return;}if(held.has(id))return;held.add(id);
      if(id===0x8000){qualityOpen=!qualityOpen;actions.quality(qualityOpen);return;}
      if(id===0x2000){if(qualityOpen){qualityOpen=false;actions.quality(false);}else actions.close();return;}
      if(qualityOpen){
        if(id===0x1000){qualityOpen=false;actions.quality(false,0,true);}
        else if(id===1||id===4)actions.quality(true,-1);
        else if(id===2||id===8)actions.quality(true,1);
        return;
      }
      if(id===4||id===8)actions.background?.(id===4?-1:1);
      else if(id===0x0100)actions.mannequin();
      else if(id===0x0200)actions.body();
      else if(id===0x4000)actions.textures();
      else if(id===0x0080&&actions.lightingAvailable())setMode(mode==='light'?'object':'light');
      else if(id===0x0040&&actions.lightingAvailable())setMode(mode==='brightness'?'object':'brightness');
    },
    step(seconds:number) {
      triggerAge+=Math.max(0,Number.isFinite(seconds)?seconds:0);if(triggerAge>.35)lt=rt=0;
      if(qualityOpen)return;
      if(mode!=='object'&&!actions.lightingAvailable())setMode('object');
      const dt=Math.max(0,Math.min(.05,Number.isFinite(seconds)?seconds:0));
      if(axes.lx||axes.ly){
        if(mode==='light')actions.light(axes.lx*130*dt,-axes.ly*130*dt);
        else if(mode==='brightness')actions.brightness(axes.ly*1.2*dt);
        else actions.pan(axes.lx*400*dt,-axes.ly*400*dt);
      }
      if(axes.rx||axes.ry)actions.rotate(axes.rx*1.8*dt,-axes.ry*1.8*dt);
      // SFSE's game-defined trigger IDs, distinct from XInput button masks.
      const zoom=Math.max(rt,Number(held.has(0xA)))-Math.max(lt,Number(held.has(0x9)));
      if(zoom)actions.zoom(Math.exp(zoom*1.3*dt));
    },
  };
}
