import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { home, projectPath, transcriptDestination } from '../kopi.mjs';

test('projects cannot escape the engine workspace', () => {
  for (const name of ['../private', 'a/b', 'a\\b', '', 'My Video', '--help']) {
    assert.throws(() => projectPath(name));
  }
  assert.equal(projectPath('invite-2026', home), join(home, 'video-projects', 'invite-2026'));
});

test('transcripts have a separate JSON filename, including paths with spaces', () => {
  const media = join(home, 'inbox', 'A Video.MP4');
  assert.equal(transcriptDestination(media), join(home, 'inbox', 'A Video.words.json'));
});

test('help works without downloading or loading an engine', () => {
  const result = spawnSync(process.execPath, [join(home, 'kopi.mjs'), '--help'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Kopi Video Editor/);
});

test('unknown commands fail instead of silently starting work', () => {
  const result = spawnSync(process.execPath, [join(home, 'kopi.mjs'), 'publish'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown command/);
});

test('unsafe project names are rejected before engine access', () => {
  const result = spawnSync(process.execPath, [join(home, 'kopi.mjs'), 'project', '../private'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Project names/);
});

test('transcription refuses to overwrite either input or existing output', () => {
  const directory = mkdtempSync(join(tmpdir(), 'kopi-guard-'));
  try {
    const recording = join(directory, 'recording.wav');
    const transcript = join(directory, 'existing.json');
    writeFileSync(recording, 'source sentinel');
    writeFileSync(transcript, 'transcript sentinel');
    for (const destination of [recording, transcript]) {
      const result = spawnSync(process.execPath, [join(home, 'kopi.mjs'), 'transcribe', recording, '--output', destination], { encoding: 'utf8' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /cannot overwrite|already exists/);
    }
    assert.equal(readFileSync(recording, 'utf8'), 'source sentinel');
    assert.equal(readFileSync(transcript, 'utf8'), 'transcript sentinel');
  } finally { rmSync(directory, { recursive: true }); }
});
