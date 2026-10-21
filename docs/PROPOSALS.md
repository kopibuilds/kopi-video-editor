# Proposal-first editing

Use this workflow when the user asks for a design, style suggestion, or editing
ideas for a folder. Phrases such as "suggest a design for inbox/My Video" are
ordinary requests, not exact commands. Both Codex and Claude Code use this guide.

## Scope

Inspect the material and recommend an edit. The request authorizes local analysis,
including media metadata, still-frame/audio extraction, and transcription when
needed with the already configured local tools. Keep analysis files separate
from source material. Do not cut footage, change source files, build video
compositions, generate creative assets, render previews/finals, upload footage, or call
paid services while the request is only for a proposal.

If tools or a model are unavailable, report what could not be inspected and how
that limits the proposal. Do not install tools or download models merely to fill
in a proposal without the user's authorization. Do not claim that sound was heard
or the full video watched when only frames, a transcript, or waveforms were used.

## Understand the folder

- Use the folder the user named. Accept an absolute path or a clear name inside
  inbox. If omitted, use a folder already identified in the conversation; if
  there is no clear match, ask which folder. Do not silently choose among clients
  or projects. Identify the intended source when multiple recordings exist.
- Read instructions.txt or instructions.md when present. A brief is optional.
  Honor the current conversation over saved defaults, and distinguish supplied
  requirements from your creative suggestions.
- Inventory recordings, images, supporting footage, music, and references. Probe
  the source duration and aspect ratio, examine representative frames across the
  recording, and inspect references as available. Use the configured local
  transcription helper if needed to understand speech and insertion cues.
- Save private analysis under .kopi/proposals/<project-name>/analysis. For example,
  pass `--output .kopi/proposals/<project-name>/analysis/source.words.json` to
  `node kopi.mjs transcribe <recording>`. Reuse matching existing transcripts;
  use a new output path when it already exists. These paths are ignored by Git.
- Ask only for information that materially blocks a useful proposal. Otherwise
  recommend a choice and clearly label the assumption. A beginner does not need
  to supply technical editing terms or exact timestamps.

## Present one recommended direction

Use plain language and a short, skimmable proposal scaled to the video's length:

- What you found: source duration, useful assets, reference observations, and
  anything missing or uncertain.
- Your recommended look and why it fits the message/audience: format, pacing,
  subtitle treatment, colors, and how prominent graphics should be.
- A suggested sequence, using speech phrases or verified timestamps for images,
  supporting footage, title cards, and the ending. Mark estimated cues as estimates.
- Any suggested speech cuts, music, or sound effects. Do not invent an asset or
  imply a stock source, paid generation service, or Drive integration is installed.
  Keep protected elements such as an approved QR layout in the constraints.
- Any essential questions, plus the next action: approve the plan or request changes.

Save the proposal as .kopi/proposals/<project-name>/DESIGN-PROPOSAL.md. Include the
source path, inspected files, user constraints, proposed choices, and status
"Awaiting approval". Show the user the proposal in chat; do not require them to
open a technical file to understand or approve it. Do not change global preferences.

## Approval and handoff

Stop after presenting the proposal. Answering a question or acknowledging the
analysis does not approve editing. An instruction such as "go ahead", "use this
design", or "proceed with these changes" in the proposal context authorizes the
edit; incorporate corrections and mark the proposal approved. If the user asks
for changes to the plan, revise it without starting the edit.

Then follow docs/ASSISTANT.md, creating the engine project only when editing is
authorized. Carry the approved proposal into DESIGN.md. Do not add another
mandatory proposal gate to an edit the user already authorized. On a later chat,
check the saved proposal and conversation evidence rather than treating a draft
proposal on disk as approval. Reconfirm only material departures from the approved
scope or decisions that actually require new authorization.
