# SDE / Event Highlights

Use kopi-sde for an event recap assembled from event photos and videos, including
same-day edits. The user can provide a local folder or their own public Drive
folder, an event name and whatever pertinent details they have. Ask for missing
information that affects the edit. Do not require a polished written brief.
Same-day delivery needs an actual deadline; the skill name does not guarantee it.

This reuses Kopi's local engine, FFmpeg/ffprobe and composition tools. It does not
add a Drive integration, autonomous event detector, background watcher, scheduler
or one-command event renderer. No event media or account-specific source is bundled.

## Intake and first-use conversation

Read the current brief and any matching saved event preferences first. Ask only
missing choices in small groups, with practical suggested answers:

- Event identity: exact event name, relevant date/place, purpose/audience, and
  any names/titles that will actually appear. Do not guess identities from faces.
- Priorities: must-include people/moments, exclusions, a needed sequence, and
  whether a deadline or same-day turnaround applies. Do not promise attendance
  coverage for people who cannot be identified in the supplied footage.
- Look: energetic, warm/emotional, elegant/formal, documentary or a supplied
  reference. Recommend a suitable direction when the user delegates the choice.
- Branding: explicitly ask whether to include an optional logo, name/handle,
  colours, opening title or closing message, and their preferred placement. Ask
  whether an existing logo is available; no logo is valid. Do not require a user
  to commission/prepare a new logo or invent a mark that looks official.
- Music/audio: explicitly ask whether to use a particular track, let the assistant
  choose an appropriate mood/track from authorized sources, retain important
  event speech/ambient sound, or use no added music. Ask about relevant speech
  captions and language if spoken passages are to be retained.

Omitting a logo or music from the initial message is not an answer. If the user
only answers part of a group, follow up on materially unresolved choices. Optional
choices can be none, assistant-decides or deferred. A decision can be delegated
without requiring the user to know editing terminology. Do not mark guesses as
confirmed preferences or treat silence as music/spending approval. Continue useful
independent inspection while a blocking decision is pending.

Use vertical 1080x1920 (9:16) by default and state it as the working format rather
than asking every user to confirm it. A different current format request wins.
Ask only when the brief conflicts or a critical group/activity cannot fit the
requested crop and the available alternatives materially change the result.

Use 90 seconds as a proposed starting target. Around 60-90 seconds can suit a
compact recap; roughly two minutes is reasonable when there are enough distinct
strong moments or meaningful speech. Inspect the media before recommending the
actual length. A requested two minutes or another duration takes priority; report
when the available material cannot support it rather than repeating weak shots.
These are editable starting choices, not platform limits or a fixed timing formula.

## Private event preferences

Store confirmed recurring choices under ignored preferences/events/<brand>.md,
separately from preferences/repurpose and the private Full-edit/Shorts profiles.
Record branding, mood, music/source permissions and format/duration preferences
only when the user intends them to recur. Store this event's facts, media source,
must-include/excluded moments and temporary exceptions in its own private brief.

Use current instructions, applicable explicitly selected private event rules,
confirmed event defaults, then the generic defaults here. Existing private event
rules survive public updates and take priority over generic setup; unknown scope
requires a question. A video-profile installation alone does not make its interview
style an event style. Reuse a selected brand's assets only when they apply to this
event; never borrow another client's identity. Do not rewrite unrelated preferences.

The profile CLI currently accepts full-edit and shorts, not sde or event. Do not
invent a new profile show/install mode. This workflow uses assistant-readable event
preferences and the existing project/render commands.

## Media access and inventory

For a local folder, inspect the actual supplied paths and preserve original files.
For Drive, use the exact user-provided folder. With an available Drive plugin, read
its Drive skill before connector operations. For a folder intended to be public,
prefer anonymous listing/download when supported and verify it actually works.
Do not silently switch to stored browser cookies, credentials, OAuth or sign-in.
Credential access requires the user's separately explained explicit approval.

Identify subfolders, pagination and downloadable photo/video types from evidence.
Record the source file IDs/paths, listing time, sizes and download status in an
inventory. Do not mistake the first page or one subfolder for the whole library.
Report blocked, missing, unsupported or corrupt items and whether they affect
must-include moments. If public access fails, explain the specific limitation and
use a user-supplied local copy or separately authorized access; do not guess IDs,
alter sharing, or claim public Drive always works without an integration.

Download needed media into inbox/events/<event-slug>/ and keep derived work private.
Use file identity/hashes when needed to reuse downloads and detect duplicates.
Treat the intake as a recorded snapshot, not ongoing monitoring. If media is still
being uploaded, clarify which snapshot to edit; do not poll indefinitely. Rechecks
or later batches need an explicit bounded scope, not a persistent background job.

## Analyze and plan the event story

Probe videos for duration, resolution, orientation and streams; inspect photos
for orientation/aspect ratio, usable resolution and subject placement. Account for
rotation before cropping. Review the actual footage at representative times and
around candidate moments; a filename or thumbnail alone does not establish action.
Use existing local transcription only for speech passages that need it, reusing
matching transcripts and preserving names/corrections. Do not transcribe every
recording unnecessarily or treat automatic words as verified dialogue.

Select clear, relevant, distinct shots and photos. Prefer good expressions in
selected stills; natural moving expressions are not a reason to cut every blink
or mouth movement. Avoid accidental duplicates, severe blur, unusable shake,
awkward photo crops and image sequences that add nothing. Omit weak assets rather
than using every file to fill time. Respect required moments and disclose gaps.

Build an event arc appropriate to the brief: establish the event, develop its
activities/people, land key moments and finish with a meaningful closing. Do not
invent chronology, attendance, quotations, awards or emotional reactions. A montage
may group related moments, but must not falsely portray an unrelated reaction as
a response to a particular speaker or event.

Summarize the proposed sequence, working format/length, look, branding and audio
treatment. For proposal-only requests, follow PROPOSALS.md and stop before creative
authoring/rendering. For a direct make/create request, local production is already
authorized once essential choices are resolved; do not add a redundant permission
pause for every stage. A request for options is not permission to choose unresolved
music, invent captions or execute a paid fallback.

## Produce with existing tools

Create the project with node kopi.mjs project <slug>. Read the installed engine's
AGENTS.md, HyperFrames/GSAP guidance and relevant storytelling/render instructions.
Reuse its local composition/render pipeline, using node kopi.mjs render <slug>
with a new output filename. Apply event pacing from this brief, not the engine's
showreel/HUD/rapid-motion house defaults or interview Shorts presets.

Interleave video and stills intentionally. Gentle photo movement, reframing and
simple transitions are available techniques, not mandatory effects. Do not animate
faces, fabricate event footage, distort people, or use generative fill merely to
make a landscape group photo fit vertical. Use intentional reframing/layouts,
letterboxing/backing or a different asset when appropriate; keep key people and
actions visible. Check moving subjects, not only one frame of a video crop.

Use concise, approved event titles/labels and captions only where useful. Verify
spellings; keep overlays clear of faces/actions and phone-viewing safe regions.
Do not impose talking-head captions on a music-led montage or add unrequested CTAs.

For music, use a voluntarily supplied suitable track, a documented cleared library,
or a source whose terms fit the intended use after the user delegates selection.
Preserve source/license information and disclose missing rights or assets. Do not
assume a public link means music is cleared for reuse. Paid stock/generation,
provider changes and external potentially billable operations require specific
advance disclosure and explicit approval; setup does not authorize them. Do not
repeatedly ask the user to approve an already authorized track/scope.

Cut/mix to the approved mood, preserving important speech and ambient moments.
Do not replace real event audio with synthesized voices, guess speaker-specific
gain or claim to have listened based on waveforms. If audio listening is unavailable,
do the supported technical checks and explicitly leave listening-dependent checks
unverified; do not certify a final music mix or speech joins by measurement alone.

## Verify and deliver

Follow VERIFICATION.md and keep a source-to-output map: file ID/path, video in/out
points or photo hold, output times, crop/layout, text and audio choices, with reasons
for material omissions/changes. Preserve the actual brief/user corrections and
identify user-approved choices versus assistant decisions. Retain prior versions.

Inspect the encoded opening frame and every frame of the first second, transitions,
photo motion, crops, text extremes, key moments and ending. Check full-file decode,
actual resolution/frame rate/duration, A/V timestamps and any listening-capable
review. Check the requested event/name/people/moments and deadline scope against
the inventory. Record checked coverage and unresolved limitations in VERIFY.md.

Deliver the requested MP4, editable project/source-map location and a short review
summary. Do not call an unreviewed result publication-ready. Static editable-only
delivery rules apply to separately requested posters/covers, not the event video.
Do not automatically generate extra posters, carousels, aspect ratios or uploads.
Nothing is published, uploaded back to Drive, scheduled or monitored by default.
