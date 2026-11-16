# Kopi graphics

A configurable static-graphics pack: four social-card appearances, light/dark/
custom themes, photo panels, quote cards, blurred cards, highlighted quotes and
seven infographic layouts. Includes an offline editor with PNG export.

No client identity, avatar, logo, signature, branded examples, photo-library link
or account connection is included. No external assets are fetched. System fonts
are used; there are no third-party font files or sample photos to redistribute.
The renderer/editor use local Node and browser capabilities, with no npm/pip
packages, API keys, model calls or server. Paid services are not enabled.

## Using the built-in pack

Update Kopi normally. Ask for a generic social-card carousel, photo-panel poster
or infographic. The kopi-graphics skill checks applicable private preferences
first, then asks only missing setup questions for the selected output. A user
may accept neutral defaults, supply a reference or choose custom colours.

Choices and supplied assets stay under ignored .kopi/graphics, separately by
brand/project and output. Setup is an assistant conversation, not a background
wizard that runs merely on opening a file. Topic-only content starts with a
copy proposal; supplied final copy can go straight to layout.

Private precedence is checked dynamically, regardless of installation order.
A matching private pack wins over generic settings. Legacy packs need a one-time
scope confirmation when their applicable brand/formats are unknown. Their files
are never rewritten. See SCHEMA.md for metadata and explicit-selection behavior.

Video/YouTube repurposing continues to use kopi-video-repurpose and its saved
designs unless a graphics-pack style is explicitly requested. Nothing here changes
Shorts styling or creates moving-video templates.

## Standalone ZIP installation

Extract the whole kopi-graphics folder and give it to Codex: “Install this graphics
pack in my Kopi.” The assistant reads SKILL.md and runs:

    node "/path/to/kopi-graphics/install.mjs" --kopi "/path/to/Kopi"

The installer creates versioned ignored files and local skill entries. It preserves
all settings, private packs and existing tracked built-in discovery entries. Repeating
installation is safe; a changed pack selects a new version and retains old files.
No commits, stashes, author configuration, remote Git calls or authentication occur.
Local Git exclusions must be writable; failure stops installation. They do not
prevent deliberate force-adding private files. A new chat may be needed if the
assistant's skill discovery was cached. New workspaces need their own setup.

## Build and editing

Use SCHEMA.md and the examples after setup. Local files are required for photos.
The build refuses overwrites and creates a single self-contained HTML set. In the
editor select a slide, type directly, replace/crop a photo, move text/images, save
a project JSON or save the whole editable HTML. Changes remain in memory until
saved. Export PNG exports the selected slide. Nothing is uploaded or auto-shared.

The initial public release is checked in Windows desktop Chrome. The code uses
portable Node paths and browser APIs for Mac/Windows; Mac execution is unverified
until tested there. Use desktop Chrome/Edge for the first editor/export check;
Safari is not certified. System-font appearance can vary by operating system.
