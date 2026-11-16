import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { downloaderAsset, ensureDownloader } from '../scripts/dependencies.mjs';

const parent = resolve('.kopi/test-dependencies');
function fixture(t) {
  mkdirSync(parent, { recursive: true }); const root = mkdtempSync(join(parent, 'case-'));
  t.after(() => { assert.ok(resolve(root).startsWith(parent + sep)); rmSync(root, { recursive: true }); });
  return root;
}
function missing() { throw Error('missing fixture downloader'); }
function downloads(bytes = Buffer.from('test binary'), badChecksum = false) {
  return async url => {
    if (url.endsWith('/latest')) return Buffer.from(JSON.stringify({ tag_name: '2026.11.01', assets: [{ name: 'yt-dlp.exe', browser_download_url: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.11.01/yt-dlp.exe' }] }));
    if (url.endsWith('SHA2-256SUMS')) return Buffer.from(`${badChecksum ? '0'.repeat(64) : createHash('sha256').update(bytes).digest('hex')}  yt-dlp.exe\n`);
    return bytes;
  };
}
const options = { platform: 'win32', arch: 'x64', find: missing, log() {} };
test('existing downloader is reused without network or filesystem installation', async t => {
  const root = fixture(t); const tool = await ensureDownloader(root, { find: () => ({ program: 'existing', version: 'known' }), request() { throw Error('must not download'); } });
  assert.equal(tool.installed, false); assert.equal(tool.program, 'existing'); assert.equal(existsSync(join(root, '.kopi')), false);
});
test('official build selection covers Windows and both kinds of Mac', () => {
  assert.equal(downloaderAsset('win32', 'arm64'), 'yt-dlp_arm64.exe');
  assert.equal(downloaderAsset('darwin', 'arm64'), 'yt-dlp_macos');
  assert.equal(downloaderAsset('darwin', 'x64'), 'yt-dlp_macos');
  assert.equal(downloaderAsset('linux', 'arm64'), 'yt-dlp_linux_aarch64');
  assert.throws(() => downloaderAsset('unknown', 'x64'), /unavailable/);
});
test('missing downloader is checksum-verified, run-checked and installed locally', async t => {
  const root = fixture(t); const tool = await ensureDownloader(root, { ...options, request: downloads(), runner: () => ({ status: 0, stdout: '2026.11.01\n' }) });
  assert.equal(tool.installed, true); assert.equal(readFileSync(tool.program, 'utf8'), 'test binary');
  assert.deepEqual(readdirSync(join(root, '.kopi/tools')), ['yt-dlp.exe']);
});
test('checksum failure never executes or installs the downloaded bytes', async t => {
  const root = fixture(t); await assert.rejects(ensureDownloader(root, { ...options, request: downloads(undefined, true), runner() { throw Error('must not execute'); } }), /checksum mismatch/);
  assert.deepEqual(readdirSync(join(root, '.kopi/tools')), []);
});
test('execution or network failures remain failures and preserve existing local files', async t => {
  const root = fixture(t);
  await assert.rejects(ensureDownloader(root, { ...options, request: downloads(), runner: () => ({ status: 1 }) }), /could not run/);
  assert.deepEqual(readdirSync(join(root, '.kopi/tools')), []);
  await assert.rejects(ensureDownloader(root, { ...options, request: async () => { throw Error('offline'); } }), /offline/);
  const local = join(root, '.kopi/tools/yt-dlp.exe'); writeFileSync(local, 'preserve');
  await assert.rejects(ensureDownloader(root, { ...options, request() { throw Error('must not download'); } }), /Inspect it/);
  assert.equal(readFileSync(local, 'utf8'), 'preserve');
});
