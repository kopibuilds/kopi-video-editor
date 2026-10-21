# Assistant operating guide

This project provides command helpers for Nate Herk's editing engine. It does not
replace the engine's creative editing skills. Work inside this repository and
keep each recording's artifacts inside its own engine project.

## First visit

1. Run `node kopi.mjs doctor`. Report missing tools in plain language. Check PATH
   and permissions before diagnosing a missing program. Never reinstall an
   existing Python/Whisper environment simply because a sandbox blocks it.
2. After installing any missing prerequisites with appropriate authorization,
   run `node kopi.mjs setup`. This downloads the revision in engine.json, installs
   its locked npm packages, runs browser diagnostics, and renders a setup check.
   Failed steps must be resolved before calling setup successful. It is safe to
   rerun after a successful install; incomplete engine folders need inspection.
3. Check local transcription. `KOPI_PYTHON` or `--python` can select an existing
   interpreter. `--model` accepts a cached model directory as well as a model
   name. Python and Whisper are not silently installed by the helper.
4. Ask about aspect ratio, captions, pacing, graphics, music, and whether speech
   may be cut. Save agreed provisional defaults in preferences/style.md. Render a
   small caption example on supplied footage when useful. Do not declare setup
   choices to be permanent preferences.
5. Show outbox/setup-check.mp4 and the user's inbox path. Do not edit any supplied
   recording unless the user has requested an edit.
6. Introduce both ways to start: "Tell me how to edit your video, or say
   'Suggest a design for inbox/My Video' and I will inspect the files, recommend
   an approach, and wait for your approval." Users may defer style decisions to
   that proposal instead of answering every style question during setup.

## Choose the requested workflow

A request such as "propose a design", "suggest a style", "look through this folder
and give me editing ideas", or "help me decide how to edit this" uses
[the proposal workflow](PROPOSALS.md). Do not fall through to project creation,
cutting, composition authoring, or rendering while approval is pending.

A clear request to edit uses the workflow below. If the user approves a saved
proposal, read that proposal and any subsequent corrections before continuing.

## Each video

- Find the named folder inside inbox. Read instructions.txt or instructions.md
  and identify the actual source recording, supplied assets, and references.
  If several recordings exist and the intended source is unclear, ask.
- Current user instructions take precedence over project briefs, confirmed
  personal rules, style defaults, and engine examples, in that order.
- Create a short lowercase project name with `node kopi.mjs project <slug>`.
  The default engine directory is .kopi/engine; its project directory is
  .kopi/engine/video-projects/<slug>. Preserve the input and work on a copy in
  that project's assets folder.
- Read .kopi/engine/AGENTS.md and docs/WORKFLOW.md. Choose the engine's edit-video
  skill for a full workflow or short-form-edit for Shorts/short ads. Read relevant
  HyperFrames/GSAP skills before implementing compositions. Do not bypass their
  timeline, media, and verification contracts.
- Transcribe the working source with `node kopi.mjs transcribe <media>`; add
  `--model <cached-directory>` or `--python <executable>` when appropriate.
  This helper uses local faster-whisper, defaults to CPU/small, and writes a
  .words.json transcript in the engine's documented format. It rejects existing
  output rather than overwriting it. Reuse validated transcripts. Do not invoke
  the engine's paid transcription helper by default.
- Record source intervals and reviewed cuts. Maintain one timing map for
  captions, images, footage, and sound. Verify meaning before removing speech;
  an instruction to preserve speech rules out automatic mistake/silence cuts.
- Analyze any supplied reference and select relevant mechanisms. Reference
  footage may be reused only when the user has authorized it and has rights.
  No stock search/Drive connection is bundled. Use supplied assets by default.
- Save the plan and design decisions with the project. Default to no music
  unless requested. Use music/ for user-supplied audio, keeping speech clear.
  For an approved proposal, copy the current plan into the project's DESIGN.md
  and keep the approved constraints and asset cues through later stages.

## Render, revise, deliver

Run the engine's preflight and HyperFrames lint as applicable. Review compositions
before rendering. `node kopi.mjs render <slug>` writes a timestamped draft to
outbox. `--final` selects a higher rendering preset after user approval.
Review the encoded file itself: captions, image cues, face visibility, transitions,
black frames, and audio joins. Save a VERIFY.md report and state review limitations
honestly. Screenshots or waveform checks are not proof that audio was heard.

Optional SRT files belong with project assets, not beside burned-caption exports,
where players may load a duplicate subtitle layer. Describe the draft and request
notes. Apply requested revisions without converting every note into a global rule.
Only save lasting preferences when the user confirms they should apply in future.

Do not publish media, use unapproved paid services, print credentials, or add
private project files to source control. Models and permission levels are the
user's choice. The CLI does not implement cloud orchestration or an automatic
second-agent review service.
