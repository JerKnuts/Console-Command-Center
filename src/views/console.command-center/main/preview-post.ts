// Shared bloom and subtle grain. The scene remains usable if an offscreen target cannot be allocated.
export function createPreviewPost(gl:WebGL2RenderingContext){
 const programs:WebGLProgram[]=[],shaders:WebGLShader[]=[];let scene:WebGLFramebuffer|null=null,depth:WebGLTexture|null=null,color:WebGLTexture|null=null,bloomA:WebGLTexture|null=null,bloomB:WebGLTexture|null=null,fbA:WebGLFramebuffer|null=null,fbB:WebGLFramebuffer|null=null;let width=0,height=0,bw=0,bh=0;let disposed=false;
 const vao=gl.createVertexArray();if(!vao)throw new Error('Could not allocate Model Viewer postprocessing.');
 const shader=(type:number,text:string)=>{const s=gl.createShader(type);if(!s)throw new Error('Could not create Model Viewer shader.');shaders.push(s);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Could not compile Model Viewer shader.');return s;};
 let vertex:WebGLShader;const vertexSource=`#version 300 es
 precision highp float;out vec2 v_uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));v_uv=p;gl_Position=vec4(p*2.0-1.0,0.0,1.0);}`;
 const program=(text:string)=>{const p=gl.createProgram();if(!p)throw new Error('Could not allocate Model Viewer program.');programs.push(p);gl.attachShader(p,vertex);gl.attachShader(p,shader(gl.FRAGMENT_SHADER,'#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 color;\n'+text));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('Could not link Model Viewer shader.');return p;};
 const releaseTargets=()=>{for(const f of [scene,fbA,fbB])gl.deleteFramebuffer(f);for(const t of [depth,color,bloomA,bloomB])gl.deleteTexture(t);scene=fbA=fbB=null;depth=color=bloomA=bloomB=null;width=height=0;};
 const dispose=()=>{if(disposed)return;disposed=true;releaseTargets();for(const p of programs)gl.deleteProgram(p);for(const s of shaders)gl.deleteShader(s);gl.deleteVertexArray(vao);};
 try{
 vertex=shader(gl.VERTEX_SHADER,vertexSource);
 const blur=program(`uniform sampler2D u_source;uniform vec2 u_step;uniform bool u_extract;
 vec4 tap(vec2 uv){vec4 c=texture(u_source,uv);if(u_extract){float brightness=max(c.r,max(c.g,c.b));float knee=smoothstep(.62,.95,brightness);return vec4(c.rgb*knee,1.0);}return c;}
 void main(){color=tap(v_uv)*.227027;color+=(tap(v_uv+u_step*1.384615)+tap(v_uv-u_step*1.384615))*.316216;color+=(tap(v_uv+u_step*3.230769)+tap(v_uv-u_step*3.230769))*.070270;}`);
 const composite=program(`uniform sampler2D u_color;uniform sampler2D u_bloom;uniform float u_ratio;uniform bool u_effects;
 float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec4 base=texture(u_color,v_uv);if(!u_effects){color=base;return;}
  vec3 glow=texture(u_bloom,v_uv).rgb*.16;float alpha=max(base.a,min(max(glow.r,max(glow.g,glow.b)),.22));
  float grain=(hash(floor(gl_FragCoord.xy/max(u_ratio,1.0)))-.5)*.009*base.a;
  color=vec4(clamp(base.rgb+glow+grain,0.0,1.0),alpha);
 }`);
 const texture=(w:number,h:number,isDepth=false)=>{const t=gl.createTexture();if(!t)throw new Error('Model Viewer texture allocation failed.');gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,isDepth?gl.DEPTH_COMPONENT24:gl.RGBA8,w,h,0,isDepth?gl.DEPTH_COMPONENT:gl.RGBA,isDepth?gl.UNSIGNED_INT:gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,isDepth?gl.NEAREST:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,isDepth?gl.NEAREST:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;};
 const framebuffer=(t:WebGLTexture,d:WebGLTexture|null=null)=>{const f=gl.createFramebuffer();if(!f)throw new Error('Model Viewer framebuffer allocation failed.');gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);if(d)gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,d,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){gl.deleteFramebuffer(f);throw new Error('Model Viewer framebuffer is incomplete.');}return f;};
 const begin=(w:number,h:number)=>{if(disposed)return false;try{if(w!==width||h!==height){releaseTargets();width=w;height=h;bw=Math.max(1,Math.ceil(w/4));bh=Math.max(1,Math.ceil(h/4));color=texture(w,h);depth=texture(w,h,true);scene=framebuffer(color,depth);bloomA=texture(bw,bh);fbA=framebuffer(bloomA);bloomB=texture(bw,bh);fbB=framebuffer(bloomB);}gl.bindFramebuffer(gl.FRAMEBUFFER,scene);return true;}catch{releaseTargets();gl.bindFramebuffer(gl.FRAMEBUFFER,null);return false;}};
 const bind=(p:WebGLProgram,name:string,t:WebGLTexture|null,unit:number)=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.uniform1i(gl.getUniformLocation(p,name),unit);};
 const present=(ratio:number,effects=true)=>{if(!scene||disposed)return;gl.bindVertexArray(vao);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.disable(gl.POLYGON_OFFSET_FILL);
  gl.useProgram(blur);gl.viewport(0,0,bw,bh);gl.bindFramebuffer(gl.FRAMEBUFFER,fbA);bind(blur,'u_source',color,0);gl.uniform2f(gl.getUniformLocation(blur,'u_step'),1/width,0);gl.uniform1i(gl.getUniformLocation(blur,'u_extract'),1);gl.drawArrays(gl.TRIANGLES,0,3);
  gl.uniform1i(gl.getUniformLocation(blur,'u_extract'),0);gl.bindFramebuffer(gl.FRAMEBUFFER,fbB);bind(blur,'u_source',bloomA,0);gl.uniform2f(gl.getUniformLocation(blur,'u_step'),0,1/bh);gl.drawArrays(gl.TRIANGLES,0,3);
  gl.bindFramebuffer(gl.FRAMEBUFFER,fbA);bind(blur,'u_source',bloomB,0);gl.uniform2f(gl.getUniformLocation(blur,'u_step'),1/bw,0);gl.drawArrays(gl.TRIANGLES,0,3);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.useProgram(composite);bind(composite,'u_color',color,0);bind(composite,'u_bloom',bloomA,2);gl.uniform1f(gl.getUniformLocation(composite,'u_ratio'),ratio);gl.uniform1i(gl.getUniformLocation(composite,'u_effects'),effects?1:0);gl.drawArrays(gl.TRIANGLES,0,3);gl.bindVertexArray(null);gl.depthMask(true);gl.activeTexture(gl.TEXTURE0);
 };
 return {begin,present,dispose};
 }catch(error){dispose();throw error;}
}
