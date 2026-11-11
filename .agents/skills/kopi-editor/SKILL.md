---
name: kopi-editor
description: Set up or update Kopi Video Editor, suggest an editing design from a footage folder, edit recordings with Herk Edit Kit, or revise a draft. Use for requests such as propose a design, suggest a style, or edit this video.
---

# Kopi editor

Read the repository's AGENTS.md and docs/ASSISTANT.md. Use the commands in
kopi.mjs for environment checks, engine setup, project creation, local speech
recognition, and exports. Read the installed engine's editing skills for the
creative work. The current user's instructions determine format and style.

For editing, read docs/WORKFLOWS.md and select kopi-full-edit or kopi-shorts.
Resolve only that mode's private profile with node kopi.mjs profile show
--workflow full-edit|shorts. Show presets are explicit and optional. Full-edit
effects and opening/end cards are not automatic Shorts preferences. For private
team installation/update use docs/PROFILES.md; for YouTube use docs/YOUTUBE.md.
Read docs/VERIFICATION.md before rendering and check the exact first frame.

For update checks or an explicit update request, use docs/UPDATES.md. Checking
availability never authorizes installing new code or changing the engine.

For requests to propose a design, suggest a style, or inspect footage for editing
ideas, read docs/PROPOSALS.md. This mode permits local analysis and a saved proposal,
not video editing or rendering. Wait for the user's approval, then carry the
approved plan into the normal editing workflow. No special command is required.
