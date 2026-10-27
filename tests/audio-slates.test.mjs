import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../src/views/console.command-center/main/book-records.json' with {type:'json'};
import {bookCategory} from '../src/views/console.command-center/main/audio-slates.ts';
import {fetchSlateAudio} from '../src/views/console.command-center/main/slate-audio.ts';
import {validateBookMedia} from '../src/views/console.command-center/main/book-reader.ts';
const id='00001CF1';
test('Audio Slates stay separate while all other authored BOOK types share Books / Notes',()=>{
 let audio=0,reading=0;for(const [key,record] of Object.entries(records)){const [plugin,localFormId]=key.split(':');const entry={type:'BOOK',plugin,localFormId,category:'Books & Notes'};const category=bookCategory(entry);if(record.slateType===3){assert.equal(category,'Audio Slates');audio++;}else {assert.equal(category,'Books / Notes');reading++;}}
 assert.equal(audio,187);assert.equal(reading,1178);
 assert.equal(bookCategory({type:'BOOK',plugin:'unrelated.esm',localFormId:'001CF1',category:'Books & Notes'}),'Books / Notes');
});
test('voice ranges are identity bound, complete and cancel when selection changes',async()=>{
 const bytes=Buffer.alloc(40000,42);const reply=p=>({ok:true,formId:id,track:0,offset:p.offset,totalBytes:bytes.length,data:bytes.subarray(p.offset,p.offset+p.count).toString('base64')});let calls=0;
 const actual=await fetchSlateAudio(async(n,p)=>{assert.equal(p.operation,'read-slate-audio');calls++;return reply(p);},id,0,()=>true);assert.deepEqual(Buffer.from(actual),bytes);assert.equal(calls,2);
 for(const changes of [{formId:'00000000'},{track:1},{offset:1},{totalBytes:9000000},{data:'AA=='},{ok:false}])await assert.rejects(fetchSlateAudio(async(n,p)=>({...reply(p),...changes}),id,0,()=>true));
 await assert.rejects(fetchSlateAudio(async()=>{throw Error('should not request');},id,0,()=>false),/selection changed/);
});
test('book media rejects oversized and out of order recording metadata',()=>{
 const good={ok:true,formId:id,bookText:'',slateType:3,audioTracks:[{index:0,text:'Recorded dialogue'}]};assert.equal(validateBookMedia(good,id).audioTracks.length,1);
 for(const audioTracks of [[{index:1,text:'wrong order'}],[{index:0,text:'x'.repeat(2049)}],Array.from({length:257},(_,index)=>({index,text:''}))])assert.throws(()=>validateBookMedia({...good,audioTracks},id));
});
