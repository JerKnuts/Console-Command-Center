import { createPreviewPost } from './preview-post.ts';
import { createPreviewShadow, previewShadowMatrix,previewShadowSize } from './preview-lighting.ts';
export type PreviewCamera={yaw:number;pitch:number;zoom:number;panX:number;panY:number;lightYaw:number;lightPitch:number;lightPower:number};
export type PreviewMesh = { positions: Float32Array; indices: Uint32Array; uv?: Float32Array; texture?: { width: number; height: number; pixels: Uint8Array }; normalTexture?: {width:number;height:number;pixels:Uint8Array}; metalTexture?: {width:number;height:number;pixels:Uint8Array}; glass?:boolean; decal?:boolean; mannequin?: boolean; incompleteMaterial?:boolean;normalOnly?:boolean; effect?:'caustic'|'liquid'; tint?: [number,number,number] };
export function decodePreview(buffer: ArrayBuffer, quality: 'low'|'medium'|'high'|'ultra' = 'high'): PreviewMesh[] {
  if (buffer.byteLength > (quality==='ultra'?256:64) * 1024 * 1024 || buffer.byteLength < 12) throw new Error('Invalid model transfer size.');
  const view = new DataView(buffer); let at = 0;
  const uint = () => { if (at + 4 > buffer.byteLength) throw new Error('Incomplete model transfer.'); const v = view.getUint32(at, true); at += 4; return v; };
  if (uint() !== 0x50504343) throw new Error('Unsupported model transfer format.');
  const version = uint(); if (![1,2,3,4,5,6,7,8,9,10,11].includes(version)) throw new Error('Unsupported model transfer format.');
  const count = uint(); if (!count || count > 512) throw new Error('Invalid number of model pieces.');
  const meshes: PreviewMesh[] = []; const textureIds: number[] = [],normalIds:number[]=[],metalIds:number[]=[]; let vertices = 0, indices = 0;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let part = 0; part < count; part++) {
    const nv = uint(), ni = uint(); vertices += nv; indices += ni;
    if (!nv || !ni || ni % 3 || vertices > 400000 || indices > 1800000 || at + nv * 12 + ni * 4 > buffer.byteLength) throw new Error('Model geometry exceeds the preview limits.');
    const positions = new Float32Array(nv * 3);
    for (let i = 0; i < positions.length; i++) {
      const v = view.getFloat32(at, true); at += 4;
      if (!Number.isFinite(v) || Math.abs(v) > 1e8) throw new Error('Invalid model coordinates.');
      positions[i] = v; min[i % 3] = Math.min(min[i % 3], v); max[i % 3] = Math.max(max[i % 3], v);
    }
    const triangles = new Uint32Array(ni);
    for (let i = 0; i < ni; i++) { triangles[i] = uint(); if (triangles[i] >= nv) throw new Error('Invalid model triangle.'); }
    const mesh: PreviewMesh = { positions, indices: triangles };
    if (version >= 2) {
      const flags = uint();const textureId = version >= 3 ? uint() : 0;
      const width = version === 2 ? uint() : 0, height = version === 2 ? uint() : 0;
      textureIds.push(textureId);
      if(version>=4){if(at+12>buffer.byteLength)throw new Error('Incomplete material color.');const tint: [number,number,number]=[view.getFloat32(at,true),view.getFloat32(at+4,true),view.getFloat32(at+8,true)];at+=12;if(tint.some(c=>!Number.isFinite(c)||c<0||c>1))throw new Error('Invalid material color.');if(flags&2)mesh.tint=tint;}
      normalIds.push(version>=5?uint():0);metalIds.push(version>=9?uint():0);mesh.glass=Boolean(flags&4);mesh.decal=Boolean(flags&8);
      if (flags > (version>=11?255:version>=10?127:version>=8?63:version>=7?31:version>=6?15:version>=5?7:version===4?3:1) || width > 4096 || height > 4096 || Boolean(width) !== Boolean(height) || at + nv * 8 + width * height * 4 > buffer.byteLength) throw new Error('Invalid preview texture.');
      mesh.incompleteMaterial=Boolean(flags&16);mesh.normalOnly=Boolean(flags&32);if(flags&64)mesh.effect='caustic';if(flags&128){if(flags&64)throw new Error('Invalid animated effect.');mesh.effect='liquid';}mesh.mannequin = Boolean(flags&1); mesh.uv = new Float32Array(nv * 2);
      for (let i = 0; i < mesh.uv.length; ++i) { const value = view.getFloat32(at, true); at += 4; if (!Number.isFinite(value) || Math.abs(value) > 10000) throw new Error('Invalid texture coordinates.'); mesh.uv[i] = value; }
      if (width) { mesh.texture = { width, height, pixels: new Uint8Array(buffer,at,width*height*4) }; at += width * height * 4; }
    }
    meshes.push(mesh);
  }
  if(version >= 3){
    const count=uint();if(count>(version>=9?1536:1024))throw new Error('Invalid preview texture count.');
    const textures: NonNullable<PreviewMesh['texture']>[]=[];
    for(let i=0;i<count;++i){const width=uint(),height=uint();if(!width||!height||width>4096||height>4096||at+width*height*4>buffer.byteLength)throw new Error('Invalid preview texture.');textures.push({width,height,pixels:new Uint8Array(buffer,at,width*height*4)});at+=width*height*4;}
    meshes.forEach((mesh,i)=>{const id=textureIds[i];if(id>textures.length)throw new Error('Invalid preview texture reference.');if(id)mesh.texture=textures[id-1];const normal=normalIds[i];if(normal>textures.length)throw new Error('Invalid normal texture reference.');if(normal)mesh.normalTexture=textures[normal-1];const metal=metalIds[i];if(metal>textures.length)throw new Error('Invalid metal texture reference.');if(metal)mesh.metalTexture=textures[metal-1];});
  }
  if(meshes.some(mesh=>mesh.effect&&(!mesh.texture||mesh.normalOnly||mesh.mannequin)))throw new Error('Invalid animated effect.');
  if(meshes.some(mesh=>mesh.normalOnly&&(!mesh.decal||!mesh.texture||!mesh.normalTexture)))throw new Error('Invalid normal-only decal.');
  if (at !== buffer.byteLength) throw new Error('Unexpected bytes after model data.');
  const center = min.map((v, i) => (v + max[i]) / 2);
  const radius = Math.hypot(...max.map((v, i) => (v - min[i]) / 2));
  if (!Number.isFinite(radius) || radius < 1e-8) throw new Error('The model has no visible extent.');
  for (const mesh of meshes) for (let i = 0; i < mesh.positions.length; i += 3) {
    const x = (mesh.positions[i] - center[0]) / radius, y = (mesh.positions[i + 1] - center[1]) / radius, z = (mesh.positions[i + 2] - center[2]) / radius;
    mesh.positions[i] = x; mesh.positions[i + 1] = z; mesh.positions[i + 2] = -y;
  }
  return meshes;
}
export function orbitState(yaw: number, pitch: number, zoom: number): { yaw: number; pitch: number; zoom: number } {
  return { yaw: Number.isFinite(yaw) ? yaw % (2 * Math.PI) : 0, pitch: Math.max(-1.5, Math.min(1.5, Number.isFinite(pitch) ? pitch : 0)), zoom: Math.max(.35, Math.min(20, Number.isFinite(zoom) ? zoom : 1)) };
}
export function previewAlphaMode(pixels: Uint8Array): 'opaque'|'cutout'|'blend' {
  const count=pixels.length/4;let fractional=0,clear=false;
  for(let i=3;i<pixels.length;i+=4){const alpha=pixels[i];if(alpha<250)clear=true;if(alpha>5&&alpha<250)++fractional;}
  // Compressed mask edges have intermediate alpha values, but must retain
  // solid depth and two-sided geometry instead of entering the glass pass.
  return fractional>count*.125?'blend':clear?'cutout':'opaque';
}
export function previewCanvasSize(width:number,height:number,ratio:number,limit:number,pixelBudget=Infinity) {
  width=Number.isFinite(width)?Math.max(1,width):1;height=Number.isFinite(height)?Math.max(1,height):1;
  ratio=Number.isFinite(ratio)?Math.max(1,ratio):1;limit=Number.isFinite(limit)?Math.max(1,limit):1024;
  pixelBudget=Number.isFinite(pixelBudget)?Math.max(1,pixelBudget):Infinity;
  const scale=Math.min(ratio,limit/width,limit/height,Math.sqrt(pixelBudget/(width*height)));
  return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
export function smoothNormals(mesh: PreviewMesh): Float32Array {
  const p=mesh.positions,n=new Float32Array(p.length);
  for(let i=0;i<mesh.indices.length;i+=3){const a=mesh.indices[i]*3,b=mesh.indices[i+1]*3,c=mesh.indices[i+2]*3;const ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2];const x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;for(const at of [a,b,c]){n[at]+=x;n[at+1]+=y;n[at+2]+=z;}}
  if(mesh.mannequin){const key=(i:number)=>`${Math.round(p[i]*1e5)},${Math.round(p[i+1]*1e5)},${Math.round(p[i+2]*1e5)}`;const joined=new Map<string,number[]>();for(let i=0;i<n.length;i+=3){const k=key(i),sum=joined.get(k)??[0,0,0];for(let j=0;j<3;++j)sum[j]+=n[i+j];joined.set(k,sum);}for(let i=0;i<n.length;i+=3){const sum=joined.get(key(i))!;for(let j=0;j<3;++j)n[i+j]=sum[j];}}
  for(let i=0;i<n.length;i+=3){const length=Math.hypot(n[i],n[i+1],n[i+2]);if(length>1e-10){n[i]/=length;n[i+1]/=length;n[i+2]/=length;}else n[i+2]=1;}return n;
}
export function createPreviewRenderer(canvas: HTMLCanvasElement, meshes: PreviewMesh[], quality: 'low'|'medium'|'high'|'ultra' = 'high', initialYawOffset = 0) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, preserveDrawingBuffer: true });
  if (!gl) throw new Error('This OSF UI installation does not provide WebGL 2. Model previews are unavailable.');
  const buffers: WebGLBuffer[] = [], shaders: WebGLShader[] = [], textures: WebGLTexture[] = []; let program: WebGLProgram | null = null;
  let observer: ResizeObserver | undefined; let disposed = false;let animationFrame=0;let visibilityObserver:IntersectionObserver|undefined;let animationVisible=true;let lastAnimation=0;let syncAnimation=()=>{};let post:ReturnType<typeof createPreviewPost>|undefined,postFailed=false;
  let shadow:ReturnType<typeof createPreviewShadow>=null,shadowSize=0;let groundShadow:ReturnType<typeof createPreviewShadow>=null;
  const onVisibility=()=>syncAnimation();
  const cleanup = () => { if (disposed) return; disposed = true;cancelAnimationFrame(animationFrame);document.removeEventListener('visibilitychange',onVisibility);visibilityObserver?.disconnect(); observer?.disconnect();shadow?.dispose();groundShadow?.dispose();post?.dispose(); for (const b of buffers) gl.deleteBuffer(b); for (const s of shaders) gl.deleteShader(s); for (const t of textures) gl.deleteTexture(t); if (program) gl.deleteProgram(program); };
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type); if (!shader) throw new Error('Could not create preview shader.'); shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('The model preview shader could not be compiled.'); return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, `#version 300 es
      in vec3 a_position;
      in vec2 a_uv;
      in vec3 a_normal;
      uniform mat3 u_rotation;
      uniform float u_aspect;
      uniform float u_zoom;
      uniform vec2 u_pan;
      uniform vec3 u_offset;
      uniform bool u_shadow_pass;
      uniform mat4 u_shadow_matrix;
      out vec4 v_shadow;
      out vec3 v_position;
      out vec3 v_model_position;
      out vec2 v_uv;
      out vec3 v_normal;
      void main() {
        vec3 p=u_rotation*a_position+u_offset; v_position=p; v_model_position=a_position; v_uv=a_uv; v_normal=u_rotation*a_normal;
        v_shadow=u_shadow_matrix*vec4(p,1.0);
        float depth=3.4-p.z;
        gl_Position=vec4((p.x+u_pan.x*depth/3.4)*u_zoom/(u_aspect*0.57735),(p.y+u_pan.y*depth/3.4)*u_zoom/0.57735,1.002002*depth-0.2002002,depth);
        if(u_shadow_pass)gl_Position=v_shadow;
      }`);
    const fragment = compile(gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float;
      in vec3 v_position;
      in vec3 v_model_position;
      in vec2 v_uv;
      in vec3 v_normal;
      in vec4 v_shadow;
      uniform bool u_shadow_pass;
      uniform bool u_ground;
      uniform vec2 u_ground_footprint;
      uniform bool u_shadows;
      uniform sampler2D u_shadow_map;
      uniform float u_shadow_step;
      uniform vec3 u_color;
      uniform bool u_light_marker;
      uniform bool u_missing_texture;
      uniform sampler2D u_texture;
      uniform sampler2D u_scene_color;
      uniform vec2 u_scene_size;
      uniform bool u_normal_only;
      uniform int u_effect;
      uniform float u_time;
      uniform bool u_textured;
      uniform bool u_show_textures;
      uniform bool u_cutout;
      uniform bool u_ultra;
      uniform bool u_cinematic;
      uniform bool u_detail;
      uniform bool u_glass;
      uniform bool u_has_normal;
      uniform sampler2D u_normal_texture;
      uniform sampler2D u_metal_texture;
      uniform bool u_has_metal;
      uniform vec3 u_light;
      uniform float u_light_strength;
      out vec4 color;
      float shadowVisibility(vec3 normal,vec3 key){
        if(!u_shadows)return 1.0;
        vec3 p=v_shadow.xyz/v_shadow.w*.5+.5;
        if(any(lessThan(p,vec3(0.0)))||any(greaterThan(p,vec3(1.0))))return 1.0;
        // Compare against the receiver plane at each actual texel centre.
        // A constant bias produces striped self-shadows on sloping surfaces.
        vec3 dx=dFdx(p),dy=dFdy(p);
        float determinant=dx.x*dy.y-dx.y*dy.x;
        vec2 gradient=abs(determinant)>.000000000001?vec2(dy.y*dx.z-dx.y*dy.z,dx.x*dy.z-dy.x*dx.z)/determinant:vec2(0.0);
        gradient=clamp(gradient,vec2(-8.0),vec2(8.0));
        float bias=.0004;
        float visibility=0.0,totalWeight=0.0;
        vec2 texel=p.xy/u_shadow_step-.5,base=floor(texel),fraction=fract(texel);
        // Continuously weighted tent PCF avoids a hard jump when a shadow
        // crosses a texel boundary. Receiver correction remains per sample.
        for(int y=-2;y<=2;y++)for(int x=-2;x<=2;x++){
          vec2 weights=max(vec2(0.0),vec2(2.0)-abs(vec2(float(x),float(y))-fraction));
          float weight=weights.x*weights.y;if(weight<=0.0)continue;
          vec2 centre=(base+vec2(float(x),float(y))+.5)*u_shadow_step;
          float depth=texture(u_shadow_map,centre).r;
          float receiver=p.z+clamp(dot(gradient,centre-p.xy),-.025,.025);
          visibility+=(receiver-bias<=depth?1.0:0.0)*weight;totalWeight+=weight;
        }
        return visibility/max(totalWeight,.00001);
      }
      vec3 studioReflection(vec3 direction,float roughness,vec3 key){
        // Dark inventory-style studio with broad reflection cards. Blur the
        // cards with roughness rather than adding a gray veil to every surface.
        float blur=roughness*roughness;
        vec3 environment=mix(vec3(.006,.008,.012),vec3(.025,.03,.04),direction.y*.5+.5);
        float card=smoothstep(mix(.96,.55,blur),mix(.994,.9,blur),dot(direction,key));
        float strip=smoothstep(mix(.985,.7,blur),mix(.999,.95,blur),dot(direction,normalize(vec3(.85,.3,.65))));
        float ceiling=smoothstep(mix(.97,.6,blur),mix(.998,.92,blur),dot(direction,normalize(vec3(-.15,.95,.2))));
        return environment+(vec3(1.0,.97,.91)*card*1.65+vec3(.75,.84,1.0)*strip*.55+vec3(1.0)*ceiling*.65)*(1.0-blur*.7);
      }
      void main() {
        if(u_shadow_pass){if(u_textured&&texture(u_texture,v_uv).a<.5)discard;color=vec4(1.0);return;}
        if(u_ground){
          // Only the shadow is visible: the receiver has no floor color or edge.
          vec2 radius=(v_uv-.5)*2.0;
          float fade=1.0-smoothstep(.65,1.0,length(radius));
          float contact=exp(-dot(radius/u_ground_footprint,radius/u_ground_footprint)*3.0)*.13;
          float visibility=shadowVisibility(normalize(v_normal),normalize(u_light));
          float above=smoothstep(0.0,.15,dot(normalize(v_normal),normalize(u_light)));
          float alpha=fade*(contact+(1.0-visibility)*.48*above);
          if(alpha<.001)discard;
          color=vec4(0.0,0.0,0.0,alpha);return;
        }
        if(u_light_marker){color=vec4(1.0,.9,.46,1.0);return;}
        if(u_missing_texture&&u_show_textures){vec3 cell=floor(v_model_position*48.0+vec3(.001));float checker=mod(cell.x+cell.y+cell.z,2.0);color=vec4(mix(vec3(1.0,.025,.055),vec3(.025,.22,1.0),checker),1.0);return;}
        if(u_effect==1){
          if(!u_show_textures||!u_textured)discard;
          // Preview-only idle approximation using the original gobo and opacity.
          // Soft additive light avoids opaque cards and never writes solid depth.
          vec4 a=texture(u_texture,v_uv+vec2(u_time*.025,u_time*.017));
          vec4 b=texture(u_texture,v_uv*1.17+vec2(-u_time*.019,u_time*.013));
          float glow=max(dot(a.rgb,vec3(.2126,.7152,.0722)),dot(b.rgb,vec3(.2126,.7152,.0722))*.65);
          float mask=texture(u_texture,v_uv).a;
          float edge=pow(abs(dot(normalize(v_normal),normalize(vec3(0,0,3.4)-v_position))),.5);
          float energy=glow*mask*edge*.45;
          if(energy<.002)discard;
          color=vec4(u_color*energy,0.0);return;
        }
        if(u_effect==2){
          if(!u_textured){color=vec4(u_color,1.0);return;}
          if(!u_show_textures){color=vec4(.65,.69,.71,1.0);return;}
          // Bounded idle approximation of the inhaler's authored emissive texture.
          vec3 flow=texture(u_texture,v_uv+vec2(u_time*.009,-u_time*.045)).rgb;
          vec3 secondary=texture(u_texture,v_uv+vec2(-u_time*.006,-u_time*.027)).rgb;
          float energy=dot(mix(flow,secondary,.3),vec3(.2126,.7152,.0722));
          color=vec4(u_color*(.4+.6*energy),1.0);return;
        }
        vec3 n=normalize(v_normal);if(!gl_FrontFacing)n=-n;
        if(u_has_normal&&u_show_textures){vec3 q1=dFdx(v_position),q2=dFdy(v_position);vec2 st1=dFdx(v_uv),st2=dFdy(v_uv);float det=st1.x*st2.y-st1.y*st2.x;if(abs(det)>1e-20){vec3 t=normalize((q1*st2.y-q2*st1.y)/det);t=normalize(t-n*dot(n,t));vec3 b=normalize(cross(n,t))*sign(det);vec3 mapped=texture(u_normal_texture,v_uv).xyz*2.0-1.0;mapped.y=-mapped.y;n=normalize(mat3(t,b,n)*mapped);}}
        float lighting=0.28+0.66*max(dot(n,normalize(vec3(-0.5,0.8,1.1))),0.0)+0.12*max(dot(n,normalize(vec3(0.9,-0.1,0.3))),0.0);
        vec4 albedo=u_textured?texture(u_texture,v_uv)*vec4(u_color,1.0):vec4(u_color,1.0);
        if(!u_show_textures)albedo.rgb=vec3(.65,.69,.71);
        if(u_cutout){if(albedo.a<0.5)discard;albedo.a=1.0;}
        else if(albedo.a<0.02)discard;
        if(u_normal_only){
          if(!u_show_textures)discard;
          vec4 base=texture(u_scene_color,gl_FragCoord.xy/u_scene_size);if(base.a<.01)discard;
          vec3 surfaceNormal=normalize(v_normal);if(!gl_FrontFacing)surfaceNormal=-surfaceNormal;
          vec3 key=normalize(u_light-v_position);
          float original=.35+max(dot(surfaceNormal,key),0.0)*u_light_strength;
          float detail=.35+max(dot(n,key),0.0)*u_light_strength;
          color=vec4(base.rgb*clamp(detail/original,.65,1.35),albedo.a);return;
        }
        if(u_ultra){
          vec3 base=pow(max(albedo.rgb,vec3(0.0)),vec3(2.2));
          vec3 key=normalize(u_light-v_position),view=normalize(vec3(0.0,0.0,3.4)-v_position);
          float visibility=shadowVisibility(normalize(v_normal),key);
          vec3 ambient=mix(vec3(.035,.038,.045),vec3(.09,.10,.12),n.y*.5+.5);
          vec3 illumination=ambient+vec3(1.0,0.94,0.84)*max(dot(n,key),0.0)*u_light_strength*visibility;
          illumination+=vec3(.025,.035,.05)*max(dot(n,normalize(vec3(0.8,0.1,-0.5))),0.0);
          float highlight=u_textured?(u_glass?.3:.035)*pow(max(dot(n,normalize(key+view)),0.0),32.0)*u_light_strength:0.0;
          vec3 hdr=base*illumination+vec3(highlight);
          if(u_cinematic){
            float roughness=u_has_normal&&u_show_textures?clamp(texture(u_normal_texture,v_uv).a,.08,1.0):(u_glass?.12:.65);
            float metalness=u_has_metal&&u_show_textures?clamp(texture(u_metal_texture,v_uv).r,0.0,1.0):0.0;
            vec3 f0=mix(vec3(.04),base,metalness);
            float nv=max(dot(n,view),.001),nl=max(dot(n,key),0.0);
            vec3 halfVector=normalize(key+view);float nh=max(dot(n,halfVector),0.0),vh=max(dot(view,halfVector),0.0);
            float a=roughness*roughness,a2=a*a,denom=nh*nh*(a2-1.0)+1.0;
            float distribution=a2/(3.141593*denom*denom+.0001);
            float k=(roughness+1.0)*(roughness+1.0)/8.0;
            float geometry=(nv/(nv*(1.0-k)+k))*(nl/(nl*(1.0-k)+k));
            vec3 fresnel=f0+(vec3(1.0)-f0)*pow(1.0-vh,5.0);
            vec3 specular=distribution*geometry*fresnel/max(4.0*nv*max(nl,.001),.001);
            vec3 reflection=reflect(-view,n);
            vec3 environment=studioReflection(reflection,roughness,normalize(u_light));
            vec3 edgeFresnel=f0+(vec3(1.0)-f0)*pow(1.0-nv,5.0);
            hdr=base*illumination*(1.0-metalness)+specular*vec3(1.0,.94,.84)*nl*u_light_strength*visibility+environment*edgeFresnel*(1.0-roughness*.65);
            hdr+=base*vec3(.018,.014,.01)*max(-n.y,0.0)*(1.0-metalness);
            if(u_glass&&u_show_textures){
              // Thin transparent surface: transmit the already-drawn contents,
              // add Fresnel reflections, and avoid diffuse white glass shading.
              float absorption=clamp(albedo.a*.32,0.0,.28);
              float reflectance=.04+.96*pow(1.0-nv,5.0);
              float coverage=clamp(absorption+reflectance*(1.0-absorption),.02,.94);
              hdr=(base*ambient*absorption*.3+environment*reflectance+specular*nl*u_light_strength*visibility)/coverage;
              albedo.a=coverage;
            }
          }
          vec3 mapped=clamp((hdr*(2.51*hdr+0.03))/(hdr*(2.43*hdr+0.59)+0.14),0.0,1.0);
          color=vec4(pow(mapped,vec3(1.0/2.2)),albedo.a);
        }else color=vec4(albedo.rgb*lighting,albedo.a);
      }`);
    program = gl.createProgram(); if (!program) throw new Error('Could not create model preview program.');
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Could not link the model preview shaders.');
    const position = gl.getAttribLocation(program, 'a_position');
    const groundUniform=gl.getUniformLocation(program,'u_ground'),groundFootprint=gl.getUniformLocation(program,'u_ground_footprint');
    const shadowPass=gl.getUniformLocation(program,'u_shadow_pass'),shadowMatrix=gl.getUniformLocation(program,'u_shadow_matrix'),shadowEnabled=gl.getUniformLocation(program,'u_shadows'),shadowSampler=gl.getUniformLocation(program,'u_shadow_map'),shadowStep=gl.getUniformLocation(program,'u_shadow_step');
    const normal = gl.getAttribLocation(program, 'a_normal'), pan = gl.getUniformLocation(program, 'u_pan');
    const uv = gl.getAttribLocation(program, 'a_uv'), textured = gl.getUniformLocation(program, 'u_textured'), sampler = gl.getUniformLocation(program, 'u_texture'), cutout=gl.getUniformLocation(program,'u_cutout');
    const rotation = gl.getUniformLocation(program, 'u_rotation'), aspect = gl.getUniformLocation(program, 'u_aspect'), zoom = gl.getUniformLocation(program, 'u_zoom'), color = gl.getUniformLocation(program, 'u_color');
    const causticUniform=gl.getUniformLocation(program,'u_effect'),timeUniform=gl.getUniformLocation(program,'u_time');
    const cinematic=gl.getUniformLocation(program,'u_cinematic'),detail=gl.getUniformLocation(program,'u_detail');
    const hasMetal=gl.getUniformLocation(program,'u_has_metal'),metalSampler=gl.getUniformLocation(program,'u_metal_texture');
    const ultra = gl.getUniformLocation(program,'u_ultra'), light = gl.getUniformLocation(program,'u_light'), strength = gl.getUniformLocation(program,'u_light_strength');
    const hasNormal=gl.getUniformLocation(program,'u_has_normal'),normalSampler=gl.getUniformLocation(program,'u_normal_texture'),glass=gl.getUniformLocation(program,'u_glass');
    const textureCache = new Map<NonNullable<PreviewMesh['texture']>, { texture: WebGLTexture; mode: ReturnType<typeof previewAlphaMode> }>();
    const metalCache=new Map<NonNullable<PreviewMesh['metalTexture']>,WebGLTexture>();
    const normalCache=new Map<NonNullable<PreviewMesh['normalTexture']>,WebGLTexture>();
    const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');
    const sceneSampler=gl.getUniformLocation(program,'u_scene_color'),sceneSize=gl.getUniformLocation(program,'u_scene_size'),normalOnlyUniform=gl.getUniformLocation(program,'u_normal_only');let sceneTexture:WebGLTexture|null=null,sceneWidth=0,sceneHeight=0;
    const missingTexture=gl.getUniformLocation(program,'u_missing_texture');let missingTexturesEnabled=false;
    // Disabled at the user's request while material appearances are reviewed.
    const missingTextureCheckerEnabled=false;
    const showTextures=gl.getUniformLocation(program,'u_show_textures');let texturesEnabled=true;
    const markerUniform=gl.getUniformLocation(program,'u_light_marker'),offsetUniform=gl.getUniformLocation(program,'u_offset');let markerVisible=false;
    const canvasLimit=Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number,gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,8192);
    const uploadMaterial=(mesh:PreviewMesh)=>{
      let texture: WebGLTexture | null = null;
      let mode: ReturnType<typeof previewAlphaMode> = 'opaque';
      if(mesh.texture){const cached=textureCache.get(mesh.texture);texture=cached?.texture??null;mode=cached?.mode??'opaque';}
      if (mesh.texture && !texture) { texture = gl.createTexture(); if (!texture) throw new Error('Could not allocate model texture.'); textures.push(texture);mode=previewAlphaMode(mesh.texture.pixels);textureCache.set(mesh.texture,{texture,mode}); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mesh.texture.width, mesh.texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, mesh.texture.pixels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D);{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(16,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number));}
      }
      let normalTexture:WebGLTexture|null=null;
      if(mesh.normalTexture){normalTexture=normalCache.get(mesh.normalTexture)??null;if(!normalTexture){normalTexture=gl.createTexture();if(!normalTexture)throw new Error('Could not allocate normal texture.');normalCache.set(mesh.normalTexture,normalTexture);textures.push(normalTexture);gl.bindTexture(gl.TEXTURE_2D,normalTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,mesh.normalTexture.width,mesh.normalTexture.height,0,gl.RGBA,gl.UNSIGNED_BYTE,mesh.normalTexture.pixels);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(16,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number));}}
      let metalTexture:WebGLTexture|null=null;
      if(mesh.metalTexture){metalTexture=metalCache.get(mesh.metalTexture)??null;if(!metalTexture){metalTexture=gl.createTexture();if(!metalTexture)throw new Error('Could not allocate metal texture.');textures.push(metalTexture);metalCache.set(mesh.metalTexture,metalTexture);gl.bindTexture(gl.TEXTURE_2D,metalTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,mesh.metalTexture.width,mesh.metalTexture.height,0,gl.RGBA,gl.UNSIGNED_BYTE,mesh.metalTexture.pixels);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);}}
      if(mesh.effect==='liquid')mode='opaque';
      else if(mesh.glass)mode='blend';
      return {effect:mesh.effect,texture,normalTexture,metalTexture,glass:mesh.glass,decal:mesh.decal,normalOnly:mesh.normalOnly,transparent:mesh.effect==='caustic'||Boolean(mesh.normalOnly)||mode==='blend',mode,mannequin:mesh.mannequin,incompleteMaterial:mesh.incompleteMaterial,tint:mesh.tint};
    };
    const parts = meshes.map(mesh => {
      const vertices = gl.createBuffer(), indices = gl.createBuffer(); if (!vertices || !indices) throw new Error('Could not allocate model geometry.');
      buffers.push(vertices, indices); gl.bindBuffer(gl.ARRAY_BUFFER, vertices); gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
      const texcoords = gl.createBuffer(); if (!texcoords) throw new Error('Could not allocate texture coordinates.'); buffers.push(texcoords);
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoords); gl.bufferData(gl.ARRAY_BUFFER, mesh.uv ?? new Float32Array(mesh.positions.length / 3 * 2), gl.STATIC_DRAW);
      const normals=gl.createBuffer();if(!normals)throw new Error('Could not allocate model normals.');buffers.push(normals);gl.bindBuffer(gl.ARRAY_BUFFER,normals);gl.bufferData(gl.ARRAY_BUFFER,smoothNormals(mesh),gl.STATIC_DRAW);
      const material=uploadMaterial(mesh);
      const center=[0,0,0];for(let i=0;i<mesh.positions.length;i+=3)for(let k=0;k<3;++k)center[k]+=mesh.positions[i+k]/(mesh.positions.length/3);
      return { vertices, indices, texcoords, normals, ...material, center, mannequin: mesh.mannequin, tint: mesh.tint, count: mesh.indices.length };
    });
    const bulbPositions:number[]=[],bulbIndices:number[]=[];
    for(let y=0;y<=8;++y)for(let x=0;x<=12;++x){const pitch=y*Math.PI/8,yaw=x*2*Math.PI/12;bulbPositions.push(Math.sin(pitch)*Math.cos(yaw)*.035,Math.cos(pitch)*.035,Math.sin(pitch)*Math.sin(yaw)*.035);}
    for(let y=0;y<8;++y)for(let x=0;x<12;++x){const i=y*13+x;bulbIndices.push(i,i+13,i+1,i+1,i+13,i+14);}
    const bulbVertices=gl.createBuffer(),bulbTriangles=gl.createBuffer();if(!bulbVertices||!bulbTriangles)throw new Error('Could not create light marker.');buffers.push(bulbVertices,bulbTriangles);gl.bindBuffer(gl.ARRAY_BUFFER,bulbVertices);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(bulbPositions),gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bulbTriangles);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(bulbIndices),gl.STATIC_DRAW);
    let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity,minY=Infinity;
    for(const mesh of meshes)for(let i=0;i<mesh.positions.length;i+=3){minY=Math.min(minY,mesh.positions[i+1]);minX=Math.min(minX,mesh.positions[i]);maxX=Math.max(maxX,mesh.positions[i]);minZ=Math.min(minZ,mesh.positions[i+2]);maxZ=Math.max(maxZ,mesh.positions[i+2]);}
    const floorY=minY-.015,floorX=(minX+maxX)/2,floorZ=(minZ+maxZ)/2,floorRadius=5.0;
    const floorVertices=gl.createBuffer(),floorIndices=gl.createBuffer(),floorUv=gl.createBuffer();
    if(!floorVertices||!floorIndices||!floorUv)throw new Error('Could not allocate ground shadow.');
    buffers.push(floorVertices,floorIndices,floorUv);
    gl.bindBuffer(gl.ARRAY_BUFFER,floorVertices);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([floorX-floorRadius,floorY,floorZ-floorRadius,floorX+floorRadius,floorY,floorZ-floorRadius,floorX+floorRadius,floorY,floorZ+floorRadius,floorX-floorRadius,floorY,floorZ+floorRadius]),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,floorUv);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,1]),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,floorIndices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array([0,1,2,0,2,3]),gl.STATIC_DRAW);
    const initial = () => orbitState((meshes.some(mesh => mesh.mannequin) ? Math.PI - .25 : maxZ-minZ>(maxX-minX)*1.7 ? Math.PI/2+.2 : -.5) + initialYawOffset, -.08, 1.6);
    let state = initial();let panX=0,panY=0;
    let lightYaw=-.45,lightPitch=.6,lightPower=1;
    const lightPoint=()=>[Math.sin(lightYaw)*Math.cos(lightPitch)*1.8,Math.sin(lightPitch)*1.8,Math.cos(lightYaw)*Math.cos(lightPitch)*1.8];
    const draw = () => {
      if (disposed) return;
      const box = canvas.getBoundingClientRect(), ratio = quality==='low'?1:quality==='medium'?Math.min(window.devicePixelRatio||1,2):quality==='ultra'?Math.min(Math.max(window.devicePixelRatio||1,3),4):Math.min(Math.max(window.devicePixelRatio||1,2),3),limit=quality==='low'?1536:quality==='medium'?2048:quality==='ultra'?8192:4096;
      const {width:w,height:h}=previewCanvasSize(box.width,box.height,ratio,Math.min(canvasLimit,limit),quality==='ultra'?24*1024*1024:Infinity);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      let postActive=false;
      if(!postFailed){try{post??=createPreviewPost(gl);postActive=post.begin(w,h);if(!postActive)postFailed=true;}catch{post?.dispose();post=undefined;postFailed=true;}}
      if(!postActive)gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      gl.viewport(0, 0, w, h); gl.depthMask(true); gl.disable(gl.BLEND); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.useProgram(program);
      const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw), cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
      gl.uniformMatrix3fv(rotation, false, new Float32Array([cy, sp * sy, -cp * sy, 0, cp, sp, sy, -sp * cy, cp * cy]));
      gl.uniform1i(groundUniform,0);gl.uniform1i(markerUniform,0);gl.uniform3f(offsetUniform,0,0,0);gl.uniform1f(aspect, box.width/Math.max(1,box.height)); gl.uniform1f(zoom, state.zoom);gl.uniform2f(pan,panX,panY); gl.enableVertexAttribArray(position); gl.enableVertexAttribArray(uv);gl.enableVertexAttribArray(normal); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(sampler, 0);
      gl.uniform1f(timeUniform,(performance.now()/1000)%12000);gl.uniform1i(causticUniform,0);
      gl.uniform1i(showTextures,texturesEnabled?1:0);gl.uniform1i(ultra,1);gl.uniform1i(cinematic,1);gl.uniform1i(detail,1);const point=lightPoint();gl.uniform3f(light,point[0],point[1],point[2]);gl.uniform1f(strength,lightPower);
      const requestedShadowSize=previewShadowSize(quality,canvasLimit);
      if(shadowSize!==requestedShadowSize){shadow?.dispose();shadow=createPreviewShadow(gl,requestedShadowSize);shadowSize=requestedShadowSize;}
      gl.uniformMatrix4fv(shadowMatrix,false,previewShadowMatrix(point));gl.uniform1i(shadowSampler,4);
      gl.uniform1i(shadowEnabled,0);gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,null);gl.activeTexture(gl.TEXTURE0);
      const modelShadowMatrix=previewShadowMatrix(point),groundShadowMatrix=previewShadowMatrix(point,6);
      groundShadow??=createPreviewShadow(gl,1024);
      const renderShadow=(target:NonNullable<typeof shadow>,matrix:Float32Array)=>{
        gl.uniformMatrix4fv(shadowMatrix,false,matrix);
        const sceneTarget=gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer|null;
        target.begin();gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.disable(gl.POLYGON_OFFSET_FILL);gl.enable(gl.DEPTH_TEST);gl.uniform1i(shadowPass,1);
        // Transparent/effect layers must not turn glass into an opaque shadow
        // caster. Solid cutouts retain their authored silhouette in the map.
        for(const part of parts)if(!part.transparent&&!part.glass&&!part.effect){
          gl.uniform1i(textured,part.texture?1:0);gl.bindTexture(gl.TEXTURE_2D,part.texture);
          gl.bindBuffer(gl.ARRAY_BUFFER,part.texcoords);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
          gl.bindBuffer(gl.ARRAY_BUFFER,part.normals);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,0,0);
          gl.bindBuffer(gl.ARRAY_BUFFER,part.vertices);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,part.indices);gl.drawElements(gl.TRIANGLES,part.count,gl.UNSIGNED_INT,0);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER,sceneTarget);gl.viewport(0,0,w,h);
      };
      if(shadow)renderShadow(shadow,modelShadowMatrix);
      if(groundShadow)renderShadow(groundShadow,groundShadowMatrix);
      const groundMap=groundShadow??shadow;gl.uniform1i(shadowEnabled,groundMap?1:0);
      gl.uniformMatrix4fv(shadowMatrix,false,groundShadow?groundShadowMatrix:modelShadowMatrix);
      gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,groundMap?.texture??null);gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(shadowPass,0);
      // Draw a transparent ground receiver before the item. It never casts a
      // shadow itself, writes depth, or adds an opaque floor over the gradient.
      gl.uniform1i(groundUniform,1);gl.uniform2f(groundFootprint,Math.max(.12,(maxX-minX)/floorRadius*.65),Math.max(.12,(maxZ-minZ)/floorRadius*.65));
      gl.uniform1f(shadowStep,groundMap?Math.max(1/groundMap.size,.0015):.0015);
      gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
      gl.disableVertexAttribArray(normal);gl.vertexAttrib3f(normal,0,1,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,floorUv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,floorVertices);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,floorIndices);gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_INT,0);
      gl.enableVertexAttribArray(normal);gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1i(groundUniform,0);gl.uniformMatrix4fv(shadowMatrix,false,modelShadowMatrix);gl.uniform1i(shadowEnabled,shadow?1:0);
      gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,shadow?.texture??null);gl.activeTexture(gl.TEXTURE0);if(shadow)gl.uniform1f(shadowStep,1/shadow.size);
      const depth=(part: typeof parts[number])=>-cp*sy*part.center[0]+sp*part.center[1]+cp*cy*part.center[2];
      const ordered=[...parts.filter(part=>!part.transparent&&!part.decal),...parts.filter(part=>!part.transparent&&part.decal),...parts.filter(part=>part.normalOnly),...parts.filter(part=>part.transparent&&!part.normalOnly&&part.effect!=='caustic').sort((a,b)=>depth(a)-depth(b)),...parts.filter(part=>part.effect==='caustic')];
      ordered.forEach((part, index) => {
        gl.uniform1i(causticUniform,part.effect==='caustic'?1:part.effect==='liquid'?2:0);
        const normalOverlay=Boolean(part.normalOnly&&part.normalTexture);
        gl.uniform1i(normalOnlyUniform,normalOverlay?1:0);gl.uniform1i(sceneSampler,2);gl.uniform2f(sceneSize,w,h);
        if(normalOverlay){
          if(!sceneTexture){sceneTexture=gl.createTexture();if(!sceneTexture)throw new Error('Could not allocate decal surface.');textures.push(sceneTexture);}
          gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,sceneTexture);
          if(sceneWidth!==w||sceneHeight!==h){gl.copyTexImage2D(gl.TEXTURE_2D,0,gl.RGBA,0,0,w,h,0);sceneWidth=w;sceneHeight=h;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}else gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,w,h);
        }
        gl.activeTexture(gl.TEXTURE0);gl.disable(gl.POLYGON_OFFSET_FILL);if(!part.transparent){gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.depthMask(true);if(part.decal){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);}} if(part.transparent){gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);}if(part.effect==='caustic'){gl.blendFuncSeparate(gl.ONE_MINUS_DST_COLOR,gl.ONE,gl.ZERO,gl.ONE);gl.disable(gl.CULL_FACE);}if(part.decal){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);}const variation = (index % 4) * .035;const c=part.tint??(part.texture?[1,1,1]:part.mannequin?[.58,.61,.61]:[.65+variation,.72+variation,.75+variation]);gl.uniform1i(missingTexture,missingTextureCheckerEnabled&&missingTexturesEnabled&&!part.mannequin&&(part.incompleteMaterial||!part.texture&&!part.tint&&!part.glass)?1:0);gl.uniform3f(color,c[0],c[1],c[2]);gl.uniform1i(cutout,!normalOverlay&&part.mode!=='blend'?1:0); gl.uniform1i(textured, part.texture ? 1 : 0); gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,part.normalTexture);gl.uniform1i(normalSampler,1);gl.uniform1i(hasNormal,part.normalTexture?1:0);gl.uniform1i(glass,part.glass?1:0);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,part.metalTexture);gl.uniform1i(metalSampler,3);gl.uniform1i(hasMetal,part.metalTexture?1:0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D, part.texture);
        gl.bindBuffer(gl.ARRAY_BUFFER, part.texcoords); gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, part.normals); gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, part.vertices); gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indices); gl.drawElements(gl.TRIANGLES, part.count, gl.UNSIGNED_INT, 0); });
      gl.depthMask(true);gl.disable(gl.POLYGON_OFFSET_FILL);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
      if(markerVisible){gl.uniform1i(causticUniform,0);gl.uniform1i(missingTexture,0);gl.uniform1i(markerUniform,1);gl.uniformMatrix3fv(rotation,false,new Float32Array([1,0,0,0,1,0,0,0,1]));gl.uniform3f(offsetUniform,point[0],point[1],point[2]);gl.disableVertexAttribArray(uv);gl.vertexAttrib2f(uv,0,0);gl.disableVertexAttribArray(normal);gl.vertexAttrib3f(normal,0,0,1);gl.bindBuffer(gl.ARRAY_BUFFER,bulbVertices);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bulbTriangles);gl.drawElements(gl.TRIANGLES,bulbIndices.length,gl.UNSIGNED_INT,0);}
      if(postActive)post!.present(w/Math.max(1,box.width),texturesEnabled);

    };
    const setQuality=(value:typeof quality)=>{if(value===quality)return;if(value!=='ultra'&&post){post.dispose();post=undefined;}if(value!==quality)postFailed=false;quality=value;for(const part of parts)for(const texture of [part.texture,part.normalTexture,part.metalTexture])if(texture){gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(16,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number));}draw();};
    const updateMaterials=(next:PreviewMesh[],nextQuality?:typeof quality)=>{
      // The packet must describe the same geometry. Quality updates never replace buffers.
      if(next.length!==meshes.length||next.some((m,i)=>m.positions.length!==meshes[i].positions.length||m.indices.length!==meshes[i].indices.length||m.positions.some((v,j)=>v!==meshes[i].positions[j])||m.indices.some((v,j)=>v!==meshes[i].indices[j])||m.uv?.length!==meshes[i].uv?.length||Boolean(m.uv?.some((v,j)=>v!==meshes[i].uv?.[j]))))return false;
      const oldCount=textures.length;textureCache.clear();normalCache.clear();metalCache.clear();
      try{const materials=next.map(uploadMaterial);materials.forEach((material,i)=>Object.assign(parts[i],material));}
      catch(error){for(const texture of textures.splice(oldCount))gl.deleteTexture(texture);textureCache.clear();normalCache.clear();metalCache.clear();throw error;}
      for(const texture of textures.splice(0,oldCount)){if(texture===sceneTexture)textures.push(texture);else gl.deleteTexture(texture);}
      meshes=next;if(nextQuality)quality=nextQuality;draw();syncAnimation();return true;
    };
    const zoomAt=(clientX:number,clientY:number,factor:number)=>{
      if(![clientX,clientY,factor].every(Number.isFinite)||factor<=0)return;
      const box=canvas.getBoundingClientRect(),nx=(clientX-box.left)/Math.max(1,box.width)*2-1,ny=1-(clientY-box.top)/Math.max(1,box.height)*2;
      // Panning shifts the projection. Zooming about a pixel therefore needs
      // only the same screen-space shift, independent of the surface depth.
      const next=orbitState(state.yaw,state.pitch,state.zoom*factor);
      panX+=nx*(box.width/Math.max(1,box.height))*.57735*3.4*(1/next.zoom-1/state.zoom);
      panY+=ny*.57735*3.4*(1/next.zoom-1/state.zoom);state=next;draw();
    };
    const lightPosition=()=>{const box=canvas.getBoundingClientRect(),[x,y,z]=lightPoint(),scale=state.zoom/((3.4-z)*.57735);return{x:box.width/2+(x*scale+panX*state.zoom/(3.4*.57735))*box.height/2,y:box.height/2-(y*scale+panY*state.zoom/(3.4*.57735))*box.height/2,z,behind:z<0};};
    const placeLight=(clientX:number,clientY:number,behind=false)=>{
      if(!Number.isFinite(clientX)||!Number.isFinite(clientY))return;
      const box=canvas.getBoundingClientRect(),nx=(clientX-box.left)/Math.max(1,box.width)*2-1,ny=1-(clientY-box.top)/Math.max(1,box.height)*2;
      const dx=nx*(box.width/Math.max(1,box.height))*.57735/state.zoom-panX/3.4,dy=ny*.57735/state.zoom-panY/3.4;
      const ox=0,oy=0,oz=3.4,a=dx*dx+dy*dy+1,b=2*(ox*dx+oy*dy-oz),c=ox*ox+oy*oy+oz*oz-1.8*1.8;
      const discriminant=b*b-4*a*c;
      // Intersect the exact projection ray with the light's orbit sphere.
      // Outside its silhouette, clamp to the nearest point on the orbit.
      const t=discriminant>=0?(-b+(behind?1:-1)*Math.sqrt(discriminant))/(2*a):Math.max(0,-b/(2*a));
      let x=ox+t*dx,y=oy+t*dy,z=oz-t;const length=Math.hypot(x,y,z);if(length<1e-8)return;
      x*=1.8/length;y*=1.8/length;z*=1.8/length;
      lightYaw=Math.atan2(x,z);lightPitch=Math.asin(Math.max(-1,Math.min(1,y/1.8)));draw();
    };
    // Static previews remain event-driven. Animated effects redraw at most 30 fps,
    // and stop when hidden, off-screen, texture-disabled, or disposed.
    const tick=(now:number)=>{animationFrame=0;if(disposed)return;if(now-lastAnimation>=1000/30){lastAnimation=now;draw();}syncAnimation();};
    syncAnimation=()=>{const active=!disposed&&animationVisible&&!document.hidden&&texturesEnabled&&canvas.isConnected&&parts.some(part=>part.effect&&part.texture);
      if(active&&!animationFrame)animationFrame=requestAnimationFrame(tick);
      if(!active&&animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0;}
    };
    document.addEventListener('visibilitychange',onVisibility);
    visibilityObserver=new IntersectionObserver(entries=>{animationVisible=entries.some(entry=>entry.isIntersecting);syncAnimation();});visibilityObserver.observe(canvas);
    observer = new ResizeObserver(draw); observer.observe(canvas); draw();syncAnimation();
    return {showMissingTextures:(enabled:boolean)=>{if(missingTexturesEnabled===enabled)return;missingTexturesEnabled=enabled;if(missingTextureCheckerEnabled)draw();},showLightMarker:(enabled:boolean)=>{if(markerVisible===enabled)return;markerVisible=enabled;draw();},setQuality,updateMaterials,zoomAt,lightPosition,placeLight,showTextures:(enabled:boolean)=>{if(texturesEnabled===enabled)return;texturesEnabled=enabled;draw();syncAnimation();}, move: (yaw:number, pitch:number, zoom = 1) => { state = orbitState(state.yaw + yaw, state.pitch + pitch, state.zoom * zoom); draw(); },pan:(x:number,y:number)=>{if(!Number.isFinite(x)||!Number.isFinite(y))return;const scale=2*.57735*3.4/(Math.max(1,canvas.getBoundingClientRect().height)*state.zoom);panX=Math.max(-100,Math.min(100,panX+x*scale));panY=Math.max(-100,Math.min(100,panY-y*scale));draw();},moveLight:(x:number,y:number)=>{if(!Number.isFinite(x)||!Number.isFinite(y))return;lightYaw+=x*.012;lightPitch=Math.max(-1.5,Math.min(1.5,lightPitch-y*.012));draw();},lightStrength:(value:number)=>{if(Number.isFinite(value))lightPower=Math.max(.1,Math.min(3,value));draw();},resetLight:()=>{lightYaw=-.45;lightPitch=.6;lightPower=1;draw();}, reset: () => { state = initial();panX=panY=0; draw(); }, getView:()=>({...state,panX,panY,lightYaw,lightPitch,lightPower}),restoreView:(view:PreviewCamera)=>{state=orbitState(view.yaw,view.pitch,view.zoom);panX=view.panX;panY=view.panY;lightYaw=view.lightYaw;lightPitch=view.lightPitch;lightPower=view.lightPower;draw();},dispose: cleanup };
  } catch (error) { cleanup(); throw error; }
}


