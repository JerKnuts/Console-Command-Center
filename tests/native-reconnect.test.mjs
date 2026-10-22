import test from 'node:test';
import assert from 'node:assert/strict';
import {createNativeReconnect} from '../src/views/console.command-center/main/native-reconnect.ts';

function clock() {
  const pending = new Map(); let id = 0;
  return {pending, set(callback, delay) {pending.set(++id, {callback,delay}); return id;}, clear(id) {pending.delete(id);},
    async tick() {const [id, next] = pending.entries().next().value; pending.delete(id); next.callback(); await new Promise(resolve=>setImmediate(resolve));}};
}
test('transient failed startup handshakes reconnect and stop after success', async()=>{
  const timers=clock();let calls=0;
  const reconnect=createNativeReconnect(async()=>++calls===3,timers);
  await reconnect.retry();assert.equal([...timers.pending.values()][0].delay,5000);
  await timers.tick();assert.equal([...timers.pending.values()][0].delay,10000);
  await timers.tick();assert.equal(calls,3);assert.equal(timers.pending.size,0);
  await reconnect.retry();assert.equal(calls,3);
});
test('reopen signals do not overlap pending requests; closing page cancels future retries',async()=>{
  const timers=clock();let finish,calls=0;
  const reconnect=createNativeReconnect(()=>{calls++;return new Promise(resolve=>{finish=resolve;});},timers);
  const first=reconnect.retry();await reconnect.retry();assert.equal(calls,1);
  finish(false);await first;assert.equal(timers.pending.size,1);
  const reopened=reconnect.retry();assert.equal(calls,2);assert.equal(timers.pending.size,0);
  reconnect.stop();finish(false);await reopened;assert.equal(timers.pending.size,0);
});
test('extended failures use bounded backoff and tolerate rejected handshakes',async()=>{
  const timers=clock();const reconnect=createNativeReconnect(async()=>{throw Error('timeout');},timers);
  await reconnect.retry();
  for(const delay of [5000,10000,20000,30000,30000]){assert.equal([...timers.pending.values()][0].delay,delay);await timers.tick();}
  reconnect.stop();assert.equal(timers.pending.size,0);
});
