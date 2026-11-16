---
name: kopi-graphics
description: Create configurable social-card, photo-panel, quote and infographic designs from a topic or final copy. Use a matching private pack first; video-source requests retain their own workflow unless this style is selected.
---

# Kopi graphics

Read the workspace instructions. This generic pack has no client identity,
brand assets, saved photo sources or client colour themes. It supplies six layout
families and an offline HTML editor. It does not replace video repurposing.

## Resolve preferences before setup

Precedence: current explicit request, matching selected private pack, confirmed
generic settings, generic layout defaults. Never reset a private pack during a
Kopi update or generic-pack installation. A subsequently installed matching private
pack takes priority too. Do not merge unrelated brands or output preferences.

Determine the intended brand/project and format from the current conversation.
If ambiguous, ask. Do not infer a brand merely from a familiar person or channel.
Run:

    node <pack>/resolve.mjs --kopi <checkout> --brand <slug> --format carousel

Use poster or graphic for the other static formats. The resolver reads only local
pack metadata and the chosen settings file, not credentials. A private route means
read that pack's skill and use its tools; do not build with generic defaults.
If it reports ambiguous/unknown private scope, ask which pack applies and record
the answer locally for the requested output. For a legacy pack, record
outputs.<format>.privatePack as its exact ID. For a
pack explicitly confirmed unrelated, record its ID in
outputs.<format>.unrelatedPrivatePacks for
this brand only. Never dismiss a private pack merely to bypass a missing setting.
If the selected private pack disappears, ask before falling back. An explicit
request for the generic pack can use --pack kopi-graphics for that request only.

## First use

Follow SETUP.md only for missing choices in the requested format. No handle,
avatar, logo, signature or verification marker is implied. Offer the appearances,
themes and layouts in OPTIONS.md or accept the user's reference. Colours, fonts,
identity and photo sources come from the user; neutral light/dark are optional
generic starting points that the user may accept, not a stored client palette.
No photo-source link is bundled. A user can supply a public Drive folder, local
folder or attachments. Ask what its subfolders are for if unclear; do not assume
any folder name or structure. Public-link access can fail. Use available authorized
tools or anonymous access, otherwise ask for local files. Never retrieve saved
credentials or connect an account merely because a link was supplied.

Settings live in ignored .kopi/graphics/settings/<brand>.json with shared identity
and separate outputs.carousel, outputs.poster and outputs.graphic sections. Save
assets locally and use paths relative to that file. Source photo paths in a spec
are relative to the spec. Keep all settings and output files out of public Git.
Use resolve.mjs --save FILE --kopi PATH --brand SLUG to save a reviewed settings
file; --replace explicitly updates that brand only after preserving other fields.
First use must not require setting up every other format.

## Content and design

For topic-only requests, propose an audience, concept, numbered slide/panel copy
and caption. The user need not write a brief. Ask only missing essentials. Get
approval for newly written copy before layout; supplied final copy and an explicit
format/style need no redundant approval. Preserve approved wording. Verify added
statistics, distinguish paraphrases from quotations, and avoid invented attribution.

Default carousel length is a suggestion, not a required count. Use the brief's
count and format. Offer square 1080×1080 or 4:5 1080×1350 for static designs. Keep
text readable (at least 22px at 1080 wide, body generally 24px or more), contrast
clear, and text off faces. Inspect source photos and actual crops. Video stills
follow Kopi's flattering-frame rules; moving Shorts retain natural speech.

Create a spec using SCHEMA.md, then:

    node <pack>/build.mjs spec.json --kopi <checkout> --brand <slug> --output <private-outbox>/editor.html

The builder rechecks private-pack precedence before using generic settings. It
uses Node's standard library only: no Python, browser installation, network, model
API, server or paid generation. It refuses overwriting existing output. Do not
use a reference image with text already flattened as the supposedly editable page.

## Check and deliver

Check every slide for readable copy, overflow, contrast, good crop and consistent
styling. Shorten or reflow overflow instead of shrinking text excessively. Test
representative text editing, photo replacement and PNG export. Desktop Chrome/Edge
is the verified Windows editor/export path; Mac execution must be checked on Mac
before claiming it was tested there. No runtime-specific absolute paths are used.

Deliver one editable HTML set, caption and useful alt text. Separate PNG/JPG files
are generated only on explicit request. The editor supports slide selection,
direct text editing, text controls, photo replacement/cropping, movement, undo,
project JSON save/open and saving a whole edited HTML. Changes are in memory until
saved. PNG export is user-operated. No external canvas is created by default.

## Boundaries

Topic/copy graphics use this pack or a matching private pack. Video/YouTube to
carousel, poster or Shorts starts with kopi-video-repurpose and its own saved
preferences. Use this pack only when its style is explicitly requested for that
video. This does not authorize creating all formats or changing Shorts styling.

Public package updates never include personal settings or copy private assets.
Read README.md for ZIP installation. No installer/update creates commits, sets
Git author identity, accesses credentials, uploads files or enables paid services.
