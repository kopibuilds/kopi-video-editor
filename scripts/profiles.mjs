import { createHash, randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs';

const MODES = ['full-edit', 'shorts'];
const MAX_PACKAGE = 32 * 1024 * 1024;
const allowed = new Set(['.md', '.txt', '.json', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ttf', '.otf', '.woff2', '.mp3', '.wav', '.m4a', '.mp4']);
const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 64;
const hash = value => createHash('sha256').update(value).digest('hex');
const readJson = file => JSON.parse(readFileSync(file, 'utf8'));
function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error(`Invalid ${label}.`);
}
function safeName(name) {
  if (typeof name !== 'string' || name.length > 240 || isAbsolute(name) || name.includes('\\') || name.includes(':') || name.includes('\0') || name.split('/').some(p => !p || p === '.' || p === '..' || p.endsWith('.') || p.endsWith(' ') || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p))) throw Error('Unsafe profile file path.');
  if (!allowed.has(extname(name).toLowerCase()) || /(^|\/)(auth|credentials?|tokens?|secrets?)(\.|\/|$)/i.test(name)) throw Error('Profiles contain data and assets only; credential/executable files are not allowed.');
  return name;
}
export function validateManifest(manifest) {
  object(manifest, 'profile manifest');
  if (manifest.schemaVersion !== 1 || !slug(manifest.id) || typeof manifest.label !== 'string' || !manifest.label.trim() || manifest.label.length > 160) throw Error('Invalid profile version, id or label.');
  object(manifest.workflows, 'workflow map');
  if (Object.keys(manifest.workflows).length !== 2 || !MODES.every(mode => typeof manifest.workflows[mode] === 'string')) throw Error('Provide separate full-edit and shorts instructions.');
  const names = [safeName(manifest.shared), ...MODES.map(mode => safeName(manifest.workflows[mode]))];
  if (new Set(names).size !== names.length || names.some(n => !n.endsWith('.md'))) throw Error('Shared and workflow instructions must be distinct Markdown files.');
  if (manifest.shows !== undefined) {
    object(manifest.shows, 'show presets');
    for (const [id, show] of Object.entries(manifest.shows)) {
      object(show, 'show preset');
      if (!slug(id) || !Array.isArray(show.workflows) || !show.workflows.length || show.workflows.some(mode => !MODES.includes(mode))) throw Error('Invalid show preset scope.');
      const file = safeName(show.instructions);
      if (!file.endsWith('.md')) throw Error('Show instructions must be Markdown.');
      names.push(file);
    }
  }
  if (manifest.assets !== undefined && !Array.isArray(manifest.assets)) throw Error('Assets must be an array of package-relative file paths.');
  names.push(...(manifest.assets ?? []).map(safeName));
  if (names.some(n => ['profile.json', 'installed.json'].includes(n.toLowerCase()))) throw Error('Profile files cannot replace installer metadata.');
  if (names.length > 256 || new Set(names.map(n => n.toLowerCase())).size !== names.length) throw Error('Duplicate or excessive profile files.');
  return names;
}
function physical(file) {
  let parent = resolve(file); const suffix = [];
  while (!existsSync(parent)) { suffix.unshift(parent.slice(dirname(parent).length + 1)); const next = dirname(parent); if (next === parent) throw Error('Cannot resolve profile destination.'); parent = next; }
  return resolve(realpathSync(parent), ...suffix);
}
function inside(parent, child) { const p = relative(parent, child); return p === '' || (!p.startsWith('..' + sep) && p !== '..' && !isAbsolute(p)); }
function externalHome(root, supplied) {
  const location = physical(supplied ?? process.env.KOPI_PROFILE_HOME ?? join(homedir(), '.kopi', 'profiles'));
  if (inside(physical(root), location)) throw Error('Private profiles must be installed outside the editor repository.');
  return location;
}
function plainFile(root, name) {
  let current = root;
  if (lstatSync(current).isSymbolicLink()) throw Error('Profile source cannot be a symlink.');
  for (const part of safeName(name).split('/')) { current = join(current, part); if (lstatSync(current).isSymbolicLink()) throw Error('Profile files cannot use symlinks.'); }
  if (!lstatSync(current).isFile()) throw Error('Expected a regular profile file.');
  return current;
}
export function packProfile(source) {
  const folder = resolve(source), manifest = readJson(plainFile(folder, 'profile.json'));
  const names = validateManifest(manifest), files = {};
  let size = 0;
  for (const name of names) {
    const bytes = readFileSync(plainFile(folder, name)); size += bytes.length;
    if (size > MAX_PACKAGE) throw Error('Profile exceeds 32 MiB; distribute large reference footage separately.');
    files[name] = { encoding: 'base64', content: bytes.toString('base64') };
  }
  return { format: 'kopi-profile', version: 1, manifest, files };
}
export function unpackProfile(bundle) {
  object(bundle, 'profile package');
  if (bundle.format !== 'kopi-profile' || bundle.version !== 1) throw Error('Unsupported profile package.');
  const names = validateManifest(bundle.manifest); object(bundle.files, 'package files');
  if (Object.keys(bundle.files).length !== names.length || Object.keys(bundle.files).some(n => !names.includes(n))) throw Error('Package files must exactly match the manifest.');
  const files = new Map(); let size = 0;
  for (const name of names) {
    const file = bundle.files[name]; object(file, 'package file');
    if (file.encoding !== 'base64' || typeof file.content !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content)) throw Error('Invalid base64 profile file.');
    const bytes = Buffer.from(file.content, 'base64'); size += bytes.length;
    if (size > MAX_PACKAGE) throw Error('Profile exceeds 32 MiB.');
    files.set(name, bytes);
  }
  return files;
}
export function saveProfilePackage(root, source, output) {
  const bundle = packProfile(source);
  const destination = physical(output ?? join(root, '.kopi', 'profile-packages', `${bundle.manifest.id}.kopi-profile.json`));
  const base = physical(root), rel = relative(base, destination);
  if (inside(base, destination) && !rel.startsWith('.kopi' + sep) && !rel.startsWith('outbox' + sep)) throw Error('Write private packages outside the repository or inside .kopi/outbox.');
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, JSON.stringify(bundle, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return destination;
}
function atomicJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  const temp = file + '.' + randomUUID() + '.tmp';
  writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  renameSync(temp, file);
}
export function installProfile(root, source, { profileHome, activate = false } = {}) {
  const origin = resolve(source);
  if (lstatSync(origin).isSymbolicLink()) throw Error('Profile source cannot be a symlink.');
  if (lstatSync(origin).isFile() && lstatSync(origin).size > MAX_PACKAGE * 1.5) throw Error('Profile package is too large.');
  const bundle = lstatSync(origin).isDirectory() ? packProfile(origin) : readJson(origin);
  const files = unpackProfile(bundle), manifest = bundle.manifest;
  const digest = hash(JSON.stringify(bundle)), storage = externalHome(root, profileHome);
  const directory = join(storage, manifest.id, 'versions', digest);
  if (!inside(storage, physical(directory)) || inside(physical(root), physical(directory))) throw Error('Profile destination escapes its external store.');
  if (existsSync(directory)) {
    verifyInstalled(directory, digest);
  } else {
    mkdirSync(dirname(directory), { recursive: true, mode: 0o700 });
    const staging = directory + '.staging-' + randomUUID(); mkdirSync(staging, { mode: 0o700 });
    for (const [name, bytes] of files) { const file = join(staging, name); mkdirSync(dirname(file), { recursive: true, mode: 0o700 }); writeFileSync(file, bytes, { flag: 'wx', mode: 0o600 }); }
    writeFileSync(join(staging, 'profile.json'), JSON.stringify(manifest, null, 2), { flag: 'wx', mode: 0o600 });
    writeFileSync(join(staging, 'installed.json'), JSON.stringify({ packageHash: digest, manifestHash: hash(JSON.stringify(manifest)), files: Object.fromEntries([...files].map(([n, b]) => [n, hash(b)])) }, null, 2), { flag: 'wx', mode: 0o600 });
    renameSync(staging, directory);
  }
  const pointer = { schemaVersion: 1, profileId: manifest.id, packageHash: digest, profileHome: storage };
  atomicJson(join(storage, manifest.id, 'current.json'), pointer);
  if (activate) atomicJson(join(root, '.kopi', 'team-profile.json'), pointer);
  return { id: manifest.id, label: manifest.label, directory, packageHash: digest, workspaceDefault: activate };
}
function verifyInstalled(directory, digest) {
  const manifest = readJson(plainFile(directory, 'profile.json'));
  const record = readJson(plainFile(directory, 'installed.json'));
  const names = validateManifest(manifest);
  if (record.packageHash !== digest || record.manifestHash !== hash(JSON.stringify(manifest)) || Object.keys(record.files).length !== names.length) throw Error('Installed profile manifest changed; reinstall the approved package.');
  for (const name of names) if (hash(readFileSync(plainFile(directory, name))) !== record.files[name]) throw Error('Installed profile files changed; reinstall from a new package.');
  return manifest;
}
export function selectProfile(root, id, { profileHome } = {}) {
  if (!slug(id)) throw Error('Invalid profile id.');
  const storage = externalHome(root, profileHome), pointer = readJson(join(storage, id, 'current.json'));
  if (pointer.profileId !== id) throw Error('Requested profile identity mismatch.');
  loadPointer(root, pointer);
  atomicJson(join(root, '.kopi', 'team-profile.json'), pointer);
  return { id, workspaceDefault: true };
}
function loadPointer(root, pointer) {
  if (pointer.schemaVersion !== 1 || !slug(pointer.profileId) || !/^[a-f0-9]{64}$/.test(pointer.packageHash ?? '') || typeof pointer.profileHome !== 'string') throw Error('Invalid workspace profile selection.');
  const storage = externalHome(root, pointer.profileHome), directory = join(storage, pointer.profileId, 'versions', pointer.packageHash);
  if (!inside(storage, physical(directory))) throw Error('Profile version escapes its external store.');
  const manifest = verifyInstalled(directory, pointer.packageHash);
  if (manifest.id !== pointer.profileId) throw Error('Profile identity mismatch.');
  return { directory, manifest, packageHash: pointer.packageHash };
}
export function resolveProfile(root, { workflow, show, profileId, profileHome } = {}) {
  if (!MODES.includes(workflow)) throw Error('Choose --workflow full-edit or --workflow shorts; styles are never merged implicitly.');
  let pointer;
  if (profileId) { if (!slug(profileId)) throw Error('Invalid profile id.'); pointer = readJson(join(externalHome(root, profileHome), profileId, 'current.json')); if (pointer.profileId !== profileId) throw Error('Requested profile identity mismatch.'); }
  else { const selection = join(root, '.kopi', 'team-profile.json'); if (!existsSync(selection)) return { installed: false, workflow, show: null, instructions: [], assets: [], message: 'No private profile selected; use the current brief and public workflow guidance.' }; pointer = readJson(selection); }
  const { directory, manifest, packageHash } = loadPointer(root, pointer);
  const names = [manifest.shared, manifest.workflows[workflow]];
  if (show) {
    if (!slug(show) || !Object.hasOwn(manifest.shows ?? {}, show) || !manifest.shows[show].workflows.includes(workflow)) throw Error('Show preset is unknown or unavailable for this workflow.');
    names.push(manifest.shows[show].instructions);
  }
  return { installed: true, id: manifest.id, label: manifest.label, workflow, show: show ?? null, packageHash,
    precedence: ['shared safeguards', 'selected workflow defaults', 'explicit show preset', 'current video brief', 'current user instructions'],
    instructions: names.map(name => ({ file: join(directory, name), text: readFileSync(join(directory, name), 'utf8') })),
    assets: (manifest.assets ?? []).map(name => join(directory, name)) };
}
