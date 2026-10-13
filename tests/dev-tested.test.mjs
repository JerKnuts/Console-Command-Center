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
 assert.equal(devFeedbackTestedClass(renamed),' dev-tested');
 assert.equal(devFeedbackTestedClass({...renamed,source:'Other.esm'}),'');
 assert.equal(devFeedbackTestedClass({kind:'Command',name:'Already reviewed',id:'known'},true),' dev-tested');
 await exportClick();assert.deepEqual(JSON.parse(storage.get('ccc.dev-feedback.v1')),[]);
 assert.equal(devFeedbackTestedClass(renamed),' dev-tested');
 for(let i=0;i<5;i++)dotClick();assert.equal(devFeedbackTestedClass(renamed),'');
 install();for(let i=0;i<5;i++)dotClick();assert.equal(devFeedbackTestedClass(renamed),' dev-tested');
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
