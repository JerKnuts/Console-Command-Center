import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {thumbnailUrl} from '../src/views/console.command-center/main/preview-thumbnails.ts';
const root=new URL('../src/views/console.command-center/main/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('preview-thumbnail-manifest.json',root)));
test('packaged thumbnails resolve by owning plugin/local ID and never cross into mod IDs',()=>{
 const [key,file]=Object.entries(manifest).find(([key])=>key==='starfield.esm:00ABF9');assert.ok(file);
 assert.equal(thumbnailUrl('Starfield.esm','0000ABF9'),'./thumbnails/'+file);assert.equal(thumbnailUrl('STARFIELD.ESM','00abf9'),'./thumbnails/'+file);
 assert.equal(thumbnailUrl('example.esm','0500ABF9'),undefined);assert.equal(thumbnailUrl('ShatteredSpace.esm','00ABF9'),undefined);assert.equal(thumbnailUrl('Starfield.esm','bad-input'),undefined);
});
test('every thumbnail manifest reference has a packaged WebP image and a bounded local filename',()=>{
 assert.ok(Object.keys(manifest).length>3000);for(const [key,file]of Object.entries(manifest)){assert.match(key,/^(starfield|shatteredspace|sfbgs00d|sfbgs050|sfbgs004|sfbgs047)\.esm:[0-9A-F]{6}$/);assert.match(file,/^[a-f0-9]{24}\.webp$/);const data=fs.readFileSync(new URL('public/thumbnails/'+file,root));assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.ok(data.length>100&&data.length<500000);}
});

test('reported Shattered Space outfits have packaged images independent of runtime load order',()=>{
 for(const id of ['01C2CD','01C2CB','160D54','001618','001616'])assert.ok(thumbnailUrl('ShatteredSpace.esm',id),'Missing reported outfit '+id);
});

test('both official vehicles and their modules have previews independent of light-plugin slots',()=>{
 for(const [plugin,ids] of [['SFBGS004.esm',['033','046']],['SFBGS047.esm',['001','018']]])for(const id of ids)assert.ok(thumbnailUrl(plugin,id),plugin+':'+id);
});
