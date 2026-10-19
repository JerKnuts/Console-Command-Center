type NamedRecord={value:string;type?:string;plugin?:string;localFormId?:string;label:string;originalName?:string;keywords?:string[]};
const KEY='ccc.area-names.v1',REPORTS='ccc.dev-feedback.v1';
type NameChange={name:string;original:string};
let cached:Record<string,NameChange>|undefined;
export function areaNameKey(record:{value:string;plugin?:string;localFormId?:string}):string{return (record.plugin??'Starfield.esm').toLowerCase()+':'+(record.localFormId??record.value).toUpperCase().slice(-6).padStart(6,'0');}
function names():Record<string,NameChange>{if(cached)return cached;try{const value=JSON.parse(localStorage.getItem(KEY)??'{}');cached={};if(value&&typeof value==='object'&&!Array.isArray(value))for(const [key,entry] of Object.entries(value)){const v=entry as NameChange;if(v&&typeof v.name==='string'&&v.name.length<=160&&typeof v.original==='string')cached[key]=v;}return cached;}catch{return cached={};}}
export function applyAreaNameOverride<T extends NamedRecord>(record:T):T {
 if(record.type!=='CELL')return record;const change=names()[areaNameKey(record)];if(!change)return record;
 return {...record,label:change.name,originalName:record.originalName??change.original,keywords:[...new Set([...(record.keywords??[]),change.original])]};
}
// Commit the report and local alias together; no engine form or packaged catalog is edited.
export function commitAreaNameChange<T>(record:{value:string;plugin?:string;localFormId?:string;label:string},name:string,reports:T[],report:T):T[]{
 const previousNames=localStorage.getItem(KEY),previousReports=localStorage.getItem(REPORTS);const key=areaNameKey(record),current=names();
 const nextNames={...current,[key]:{name,original:current[key]?.original??record.label}};const nextReports=[...reports,report];
 try{localStorage.setItem(REPORTS,JSON.stringify(nextReports));localStorage.setItem(KEY,JSON.stringify(nextNames));}
 catch(error){try{if(previousReports===null)localStorage.removeItem(REPORTS);else localStorage.setItem(REPORTS,previousReports);if(previousNames===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,previousNames);}catch{}throw error;}
 cached=nextNames;return nextReports;
}
