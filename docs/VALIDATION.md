# Local validation

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
