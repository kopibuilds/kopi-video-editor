# Editable image designs by default

Every new or revised static design containing text must include a self-contained
manual editor as the only default output, including its PNG export button.
Generate separate PNG/JPG files only when explicitly requested. Apply this by the actual content,
not the name: photo posts, carousels, posters, thumbnails, quote cards, covers,
banners, infographics and other images with text all qualify. The user does not
need to say “manual editor.” A current explicit request for exports only overrides
the default. This does not add an editor to ordinary untouched photos or every
frame of a video.

## Assistant workflow

1. Preserve a layered design manifest as the source of truth: local source image
   paths, image frames/crops, and separate text layers with exact wording and style.
   Do not burn the editable text into a background and label that editable.
2. Reuse the current design and source assets. Do not change a provider or make new
   AI images merely to build the editor. An existing flattened reference may need
   rebuilding from source images and text. Explain missing source limitations.
3. Build the editor automatically with `node kopi.mjs image-editor DESIGN_JSON
   --output outbox/JOB/image-editor.html`. No engine, extra packages, account,
   server, subscription, API calls or installations are needed for this command.
4. Inspect the layout and check the primary text-edit/photo-replace/PNG-export
   interactions on a representative design. Deliver only the editor by default.
   Temporary local screenshots for layout verification are not extra deliverables;
   do not create a separate image-delivery workflow unless requested.
   Open its local HTML in the available side-panel browser when
   supported; otherwise give its absolute file link. A presentation preview with
   “Request edits” is not a substitute for direct manual editing.
5. For revisions, generate a new output filename and preserve the prior editor,
   source manifest and any requested exports. Use the same design data for static exports and
   the editor so their words, crops and positions agree. The editor's PNG export
   can produce the static delivery; never quietly change an approved design.

This is an assistant workflow default backed by a local generator. It does not
watch folders or retroactively discover/rebuild all previous designs on its own.
No publishing, uploads, paid generation or credential access is authorized by it.

## Manifest

Paths are relative to the manifest file. Coordinates and font sizes are pixels.
Use 1–30 pages and the actual design dimensions (64–4096 pixels on each axis).
Image frames can be anywhere on the canvas. Images draw in array order, followed
by editable text in array order. Supply clean source photos, not photos with the
same captions already baked in. Use a precomposed background for fixed decorative
artwork, while keeping every requested photo and text as its own layer.

```json
{
  "version": 1,
  "pages": [{
    "title": "Square quote card",
    "filename": "quote-card",
    "width": 1080,
    "height": 1080,
    "background": "#101010",
    "shade": 0.8,
    "images": [{
      "id": "portrait", "label": "Portrait", "path": "portrait.jpg",
      "x": 0, "y": 0, "w": 1080, "h": 1080, "shadeHeight": 320,
      "zoom": 1, "panX": 0, "panY": 0
    }],
    "texts": [{
      "id": "quote", "label": "Quote", "text": "Your editable words",
      "x": 70, "y": 860, "w": 940, "size": 48,
      "family": "Arial", "bold": true, "color": "#ffffff", "align": "center"
    }]
  }]
}
```

`shadeHeight` adds a black gradient inside the bottom of that photo's frame.
`shade` controls its maximum opacity. Optional `headerShade` adds a subtle
black strip of that height at the top of the canvas. `panX`/`panY` range from
-1 to 1; zoom ranges from 1 to 4. A photo fills its frame without distortion.
The manifest must specify local PNG, JPEG, WebP or GIF files. URLs, network shares,
SVG, arbitrary HTML, and scripts are not accepted as image inputs. GIFs export as
a still. Input manifests and prior outputs are never overwritten.

Text uses installed system fonts; a recipient needs the same font for an exact
match. The generator does not embed font files. Explicit newlines are preserved,
with additional wrapping to fit the text box. Dense infographics, unsupported
effects or reference fonts may require a layout rebuild; do not promise pixel
identity without comparing the result.

## Manual editing and sharing

Click text to type directly, or select a layer and edit its controls. Select a
photo, choose **Replace photo**, or drop an image on a photo frame. Drag images
to crop and use Zoom for scale. Replacement dimensions can differ. Text remains
separate. Use **Move text** or position controls to reposition text.

The editor embeds its images and runs offline in a normal browser or a compatible
Codex browser panel. It has no external dependencies or network calls. Send the
HTML to another team member to share the design. Browser storage is best effort
and local to that browser: use **Save project** for a portable JSON containing the
selected design's text, images and crop settings, then **Open project** in the same
design's editor to restore it. Multi-design HTML offers a design selector; each
design saves and exports separately. **Export PNG** exports the selected design
at its original pixel dimensions. Edits do not sync between teammates.

Generated HTML and saved project JSON contain private image assets. Keep manifests,
embedded outputs, project JSON and client assets inside ignored project/output
folders. Commit only the reusable code, template, synthetic tests and instructions.
