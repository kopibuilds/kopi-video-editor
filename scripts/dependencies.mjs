import { createHash, randomUUID } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { findDownloader } from './youtube.mjs';

const RELEASE = 'https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest';
const MAX_BYTES = 150 * 1024 * 1024;

export function downloaderAsset(platform = process.platform, arch = process.arch) {
  if (platform === 'darwin' && ['x64', 'arm64'].includes(arch)) return 'yt-dlp_macos';
  if (platform === 'win32') return { x64: 'yt-dlp.exe', arm64: 'yt-dlp_arm64.exe', ia32: 'yt-dlp_x86.exe' }[arch] ?? unsupported();
  if (platform === 'linux') return { x64: 'yt-dlp_linux', arm64: 'yt-dlp_linux_aarch64' }[arch] ?? unsupported();
  return unsupported();
  function unsupported() { throw Error(`Automatic yt-dlp installation is unavailable for ${platform}/${arch}. Install the official package, then rerun dependencies.`); }
}

async function readPublic(url, limit = MAX_BYTES) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Kopi-Video-Editor-Dependencies' },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw Error(`Official yt-dlp download failed (HTTP ${response.status}).`);
  const chunks = []; let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) { throw Error('Official yt-dlp response exceeds the size limit.'); }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function ensureDownloader(root, { platform = process.platform, arch = process.arch,
  find = findDownloader, request = readPublic, runner = spawnSync, log = console.log } = {}) {
  try { return { ...find(root), installed: false }; } catch (error) {
    if (process.env.KOPI_YT_DLP) throw Error(`Configured KOPI_YT_DLP is unavailable. Fix that path before installing: ${error.message}`);
  }
  const asset = downloaderAsset(platform, arch);
  const tools = join(resolve(root), '.kopi', 'tools');
  let parent = tools;
  while (!existsSync(parent)) parent = dirname(parent);
  const parentRel = relative(realpathSync(root), realpathSync(parent));
  if (parentRel === '..' || parentRel.startsWith('..' + sep) || isAbsolute(parentRel)) throw Error('Dependency directory must remain inside the editor workspace.');
  mkdirSync(tools, { recursive: true });
  const rel = relative(realpathSync(root), realpathSync(tools));
  if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) throw Error('Dependency directory must remain inside the editor workspace.');
  const target = join(tools, platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  if (existsSync(target)) throw Error(`An existing local downloader cannot run: ${target}. Inspect it before replacing it.`);
  log('Installing required YouTube downloader from the official yt-dlp release into .kopi/tools. No system installation or sign-in.');
  const release = JSON.parse((await request(RELEASE, 4 * 1024 * 1024)).toString());
  if (!/^\d{4}\.\d{2}\.\d{2}(?:\.[\w.-]+)?$/.test(release.tag_name ?? '')) throw Error('Invalid official yt-dlp release tag.');
  const prefix = `https://github.com/yt-dlp/yt-dlp/releases/download/${release.tag_name}/`;
  const selected = release.assets?.find(item => item.name === asset);
  if (selected?.browser_download_url !== prefix + asset) throw Error('Official platform download is missing or has an unexpected URL.');
  const sums = (await request(prefix + 'SHA2-256SUMS', 1024 * 1024)).toString();
  const expected = sums.split(/\r?\n/).map(line => line.match(/^([a-f0-9]{64})\s+\*?(.+)$/i)).find(match => match?.[2] === asset)?.[1]?.toLowerCase();
  if (!expected) throw Error('Official checksum for the platform download is missing.');
  const bytes = await request(selected.browser_download_url, MAX_BYTES);
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw Error('yt-dlp checksum mismatch; nothing was installed.');
  const temporary = join(tools, `.yt-dlp-${randomUUID()}${platform === 'win32' ? '.exe' : ''}`);
  try {
    writeFileSync(temporary, bytes, { flag: 'wx', mode: 0o755 });
    if (platform !== 'win32') chmodSync(temporary, 0o755);
    const result = runner(temporary, ['--ignore-config', '--version'], { encoding: 'utf8', windowsHide: true, timeout: 15000, stdio: 'pipe' });
    if (result.error || result.status !== 0 || !String(result.stdout ?? '').trim()) throw Error('Downloaded yt-dlp could not run. Dependency setup is incomplete.');
    renameSync(temporary, target);
    return { program: target, version: result.stdout.trim(), installed: true };
  } finally { rmSync(temporary, { force: true }); }
}
