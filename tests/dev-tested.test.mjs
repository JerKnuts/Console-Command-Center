import test from 'node:test';
import assert from 'node:assert/strict';
import { installDevFeedback, devFeedbackIdentity, devFeedbackTestedClass } from '../src/views/console.command-center/main/dev-feedback.ts';
import { reviewedWasTested } from '../src/views/console.command-center/main/reviewed-id-findings.ts';

test('markers migrate previous reports, survive export and restart, and hide outside Dev Mode', async () => {
 const report={kind:'ID',name:'Old name',id:'0307E666',localId:'07E666',source:'SFBGS050.esm',status:'Working',comment:'Rename',time:'now',version:'1.2.36'};
 const storage=new Map([['ccc.dev-feedback.v1',JSON.stringify([report])]]);
 globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
 let dotClick,exportClick;
 const dot={classList:{toggle(){}},setAttribute(){},addEventListener:(_event,fn)=>dotClick=fn};
 const button={disabled:false,addEventListener:(_event,fn)=>exportClick=fn};
 globalThis.document={querySelector:s=>s==='#dev-mode-dot'?dot:button,addEventListener(){}};
 const install=()=>installDevFeedback({version:'1.2.37',rerender(){},status(){},exportText:async()=> 'new.txt'});
 const renamed={...report,name:'Crewman Outfit',id:'0907E666'};
 install();assert.equal(devFeedbackTestedClass(renamed),'');
 for(let i=0;i<5;i++)dotClick();
 assert.equal(devFeedbackTestedClass(renamed),' dev-tested dev-working');assert.equal(devFeedbackTestedClass({...renamed,referenceOnly:true}),' dev-tested dev-working');
 assert.equal(devFeedbackTestedClass({...renamed,source:'Other.esm'}),'');
 assert.equal(devFeedbackTestedClass({kind:'Command',name:'Already reviewed',id:'known'},true),' dev-tested dev-working');
 await exportClick();assert.deepEqual(JSON.parse(storage.get('ccc.dev-feedback.v1')),[]);
 assert.equal(devFeedbackTestedClass(renamed),' dev-tested dev-working');assert.equal(devFeedbackTestedClass({...renamed,referenceOnly:true}),' dev-tested dev-working');
 for(let i=0;i<5;i++)dotClick();assert.equal(devFeedbackTestedClass(renamed),'');
 install();for(let i=0;i<5;i++)dotClick();assert.equal(devFeedbackTestedClass(renamed),' dev-tested dev-working');assert.equal(devFeedbackTestedClass({...renamed,referenceOnly:true}),' dev-tested dev-working');
 for(let i=0;i<5;i++)dotClick();
 delete globalThis.document;delete globalThis.localStorage;
});

test('reviewed item history and quest identities remain tied to owning records',()=>{
 assert.equal(reviewedWasTested({value:'0307E666',localFormId:'07E666',plugin:'SFBGS050.esm'}),true);
 assert.equal(reviewedWasTested({value:'0307E666',localFormId:'07E666',plugin:'Other.esm'}),false);
 assert.equal(reviewedWasTested({value:'0003B423'}),true);
 assert.equal(devFeedbackIdentity({kind:'Quest',name:'Quest',id:'010847CA',source:'Shattered Space'}),devFeedbackIdentity({kind:'Quest',name:'Renamed',localId:'0847CA',source:'ShatteredSpace.esm'}));
 assert.equal(devFeedbackIdentity({kind:'Setting',name:'fExample',id:'00123456'}),'Setting:fExample');
});


test('latest explicit outcomes migrate, survive export, and keep comment-only reports neutral',async()=>{
 const common={kind:'ID',name:'Example',id:'00123456',source:'Starfield.esm',time:'now',version:'old',comment:''};
 const reports=[{...common,status:'Working'},{...common,status:'Not working'},{...common,status:'',comment:'More details'}, {...common,id:'00123457',status:'Not noticeable'}, {...common,id:'00123458',status:'Reference Only'}, {...common,id:'00123459',status:'',comment:'No test yet'}];
 const storage=new Map([['ccc.dev-feedback.v1',JSON.stringify(reports)]]);let toggle,exportClick;
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 const dot={classList:{toggle(){}},setAttribute(){},addEventListener:(n,f)=>toggle=f};const button={disabled:false,addEventListener:(n,f)=>exportClick=f};
 globalThis.document={querySelector:s=>s==='#dev-mode-dot'?dot:button,addEventListener(){}};
 const install=()=>installDevFeedback({version:'new',rerender(){},status(){},exportText:async()=> 'report.txt'});
 try{
 install();for(let i=0;i<5;i++)toggle();
 assert.equal(devFeedbackTestedClass(common),' dev-tested dev-issues');
 assert.equal(devFeedbackTestedClass({...common,id:'00123457'}),' dev-tested dev-uncertain');
 assert.equal(devFeedbackTestedClass({...common,id:'00123458'}),' dev-tested dev-reference');
 assert.equal(devFeedbackTestedClass({...common,id:'00123459'}),' dev-tested');
 assert.equal(devFeedbackTestedClass({...common,id:'00123460',referenceOnly:true},true),' dev-tested dev-reference');
 await exportClick();assert.deepEqual(JSON.parse(storage.get('ccc.dev-feedback.v1')),[]);
 for(let i=0;i<5;i++)toggle();install();for(let i=0;i<5;i++)toggle();
 assert.equal(devFeedbackTestedClass(common),' dev-tested dev-issues');
 assert.equal(devFeedbackTestedClass({...common,id:'09123457',localId:'123457'}),' dev-tested dev-uncertain');
 assert.equal(devFeedbackTestedClass({...common,source:'Other.esm'}),'');
 }finally{for(let i=0;i<5;i++)toggle();delete globalThis.document;delete globalThis.localStorage;}
});


test('new local Working outcome is not overwritten by an older queued issue on restart',()=>{
 const record={kind:'ID',name:'Example',id:'00123456',source:'Starfield.esm'};const identity=devFeedbackIdentity(record);
 const storage=new Map([['ccc.dev-feedback.v1',JSON.stringify([{...record,status:'Issues',comment:'Old problem',time:'2026-10-14T00:00:00Z',version:'old'}])],['ccc.dev-outcomes.v1',JSON.stringify({[identity]:{status:'working',time:'2026-10-15T00:00:00Z'}})]]);let toggle;
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 const dot={classList:{toggle(){}},setAttribute(){},addEventListener:(n,f)=>toggle=f};globalThis.document={querySelector:s=>s==='#dev-mode-dot'?dot:null,addEventListener(){}};
 try{installDevFeedback({version:'new',rerender(){},status(){},exportText:async()=>''});for(let i=0;i<5;i++)toggle();assert.equal(devFeedbackTestedClass(record),' dev-tested dev-working');}finally{for(let i=0;i<5;i++)toggle();delete globalThis.document;delete globalThis.localStorage;}
});
