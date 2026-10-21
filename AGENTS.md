# Kopi workspace instructions

For setup, design suggestions, editing, or revisions, read docs/ASSISTANT.md. The shared skill is
.agents/skills/kopi-editor/SKILL.md. Claude Code also has a discovery entry in
.claude/skills/kopi-editor/SKILL.md; CLAUDE.md imports this guide.

When the user asks to suggest/propose a design, inspect a folder for editing ideas,
or help choose a style, follow docs/PROPOSALS.md. Inspect and propose first; wait
for approval before making video edits or rendering. A direct request to edit
still authorizes the normal editing workflow. If the intent is unclear, inspect
the files and offer a proposal rather than assuming permission to edit.

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
