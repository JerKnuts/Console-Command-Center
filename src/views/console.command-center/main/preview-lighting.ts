// The decoded model fits a unit sphere. Keep the light's orthographic shadow
// volume stable while the camera rotates, pans or zooms.
export function previewShadowMatrix(light: readonly number[],extent=1.12): Float32Array {
  const distance=Math.hypot(...light);
  if(light.length!==3||!light.every(Number.isFinite)||distance<.01||!Number.isFinite(extent)||extent<1.12||extent>16)throw new Error('Invalid preview light.');
  const z=light.map(v=>v/distance),reference=Math.abs(z[1])>.98?[0,0,1]:[0,1,0];
  const x=[reference[1]*z[2]-reference[2]*z[1],reference[2]*z[0]-reference[0]*z[2],reference[0]*z[1]-reference[1]*z[0]];
  const length=Math.hypot(...x);for(let i=0;i<3;++i)x[i]/=length;
  const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  const near=distance-extent-.13,far=distance+extent+.13,range=far-near;
  return new Float32Array([
    x[0]/extent,y[0]/extent,-2*z[0]/range,0,
    x[1]/extent,y[1]/extent,-2*z[1]/range,0,
    x[2]/extent,y[2]/extent,-2*z[2]/range,0,
    0,0,(2*distance-far-near)/range,1,
  ]);
}

export function createPreviewShadow(gl:WebGL2RenderingContext,size:number){
  const target=gl.createFramebuffer(),texture=gl.createTexture();
  const dispose=()=>{gl.deleteFramebuffer(target);gl.deleteTexture(texture);};
  if(!target||!texture){dispose();return null;}
  const previous=gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer|null;
  try{
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,size,size,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,texture,0);
    gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){dispose();return null;}
    return {texture,size,begin:()=>{gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.viewport(0,0,size,size);gl.depthMask(true);gl.clearDepth(1);gl.clear(gl.DEPTH_BUFFER_BIT);},dispose};
  }catch{dispose();return null;}
  finally{gl.bindFramebuffer(gl.FRAMEBUFFER,previous);}
}

export function previewShadowSize(quality:'low'|'medium'|'high'|'ultra',maximum=4096):number{
 const requested=quality==='low'?1024:quality==='medium'?1536:quality==='high'?2048:4096;
 return Math.max(1,Math.min(requested,Number.isFinite(maximum)?Math.floor(maximum):4096));
}
