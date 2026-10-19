type ModRow = {source?:string;category:string;referenceOnly?:boolean};
export function modCategoryCounts(rows:ModRow[],advanced:boolean):Array<{name:string;count:number}> {
 const counts=new Map<string,number>();
 for(const row of rows)if(row.source==='mod'&&(advanced||!row.referenceOnly)){
  const name=row.category||'Other';counts.set(name,(counts.get(name)??0)+1);
 }
 return [...counts].map(([name,count])=>({name,count})).sort((a,b)=>a.name.localeCompare(b.name));
}
export function modCategoryMatches(row:ModRow,category:string):boolean {
 return row.source==='mod'&&(!category||(row.category||'Other')===category);
}
