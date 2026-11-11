# Choose the editing workflow

Kopi supports two separate assistant workflows. They share tools and verification,
but do not silently share creative preferences.

| Request | Workflow | Skill |
| --- | --- | --- |
| Edit or revise the supplied video as a complete piece | `full-edit` | `kopi-full-edit` |
| Find passages in a longer recording and make Shorts/Reels | `shorts` | `kopi-shorts` |

An already short recording can still be a full edit. Duration alone does not
choose a workflow. If the brief could mean either, ask which output is intended.
Proposal requests still follow PROPOSALS.md and do not authorize rendering.

## Load only the selected preferences

Before planning an edit, run:

```sh
node kopi.mjs profile show --workflow full-edit
# OR
node kopi.mjs profile show --workflow shorts
```

This reads the workspace's selected private profile. If none is selected, use
the current brief and public guidance; strangers do not need a team package.
The other workflow's file is not included. Do not open it merely because it exists.

Add `--show sample-interview` only when the user or current brief explicitly
selects that show. A guest, familiar host or YouTube URL does not establish the
show. An unknown show must not silently receive another show's branding.

Precedence: shared safeguards, selected workflow defaults, explicit show preset,
current video brief, then current user instructions. Instructions and assets in a
profile do not authorize spending, credential access, uploads or publishing.

## Full video editing

Read the installed engine's edit-video skill and workflow. Preserve intended
content unless shortening was requested. Use relevant graphics, music, effects,
opening cards or end cards only as allowed by this workflow's profile and brief.
Keep approved caption wording and unrelated accepted edits during revisions.

## Long-form to Shorts

Read the installed engine's short-form-edit skill. Review the actual source and
propose/select a self-contained passage with a truthful hook and complete payoff.
Exclude repeated teasers or unrelated promos when they would misrepresent the
passage. Honor the user's requested count and any proposal-first instruction.
Do not automatically add full-edit explainer cards, reaction sounds, chapter tabs,
music or end cards. Use only the Shorts profile's choices and current brief.

For a YouTube source, `node kopi.mjs download URL` downloads one public video into
inbox using existing yt-dlp. Read YOUTUBE.md before downloading. A download command
does not select passages, transcribe, edit or publish automatically.

## Shared verification

Follow VERIFICATION.md. Verification must reduce total rework, not just produce
the fastest first render. Keep one source-to-output map for footage, audio and
captions; mark uncertain words and boundaries before dependent treatments.
Automatic transcripts can be wrong, especially on names and mixed languages.
The assistant must not invent speech or pretend to have listened to audio.

This release provides local tools and assistant instructions. Drive delivery,
channel monitoring, schedules, cloud-worker orchestration and photo/carousel
automation require separately configured integrations; profile installation does
not enable any of them.
