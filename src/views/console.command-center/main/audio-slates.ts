import records from './book-records.json' with {type:'json'};
type BookIdentity={type:string;plugin?:string;localFormId?:string;category?:string};
export function bookCategory(entry:BookIdentity):string|undefined {
 if(entry.type.toUpperCase()!=='BOOK')return;
 const key=`${entry.plugin?.toLowerCase()}:${entry.localFormId?.toUpperCase().padStart(6,'0')}`;
 const record=(records as Record<string,{slateType:number;worldModel:string;inventoryModel:string}>)[key];
 if(record?.slateType===3)return 'Audio Slates';
 if(record||['Books','Books & Notes','Books / Notes','Notes','Text Slates','Image Slates'].includes(entry.category??''))return 'Books / Notes';
 return entry.category;
}
export function isAudioSlate(entry:BookIdentity):boolean{return bookCategory(entry)==='Audio Slates';}
export function classifyAudioSlate<T extends BookIdentity&{category:string}>(entry:T):T {
 const category=bookCategory(entry);return category&&category!==entry.category?{...entry,category}:entry;
}
