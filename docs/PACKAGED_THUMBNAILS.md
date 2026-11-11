# Packaged item thumbnails

Where present, the small ID Browser preview shows a bundled WebP image immediately. It has no rotation or zoom controls. After a selection remains visible for one second in the running game, a low-quality complete-material request refreshes the still image using installed assets. Completed Model Viewer data is reused when available. The initial bundled image requires no model request or WebGL; generating its replacement uses a temporary renderer that is disposed afterward.

The current manifest includes **4,823 official game/update/DLC mappings** using **3,460 image files** (about **14.1 MiB**). [Coverage and unsupported records](THUMBNAIL_COVERAGE.json) accounts for all 6,072 attempted records across Starfield, Shattered Space, Free Lanes and Terran Armada.

Internal markers, effects, unavailable assets and unsupported assemblies may have no image. Supported items without bundled artwork begin generating a still when visible. A session-only cache holds at most 12 PNGs / 2 MiB; no IndexedDB or disk thumbnail cache is written. Loading failure retains existing artwork where available. Books/slates use only a still with Read/Listen; complete ships have no viewer. Bundled vanilla snapshots can differ from installed replacers; the live refresh uses the current game assets.

Generated assets are checked in under `src/views/console.command-center/main/public/thumbnails`, with plugin/local-Form-ID mappings in `preview-thumbnail-manifest.json`. Identical geometry/material/orientation packets share an image. The normal UI build copies the files into the view, so Nexus installations need no image generator, browser automation, extra game plugin, or first-run cache. Generated images must be included with both source and mod releases.

## Rebuilding the images

This is an offline authoring workflow using a local licensed game installation. It does not run on players' machines. Build the existing `PreviewGeometryTests` target with xmake. The optional render tool needs Playwright and Edge; supply `--playwright` with an installed Playwright module directory when it is not installed locally. It uses the maintained CCC renderer, male worn armor models with female fallback, the existing category rotations, small complete-material maps and a transparent 384x256 image.

From the repository root, create an output directory, then:

```powershell
node scripts/render-preview-thumbnails.mjs --write-list .thumbnail-work/items.txt
$env:CCC_PREVIEW_PLUGINS='ShatteredSpace.esm;SFBGS00D.esm;SFBGS050.esm'
./build/windows/x64/release/PreviewGeometryTests.exe 'PATH/TO/Starfield/Data' --thumbnail-batch-final .thumbnail-work/items.txt .thumbnail-work/packets > .thumbnail-work/native.log
node scripts/render-preview-thumbnails.mjs --packets .thumbnail-work/packets --status .thumbnail-work/native.log
```

Create `.thumbnail-work/packets` before exporting. Native output resumes existing packet files; use a fresh packet directory after changing game assets or material decoding. Use `--force` when rerendering existing images after a lighting/framing change. The renderer writes a coverage/failure report beside the packets. Review failures and representative thumbnails before publishing; the tool never invents a replacement picture for unsupported geometry. No raw game asset files or binary model packets belong in the shipped thumbnail directory.
