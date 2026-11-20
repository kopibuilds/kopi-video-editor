# Choose the editing workflow

For any static image design with text, automatically include the local manual
editor described in IMAGE-EDITOR.md as the only default output, with its PNG
export button. Generate separate PNG/JPG files only when explicitly requested;
exports-only requests can omit the editor. This applies
regardless of the output's name and also to static designs made with a video pack.

For a local video or YouTube link repurposed into a carousel, poster or Shorts,
start with kopi-video-repurpose and VIDEO-REPURPOSING.md. It routes each requested
output to its own preferences; it does not combine their design presets.

Kopi provides separate event-highlights, full-edit and Shorts assistant workflows.
They share local tools and verification, but do not silently share creative
preferences. The profile CLI still has only full-edit and shorts modes.

| Request | Workflow | Skill |
| --- | --- | --- |
| Create/revise an SDE or event recap from photos/videos | Event montage (assistant workflow) | `kopi-sde` |
| Edit or revise another supplied video as a complete piece | `full-edit` | `kopi-full-edit` |
| Find passages in a longer recording and make Shorts/Reels | `shorts` | `kopi-shorts` |

An already short recording can still be a full edit. Duration alone does not
choose a workflow. If the brief could mean either, ask which output is intended.
Proposal requests still follow PROPOSALS.md and do not authorize rendering.

## Load only the selected preferences

For an event montage, follow EVENT-HIGHLIGHTS.md and use only applicable event
preferences under preferences/events/. Do not call profile show --workflow sde
or inherit full-edit/Shorts preferences merely because a video profile is installed.

Before planning a full-edit or Shorts edit, run:

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

For event-specific intake, missing logo/music choices, photo/video selection,
defaults, source access and delivery, follow [EVENT-HIGHLIGHTS.md](EVENT-HIGHLIGHTS.md).

Follow VERIFICATION.md. Verification must reduce total rework, not just produce
the fastest first render. Keep one source-to-output map for footage, audio and
captions; mark uncertain words and boundaries before dependent treatments.
Automatic transcripts can be wrong, especially on names and mixed languages.
The assistant must not invent speech or pretend to have listened to audio.

This release provides local tools and assistant instructions. Drive delivery,
channel monitoring, schedules and cloud-worker orchestration require separately
configured integrations. Static image editors are generated locally from layered
design manifests; automatic content selection and unattended production are not
enabled by this command. Profile installation does
not enable any of them.
