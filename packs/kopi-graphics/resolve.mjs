import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const plainFile=p=>fs.existsSync(p)&&fs.lstatSync(p).isFile()&&!fs.lstatSync(p).isSymbolicLink();
const slug=s=>typeof s==='string'&&/^[a-z0-9][a-z0-9_-]{0,79}$/.test(s);
export function settingsPath(root,brand){if(!slug(brand))throw Error('Brand/project ID must be a lowercase slug.');return path.join(root,'.kopi/graphics/settings',brand+'.json')}
export function discoverPrivate(root){
 const base=path.join(root,'.kopi/packs'),found=[];
 if(!fs.existsSync(base))return found;
 // Only the dedicated pack directory is inspected; no credential stores or profiles.
 for(const e of fs.readdirSync(base,{withFileTypes:true})){if(!e.isDirectory()||e.isSymbolicLink())continue;
  const parent=path.join(base,e.name),dirs=[parent,...fs.readdirSync(parent,{withFileTypes:true}).filter(d=>d.isDirectory()&&!d.isSymbolicLink()).map(d=>path.join(parent,d.name))];
  for(const dir of dirs){const manifest=path.join(dir,'pack.json'),skill=path.join(dir,'SKILL.md');
   if(plainFile(manifest)){const p=read(manifest);if(p.visibility==='private'){if(typeof p.id!=='string'||!Array.isArray(p.brands||[])||!Array.isArray(p.formats||[]))throw Error('Invalid private pack metadata; confirm it before fallback.');found.push({id:p.id,version:p.version||path.basename(dir),brands:p.brands||[],formats:p.formats||[],skill:plainFile(skill)?skill:null,path:dir});}}
   else if(plainFile(skill)){const text=fs.readFileSync(skill,'utf8');if(/private/i.test(text.slice(0,1200))){const name=text.match(/^name:\s*(.+)$/m)?.[1].trim();found.push({id:name||e.name,version:path.basename(dir),brands:[],formats:[],skill,path:dir,legacy:true})}}
  }
 }
 // Old versions of one pack do not become several competing brands.
 const wrappers=[];const skillRoot=path.join(root,'.agents/skills');
 if(fs.existsSync(skillRoot))for(const e of fs.readdirSync(skillRoot,{withFileTypes:true})){if(!e.isDirectory()||e.isSymbolicLink())continue;const p=path.join(skillRoot,e.name,'SKILL.md');if(plainFile(p))wrappers.push(fs.readFileSync(p,'utf8').replaceAll('\\','/'));}
 const active=found.filter(p=>wrappers.some(w=>w.includes(p.path.replaceAll('\\','/')+'/SKILL.md')));
 const chosen=new Map();for(const p of found){if(active.some(a=>a.id===p.id)&&!active.includes(p))continue;const previous=chosen.get(p.id);if(previous&&previous.path!==p.path&&!active.includes(p))p.ambiguousVersion=true;chosen.set(p.id,p)}
 return [...chosen.values()];
}
export function resolveGraphics({root,brand,format='carousel',explicitPack,privatePacks}){
 root=path.resolve(root);const file=settingsPath(root,brand),saved=fs.existsSync(file)?read(file):null;
 const packs=privatePacks??discoverPrivate(root),selection=saved?.outputs?.[format]?.privatePack??saved?.privatePack;
 const matching=packs.filter(p=>p.brands.includes(brand)&&p.formats.includes(format));
 const selected=packs.find(p=>p.id===(explicitPack||selection));
 const ready=saved?.outputs?saved.outputs[format]?.setupComplete===true:saved?.setupComplete===true;
 if(explicitPack==='kopi-graphics')return {route:ready?'public':'setup',settings:saved,file,reason:'Explicit current request selects generic graphics.'};
 if(selected?.ambiguousVersion)return {route:'confirm-private-scope',candidates:[selected],file,reason:'Private pack version is ambiguous; ask which installed version to use.'};
 if(selected&&(selected.legacy||selected.formats.includes(format)))return {route:'private',pack:selected,settings:saved,file,reason:'Selected private pack takes precedence.'};
 if(explicitPack&&explicitPack!=='kopi-graphics')throw Error('Requested private pack is unavailable for this format.');
 if(selection&&!selected)return {route:'missing-private',file,reason:'Selected private pack is missing; ask before any fallback.'};
 if(matching.some(p=>p.ambiguousVersion))return {route:'confirm-private-scope',candidates:matching,file,reason:'Confirm the active private pack version before building.'};
 if(matching.length===1)return {route:'private',pack:matching[0],settings:saved,file,reason:'Matching private pack overrides generic settings, regardless of install order.'};
 if(matching.length>1)return {route:'choose-private',candidates:matching,file,reason:'Several matching private packs; ask which one.'};
 const unknown=packs.filter(p=>p.legacy||!p.brands.length||!p.formats.length);
 const dismissed=saved?.outputs?.[format]?.unrelatedPrivatePacks??saved?.unrelatedPrivatePacks??[];
 const unresolved=unknown.filter(p=>!dismissed.includes(p.id));
 if(unresolved.length)return {route:'confirm-private-scope',candidates:unresolved,file,reason:'Legacy/private scope is unknown. Ask whether it applies before generic setup; do not overwrite it.'};
 return {route:ready?'public':'setup',settings:saved,file,reason:ready?'Reuse confirmed generic settings.':'No applicable confirmed settings for this output; run setup.'};
}
export function saveSettings(root,brand,value,{replace=false}={}){
 const file=settingsPath(path.resolve(root),brand);fs.mkdirSync(path.dirname(file),{recursive:true});
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Settings must be an object.');
 fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:replace?'w':'wx'});return file;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const a=process.argv.slice(2),arg=(key,fallback)=>a.includes(key)?a[a.indexOf(key)+1]:fallback;
 if(a.includes('--save')){const input=read(arg('--save'));console.log(saveSettings(arg('--kopi','.'),arg('--brand'),input,{replace:a.includes('--replace')}));}
 else console.log(JSON.stringify(resolveGraphics({root:arg('--kopi','.'),brand:arg('--brand'),format:arg('--format','carousel'),explicitPack:arg('--pack')}),null,2));
 }catch(e){console.error(e.message);process.exitCode=1}
}
