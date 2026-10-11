# Future features

These are candidate improvements, not promises or features of v1.2.18. Editable text batches, On Load Auto-Run, and scanned mod quest-stage controls are already implemented; see [Command batches](COMMAND_BATCHES.md) and [Mod ID catalogs](MOD_ID_CATALOGS.md).

## Command batches

- Duplicate-command warnings, especially for repeated toggles.
- Execution progress and cancellation of remaining commands.
- Descriptions, tags, folders, and reusable batch variables.
- Auto-Run choices for first load per session versus every load, adjustable delay, and optional per-character selections.
- Persistent native Auto-Run reports that survive quitting before CCC opens.

## Browsers and testing

- Quest bookmarks and filters for inspected running/completed state.
- Mod scan comparisons and per-plugin visibility controls.
- More reviewed plugin names and supported record types.
- WIP test reporting with notes and exportable results.
- Activity Log export, portable favorites, recent IDs, and before/after stat comparisons.

## Mod catalog caching

Reliable optional caching remains future work. Current Mod Browser results are held only for the game session; scanning is manual. An eventual cache must preserve current runtime ID ownership, handle changed plugins, and improve startup speed. See [Mod ID catalogs](MOD_ID_CATALOGS.md).
