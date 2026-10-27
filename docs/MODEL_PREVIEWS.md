# Item previews and Model Viewer

CCC reads installed geometry and materials in its own WebGL viewer. It does not equip the player, copy an engine scene or contact an online service. Preview controls are available in Basic and Advanced mode. Complete ships have no viewer because complete ship assembly is unsupported; supported individual ship parts and vehicles can be previewed.

## Small previews

Official items with a packaged thumbnail show a still image immediately, without native model requests or WebGL. There are 4,822 mappings to 3,459 images, including REV-8 and Moonjumper. These vanilla snapshots do not reflect installed replacers. See [thumbnail coverage and regeneration](PACKAGED_THUMBNAILS.md).

Mod items and books/slates without a bundled image request a small color model when visible, render a still image, and dispose the temporary renderer. Up to 12 generated stills / 2 MiB are retained in session memory; no thumbnail cache is written to disk. Unsupported assets show an unavailable message. Small previews have no rotation controls or surrounding frame.

Books / Notes and Audio Slates offer only a still preview, with a compact Read or Listen button beneath it. Flat reading models stand upright at a slight angle. These items have no full Model Viewer button. See [books and slates](AUDIO_SLATES.md).

## Full viewer controls

Left-drag pans, middle-drag orbits, right-drag up/down zooms, and the wheel zooms toward the pointer. Shift plus arrow keys pans; double-click resets the camera. Close, Escape or controller B returns to the selected item. The browser restores its row and scroll position.

| Controller | Action |
| --- | --- |
| LB / RB | Mannequin on/off / outfit body sex, when available |
| Y | Quality chooser; D-pad or left stick selects, A applies, B cancels |
| X | Textures on/off |
| D-pad Left / Right | Cycle background while the quality chooser is closed |
| R3 | Toggle left-stick light movement |
| L3 | Toggle left-stick brightness control |
| Left stick | Pan, move light or adjust brightness in the selected mode |
| Right stick | Rotate |
| L2 / R2 | Hold to zoom out / in |
| B | Close chooser or viewer |

Light and brightness modes are mutually exclusive. Textures Off shows neutral shaded geometry while retaining supported cutout masks. Supported apparel, spacesuits, helmets and vehicles use their corrected initial/reset orientation. Texture upgrades preserve the current camera.

## Mannequins

Mannequin starts off when CCC loads, and the on/off choice is remembered for subsequent items during that page session. Body selects the outfit's male/female model; unavailable variants fall back to the available one. A separate mannequin-body control offers Auto / Female / Male. Auto follows the main outfit rather than shared gloves or boots.

Spacesuits use only the mannequin neck/head, avoiding extra hands, feet and torso inside the suit. Helmets, hats and packs use full-size mannequins. Apparel uses an inset body to reduce clipping. The mannequin is static and does not reproduce the player's shape, animations or outfit-specific masking; tight or open clothing may still clip.

## Backgrounds, lighting and shadows

Background is available in both Basic and Advanced mode and applies to small previews as well. Dark theme defaults to Graphite; light theme defaults to Pearl. Other choices include Blue, Teal, Warm and Plum gradients, light Mist, Linen, Sage and Lavender gradients, and solid Charcoal/Black. Choices are saved separately by theme. Shop backdrops are retired and not shipped; older saved shop selections fall back to the theme default.

All four quality presets use authored normal/roughness/metal maps where supported, neutral studio reflections, bloom, subtle monochrome grain and tone mapping. Depth of field is disabled. Reflections respond to rotation and lighting; they are not ray tracing or game-world reflection captures.

Filtered shadow maps use Low 1024, Medium 1536, High 2048 and Ultra 4096, subject to GPU limits. A transparent receiver below the model supplies a soft contact and light-cast ground shadow without a visible floor. Glass, normal-only overlays and transparent effects do not cast opaque silhouettes. Moving the light updates the shadows. If shadow targets cannot be allocated, ordinary lighting remains available.

## Quality and loading

Low, Medium, High and Ultra preserve the same supported geometry. High is the default. Full previews show geometry first, a small color stage next, then the selected detailed quality. The color stage uses base-color mips up to 128px plus opacity/tint, skipping detailed normal/metal maps and layered composition. A loading ring indicates work; failed upgrades retain the usable preview and report the error.

Ultra requests source textures up to 4096px with a 192 MiB decoded material budget and 256 MiB transfer cap. It uses supersampling capped at 8192px per side and 24 megapixels. Lower qualities use a 64 MiB transfer cap. Final packets reduce large images only when needed to fit the cap; they preserve geometry, references and alpha. Sources are not upscaled to invent detail. Complex cold Ultra loads can still be slow.

Native replies advertise chunks up to 256 KiB. Older DLLs retain 64 KiB replies. Four concurrent ranges are paced in batches at least 70ms apart; retries shrink conservatively. This reduces request overhead without changing texture pixels or OSF rate limits. Install the matching DLL and restart Starfield for native changes.

Recent decoded models, shared textures and archive indexes are reused within bounded in-memory caches. There is no persistent asset cache. Closing the viewer cancels transfers and releases GPU resources; an active native file read may finish in the background.

## Asset and material support

Supported record types include BOOK (still only), MISC, WEAP, ARMO, AMMO, ALCH and available furniture, workshop, ship-part and assembly records (FURN, STAT, MSTT, ACTI, CONT, DOOR, GBFM, PKIN, COBJ). Eligibility does not guarantee a usable model. Record traversal is bounded and uses plugin-local ID remapping.

Armor uses matching armor-addon models. Weapons resolve supported default attachment templates and authored attachment transforms; equipped/random inventory modifications are not read. Origin-space wearable attachments use bind transforms. Record MOLM/LMSW/MTPT swaps, armor-addon sex variants and supported OBTS/OMOD material swaps apply before texturing. Item variants override addon defaults. The [variant audit](PREVIEW_VARIANT_AUDIT.md) is a structural check, not visual certification of every entry.

The reader supports bounded BA2/NIF/mesh paths, supported embedded geometry, zlib/raw LZ4 archives and BC1/2/3/4/5/7 or supported raw DDS formats. Material lookup reads installed standalone JSON .mat files before the CDB fallback, with bounded inheritance, layers, texture slots and tint/constant colors. Supported normal-only decals preserve underlying color. Animated caustic and inhaler effects are approximate; see [animated previews](ANIMATED_PREVIEWS.md).

The exact engine-only materials/effects/fires/HeatDistortion.mat shell is omitted. Its scene refraction cannot be reproduced as an ordinary surface: doing so covered Crimson Gutter, Crimson Shiv and related blades in gray. Physical blades, visor materials and other supported effects remain eligible.

Scene selection and archive precedence approximate the game's resolver. Existing narrow material fallbacks include Akila Security gloves, supported helmet lights and the Particle Machine Gun's fully transparent body/grip materials. CCC retains the original game textures for the previously reported cap branding and Barrett outfit rather than those installed replacers. No installed mod files are changed.

## Remaining differences and diagnostics

The missing-material checkerboard is disabled, including in Dev Mode. Incomplete-layer notices and native diagnostics remain available. A normal-looking preview does not certify complete shader fidelity.

- Glass, refraction, dynamic screens, transparency sorting, layered textile/paint materials and game post-processing can differ.
- Cloth is not simulated. The Caped House Veth'aal Suit's separate banner can appear detached in its authored rest pose; it is retained rather than deleted or placed with a guessed offset.
- Mantis backpack inner surfaces may be visible in the standalone view even though they are hidden against a body in game. The authored model is retained.
- Ecliptic backpack layered materials, Aqueous Hematite's dynamic display and some replacement assemblies still need in-game comparison. See [material findings](MATERIAL_FEEDBACK_1339.md).

Native lookup runs on the SFSE task queue, with asset reading on a bounded worker and compressed transport into WebGL 2. Packet versions 1–11 remain readable. Native fixtures cover paths, bounds, decompression, inheritance, attachment placement and transport; browser checks cover transfer cancellation, rendering and state preservation. See [release validation](../RELEASE_VALIDATION.md) for completed checks and remaining in-game review.

The BA2/NIF/mesh readers and shaders were independently written. SFShopExplorer 0.8.123 was examined for format research; its renderer and shaders were not copied. DDS decoding uses the unmodified bcdec v0.985 header under its MIT option. See [third-party notices](../THIRD_PARTY_NOTICES.md). Raw game/mod model, texture and audio assets are not included in the source package; generated still previews are shipped as UI assets.
