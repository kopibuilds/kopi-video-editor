import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildImageEditor } from '../scripts/image-editor.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9ioAAAAASUVORK5CYII=','base64');
function fixture(run) {
  const dir=mkdtempSync(join(tmpdir(),'kopi-image-editor-'));
  try {
    writeFileSync(join(dir,'source.png'),pixel);
    const page={width:1200,height:630,title:'Thumbnail',images:[{id:'photo',path:'source.png',w:1200,h:630}],texts:[{id:'headline',text:'Editable headline',x:40,y:400,w:1120,size:64}]};
    const manifest=join(dir,'design.json');
    const save=pages=>writeFileSync(manifest,JSON.stringify({version:1,pages}));
    save([page]);run({dir,page,manifest,save});
  } finally {rmSync(dir,{recursive:true,force:true})}
}
test('image-editor CLI builds an offline editor at the requested size without an engine',()=>fixture(({dir,manifest})=>{
  const output=join(dir,'editor.html');
  const result=spawnSync(process.execPath,[join(root,'kopi.mjs'),'image-editor',manifest,'--output',output],{encoding:'utf8',env:{...process.env,KOPI_ENGINE_HOME:join(dir,'no-engine')}});
  assert.equal(result.status,0,result.stderr);
  const html=readFileSync(output,'utf8');
  assert.match(html,/"width":1200,"height":630/);
  assert.match(html,/data:image\/png;base64/);
  assert.match(html,/Editable headline/);
  assert.doesNotMatch(html,/__EDITOR_PROJECT__|__STORAGE_KEY__|https?:\/\//);
}));
test('multi-design output embeds separate editors and escapes text as data',()=>fixture(({dir,manifest,page,save})=>{
  page.texts[0].text='</script><script>window.UNSAFE=true</script> $&';
  save([page,{...page,title:'Poster',width:1080,height:1350,images:[],texts:[{id:'poster',text:'A separate design'}]}]);
  const result=buildImageEditor(manifest,join(dir,'set.html'));
  const html=readFileSync(result.path,'utf8');
  assert.equal(result.pages,2);assert.match(html,/Choose design/);assert.match(html,/\\u003c/);
  assert.doesNotMatch(html,/<script>window.UNSAFE/);
  assert.match(html,/A separate design/);assert.match(html,/\$&/);
}));
test('input files and existing outputs are preserved',()=>fixture(({dir,manifest})=>{
  const before=readFileSync(manifest);const output=join(dir,'existing.html');writeFileSync(output,'sentinel');
  assert.throws(()=>buildImageEditor(manifest,output),/EEXIST/);
  assert.equal(readFileSync(output,'utf8'),'sentinel');assert.deepEqual(readFileSync(manifest),before);
  assert.throws(()=>buildImageEditor(manifest,manifest),/HTML/);
}));
test('flattened-only designs, network assets, invalid geometry and duplicate layers fail',()=>fixture(({dir,manifest,page,save})=>{
  for(const invalid of [
    {...page,texts:[]},
    {...page,images:[{id:'photo',path:'https://example.test/image.png'}]},
    {...page,images:[{id:'photo',path:'\\\\server\\share\\image.png'}]},
    {...page,images:[{id:'photo',path:'source.png',x:1190,w:100}]},
    {...page,width:Infinity},
    {...page,texts:[...page.texts,...page.texts]},
    {...page,texts:[{id:'__proto__',text:'bad'}]},
    {...page,images:[{id:'toString',path:'source.png'}]}
  ]){save([invalid]);assert.throws(()=>buildImageEditor(manifest,join(dir,'bad.html')))}
  writeFileSync(join(dir,'not-an-image.txt'),'not an image');save([{...page,images:[{path:'not-an-image.txt'}]}]);
  assert.throws(()=>buildImageEditor(manifest,join(dir,'bad.html')),/supported/);
}));
