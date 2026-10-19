# Future features

These are candidate improvements, not promises or features of v1.3.2. Editable text batches, On Load Auto-Run, and scanned mod quest-stage controls are already implemented; see [Command batches](COMMAND_BATCHES.md) and [Mod ID catalogs](MOD_ID_CATALOGS.md).

## Command batches

The editable INCLUDED library, syntax highlighting and semicolon/inline comments are implemented in 1.3.2. Candidate further improvements:

- Duplicate-command warnings, especially for repeated toggles.
- Execution progress and cancellation of remaining commands.
- Descriptions, tags, folders, and reusable batch variables.
- Auto-Run choices for first load per session versus every load, adjustable delay, and optional per-character selections.
- Persistent native Auto-Run reports that survive quitting before CCC opens.

## Browsers and testing

- Quest bookmarks and filters for inspected running/completed state.
- Mod scan comparisons and per-plugin visibility controls.
- More reviewed plugin names and supported record types.
- Further Dev Mode report filtering, editing, and review tools.
- Activity Log export, portable favorites, recent IDs, and before/after stat comparisons.

## Mod catalog caching

Reliable optional caching remains future work. Current Mod Browser results are held only for the game session; scanning is manual. An eventual cache must preserve current runtime ID ownership, handle changed plugins, and improve startup speed. See [Mod ID catalogs](MOD_ID_CATALOGS.md).

## Automatic item previews

- Extend the experimental shaded viewer with complete material resolution, lighting, better archive support, and additional model formats.
- Investigate an isolated preview copy of the player character, including body shape and appearance, plus automatically generated/cached thumbnails. The current mannequin is static.
- The manually supplied Akila screenshots have been removed. The v1.3.2 prototype reads installed geometry on demand without paid AI processing or per-item screenshots. See [Model previews](MODEL_PREVIEWS.md).

Research reference: SFShopExplorer 0.8.123 uses a separate DirectX 12 renderer and ImGui. CCC's independent prototype uses WebGL in its existing web view. Automatic thumbnail generation remains future work.

## Book and note reader

- Explore reading book and note text directly in CCC, with readable pages and navigation.
- Books and notes no longer offer 3D previews. A reader is future work and is not included in the current build.

- Investigate transferring GPU-compressed source textures and a persistent asset cache to avoid repeated RGBA expansion/transfer on cold High previews. Model-first background upgrades are already implemented.
