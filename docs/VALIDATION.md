# Local validation

## Private profiles and workflow separation — 11 November 2026

- All 28 Node tests passed on Windows, including external profile installation,
  separate workflow/show resolution, pinned updates, package validation, traversal
  and junction rejection, changed-file detection and a cold CLI installation with
  no engine. No tests were skipped in the final elevated local run.
- All three changed/new Codex skill entry points passed the bundled skill validator.
- A privately supplied package installed into the external user profile store;
  actual CLI reads loaded only the selected workflow and no show by default.
- Existing yt-dlp was discovered and its version checked. Downloader argument,
  failure, destination and completed-file checks used offline test fixtures; no
  new live YouTube media download was made for this release validation.
- The launcher produced another 8-second setup-check render at a new filename.
  Source recordings, previous exports, the private package and workspace selection
  remain excluded from Git. No cloud job, publishing or paid API was invoked.

These are local helper/packaging checks, not proof of every fresh computer or
assistant's behavior. Private asset references do not establish access or local
availability for another team member. Automated Drive delivery and scheduling are
not implemented by this release.

Checked on Windows on 2026-10-21 with Node.js 24 and the revision in engine.json.

- Six Node command tests passed, covering project path traversal, transcription
  output naming, help, unknown commands, and protection against overwriting source
  recordings or existing transcripts.
- A fresh engine installation fetched Herk directly, installed the lockfile's
  packages, and produced the starter video at 1920x1080, 24 fps, 192 frames (8 s).
  A full-size frame was inspected for visible content and readable text.
- Repeat setup preserved the existing valid setup-check MP4.
- Local speech recognition ran on a six-second private audio sample using an
  already installed faster-whisper environment and cached small model. The output
  contained 15 words and passed schema and timestamp-bound checks.
- The final render preset was exercised on the starter project.
- Recordings, generated media, transcripts, the installed engine, and machine logs
  remain local and excluded from the published source.

This is a smoke test on one existing Windows environment. It does not establish
compatibility with every fresh PC, macOS/Linux, every Python configuration, or
every assistant/model. No human listening test or multi-client cloud deployment
is implied by these checks.

## Weekly update checker

Checked on Windows on 2026-10-21:

- All 14 command/update tests passed, including weekly caching, offline retry
  throttling, manual checks, damaged cache recovery, diverged history, source-file
  preservation, and permission notices without installation.
- A live public GitHub check identified the current version and a second call
  used the saved weekly result. A live comparison using an older published
  revision identified available changes and produced an approval notice.
- Both changed assistant skill entry points passed metadata validation.
- The existing 1080p starter still rendered after the command-entry changes.

These checks validate the helper and its instructions. They do not guarantee an
assistant will obey every instruction or implement automatic engine migration.
