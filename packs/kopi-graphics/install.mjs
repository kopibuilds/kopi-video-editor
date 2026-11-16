import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const SOURCE=path.dirname(fileURLToPath(import.meta.url));
export function install(root,source=SOURCE){
 root=fs.realpathSync(path.resolve(root));if(!fs.existsSync(path.join(root,'kopi.mjs')))throw Error('Target must be a Kopi checkout.');
 const collect=(dir,prefix='')=>fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{if(e.isSymbolicLink())throw Error('Symlinks are unsupported.');const rel=path.join(prefix,e.name);return e.isDirectory()?collect(path.join(dir,e.name),rel):[rel]});
 const files=collect(source),hash=createHash('sha256');for(const f of files){hash.update(f.replaceAll('\\','/'));hash.update(fs.readFileSync(path.join(source,f)))}
 const version=hash.digest('hex').slice(0,16),destination=path.join(root,'.kopi/packs/kopi-graphics',version);
 if(destination.startsWith(source+path.sep))throw Error('Target must not be inside the source pack.');
 const result=spawnSync('git',['rev-parse','--git-path','info/exclude'],{cwd:root,encoding:'utf8',windowsHide:true});if(result.status!==0)throw Error('Cannot verify local Git exclusions.');
 const excluded=['/.agents/skills/kopi-graphics/','/.claude/skills/kopi-graphics/','/.kopi/'],excludeFile=path.resolve(root,result.stdout.trim());
 // A tracked built-in entry belongs to Kopi updates; do not rewrite it during ZIP installation.
 const wrappers=['.agents','.claude'].map(d=>path.join(root,d,'skills/kopi-graphics/SKILL.md'));
 const writable=[];
 for(const wrapper of wrappers){const rel=path.relative(root,wrapper),tracked=spawnSync('git',['ls-files','--error-unmatch','--',rel],{cwd:root,windowsHide:true,stdio:'ignore'}).status===0;if(tracked)continue;
 if(fs.existsSync(wrapper)&&!fs.readFileSync(wrapper,'utf8').includes('<!-- KOPI GENERIC GRAPHICS PACK -->'))throw Error('Unrelated existing skill; refusing to overwrite.');writable.push(wrapper)}
 fs.mkdirSync(path.dirname(excludeFile),{recursive:true});let exclusions=fs.existsSync(excludeFile)?fs.readFileSync(excludeFile,'utf8'):'';for(const p of excluded)if(!exclusions.split(/\r?\n/).includes(p))exclusions+='\n'+p+'\n';fs.writeFileSync(excludeFile,exclusions);
 for(const wrapper of writable){const r=spawnSync('git',['check-ignore','--quiet',path.relative(root,wrapper)],{cwd:root,windowsHide:true});if(r.status!==0)throw Error('Exclusions did not take effect.');}
 if(!fs.existsSync(destination)){fs.mkdirSync(destination,{recursive:true});for(const f of files){const target=path.join(destination,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(source,f),target,fs.constants.COPYFILE_EXCL)}}
 for(const wrapper of writable){fs.mkdirSync(path.dirname(wrapper),{recursive:true});fs.writeFileSync(wrapper,`---\nname: kopi-graphics\ndescription: Create configurable social-card, photo-panel, quote and infographic designs from a topic or final copy. Use a matching private pack first; video-source requests retain their own workflow unless this style is selected.\n---\n<!-- KOPI GENERIC GRAPHICS PACK -->\nRead ${destination.replaceAll('\\','/')}/SKILL.md. Resolve matching private settings before generic setup.\n`)}
 // Existing settings and every other pack are deliberately untouched.
 return destination;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const args=process.argv.slice(2),i=args.indexOf('--kopi');if(i<0||!args[i+1])throw Error('Usage: node install.mjs --kopi "/path/to/Kopi"');console.log(install(args[i+1]))}catch(e){console.error(e.message);process.exitCode=1}}
