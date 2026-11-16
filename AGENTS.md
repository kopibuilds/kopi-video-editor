# Kopi workspace instructions

For every static image design containing text, automatically deliver a directly
editable local HTML version alongside the image exports, regardless of whether
the user calls it a photo, carousel, poster, thumbnail, cover or another name.
Do not wait for the user to request a manual editor. Read docs/IMAGE-EDITOR.md
and use `node kopi.mjs image-editor` with separate image and text layers.
An explicit exports-only brief can override this default. Keep private assets
and generated editors out of Git.

For setup, design suggestions, editing, or revisions, read docs/ASSISTANT.md. The shared skill is
.agents/skills/kopi-editor/SKILL.md. Claude Code also has a discovery entry in
.claude/skills/kopi-editor/SKILL.md; CLAUDE.md imports this guide.

Setup and approved updates must include `node kopi.mjs dependencies`. This installs
missing yt-dlp locally from official releases and verifies it; reuse existing tools.
Do not call an update complete after only pulling Git or leave downloader setup
for the user to request separately. Report blocked installations honestly.

At the start of a new editing/proposal/review session, follow docs/UPDATES.md:
run `node kopi.mjs updates` unless KOPI_UPDATE_CHECK=off. The check is cached for
a week and must not interrupt an active edit or render. If a newly checked update
is available, briefly explain it and ask permission before installing. Declining
or being offline does not block work. A request to check does not approve installing.
For an explicit request to update Kopi, use the safe update steps in that guide.
Use `node kopi.mjs update` for an approved update. Updating never authorizes
creating a local commit, stash, merge commit, rebase or push, or configuring
user.name/user.email. Never ask a teammate for author identity just to update.
If local changes/history prevent a fast-forward, stop and explain; do not save
them in a commit to make the update work. Windows sandbox setup is separate
from Kopi setup: report an actual platform prompt rather than starting it as
a routine Kopi update step or weakening its protections.

When the user asks to suggest/propose a design, inspect a folder for editing ideas,
or help choose a style, follow docs/PROPOSALS.md. Inspect and propose first; wait
for approval before making video edits or rendering. A direct request to edit
still authorizes the normal editing workflow. If the intent is unclear, inspect
the files and offer a proposal rather than assuming permission to edit.

For a reference-video breakdown, read docs/REFERENCES.md. For saving or applying
a client's video branding, read docs/BRANDING.md. For checking an exported video,
read docs/REVIEW.md. These requests do not by themselves authorize video edits.
The corresponding kopi-reference, kopi-brand, and kopi-review skills are available
in both .agents/skills and .claude/skills. They reuse the installed engine's guidance.

Use node kopi.mjs for checks, setup, project creation, transcription, and renders.
The creative editing engine is Herk Edit Kit, installed at .kopi/engine. Read its
AGENTS.md and relevant skills before editing. Keep its licenses intact.

For each edit choose the workflow in docs/WORKFLOWS.md: full-edit for a complete
video edit, shorts for extracting Shorts from a longer recording. Read only that
mode's private preferences with node kopi.mjs profile show --workflow <mode>.
Add a show only when explicitly selected. Do not merge the creative preference
sets. Use kopi-full-edit or kopi-shorts accordingly. Read docs/VERIFICATION.md
before rendering; inspect exact frame zero and every frame of the first second.
For private team setup read docs/PROFILES.md and install profiles outside this
repository. For YouTube sources read docs/YOUTUBE.md; reuse yt-dlp without cookies.

Current project instructions override defaults. Preserve source recordings and
honor explicit speech-preservation requirements. Never assume setup preferences
are permanent. Local transcription is the default; reuse installed Python and
cached models before installing anything. Never print login material or commit
private recordings, transcripts, exports, music, credentials, or preferences.

Changes to this package must preserve useful verification. Run node --test after
changing commands. Test a real render or transcript when the affected path changes.
