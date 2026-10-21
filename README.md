# Kopi Video Editor

A local video editing workspace by [Kopi](https://github.com/kopibuilds), powered
by **[Herk Edit Kit by Nate Herk](https://github.com/nateherkai/herk-edit-kit)**.

Describe the edit in plain language, let your assistant produce an MP4, and give
feedback in the same chat. Kopi supplies the launcher, local transcription adapter,
and onboarding. Herk Edit Kit supplies the editing framework and creative tools.

## Beginner guide

### 1. Choose your assistant

You need an assistant that can work with files and run programs on your computer.
Ordinary ChatGPT or Claude browser chat is not this local editing environment.

- **Codex:** install through the [official OpenAI download page](https://chatgpt.com/download/),
  sign in with your ChatGPT account, and select Codex/local execution. See the
  [desktop guide](https://learn.chatgpt.com/docs/app).
- **Claude Code:** follow its [official setup guide](https://code.claude.com/docs/en/quickstart).
  Use a local Claude Code session, in a desktop interface or terminal. If using a
  terminal, follow that guide's installation steps first; you do not need to write
  editing code yourself.

Use your own account with sufficient usage. Subscription availability and billing
are determined by your provider. Video editing and revisions consume AI allowance.

### 2. Create and open an editor folder

On Windows, open File Explorer, go to Documents, and make a folder named
`My Video Editor`. Open that folder in Codex or Claude Code. If your interface
uses a terminal, start Claude Code from that folder as described in its guide.

### 3. Paste this into your Codex or Claude Code chat

```text
Set up Kopi Video Editor in this workspace.
Download https://github.com/kopibuilds/video-editor into a video-editor subfolder.
Read its AGENTS.md and docs/ASSISTANT.md, then run node kopi.mjs doctor and
node kopi.mjs setup from that subfolder.

Check for existing tools first and help me install anything missing.
Use local faster-whisper. Reuse an existing Python installation and cached model
when available. No paid services or footage uploads.

Show the setup test video and ask about my provisional editing preferences.
Tell me the full inbox and outbox paths and which folder to open next time.
Explain any steps I need to complete in beginner-friendly language.
```

The assistant checks Node.js 22+, Git, FFmpeg, and Python/faster-whisper.
Setup downloads the pinned Herk engine, installs its locked packages, checks the
browser runtime, and renders a sample. You may need to approve installations.
Local transcription needs a model download the first time unless already cached.

Setup stops when a check fails; ask your assistant to fix the reported problem.
Keep your computer awake and allow space for tools, recordings, and working copies.
The engine's diagnostic report also lists optional Docker, voice, music, and
alternative speech tools. Those are not requirements for this local workflow.
Its update notice is informational: keep the tested revision unless upgrading deliberately.

### 4. Put your files in the inbox

Use a separate folder for each video. For example:

```text
video-editor/
  inbox/
    Webinar Invite/
      recording.mp4
      instructions.txt
      poster.png
      reference-video.mp4
  outbox/
  music/
  preferences/
```

Only the recording is essential. Add optional images, authorized supporting footage,
reference videos, and music as needed. A style reference does not by itself grant
permission to extract its content. You can write your instructions directly in
chat, or use [this sample](examples/instructions.txt) as instructions.txt.

### 5. Request an edit

Open the `video-editor` folder in your assistant, then say:

```text
Edit the recording in inbox/Webinar Invite. Read instructions.txt first.
Make a landscape YouTube video with clean subtitles.
Keep all spoken content. Show the poster when the invitation is mentioned.
Use local transcription. No background music.
```

Choose landscape or vertical and say whether speech can be trimmed. Your current
instructions override defaults. The assistant works from a copy and puts MP4 drafts
in `outbox`. The helper commands do not make creative editing decisions by themselves.

### 6. Review and request changes

Watch the draft and give feedback in the same chat, preferably with timestamps:

> At 00:21, show the poster two seconds later. Make captions smaller throughout.
> Keep the ending. Apply these changes to this video only.

Once satisfied, say: **Approved. Export the final video.** For another recording,
start at step 4. Your computer must stay awake while processing.

## Commands for your assistant

Run these from the repository folder:

```text
node kopi.mjs doctor
node kopi.mjs setup
node kopi.mjs project my-video
node kopi.mjs transcribe "inbox/My Video/recording.mp4"
node kopi.mjs render my-video
node kopi.mjs render my-video --final
```

The engine is installed under `.kopi/engine`. Projects live under
`.kopi/engine/video-projects/<project-name>`. Setup preserves existing projects
and refuses to reset an engine with an unexpected revision. Interrupted initial
checkouts may require your assistant to inspect the incomplete folder before retrying.
An existing valid setup-check export is preserved on repeat setup.

Local transcription defaults to the `small` model on CPU. To reuse another
interpreter or cached model, your assistant can use `--python <executable>` and
`--model <model-directory>`. It writes `.words.json` beside the working recording
and refuses to overwrite existing files. `--device cuda` is available when your
installed Python environment supports it; it does not silently fall back to CPU.

For advanced setups only, KOPI_PYTHON chooses a Python executable and
KOPI_ENGINE_HOME selects an engine folder already checked out at the pinned revision.

## What this includes

- Direct installation of a pinned Herk Edit Kit revision.
- A local faster-whisper adapter using Herk's documented word-timestamp format.
- A shared assistant guide and skill entry points for Codex and Claude Code.
- Draft/final render helpers and a sample project brief.

This is a local AI-assisted workflow, not the proposed Drive/n8n cloud service.
It does not include stock search, automatic publishing, or a separate automatic
reviewer service. Check every video's text, visuals, timing, and sound before use.
Quality and speed depend on your brief, footage, computer, and chosen assistant.

## Privacy and costs

Kopi's code is MIT-licensed. Herk and installed dependencies keep their own licenses.
AI subscription or API usage still applies. Local speech recognition has no
transcription API fee. No paid generation or stock subscription is required.

Private working folders, recordings, renders, transcripts, preferences, and secrets
are excluded from Git. Your assistant is an online service and may receive context
through its tools; choose provider settings appropriate for your material.
Do not put confidential content in examples or force-add ignored files.

## Credits

**Editing engine: [Herk Edit Kit by Nate Herk](https://github.com/nateherkai/herk-edit-kit).**
The engine includes its own MIT license and author notices. It uses HyperFrames
and GSAP; local media processing uses FFmpeg and faster-whisper.
See [third-party notices](THIRD_PARTY_NOTICES.md) for sources and license locations.
Example brand materials belong to their owners and are not your branding assets.

Kopi's launcher, transcription adapter, and onboarding are covered by [LICENSE](LICENSE).
This project is not affiliated with the assistant vendors or engine authors.
