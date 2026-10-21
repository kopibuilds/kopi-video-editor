# Kopi workspace instructions

For setup, design suggestions, editing, or revisions, read docs/ASSISTANT.md. The shared skill is
.agents/skills/kopi-editor/SKILL.md. Claude Code also has a discovery entry in
.claude/skills/kopi-editor/SKILL.md; CLAUDE.md imports this guide.

At the start of a new editing/proposal/review session, follow docs/UPDATES.md:
run `node kopi.mjs updates` unless KOPI_UPDATE_CHECK=off. The check is cached for
a week and must not interrupt an active edit or render. If a newly checked update
is available, briefly explain it and ask permission before installing. Declining
or being offline does not block work. A request to check does not approve installing.
For an explicit request to update Kopi, use the safe update steps in that guide.

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

Current project instructions override defaults. Preserve source recordings and
honor explicit speech-preservation requirements. Never assume setup preferences
are permanent. Local transcription is the default; reuse installed Python and
cached models before installing anything. Never print login material or commit
private recordings, transcripts, exports, music, credentials, or preferences.

Changes to this package must preserve useful verification. Run node --test after
changing commands. Test a real render or transcript when the affected path changes.
