# ID Catalog Sources

CCC v0.3.0 packages a static, searchable catalog instead of reading Starfield's live form map. The catalog contains 340 entries. IDs are normalized to eight uppercase hexadecimal characters and checked for duplicates during the build.

## Base-game lists added for v0.3.0

- All 82 skills and all 17 traits were cross-checked against the [PC Gamer Starfield console command list](https://www.pcgamer.com/starfield-console-commands-cheats/) and the [eXputer Starfield item ID list](https://exputer.com/guides/starfield-item-ids/).
- The expanded weapon list, complete 22-entry ammunition list, and 52-entry aid list came from the same two published lists. Duplicate records already present in CCC were merged rather than repeated.
- Existing armor, resources, object modifiers, factions, companions, and weather entries were retained from the previously tested catalog.

These web lists are reference data, not proof that every quick action has been exercised in the current game runtime. The catalog should continue to record in-game results as entries are tested.

## Expansion labeling

An expansion-only entry must name its requirement in `detail`, where it is visible in the selected-result panel. The current catalog includes two Shattered Space faction records, each labeled **Shattered Space DLC bounty faction**. The v0.3.0 expansion adds base-game records only.

## Safety rules

- Do not restore the removed `console.command-center.searchForms` bridge route without a separately verified game-safe API.
- Reject duplicate Form IDs in the packaged catalog unless a documented record intentionally needs multiple user-facing aliases.
- Label DLC, Creation, or mod requirements on every affected entry.
- Prefer IDs corroborated by two independent lists or by direct inspection of the shipped game data.
