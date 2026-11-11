import {assetPreviewOrientation} from './preview-asset-views.ts';
import {throwableKind} from './throwables.ts';
export type PreviewOrientation={yawOffset:number;pitch:number;roll?:number;yaw?:number;modelPitch?:number};
export function previewOrientation(type:string,category='',label='',editorId='',modelPath?:string):PreviewOrientation {
  const assetView=assetPreviewOrientation(type,editorId,modelPath);
  if(assetView)return assetView;
  const kind=throwableKind({type,category,label,editorId});
  if(kind==='mine')return {yawOffset:0,yaw:-.5,pitch:.55};
  if(kind==='grenade')return {yawOffset:0,yaw:0,pitch:.08,roll:Math.PI/2};
  if(type.toUpperCase()==='AMMO')return {yawOffset:Math.PI,pitch:.45};
  return {yawOffset:['Helmets','Apparel','Spacesuits','Armor','Armor / Apparel','Vehicles'].includes(category)?Math.PI:0,pitch:-.08};
}
// Rotate decoded geometry before framing, normals and ground shadows are computed.
// Packet buffers stay unmodified; each decode owns its position arrays.
export function orientPreviewMeshes(meshes:{positions:Float32Array}[],orientation:PreviewOrientation):void {
  if(orientation.modelPitch){
    const c=Math.cos(orientation.modelPitch),s=Math.sin(orientation.modelPitch);
    for(const mesh of meshes)for(let i=0;i<mesh.positions.length;i+=3){
      const y=mesh.positions[i+1],z=mesh.positions[i+2];
      mesh.positions[i+1]=c*y-s*z;
      mesh.positions[i+2]=s*y+c*z;
    }
  }
  if(!orientation.roll)return;
  const c=Math.cos(orientation.roll),s=Math.sin(orientation.roll);
  for(const mesh of meshes)for(let i=0;i<mesh.positions.length;i+=3){const x=mesh.positions[i],y=mesh.positions[i+1];mesh.positions[i]=c*x-s*y;mesh.positions[i+1]=s*x+c*y;}
}
