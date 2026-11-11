import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installProfile, packProfile, resolveProfile, saveProfilePackage, selectProfile, unpackProfile } from '../scripts/profiles.mjs';

const parent = fileURLToPath(new URL('../.kopi/test-profiles/', import.meta.url));
function fixture(t) {
  mkdirSync(parent, { recursive: true }); const folder = mkdtempSync(join(parent, 'case-'));
  t.after(() => { assert.ok(resolve(folder).startsWith(resolve(parent) + sep)); rmSync(folder, { recursive: true }); });
  const root = join(folder, 'editor'), source = join(folder, 'package'), profileHome = join(folder, 'private');
  mkdirSync(root); mkdirSync(source);
  const manifest = { schemaVersion: 1, id: 'fictional-studio', label: 'Fictional Studio', shared: 'shared.md', workflows: { 'full-edit': 'full.md', shorts: 'shorts.md' }, shows: { interview: { instructions: 'show.md', workflows: ['shorts'] } }, assets: ['assets/mark.svg'] };
  mkdirSync(join(source, 'assets'));
  writeFileSync(join(source, 'profile.json'), JSON.stringify(manifest));
  for (const [name, text] of Object.entries({ 'shared.md': 'Preserve approved wording.', 'full.md': 'Full edit: optional explainer graphics.', 'shorts.md': 'Shorts: neutral captions and selected excerpt.', 'show.md': 'Explicit interview identification.', 'assets/mark.svg': '<svg xmlns="http://www.w3.org/2000/svg"><rect width="2" height="2"/></svg>' })) writeFileSync(join(source, name), text);
  return { folder, root, source, profileHome, manifest };
}
test('installation resolves only the chosen workflow and explicit show, outside the checkout', t => {
  const f = fixture(t); const installed = installProfile(f.root, f.source, { profileHome: f.profileHome, activate: true });
  assert.ok(installed.directory.startsWith(f.profileHome + sep));
  const full = resolveProfile(f.root, { workflow: 'full-edit' });
  assert.deepEqual(full.instructions.map(i => i.text), ['Preserve approved wording.', 'Full edit: optional explainer graphics.']);
  const shorts = resolveProfile(f.root, { workflow: 'shorts', show: 'interview' });
  assert.equal(shorts.instructions.length, 3); assert.match(shorts.instructions[1].text, /^Shorts:/);
  assert.throws(() => resolveProfile(f.root, { workflow: 'full-edit', show: 'interview' }), /unavailable/);
  assert.throws(() => resolveProfile(f.root, {}), /Choose --workflow/);
  assert.equal(readFileSync(shorts.assets[0], 'utf8'), readFileSync(join(f.source, 'assets/mark.svg'), 'utf8'));
});
test('a workspace pins its chosen version until explicitly updated or switched', t => {
  const f = fixture(t), first = installProfile(f.root, f.source, { profileHome: f.profileHome, activate: true });
  writeFileSync(join(f.source, 'shorts.md'), 'Shorts: revised private default.');
  const second = installProfile(f.root, f.source, { profileHome: f.profileHome });
  assert.notEqual(first.packageHash, second.packageHash);
  assert.match(resolveProfile(f.root, { workflow: 'shorts' }).instructions[1].text, /selected excerpt/);
  selectProfile(f.root, f.manifest.id, { profileHome: f.profileHome });
  assert.match(resolveProfile(f.root, { workflow: 'shorts' }).instructions[1].text, /revised private/);
  assert.match(readFileSync(join(first.directory, 'shorts.md'), 'utf8'), /selected excerpt/);
});
test('a portable package installs without executing or fetching anything', t => {
  const f = fixture(t), output = join(f.folder, 'team.kopi-profile.json');
  saveProfilePackage(f.root, f.source, output);
  const result = installProfile(f.root, output, { profileHome: f.profileHome, activate: true });
  assert.equal(result.id, f.manifest.id);
  assert.match(resolveProfile(f.root, { workflow: 'shorts' }).instructions[1].text, /Shorts:/);
  assert.throws(() => saveProfilePackage(f.root, f.source, output), /EEXIST/);
  assert.throws(() => saveProfilePackage(f.root, f.source, join(f.root, 'public-package.json')), /outside/);
});
test('unsafe paths, extra files, merged modes and credential-shaped files are rejected', t => {
  const f = fixture(t), original = packProfile(f.source);
  for (const name of ['../escape.md', 'C:/outside.md', 'a\\b.md', 'a/../../outside.md', 'assets/auth.json', 'installed.json', 'assets/con.png']) {
    const bundle = structuredClone(original); bundle.manifest.assets = [name];
    assert.throws(() => unpackProfile(bundle));
  }
  const extra = structuredClone(original); extra.files['run.mjs'] = { encoding: 'base64', content: Buffer.from('bad').toString('base64') };
  assert.throws(() => unpackProfile(extra), /exactly match/);
  const merged = structuredClone(original); merged.manifest.workflows.shorts = merged.manifest.workflows['full-edit'];
  assert.throws(() => unpackProfile(merged), /distinct/);
});
test('private installation inside the editor is refused, including destination junctions', t => {
  const f = fixture(t);
  assert.throws(() => installProfile(f.root, f.source, { profileHome: join(f.root, '.kopi/private') }), /outside/);
  mkdirSync(f.profileHome); const inside = join(f.root, 'exposed'); mkdirSync(inside);
  try { symlinkSync(inside, join(f.profileHome, f.manifest.id), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (e) { if (['EPERM', 'EACCES'].includes(e.code)) return t.skip('Creating test junction is not permitted.'); throw e; }
  assert.throws(() => installProfile(f.root, f.source, { profileHome: f.profileHome }), /escapes/);
});
test('source symlinks are refused before reading their contents', t => {
  const f = fixture(t), link = join(f.folder, 'source-link');
  try { symlinkSync(f.source, link, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (e) { if (['EPERM', 'EACCES'].includes(e.code)) return t.skip('Creating test junction is not permitted.'); throw e; }
  assert.throws(() => packProfile(link), /symlink/);
});
test('changed installed instructions fail verification instead of silently changing style', t => {
  const f = fixture(t), result = installProfile(f.root, f.source, { profileHome: f.profileHome, activate: true });
  writeFileSync(join(result.directory, 'shorts.md'), 'Unexpected edit');
  assert.throws(() => resolveProfile(f.root, { workflow: 'shorts' }), /changed/);
});
test('an explicit profile id cannot silently select another client', t => {
  const f = fixture(t); installProfile(f.root, f.source, { profileHome: f.profileHome });
  mkdirSync(join(f.profileHome, 'other-client'));
  writeFileSync(join(f.profileHome, 'other-client/current.json'), readFileSync(join(f.profileHome, f.manifest.id, 'current.json')));
  assert.throws(() => selectProfile(f.root, 'other-client', { profileHome: f.profileHome }), /identity mismatch/);
  assert.throws(() => resolveProfile(f.root, { workflow: 'shorts', profileId: 'other-client', profileHome: f.profileHome }), /identity mismatch/);
});
test('no selected profile leaves strangers on the public guidance', t => {
  const f = fixture(t), result = resolveProfile(f.root, { workflow: 'shorts' });
  assert.equal(result.installed, false); assert.deepEqual(result.instructions, []);
});
test('cold-install CLI installs a supplied package and reads two separate workflows without an engine', t => {
  const f = fixture(t), sourceRoot = fileURLToPath(new URL('../', import.meta.url));
  mkdirSync(join(f.root, 'scripts'));
  for (const file of ['kopi.mjs', 'engine.json', 'scripts/profiles.mjs', 'scripts/youtube.mjs', 'scripts/updates.mjs']) copyFileSync(join(sourceRoot, file), join(f.root, file));
  const bundle = join(f.folder, 'team.kopi-profile.json'); saveProfilePackage(f.root, f.source, bundle);
  const cli = args => spawnSync(process.execPath, [join(f.root, 'kopi.mjs'), ...args], { encoding: 'utf8' });
  const installed = cli(['profile', 'install', bundle, '--profile-home', f.profileHome, '--default']);
  assert.equal(installed.status, 0, installed.stderr);
  const full = cli(['profile', 'show', '--workflow', 'full-edit']), shorts = cli(['profile', 'show', '--workflow', 'shorts']);
  assert.equal(full.status, 0, full.stderr); assert.equal(shorts.status, 0, shorts.stderr);
  assert.match(JSON.parse(full.stdout).instructions[1].text, /^Full edit:/);
  assert.match(JSON.parse(shorts.stdout).instructions[1].text, /^Shorts:/);
  assert.equal(cli(['profile', 'show']).status, 1);
});
