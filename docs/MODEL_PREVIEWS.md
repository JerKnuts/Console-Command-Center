# Model Viewer

The experimental viewer reads installed game geometry and materials without adding inventory, equipping the player, copying an engine scene or contacting an online service. Game assets are not distributed with CCC. In ID Browser, enable Advanced Options and select a supported item; scanned mod assets also offer previews. The info panel has a Low-quality inline preview and a **Model Viewer** button (controller **Y**).

## Controls

Left-drag pans, middle-drag orbits, right-drag up/down zooms, and the wheel zooms toward the pointer. Shift plus arrow keys pans; double-click resets the camera. Panning shifts projected screen coordinates so moving to the edge does not stretch the object. Close, Escape or controller B returns to the selected item. ID Browser restores its row and scroll position.

All categories start with the mannequin off. Supported wearables offer Mannequin and Male/Female controls; missing sex variants fall back to the available model. The mannequin is static and does not reproduce player body shape or animation. Textures Off shows neutral shaded geometry while retaining cutout masks. It intentionally does not show the Dev Mode missing-material checker.

| Controller | Action |
| --- | --- |
| LB / RB | Mannequin on/off / male/female body |
| Y | Quality chooser; D-pad or left stick selects, A applies, B cancels |
| X | Textures on/off |
| R3 | Toggle left-stick light movement |
| L3 | Toggle left-stick brightness control |
| Left stick | Pan; move light or adjust brightness in the selected mode |
| Right stick | Rotate |
| L2 / R2 | Hold to zoom out / in |
| B | Close chooser or viewer |

Controller input stays with the fullscreen canvas instead of cycling toolbar buttons. Light and brightness modes are mutually exclusive. The movable light marker is projected from its 3D position and uses cursor-aware picking. Ordinary mouse controls remain available.

## Quality and loading

Low, Medium, High and Ultra preserve original mesh geometry. All retain normal/roughness maps, authored metal maps, studio reflections and tone mapping. All four presets also include the extra studio reflection panels, bloom and subtle monochrome grain. Depth of field is disabled. These are preview studio reflections, not ray tracing or the game world reflected into the model. Textures Off bypasses the post effects.

Ultra requests source textures up to 4096 pixels, with a 192 MiB decoded material budget and a 256 MiB transfer cap. Actual source resolution, number of materials and shared memory coverage determine the resulting map sizes; images are not upscaled to invent detail. Ultra uses supersampling capped at 8192 pixels per side and 24 megapixels while preserving aspect ratio. Offscreen bloom and scene depth targets are used by every preset and released when changing preset or closing. If allocation fails, the renderer falls back to its ordinary scene pass. High remains the default.

On a cold load, both inline and fullscreen previews request and draw geometry without textures first, before starting any material request. Fullscreen then adds Low textures before upgrading to Medium, High or Ultra. Geometry can be reused from an inline preview even while its texture request is pending. Material upgrades preserve the camera and compatible geometry. A CCC ring at the bottom right indicates loading. Failed upgrades retain the usable preview and display an error. Recent decoded models, shared textures and archive indexes are reused in memory; this is not a persistent disk cache. Cold High requests can still be expensive. Closing the viewer cancels remaining transfers and disposes GPU resources; an active native file read can finish in the background.

## Supported assets and material selection

Supported records include MISC, WEAP, ARMO, AMMO, ALCH and available furniture, workshop, ship-part and assembly records (FURN, STAT, MSTT, ACTI, CONT, DOOR, GBFM, PKIN, COBJ). Eligibility does not guarantee that a record exposes a usable model. Books and notes have no 3D preview. Record/assembly traversal is bounded and uses plugin-local ID remapping.

Armor uses matching armor-addon models. Weapons resolve supported default attachment templates; Beowulf also has a curated standard assembly placed using authored attachment points. Equipped/random inventory modifications are not read. XM-2311’s scope-mount model uses its receiver’s authored Scope transform through an exact model-path alias. Five reported Particle Machine Gun body/grip material paths use a narrow fallback when their resulting opacity is entirely zero. Partial masks and unrelated materials are preserved. This restores the receiver, frame, barrel frame, body parts and standard grip without hiding unsupported geometry. Origin-space attachments use bind transforms rather than guessed offsets. Scene/model selection and archive precedence approximate the game resource resolver.

The reader supports bounded BA2/NIF/mesh paths, external and supported embedded geometry streams, DDS color/opacity/normal channels and material-database lookups. It decodes supported BC1/2/3/4/5/7 and raw formats, including zlib and raw LZ4 archive data. CDB inheritance follows bounded parent/first-layer material and texture links, including replacement-enable flags, tint and constant colors. A material without an albedo DDS can be valid. Root light colors and supported texture-free inline shaders retain authored colors.

Record MOLM/LMSW/MTPT swaps, armor-addon sex variants, and typed default OBTS/OMOD material swaps are applied before texturing. Item variants override addon defaults. This fixes the Syndicate Boss Suit's generic white jacket by choosing its blue/patterned materials. The [repeatable variant audit](PREVIEW_VARIANT_AUDIT.md) scanned 1,070 ARMO/WEAP entries and verified 1,606 rules across 388 entries using this route. Those are structural results, not 388 visually certified matches.

CCC deliberately uses original game textures for cap branding and Barrett's outfit instead of the installed retexture overrides previously reported. This does not alter installed mod files. Narrow material aliases restore the Akila Security gloves and supported helmet/light textures.

## Diagnostics and remaining differences

Dev Mode applies a small bright red/blue procedural checker to unresolved surfaces or explicitly known incomplete materials in both preview sizes. Loaded color maps, authored tint-only materials, glass and mannequins are not missing merely because they are plain or have multiple layers. Textures Off suppresses the diagnostic. The checker identifies supported failure conditions; its absence cannot certify full shader fidelity.

- **Ecliptic backpack:** base color and normal resolve, but its masked textile/paint layers are not reconstructed. An exact material-path exception marks that known incomplete surface; unrelated Ecliptic/Bounty Hunter materials are not flagged.
- **Mantis backpack:** the inspected shell has authored color/normal/roughness maps. Its white appearance alone does not establish a missing file; layered rendering remains approximate.
- **Glass, dynamic screens, translucency, complex layer blends, refraction and game post-processing** can differ. Transparency sorting is per piece. No claim of full Starfield renderer equivalence is made.
- **Miscellaneous material feedback:** inherited surfaces were restored for the reported jars, control board, samples, containers and resources. Normal-only bolt/trim decals preserve underlying color through a dedicated overlay pass; this resolves the reported sample caps, Astra, manifold and replacement-model details. Eggmund's texture-free inline component uses its authored color, and the Blue Fluted Vase uses its form-linked blue material.
- **Model identity:** Bio-Sensor uses the DataSlate model named by the inspected record. Aqueous Hematite's blank/dynamic display and complete runtime replacement models still need in-game comparison; no geometry is hidden to mask those differences.

The October 16 material reports covered 18 distinct models; subsequent tests resolved all 18 item packets and all ten distinct nonempty missing-material paths from the runtime log under supported packet criteria. This verifies paths and decoded channels, not every game shader. Catalog feedback expectations remain in the reviewed findings modules and test fixtures, rather than separate dated documentation.

## Implementation, provenance and verification

Native form/model lookup runs on the SFSE task queue. A background worker reads assets; bounded, compressed chunks transfer to WebGL 2 in the existing OSF view. Caches and allocations have explicit bounds. Packets 1–9 remain readable; version 9 adds bounded, deduplicated metal-map references, version 7 carries incomplete-material metadata and version 8 adds validated normal-only overlays. Older packets and materials without metal maps retain the dielectric fallback. Metal maps are linear data; they affect diffuse energy and colored specular reflections. The renderer releases framebuffers, textures, buffers and listeners on disposal.

The BA2/NIF/mesh readers and WebGL shaders were independently written. SFShopExplorer 0.8.123 was examined for file-format research; its source, renderer and shaders were not copied. Texture decoding uses bcdec v0.985 under its MIT option; the unmodified upstream header and license are retained in native/third_party. See [third-party notices](../THIRD_PARTY_NOTICES.md).

Native fixtures cover malformed/truncated files, path bounds, decompression, material inheritance, template cycles, attachment placement, cold weapon initialization and packet transport. UI tests cover transfer integrity/cancellation, controls, material upgrades and state preservation. Prior real-asset browser checks covered representative clothing, weapons, helmets, miscellaneous items and the default variant fix. Current release verification is recorded in [Release validation](../RELEASE_VALIDATION.md); an offline pass is not a replacement for an in-game comparison.

### Cloth rest poses

The static reader does not simulate in-game cloth. The Caped House Veth'aal Suit's separate administrator banner uses Cloth_Banner_* bones and can appear detached beside the shoulder in its authored rest pose. This is separate from texture/reflection loading. The banner is retained; fixing this needs a supported cloth pose rather than deleting it or guessing a translation. The preview test tool's --inspect-attachment mode can inspect geometry transforms, bind matrices and inferred bone anchors for installed model paths.
