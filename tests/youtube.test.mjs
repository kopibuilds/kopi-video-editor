import test from 'node:test';import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';import { fileURLToPath } from 'node:url';
import { downloadPlan, downloadYouTube, youtubeId } from '../scripts/youtube.mjs';
const parent=fileURLToPath(new URL('../.kopi/test-youtube/',import.meta.url)),id='AbCdEf123_-';
function fixture(t){mkdirSync(parent,{recursive:true});const root=mkdtempSync(join(parent,'case-'));t.after(()=>{assert.ok(resolve(root).startsWith(resolve(parent)+sep));rmSync(root,{recursive:true});});return root;}
test('only single HTTPS YouTube videos are accepted and tracking parameters are removed',t=>{
 const root=fixture(t);assert.equal(youtubeId(`https://youtu.be/${id}?feature=shared`),id);
 assert.equal(downloadPlan(root,`https://www.youtube.com/watch?v=${id}&list=anything`).args.at(-1),`https://www.youtube.com/watch?v=${id}`);
 for(const url of ['https://example.com/watch?v='+id,'http://youtu.be/'+id,'https://user:pass@youtu.be/'+id,'https://youtube.com/playlist?list=x','https://youtube.com/@channel'])assert.throws(()=>youtubeId(url));
 assert.throws(()=>downloadPlan(root,`https://youtu.be/${id}`,{output:'../outside'}),/inside inbox/);
});
test('download uses bounded public-only arguments and requires a completed file',t=>{
 const root=fixture(t),calls=[];
 const runner=(program,args)=>{calls.push({program,args});if(args.includes('--version'))return {status:0,stdout:'test-version'};const folder=args[args.indexOf('--paths')+1];writeFileSync(join(folder,id+'.mp4'),'fixture media');return {status:0};};
 const result=downloadYouTube(root,`https://youtu.be/${id}`,{executable:'test-downloader',runner});
 assert.equal(result.media.length,1);assert.equal(calls.length,2);
 const args=calls[1].args;assert.ok(args.includes('--ignore-config'));assert.ok(args.includes('--no-playlist'));assert.ok(args.includes('--no-overwrites'));
 assert.equal(args[args.indexOf('--retries')+1],'1');assert.ok(!args.some(a=>/cookie|netrc|password|username/.test(a)));
});
test('a failed or empty download does not report success or trigger another provider',t=>{
 const root=fixture(t);let count=0;
 const runner=(_,args)=>{count++;return args.includes('--version')?{status:0,stdout:'test'}:{status:1};};
 assert.throws(()=>downloadYouTube(root,`https://youtu.be/${id}`,{executable:'fixture',runner}),/did not complete/);assert.equal(count,2);
 assert.throws(()=>downloadYouTube(root,`https://youtu.be/${id}`,{executable:'fixture',runner:(_,args)=>({status:0,stdout:args.includes('--version')?'test':''})}),/no completed video/);
});
