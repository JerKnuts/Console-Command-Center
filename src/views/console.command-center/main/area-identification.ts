export type AreaForm = {id:string;editorId:string;name:string};
export type CurrentArea = {ok:boolean;cell:AreaForm;locations:AreaForm[];world:AreaForm|null};
export type AreaRecord = {kind:string;name:string;id?:string;localId?:string;source?:string;recordType?:string;editorId?:string};
export type AreaProposal = {matches:boolean;name:string;basis:string;message:string};
const usefulName=(value:string)=>Boolean(value.trim()&&/[\p{L}\p{N}]/u.test(value)&&!/^\?+$/.test(value.trim()));
export function proposeAreaName(record:AreaRecord,area:CurrentArea):AreaProposal {
 if(!area?.ok||!area.cell||!Array.isArray(area.locations))throw new Error('The game did not return a valid current area.');
 const matches=record.recordType==='CELL'&&Boolean(record.id)&&record.id!.toUpperCase().padStart(8,'0')===area.cell.id.toUpperCase().padStart(8,'0');
 if(!matches)return {matches:false,name:'',basis:'',message:`You are in ${area.cell.name||area.cell.editorId||area.cell.id}, not the selected cell. Stand in the selected destination, then identify it again.`};
 const location=area.locations.find(l=>usefulName(l.name));
 if(location)return {matches:true,name:location.name.trim(),basis:location===area.locations[0]?'Current location':'Parent location',message:'This is an area name reported by the game; it may cover several cells. Review it before accepting.'};
 if(usefulName(area.cell.name))return {matches:true,name:area.cell.name.trim(),basis:'Current cell display name',message:'This display name is reported by the current cell.'};
 if(area.world&&usefulName(area.world.name))return {matches:true,name:`${area.world.name.trim()} — ${area.cell.editorId||area.cell.id}`,basis:'Worldspace plus cell Editor ID',message:'Only the broader worldspace has a display name. The cell ID is retained to distinguish this destination.'};
 return {matches:true,name:'',basis:'No display name available',message:'The game did not provide a usable name. No name change can be proposed.'};
}
export const validAreaName=(name:string)=>name.trim().length>0&&name.trim().length<=160&&!/[\x00-\x1f\x7f]/.test(name)&&/[\p{L}\p{N}]/u.test(name);
