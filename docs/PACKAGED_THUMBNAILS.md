# Packaged item thumbnails

Where present, the small ID Browser preview is a bundled transparent WebP image. It makes no native model requests, creates no WebGL context, writes no thumbnail cache, and has no rotation or zoom controls. Use **Model Viewer** for the live model. The selected background still applies behind the image.

The current manifest includes **4,822 official game/update/DLC mappings** using **3,459 image files** (about **14 MiB**). [Coverage and unsupported records](THUMBNAIL_COVERAGE.json) accounts for all 6,072 attempted records across Starfield, Shattered Space, Free Lanes and Terran Armada.

Images cover base-game catalog records with supported standalone geometry. Internal markers, effects, unavailable assets and unsupported assemblies may have no image. Mod records without a bundled image request a small color model when visible, render one PNG, then dispose the renderer. A session-only cache holds at most 12 PNGs / 2 MiB; no IndexedDB or disk thumbnail cache is written. Unsupported models retain a status message and, when eligible, the Model Viewer button. Books/slates use only a still with Read/Listen; complete ships have no viewer. These are vanilla snapshots: they do not reflect a user's texture replacers or model overrides.

Generated assets are checked in under `src/views/console.command-center/main/public/thumbnails`, with plugin/local-Form-ID mappings in `preview-thumbnail-manifest.json`. Identical geometry/material/orientation packets share an image. The normal UI build copies the files into the view, so Nexus installations need no image generator, browser automation, extra game plugin, or first-run cache. Generated images must be included with both source and mod releases.

## Rebuilding the images

This is an offline authoring workflow using a local licensed game installation. It does not run on players' machines. Build the existing `PreviewGeometryTests` target with xmake. The optional render tool needs Playwright and Edge; supply `--playwright` with an installed Playwright module directory when it is not installed locally. It uses the maintained CCC renderer, male worn armor models with female fallback, the existing category rotations, small base-color maps and a transparent 384x256 image.

From the repository root, create an output directory, then:

```powershell
node scripts/render-preview-thumbnails.mjs --write-list .thumbnail-work/items.txt
$env:CCC_PREVIEW_PLUGINS='ShatteredSpace.esm;SFBGS00D.esm;SFBGS050.esm'
./build/windows/x64/release/PreviewGeometryTests.exe 'PATH/TO/Starfield/Data' --thumbnail-batch .thumbnail-work/items.txt .thumbnail-work/packets > .thumbnail-work/native.log
node scripts/render-preview-thumbnails.mjs --packets .thumbnail-work/packets --status .thumbnail-work/native.log
```

Create `.thumbnail-work/packets` before exporting. Native output resumes existing packet files; use a fresh packet directory after changing game assets or material decoding. Use `--force` when rerendering existing images after a lighting/framing change. The renderer writes a coverage/failure report beside the packets. Review failures and representative thumbnails before publishing; the tool never invents a replacement picture for unsupported geometry. No raw game asset files or binary model packets belong in the shipped thumbnail directory.
