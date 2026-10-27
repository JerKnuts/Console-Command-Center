# Future features

These are candidates, not promised release features. The book/note reader, in-CCC Audio Slate playback, packaged official-item thumbnails, on-demand mod still previews, studio lighting, ground shadows and manual batch editing are implemented. See [model previews](MODEL_PREVIEWS.md), [books and slates](AUDIO_SLATES.md) and [command batches](COMMAND_BATCHES.md).

## Loading and model fidelity

- Reduce cold High/Ultra preparation and transfer costs further, including investigating GPU-compressed textures. Progressive color previews and larger transfer chunks are implemented; Ultra can still take time.
- Improve layered materials, transparency, refraction, cloth poses and modular assembly coverage. Current previews approximate the game renderer.
- Investigate an optional persistent asset/thumbnail cache with reliable invalidation after mod or load-order changes. Current dynamic thumbnails are cached only in memory.
- Continue the separate native inventory-renderer experiment. It is not part of this release or a replacement for the current WebGL viewer.

## Browsers and testing

- Quest bookmarks and running/completed filters.
- Mod scan comparisons, per-plugin visibility and optional validated catalog caching. Current scans are manual and last for the game session.
- More reviewed names, model coverage and supported record types.
- Dev Mode report filtering/editing, portable favorites, recent IDs and before/after stat comparisons.
- Embedded image-slate layouts. The reader displays supported text and recorded audio; videos are outside scope.

## Command batches

- Duplicate-command warnings, especially for repeated toggles.
- Execution progress and cancellation of remaining commands.
- Descriptions, tags, folders and reusable variables.
- Auto-Run choices for first load per session versus every load, adjustable delay and per-character selections.
- Persistent Auto-Run reports that survive quitting before CCC opens.

## Known issues to investigate

- The direct CCC keyboard shortcut can require two presses.
- OSF UI can remain stuck on Loading, especially after repeated teleports.
- Remaining unsupported command readouts and material cases need live verification; successful dispatch alone is not a verified result.

See the [README](../README.md) for current workarounds and [release validation](../RELEASE_VALIDATION.md) for the distinction between automated checks and in-game confirmation.
