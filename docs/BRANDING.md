# Reusable client branding

Use when the user explicitly asks to save or apply a client's video branding.
There is no brand setup requirement for ordinary edits. A one-video design
choice does not become a permanent preference without the user's instruction.

## Create or update a profile

Identify the client and supplied asset folder. Inspect logos, actual font files,
color specifications, brand guidelines, approved examples, and any instructions.
If the client identity is ambiguous, ask. Derive a stable local folder name and
keep the selected client clear in the chat.

Store the private profile at preferences/clients/<client-name>/brand.md. Put
supplied reusable assets under that client's assets folder, preserving originals.
Do not put logos or profiles in tracked examples, shared skills, or source control.
The entire preferences directory is ignored by Git.

Record only what is useful and supported:

- Client name and source guideline/asset locations.
- Supplied logo variants and their intended backgrounds/placement.
- Exact approved colors and available fonts, including readable fallbacks.
- Confirmed subtitle, title-card, graphic, pacing, and sound preferences.
- Protected layouts and explicit do/don't rules.
- Which choices are confirmed, which are suggested, and where they came from.

Do not invent brand colors or claim a guessed font is the actual font. Clearly
label colors sampled from an image as inferred. Identify unavailable fonts and
propose a fallback; do not silently download or license fonts. Do not treat a logo
as permission to use unrelated branded footage or make claims on a client's behalf.

If the user says "save this approved style for Client A", save those choices and
summarize what was stored. If asked to develop new branding, present the proposed
profile for approval before using suggested choices as permanent client rules.
Setting up the profile alone does not authorize rendering a video.

## Apply a profile

Load only the client the user or current brief selected. When a project explicitly
selects a client, load that profile as defaults without requiring a magic command.
If no client is selected, do not guess from other clients' files. Current user
instructions and the current project brief override the client's stored defaults.
Report material contradictions instead of silently changing the saved profile.

Copy relevant approved choices into that video's DESIGN.md; localize fonts and
assets used in the final composition. Do not change the profile to match one-off
requests unless the user asks. Do not revise previously approved exports merely
because the stored brand profile changes.

Use the engine's style-library skill for adapting templates and graphics after
an edit is authorized. Profile setup adds no new third-party assets or paid tools.
