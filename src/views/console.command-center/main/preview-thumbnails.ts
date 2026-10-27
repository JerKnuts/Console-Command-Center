// Generated images ship with CCC; this lookup performs no model requests or local-cache writes.
import manifest from './preview-thumbnail-manifest.json' with {type:'json'};
export function thumbnailUrl(plugin:string,localId:string):string|undefined{
 const id=localId.replace(/^0x/i,'').toUpperCase().slice(-6).padStart(6,'0');
 const file=(manifest as Record<string,string>)[plugin.toLowerCase()+':'+id];
 return file?'./thumbnails/'+file:undefined;
}
