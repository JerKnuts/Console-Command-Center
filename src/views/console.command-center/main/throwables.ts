export type ThrowableRecord = {type?:string;label?:string;category?:string;editorId?:string;keywords?:readonly string[]};
// WEAP is essential: ship/creature ammunition and launchers are not hand throwables.
export function throwableKind(record:ThrowableRecord):'mine'|'grenade'|undefined {
  if(record.type?.toUpperCase()!=='WEAP')return;
  const names=[record.label??'',record.editorId??'',...(record.keywords??[])];
  if(names.some(name=>/(?:grenade|mine)[ _-]*launchers?/i.test(name)))return;
  if(record.category==='Mines'||names.some(name=>/\bmines?\b/i.test(name)||/mine(?:$|[_\d])/i.test(name)))return 'mine';
  if(record.category==='Grenades'||names.some(name=>/\bgrenades?\b/i.test(name)||/grenade(?:$|[_\d])/i.test(name)))return 'grenade';
}
