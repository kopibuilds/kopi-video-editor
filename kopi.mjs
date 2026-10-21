#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { checkForUpdates, updateNotice } from './scripts/updates.mjs';

export const home = dirname(fileURLToPath(import.meta.url));
export const engine = process.env.KOPI_ENGINE_HOME
  ? resolve(process.env.KOPI_ENGINE_HOME) : join(home, '.kopi', 'engine');
const manifest = JSON.parse(readFileSync(join(home, 'engine.json'), 'utf8'));

export function projectPath(slug, base = engine) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug ?? '')) {
    throw new Error('Project names must use lowercase letters/numbers separated by hyphens.');
  }
  return join(base, 'video-projects', slug);
}

function execute(program, args, cwd = home, capture = false) {
  const result = spawnSync(program, args, {
    cwd, windowsHide: true, encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit', maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`${program} failed: ${result.error?.message ?? result.stderr ?? result.status}`);
  }
  return (result.stdout ?? '').trim();
}

export function pythonCommand(explicit) {
  const choices = explicit ? [[explicit, []]] : process.env.KOPI_PYTHON
    ? [[process.env.KOPI_PYTHON, []]]
    : [['python', []], ['python3', []], ['py', ['-3']]];
  for (const [program, prefix] of choices) {
    const probe = spawnSync(program, [...prefix, '-c', 'import faster_whisper'], {
      windowsHide: true, stdio: 'pipe', timeout: 30000,
    });
    if (!probe.error && probe.status === 0) return { program, prefix };
  }
  throw new Error('No working Python with faster-whisper found. Check launcher permissions first. Set KOPI_PYTHON or --python to the existing interpreter; otherwise install faster-whisper in your chosen Python.');
}

function ensureEngine() {
  if (!existsSync(join(engine, 'package.json'))) throw new Error('Editing engine is missing. Run node kopi.mjs setup.');
  const revision = execute('git', ['rev-parse', 'HEAD'], engine, true);
  if (revision !== manifest.revision) throw new Error('Engine revision differs from engine.json. Use a separate engine folder or deliberately update the manifest; existing projects will not be reset.');
}

function directories() {
  for (const folder of ['inbox', 'outbox', 'music', 'preferences', '.kopi']) {
    mkdirSync(join(home, folder), { recursive: true });
  }
}

function doctor() {
  let missing = Number(process.versions.node.split('.')[0]) < 22;
  console.log(`Node.js: ${process.versions.node}${missing ? ' (22+ required)' : ''}`);
  for (const [program, flag] of [['git', '--version'], ['ffmpeg', '-version'], ['ffprobe', '-version']]) {
    try { console.log(execute(program, [flag], home, true).split(/\r?\n/)[0]); }
    catch { console.error(`${program}: unavailable. Check PATH or install the official package.`); missing = true; }
  }
  try { console.log(`Local transcription: ${pythonCommand().program}`); }
  catch (error) { console.log(`Local transcription: ${error.message}`); }
  console.log(`Engine directory: ${engine}`);
  if (missing) throw new Error('Required editing tools are unavailable. Ask your assistant to help install them, then rerun setup.');
}

function setup() {
  doctor();
  directories();
  if (!existsSync(join(engine, '.git'))) {
    if (existsSync(engine)) throw new Error(`An incomplete engine folder exists at ${engine}. Inspect it before moving or removing it; setup will not delete it.`);
    mkdirSync(dirname(engine), { recursive: true });
    execute('git', ['init', engine]);
    execute('git', ['remote', 'add', 'origin', manifest.repository], engine);
    execute('git', ['sparse-checkout', 'init', '--no-cone'], engine);
    // Keep the starter; omit the showcase and previously published video projects.
    execute('git', ['sparse-checkout', 'set', '--no-cone', '/*', '!/examples/showcase/', '!/video-projects/'], engine);
    execute('git', ['fetch', '--depth=1', '--filter=blob:none', 'origin', manifest.revision], engine);
    execute('git', ['checkout', '--detach', manifest.revision], engine);
  }
  ensureEngine();
  if (!existsSync(join(engine, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs'))) {
    // This shell command is constant; user paths or instructions are never interpolated.
    if (process.platform === 'win32') execute(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npm ci --no-audit --no-fund'], engine);
    else execute('npm', ['ci', '--no-audit', '--no-fund'], engine);
  }
  execute(process.execPath, [join(engine, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs'), 'doctor'], engine);
  const slug = 'kopi-setup-check';
  if (!existsSync(projectPath(slug))) execute(process.execPath, [join(engine, 'scripts', 'new-video.mjs'), slug], engine);
  const previous = join(home, 'outbox', 'setup-check.mp4');
  if (existsSync(previous)) {
    execute('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', previous], home, true);
    console.log('Existing setup render verified; preserved without overwriting.');
  } else render(slug, false, 'setup-check.mp4');
  console.log(`Setup render: ${join(home, 'outbox', 'setup-check.mp4')}`);
  console.log(`Put recordings in ${join(home, 'inbox')}. Open this folder in your assistant and ask for an edit.`);
}

function createProject(slug) {
  projectPath(slug);
  ensureEngine();
  directories();
  execute(process.execPath, [join(engine, 'scripts', 'new-video.mjs'), slug], engine);
  console.log(`Project: ${projectPath(slug)}`);
}

export function transcriptDestination(media, requested) {
  return requested ? resolve(requested) : join(dirname(media), `${basename(media).replace(/\.[^.]+$/, '')}.words.json`);
}

function transcribe(media, options) {
  if (!media) throw new Error('Supply a recording path after transcribe.');
  const input = resolve(media);
  if (!existsSync(input)) throw new Error(`Recording does not exist: ${input}`);
  const destination = transcriptDestination(input, options.output);
  if (destination === input) throw new Error('Transcript output cannot overwrite the recording.');
  if (existsSync(destination)) throw new Error(`Transcript already exists: ${destination}. Reuse it or choose a new --output path.`);
  const interpreter = pythonCommand(options.python);
  execute(interpreter.program, [...interpreter.prefix, join(home, 'scripts', 'speech.py'), input,
    '--output', destination, '--model', options.model, '--device', options.device]);
}

function render(slug, final, outputName) {
  const project = projectPath(slug);
  ensureEngine();
  if (!existsSync(project)) throw new Error(`Project does not exist: ${slug}`);
  directories();
  const name = outputName ?? `${slug}-${final ? 'final' : 'draft'}-${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`;
  const destination = join(home, 'outbox', name);
  if (existsSync(destination)) {
    // The setup check is reproducible but must not silently replace a prior check.
    throw new Error(`Output exists: ${destination}. Keep it or move it before rendering again.`);
  }
  execute(process.execPath, [join(engine, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs'),
    'render', '--quality', final ? 'standard' : 'draft', '--fps', '24', '--workers', '1', '--output', destination], project);
  console.log(`Video: ${destination}`);
}

export async function main(argv = process.argv.slice(2)) {
  const { positionals, values } = parseArgs({ args: argv, allowPositionals: true, options: {
    help: { type: 'boolean', short: 'h' }, final: { type: 'boolean' },
    model: { type: 'string', default: 'small' }, device: { type: 'string', default: 'cpu' },
    python: { type: 'string' }, output: { type: 'string' },
    'check-now': { type: 'boolean' },
  }});
  const [action, argument] = positionals;
  if (values.help || !action) return console.log(`Kopi Video Editor\n\nnode kopi.mjs doctor\nnode kopi.mjs setup\nnode kopi.mjs project my-video\nnode kopi.mjs transcribe recording.mp4 [--model small] [--python PATH] [--output PATH]\nnode kopi.mjs render my-video [--final]\nnode kopi.mjs updates [--check-now]\n\nEditing itself is performed by your assistant using Herk Edit Kit's project skills.`);
  if (action === 'updates') {
    const result = await checkForUpdates({ root: home, force: values['check-now'] });
    const notice = updateNotice(result, !values['check-now']);
    console.log(notice || (result.cached ? 'Kopi: weekly update check is not due. No update installed.'
      : updateNotice(result)));
    return;
  }
  if (action === 'project') projectPath(argument);
  if (['doctor', 'setup', 'project'].includes(action) && process.env.KOPI_UPDATE_CHECK !== 'off') {
    const result = await checkForUpdates({ root: home });
    const notice = updateNotice(result, true);
    if (notice) console.log(notice);
  }
  if (action === 'doctor') return doctor();
  if (action === 'setup') return setup();
  if (action === 'project') return createProject(argument);
  if (action === 'transcribe') return transcribe(argument, values);
  if (action === 'render') return render(argument, values.final);
  throw new Error(`Unknown command: ${action}. Run node kopi.mjs --help.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(); } catch (error) { console.error(`Kopi: ${error.message}`); process.exitCode = 1; }
}
