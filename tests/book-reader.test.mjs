import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBookReply} from '../src/views/console.command-center/main/book-reader.ts';
test('book replies are bound to the selected record and reject malformed or oversized text',()=>{
 const reply={ok:true,formId:'FE001ABC',bookText:'<p>Chapter One</p>'};assert.equal(validateBookReply(reply,'fe001abc'),reply.bookText);
 for(const value of [{...reply,formId:'00000001'},{...reply,bookText:{}},{...reply,ok:false},{...reply,bookText:'x'.repeat(262145)}])assert.throws(()=>validateBookReply(value,'FE001ABC'));
 assert.equal(validateBookReply({...reply,bookText:''},'FE001ABC'),'');
});
