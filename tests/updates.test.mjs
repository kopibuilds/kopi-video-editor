import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkForUpdates, updateNotice, WEEK } from '../scripts/updates.mjs';

const oldSha = 'a'.repeat(40), latestSha = 'b'.repeat(40);
const testParent = fileURLToPath(new URL('../.kopi/test-updates/', import.meta.url));
function fixture(t) {
  mkdirSync(testParent, { recursive: true });
  const root = mkdtempSync(join(testParent, 'case-'));
  t.after(() => {
    assert.ok(resolve(root).startsWith(resolve(testParent) + sep));
    rmSync(root, { recursive: true });
  });
  return root;
}
const readInstalled = () => ({ head: oldSha, localChanges: false });

test('a successful check is cached for a week, then runs again', async t => {
  const root = fixture(t); let calls = 0;
  const request = async () => { calls++; return { sha: oldSha }; };
  await checkForUpdates({ root, readInstalled, request, now: 100 });
  const saved = await checkForUpdates({ root, readInstalled, request, now: 101 });
  assert.equal(saved.cached, true);
  assert.equal(calls, 1);
  await checkForUpdates({ root, readInstalled, request, now: 100 + WEEK });
  assert.equal(calls, 2);
});

test('available updates produce a permission notice without changing source files', async t => {
  const root = fixture(t); const urls = [];
  writeFileSync(join(root, 'engine.json'), 'original engine');
  writeFileSync(join(root, 'recording.mp4'), 'private recording');
  const result = await checkForUpdates({ root, readInstalled, now: 100, request: async url => {
    urls.push(url);
    return urls.length === 1 ? { sha: latestSha } : { status: 'ahead', ahead_by: 2,
      commits: [{ commit: { message: 'Improve captions\nDetails' } }], files: [{ filename: 'engine.json' }] };
  }});
  assert.equal(result.status, 'available');
  assert.equal(result.engineChange, true);
  assert.equal(result.commitCount, 2);
  assert.match(updateNotice(result), /Ask the user whether to update/);
  assert.match(updateNotice(result), /No update has been installed/);
  assert.equal(readFileSync(join(root, 'engine.json'), 'utf8'), 'original engine');
  assert.equal(readFileSync(join(root, 'recording.mp4'), 'utf8'), 'private recording');
  assert.deepEqual(urls, [
    'https://api.github.com/repos/kopibuilds/kopi-video-editor/commits/main',
    `https://api.github.com/repos/kopibuilds/kopi-video-editor/compare/${oldSha}...${latestSha}`,
  ]);
});

test('offline failures are nonfatal and throttled, with a manual retry option', async t => {
  const root = fixture(t); let calls = 0;
  const request = async () => { calls++; throw new Error('offline'); };
  const result = await checkForUpdates({ root, readInstalled, request, now: 100 });
  assert.equal(result.status, 'unavailable');
  assert.equal(updateNotice(result, true), '');
  await checkForUpdates({ root, readInstalled, request, now: 101 });
  assert.equal(calls, 1);
  await checkForUpdates({ root, readInstalled, request, now: 102, force: true });
  assert.equal(calls, 2);
});

test('a changed installed commit invalidates the saved check', async t => {
  const root = fixture(t); let calls = 0;
  const request = async () => { calls++; return { sha: latestSha }; };
  await checkForUpdates({ root, readInstalled: () => ({ head: latestSha }), request, now: 100 });
  await checkForUpdates({ root, readInstalled: () => ({ head: oldSha }),
    request: async () => { calls++; throw new Error('offline'); }, now: 101 });
  assert.equal(calls, 2);
});

test('diverged histories are not presented as a safe update', async t => {
  const root = fixture(t); let calls = 0;
  const result = await checkForUpdates({ root, readInstalled, request: async () =>
    ++calls === 1 ? { sha: latestSha } : { status: 'diverged' } });
  assert.equal(result.status, 'diverged');
  assert.match(updateNotice(result), /No automatic update is safe/);
});

test('ZIP copies or other remotes do not make update requests', async t => {
  let called = false;
  const result = await checkForUpdates({ root: fixture(t), readInstalled: () => { throw new Error('no checkout'); },
    request: async () => { called = true; } });
  assert.equal(result.status, 'unavailable');
  assert.equal(called, false);
});

test('cached update notices do not repeatedly interrupt normal commands', () => {
  assert.equal(updateNotice({ status: 'available', cached: true }, true), '');
});

test('damaged cache data does not block checking or editing', async t => {
  const root = fixture(t);
  mkdirSync(join(root, '.kopi'));
  for (const value of ['null', '[]', '{broken json']) {
    writeFileSync(join(root, '.kopi', 'update-status.json'), value);
    const result = await checkForUpdates({ root, readInstalled, request: async () => ({ sha: oldSha }), now: 100 });
    assert.equal(result.status, 'current');
    assert.equal(result.cached, false);
  }
});
