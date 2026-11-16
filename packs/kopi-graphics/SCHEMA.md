# Specs and local settings

Use examples/settings.json as a skeleton AFTER the setup conversation. Store the
completed file in .kopi/graphics/settings/<brand>.json, not this tracked example.
Set outputs.<format>.setupComplete only for approved/explicitly accepted choices.

Shared settings can contain identity, font and colour fields intended for every
output. outputs.carousel, outputs.poster and outputs.graphic override shared
fields independently. Identity fields are name, handle, subtitle, avatar, logo
and signature. Each is optional. Asset paths are relative to the settings file.
photoSource is assistant-readable local metadata, not an automatic downloader.

Theme values: light, dark, custom. The neutral light/dark palettes are generic
starting options. Custom colours require background, surface, ink, muted, line,
accent and accentInk as #rrggbb values. Any theme can override those colours.
Font values: Arial, Verdana, Georgia, Trebuchet MS, Tahoma.

Appearance values: neutral, x, threads, linkedin. Background values: plain, solid,
photo, blurred. interactions defaults false. Identity, background and appearance
are independent. No platform logo, badge or engagement count is generated.

Panel settings: color, text, opacity (0.35–1), radius (0–100 px), border (#rrggbb),
width (0.3–0.9 canvas fraction). Override them per slide using panel. The position
values are bottom-left, bottom-right, bottom-center, middle-left, middle-right,
center and top-left. Inspect the result to avoid faces and overflow.

A spec has title, format (carousel/poster/graphic), optional size [width,height],
and 1–30 slides. Dimensions are integers 320–4096; defaults are 1080×1080 or
1080×1350 for infographic. Each slide may override size, theme, colors,
appearance, background, interactions, panel and position. Local photo paths
are relative to the spec. File types: PNG, JPEG, WebP, GIF (still only).
Photo inputs are at most 30 MB. Resize larger photos before building.

| Style | Fields |
| --- | --- |
| tweet | headline, body; optional photo when background is photo/blurred |
| photo-panel | photo, text, panel, position |
| quote-card | photo, quote, panel.width/radius, position |
| blur-tweet | photo, headline, body, appearance |
| quote-highlight | photo, headline, sub, position, panel colours; signature is an optional identity asset |
| infographic | layout, kicker, title, subtitle, cta, source and layout data below |

Text accepts **bold**, ==highlight== and newlines. Text is HTML-escaped before
those limited marks are applied. Do not pass arbitrary HTML or remote image URLs.

Infographic layout data:

- stats: items (1–5), each with value and label.
- pictogram: rows (1–4), each with value, label, filled and total. total is an
  integer 1–20; filled may be fractional between 0 and total. Use true proportions,
  not multipliers. Shapes use fill/outline, not colour alone.
- steps/timeline/checklist: sections (1–5), each with optional kicker, title, text
  and checks (text array).
- levels: levels (2–4), each with name, value and label.
- comparison: columns (exactly 2), each with title and items (text array).

source is needed for factual external data. Example data is illustrative, not a
verified claim. Content can still overflow: inspect the actual result and shorten
or split copy. The renderer does not silently shrink whole slides.

The normal build command resolves private precedence first:

    node packs/kopi-graphics/build.mjs spec.json --kopi . --brand my-project --output outbox/job/editor.html

--settings FILE is an explicit direct-settings path for previews/testing or a
deliberately selected generic setup; it bypasses automatic private routing.
Assistants must use the resolver first for ordinary production requests.

## Private-pack compatibility

A new private pack may declare pack.json with schemaVersion:1, visibility:private,
id, version, brands (explicit brand/project IDs), and formats (carousel, poster,
graphic). Its SKILL.md supplies its actual preferences and build commands.
Existing private packs without this metadata remain unchanged. The resolver asks
which brand/formats they apply to, records privatePack for the chosen local brand,
and then routes to their skill; it never converts their settings to generic defaults.
Several matching packs require selection. An uninstalled selected pack requires
confirmation before fallback. Generic updates preserve settings and other packs.
