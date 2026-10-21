# Reference-video analysis

Use when the user asks "break down this sample", "what makes this style work?",
or "how can we get a similar feel?" This is video analysis, not a request to copy
assets or start producing an edit. A reference may be analyzed on its own or as
part of the proposal workflow in PROPOSALS.md.

## Inspect

Identify the reference from the named folder or file. If there are several likely
references, ask which one to prioritize rather than blending them silently. Read
any user notes about what they like and what must stay in their own video.

Use local tools to probe the duration, dimensions, and audio streams. Examine
frames across the full duration, then contiguous frame strips at representative
transitions. Use a matching transcript or configured local transcription when
speech matters. Store derived analysis under .kopi/references/<reference-name>.
Do not download remote footage without authorized access; ask for a local copy if
the available tools cannot inspect the supplied reference.

When the engine is installed, use its short-form-edit reference-analysis guide
at .kopi/engine/.agents/skills/short-form-edit/references/reference-analysis.md
for the detailed worksheet; Claude Code can use the corresponding .claude path.
Do not install or run the engine just to read a reference if existing tools suffice.

## Explain what matters

Recommend a small set of useful mechanisms, with concrete examples:

- Opening: how the first few seconds establish the message or viewer interest.
- Pacing: where the edit holds, cuts, or changes layout, and what the speech is doing.
- Captions: placement, line length, font weight, emphasis, and readability.
- Supporting visuals: which spoken ideas trigger images, footage, or graphics.
- Sound: only describe audible effects or music when actually heard with a
  supported playback/listening tool. Otherwise identify audio inspection limits.
- Ending: how the reference handles its message, offer, or call to action.

Separate measured observations from inferred intent or suggestions. Give timestamps
for claims; do not pretend sampled frames establish every transition or sound cue.
Avoid vague scores, claims of guaranteed audience performance, or an exact-match
promise. Explain where the user's assets, recording, or budget would limit the match.

Save REFERENCE-ANALYSIS.md in the private analysis directory, including source
identity, inspected ranges, evidence, and limitations. Summarize it in chat.
If the user supplied their footage too, suggest adaptations rather than assuming
approval. Use PROPOSALS.md for a proposed edit and wait for approval in that mode.
An existing instruction to edit with this reference does not need an extra gate.

Keep any explicitly approved element (such as the user's QR layout) even when it
differs from the reference. Reusing reference footage, music, logos, or copy requires
the relevant authorization; style analysis by itself supplies no such permission.
