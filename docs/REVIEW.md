# Review an exported video

Use for "check this export", "review the draft", or equivalent video quality
requests. This guides the current assistant's review; it does not launch an
independent agent. User approval remains necessary for publishing.

## Establish the target and scope

Identify the exact MP4/version to review. Use an unambiguous file supplied in the
request or already established in the conversation. Ask when several versions
could be intended; do not silently choose a different client's or an older draft.
Read the current brief, approved proposal/DESIGN.md, approved brand profile when
selected, source transcript and timing map, and prior feedback as available.
An export without a brief can be checked for technical/visible issues; distinguish
that from verifying creative requirements you do not know.

Review-only requests permit local inspection, extracted evidence, and a saved
report. Preserve the exported file and source. Do not re-edit, re-render, change
client defaults, post, or upload the video unless the user asks for those actions.

## Inspect the encoded export

Use the actual MP4, not just composition HTML or Studio. Probe its duration,
dimensions, frame rate, streams, and basic decode health. Run applicable existing
engine preflight/lint and beat validators when project sources exist. Passing
those checks does not prove the encoded video looks or sounds correct.

- Inspect representative frames across the complete duration, plus opening,
  ending, every supplied-image cue, and known layout changes. Use contiguous
  frame strips around cuts and transitions where useful. Report sampled coverage.
- Check subtitle clipping, overlap, contrast, phrase breaks, duplicate subtitle
  tracks/adjacent SRT loading, and timing against the speech. Account for edits'
  timing maps when comparing with the original recording's transcript.
- Check face visibility, image crops, safe margins, text readability, stretched
  assets, black flashes, and whether inserts support the spoken passage.
- Preserve approved elements and check them against their approved version. For
  a QR code, check visibility, hold duration, and source fidelity; try decoding
  representative frames if a decoder is already available. Do not claim it scans
  successfully without a decoding or real scan check.
- Check audio streams, clipping/silence, and A/V timing. Listen to speech, effects,
  and joins when the environment supports listening. Loudness or waveform checks
  alone do not establish a clean listening experience; label that limitation.
- Check brief compliance: protected speech, requested format, supplied assets,
  sound restrictions, branding, and any approved insertion cues.

Scale effort to duration and complexity. If an important check cannot be performed,
state that explicitly rather than awarding an unconditional pass.

## Report and optional corrections

Save a version-specific report with source identity, inspected ranges/checks,
limitations, and findings. Use the engine project's VERIFY.md when available,
or .kopi/reviews/<project-name>/<version>/VERIFY.md for a standalone export.
Save derived evidence with the private report, not in the repository's examples.

For each finding, give an output timestamp/range, the observed problem, why it
matters, and a proposed fix. Separate blockers from important fixes and optional
polish. Summarize "needs changes" or "no blocking issues found in the checks
performed"; do not claim perfect quality or a guaranteed human-equivalent review.

For review-only, show the report and stop. For an explicit "review and fix" request,
use docs/ASSISTANT.md to correct the editable project, export a new version, and
recheck the affected areas plus adjacent transitions. Preserve prior exports.
After two correction/review cycles, report remaining issues rather than looping
indefinitely. Ask for missing project files if the export cannot be safely corrected.
Do not re-ask permission already granted for ordinary fixes within the user's scope.
