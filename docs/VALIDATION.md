# Local validation

## Updates without snapshot commits — 16 November 2026

The complete Node suite passed all 42 tests on Windows outside the restricted
executor, including the two junction checks previously skipped in that executor.
New tests use temporary local repositories, synthetic fixture authors, and local
transport in place of GitHub; no credentials or network are used. They verify a
real fast-forward with empty author identity, no extra commit, dirty-file refusal,
diverged-history refusal, pinned-engine refusal, detached/wrong-source refusal,
offline failure preservation, and preservation of ignored private files. No live
checkout was updated and no Windows sandbox configuration was changed by these
tests. The updater's dependency step uses a fresh process after the fast-forward;
failures report the installed code revision without claiming setup completion.

## Editable static image designs — 16 November 2026

- The generator runs without the editing engine or additional Node packages,
  embeds local image assets, escapes supplied text as data, supports multiple
  canvas sizes/pages, and refuses to overwrite existing output files.
- The Node suite has 37 tests: 35 passed and two existing junction tests skipped
  in the restricted Windows executor. No failures. These tests cover the new
  command, multi-page output, script-like text, invalid geometry/layer IDs,
  network input rejection, and source/output preservation.
- An isolated headless Chrome session tested a real four-slide carousel plus
  a separate synthetic 1200×630 thumbnail. Inline text editing, photo replacement,
  crop zoom, project save/reopen, independent edits between pages, native-size PNG
  downloads, responsive widths of 320/540/1100px, and absence of script errors passed.
- Browser testing used fresh temporary browser storage, no saved user profiles,
  credentials, screen capture of user apps, paid services or new installations.
- Private source images, manifests, browser reports and generated HTML remain
  in ignored local folders. Only reusable code, template, instructions and
  synthetic unit tests belong in the shared commit.
- Other browsers and operating systems were not executed here. System font
  availability can affect layout, and browser autosave is best effort; the
  portable project JSON is the explicit editable backup. Manual edits are local
  to each copy; the command does not enable real-time team collaboration.

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

## Required YouTube downloader installation

Checked on Windows on 2026-11-16:

- All 33 tests passed, including missing-tool installation, existing-tool reuse,
  checksum rejection, failed execution/network handling, and profile isolation.
- A real cold install in an isolated ignored folder downloaded the official
  Windows x64 yt-dlp release, verified its SHA256 checksum and successfully ran
  its version check (2026.10.26).
- macOS Intel/Apple Silicon and Windows ARM64 asset selection is covered by
  tests; actual execution on those operating systems was not tested.
- Installation does not download a source video or prove that every YouTube URL
  is downloadable. Site restrictions and missing third-party runtime prerequisites
  can still prevent a particular download.
- Approved updates must run the dependency command; a bare Git pull cannot
  automatically execute it. Existing older assistants must read the updated
  AGENTS.md and docs/UPDATES.md after fetching the new version.
