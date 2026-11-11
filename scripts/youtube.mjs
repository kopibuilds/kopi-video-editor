import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, realpathSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

export function youtubeId(input) {
  const u = new URL(input);
  if (u.protocol !== 'https:' || u.username || u.password || u.port) throw Error('Use an HTTPS YouTube video URL without embedded credentials.');
  const host = u.hostname.toLowerCase(); let id;
  if (host === 'youtu.be') id = u.pathname.slice(1);
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else id = u.pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)\/?$/)?.[1];
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(id ?? '')) throw Error('Supply one YouTube video URL, not a channel, playlist or another host.');
  return id;
}
export function findDownloader(root, { executable, runner = spawnSync } = {}) {
  const local = join(root, '.kopi', 'tools', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  const choices = executable ? [executable] : process.env.KOPI_YT_DLP ? [process.env.KOPI_YT_DLP] : [existsSync(local) ? local : null, 'yt-dlp'].filter(Boolean);
  for (const program of choices) {
    const result = runner(program, ['--ignore-config', '--version'], { encoding: 'utf8', windowsHide: true, timeout: 10000, stdio: 'pipe' });
    if (!result.error && result.status === 0) return { program, version: (result.stdout ?? '').trim() };
  }
  throw Error('yt-dlp is unavailable. Reuse an existing installation or install the official yt-dlp package. yt-dlg is a separate graphical frontend.');
}
function physical(file) { let current = resolve(file); const rest = []; while (!existsSync(current)) { rest.unshift(current.slice(dirname(current).length + 1)); current = dirname(current); } return resolve(realpathSync(current), ...rest); }
function contained(parent, child) { const p = relative(parent, child); return p === '' || (p !== '..' && !p.startsWith('..' + sep) && !isAbsolute(p)); }
export function downloadPlan(root, url, { output, maxHeight = 1080 } = {}) {
  const id = youtubeId(url), inbox = physical(join(root, 'inbox'));
  const destination = physical(output ? resolve(root, output) : join(inbox, 'youtube', id));
  if (!contained(inbox, destination)) throw Error('Download destination must stay inside inbox, including through symlinks.');
  if (![720, 1080, 1440, 2160].includes(Number(maxHeight))) throw Error('Choose a supported maximum height: 720, 1080, 1440 or 2160.');
  return { id, destination, args: ['--ignore-config', '--no-playlist', '--no-overwrites', '--no-cache-dir', '--retries', '1', '--fragment-retries', '1', '--socket-timeout', '20', '--write-info-json', '--no-progress', '-f', `bv*[height<=${maxHeight}][ext=mp4]+ba[ext=m4a]/b[height<=${maxHeight}][ext=mp4]/b[height<=${maxHeight}]`, '--merge-output-format', 'mp4', '--paths', destination, '-o', '%(id)s.%(ext)s', '--', `https://www.youtube.com/watch?v=${id}`] };
}
export function downloadYouTube(root, url, options = {}) {
  const plan = downloadPlan(root, url, options), runner = options.runner ?? spawnSync;
  const tool = findDownloader(root, { executable: options.executable, runner });
  mkdirSync(plan.destination, { recursive: true });
  const result = runner(tool.program, plan.args, { encoding: 'utf8', windowsHide: true, stdio: 'inherit', timeout: 20 * 60 * 1000, killSignal: 'SIGTERM' });
  if (result.error || result.status !== 0) throw Error('YouTube download did not complete. Keep partial files for a deliberate retry; no automatic browser-cookie or login fallback is used.');
  const media = readdirSync(plan.destination).filter(name => name.startsWith(plan.id + '.') && /\.(mp4|mkv|webm|mov)$/.test(name)).map(name => join(plan.destination, name)).filter(file => statSync(file).isFile() && statSync(file).size > 0);
  if (!media.length) throw Error('Downloader returned success but no completed video was found.');
  return { id: plan.id, folder: plan.destination, media, downloader: tool.version };
}
