# First-use conversation

Run resolve.mjs before asking design questions. Reuse an applicable private pack
or confirmed settings. Ask only for the requested brand/project and output.

1. Identity: optional display name, exact handle, avatar, logo, signature, and
   placement. The user may omit any of them. Use real supplied assets; do not
   fabricate a signature, verification marker, platform account or engagement count.
2. Appearance: offer a few choices from OPTIONS.md or accept a reference. For
   social cards ask about platform-inspired appearance and light/dark/custom theme
   independently of background. For photo panels include panel/text colour,
   opacity, border and corner rounding. For infographics offer layout choices.
3. Photos: attachments, a local folder, or a public Drive folder provided by THIS
   user. No prefilled link or fallback library exists. Record whether photos are
   curated and any subject/subfolder rules supplied by the user. If access fails,
   ask for local photos; do not assume a connector or OAuth is available.
4. Format: confirm size, slide/panel count and text density. Ask only missing
   details; do not turn setup into a long form. Use skip/decide-later options.
5. Summarize confirmed choices and explicitly accepted provisional defaults.
   Save shared identity only when meant to be shared, with separate output
   settings. Mark unresolved choices deferred. Set setupComplete for the chosen
   output only. Do not render a design that depends on an unresolved choice.

The settings skeleton in examples/settings.json contains no identity or source.
It is an opt-in neutral starting point, not preapproved settings. Do not copy its
setupComplete flag unchanged. A user can accept those defaults or choose others.

Store settings in .kopi/graphics/settings/<slug>.json. For photo libraries store
the user's link and rules there; download chosen images locally before building.
No downloading occurs merely because a folder link is saved. Store library links
separately from identity assets (an avatar is not automatically a background).

When updating an existing settings file, read it first, change only the explicitly
approved fields and retain the other formats, source rules and private selection.
Current-job exceptions belong in the project brief/spec rather than automatically
rewriting defaults. Installing a pack must never mutate settings files.
