import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyApprovedUpdate, runUpdateGit } from '../scripts/updates.mjs';

const parent=fileURLToPath(new URL('../.kopi/test-update-install/',import.meta.url));
function fixture(t){
  mkdirSync(parent,{recursive:true});const dir=mkdtempSync(join(parent,'case-'));
  t.after(()=>{assert.ok(resolve(dir).startsWith(resolve(parent)+sep));rmSync(dir,{recursive:true,force:true})});
  const seed=join(dir,'seed'),remote=join(dir,'remote.git'),root=join(dir,'editor');
  mkdirSync(seed);mkdirSync(remote);
  const git=(where,args)=>{const r=runUpdateGit(where,args);assert.equal(r.status,0,r.stderr);return r.stdout};
  git(remote,['init','--bare']);git(seed,['init','--initial-branch=main']);
  writeFileSync(join(seed,'engine.json'),'{}\n');writeFileSync(join(seed,'tool.txt'),'version one');writeFileSync(join(seed,'.gitignore'),'.kopi/\ninbox/\noutbox/\n');
  function commit(where,message){git(where,['add','.']);git(where,['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m',message]);return git(where,['rev-parse','HEAD'])}
  commit(seed,'Initial');git(seed,['push',remote,'main']);git(dir,['clone','--branch','main',remote,root]);
  git(root,['remote','set-url','origin','https://github.com/kopibuilds/kopi-video-editor.git']);
  const commands=[];
  const runner=(where,args)=>{commands.push(args);const safe=['-c','user.name=','-c','user.email=',...args];if(args[0]==='fetch')safe[safe.indexOf('https://github.com/kopibuilds/kopi-video-editor.git')]=remote;return runUpdateGit(where,safe)};
  const publish=(file,content)=>{writeFileSync(join(seed,file),content);const sha=commit(seed,'Update');git(seed,['push',remote,'main']);return sha};
  return{dir,root,seed,git,runner,commands,commit,publish};
}
test('approved update fast-forwards without author identity or creating a commit',t=>{
  const f=fixture(t);const target=f.publish('tool.txt','version two');
  mkdirSync(join(f.root,'inbox'));writeFileSync(join(f.root,'inbox','private.txt'),'private sentinel');
  const beforeCount=f.git(f.root,['rev-list','--count','HEAD']);
  const result=applyApprovedUpdate({root:f.root,git:f.runner});
  assert.equal(result.status,'updated');assert.equal(result.installed,target);
  assert.equal(readFileSync(join(f.root,'tool.txt'),'utf8'),'version two');assert.equal(readFileSync(join(f.root,'inbox','private.txt'),'utf8'),'private sentinel');
  assert.equal(Number(f.git(f.root,['rev-list','--count','HEAD'])),Number(beforeCount)+1);
  assert.deepEqual(f.commands.find(a=>a[0]==='merge'),['merge','--ff-only','--no-edit','--no-autostash',target]);
  assert.ok(f.commands.every(a=>!['commit','stash','rebase','push','config','reset','clean','checkout'].includes(a[0])));
  const again=applyApprovedUpdate({root:f.root,git:f.runner});assert.equal(again.status,'current');
});
test('dirty files stop before fetching and are not committed or stashed',t=>{
  const f=fixture(t),before=f.git(f.root,['rev-parse','HEAD']);writeFileSync(join(f.root,'tool.txt'),'local edit');
  assert.throws(()=>applyApprovedUpdate({root:f.root,git:f.runner}),/local code changes/i);
  assert.equal(readFileSync(join(f.root,'tool.txt'),'utf8'),'local edit');assert.equal(f.git(f.root,['rev-parse','HEAD']),before);
  assert.ok(!f.commands.some(a=>a[0]==='fetch'||a[0]==='merge'));
});
test('diverged history and engine upgrades stop without changing local HEAD',t=>{
  const f=fixture(t);writeFileSync(join(f.root,'local.txt'),'local');const local=f.commit(f.root,'Local change');f.publish('tool.txt','published change');
  assert.throws(()=>applyApprovedUpdate({root:f.root,git:f.runner}),/ahead or diverged/);
  assert.equal(f.git(f.root,['rev-parse','HEAD']),local);assert.ok(!f.commands.some(a=>a[0]==='merge'));
  const g=fixture(t),before=g.git(g.root,['rev-parse','HEAD']);g.publish('engine.json','{"revision":"new-engine"}');
  assert.throws(()=>applyApprovedUpdate({root:g.root,git:g.runner}),/Herk engine changes/);assert.equal(g.git(g.root,['rev-parse','HEAD']),before);
});
test('detached checkouts and wrong remotes never fetch or mutate history',t=>{
  const f=fixture(t);f.git(f.root,['checkout','--detach']);assert.throws(()=>applyApprovedUpdate({root:f.root,git:f.runner}),/detached HEAD/);assert.ok(!f.commands.some(a=>a[0]==='fetch'));
  const g=fixture(t);g.git(g.root,['remote','set-url','origin','https://example.invalid/other.git']);assert.throws(()=>applyApprovedUpdate({root:g.root,git:g.runner}),/not the official/);assert.ok(!g.commands.some(a=>a[0]==='fetch'));
});
test('a failed fetch preserves the checkout and never requests an author',t=>{
  const f=fixture(t),before=f.git(f.root,['rev-parse','HEAD']);
  const runner=(root,args)=>args[0]==='fetch'?{status:1,stdout:'',stderr:'offline'}:f.runner(root,args);
  assert.throws(()=>applyApprovedUpdate({root:f.root,git:runner}),/offline/);assert.equal(f.git(f.root,['rev-parse','HEAD']),before);assert.ok(!f.commands.some(a=>a[0]==='merge'));
});
