import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const WEEK = 7 * 24 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const API = 'https://api.github.com/repos/kopibuilds/kopi-video-editor';
const shaPattern = /^[a-f0-9]{40}$/i;

function gitRead(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], {
    windowsHide: true, encoding: 'utf8', timeout: 2500, maxBuffer: 1024 * 1024,
  });
  if (result.error || result.status !== 0) throw new Error('Git metadata unavailable');
  return result.stdout.trim();
}

export function installedCopy(root) {
  const top = gitRead(root, ['rev-parse', '--show-toplevel']);
  if (resolve(top) !== resolve(root)) throw new Error('This folder is not a Git checkout');
  const remote = gitRead(root, ['remote', 'get-url', 'origin']);
  if (!/^(https:\/\/github\.com\/|git@github\.com:)kopibuilds\/kopi-video-editor(?:\.git)?\/?$/i.test(remote)) {
    throw new Error('This checkout uses a different source repository');
  }
  const head = gitRead(root, ['rev-parse', 'HEAD']);
  if (!shaPattern.test(head)) throw new Error('Unrecognized installed revision');
  return { head, localChanges: Boolean(gitRead(root, ['status', '--porcelain'])) };
}

async function githubJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Kopi-Video-Editor-Update-Check' },
    signal: AbortSignal.timeout(4000), redirect: 'error',
  });
  if (!response.ok) throw new Error('Update service unavailable');
  return response.json();
}

function readState(path) {
  try {
    const value = JSON.parse(readFileSync(path, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

function saveState(root, state) {
  const directory = join(root, '.kopi');
  mkdirSync(directory, { recursive: true });
  const temporary = join(directory, `update-status-${process.pid}.tmp`);
  writeFileSync(temporary, JSON.stringify(state, null, 2) + '\n');
  renameSync(temporary, join(directory, 'update-status.json'));
}

export async function checkForUpdates({ root, force = false, now = Date.now(),
  readInstalled = installedCopy, request = githubJson } = {}) {
  // Only the ignored cache is written. Never fetch, pull, reset, install, or run remote code.
  let local;
  try { local = readInstalled(root); }
  catch { return { status: 'unavailable', reason: 'A Git clone of Kopi is required for update checks.' }; }
  const previous = readState(join(root, '.kopi', 'update-status.json'));
  if (!force && previous.installed === local.head && Number.isFinite(previous.nextCheckAt)
      && previous.nextCheckAt > now && previous.nextCheckAt <= now + WEEK) {
    return { ...previous, cached: true, localChanges: local.localChanges };
  }
  let state;
  try {
    const latest = await request(`${API}/commits/main`);
    if (!shaPattern.test(latest.sha ?? '')) throw new Error('Invalid remote revision');
    state = { status: 'current', installed: local.head, latest: latest.sha,
      checkedAt: now, nextCheckAt: now + WEEK, localChanges: local.localChanges };
    if (latest.sha !== local.head) {
      const comparison = await request(`${API}/compare/${local.head}...${latest.sha}`);
      if (!['ahead', 'behind', 'identical', 'diverged'].includes(comparison.status)) throw new Error('Cannot compare revisions');
      if (comparison.status === 'diverged') state.status = 'diverged';
      if (comparison.status === 'ahead') {
        if (!(Number.isInteger(comparison.ahead_by) && comparison.ahead_by > 0)) throw new Error('Invalid comparison');
        state.status = 'available';
        state.commitCount = comparison.ahead_by;
        state.summary = (comparison.commits ?? []).slice(-3).map(item =>
          String(item.commit?.message ?? '').split('\n')[0].replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').slice(0, 140));
        state.engineChange = (comparison.files ?? []).some(item => item.filename === 'engine.json');
      }
    }
  } catch {
    state = { status: 'unavailable', installed: local.head, attemptedAt: now,
      nextCheckAt: now + DAY, reason: 'Could not check for updates. Editing can continue; retry after a day or request a manual check.' };
  }
  try { saveState(root, state); } catch { /* A read-only cache must not prevent editing. */ }
  return { ...state, cached: false };
}

export function updateNotice(result, automatic = false) {
  if (automatic && result.cached) return '';
  if (result.status === 'available') {
    const lines = [`Kopi update available: ${result.commitCount} new commit(s). No update has been installed.`];
    for (const subject of result.summary ?? []) lines.push(`  - ${subject}`);
    if (result.localChanges) lines.push('Local code changes exist; inspect them before any update.');
    if (result.engineChange) lines.push('This update also changes the pinned Herk engine; review compatibility separately.');
    lines.push('Ask the user whether to update now or continue with the installed version. Never update during an edit or render.');
    return lines.join('\n');
  }
  if (result.status === 'diverged') return 'Kopi differs from the published history. No automatic update is safe; review the local changes first. Editing can continue.';
  if (result.status === 'unavailable') return automatic ? '' : `Kopi: ${result.reason}`;
  return automatic ? '' : `Kopi is current${result.cached ? ' according to the saved weekly check' : ''}.`;
}
