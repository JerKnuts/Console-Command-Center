# ID Catalog Sources

The packaged ID Browser uses a static, searchable catalog. The separate Mod Browser scans active plugin records and resolves runtime IDs and names through Starfield; those session records are not included in the packaged counts below. The current source contains 16,528 unique entries: 16,358 generated records plus 170 additional reviewed records whose IDs are not already present in the generated set. IDs are normalized to eight uppercase hexadecimal characters and checked for duplicates during validation.

## Catalog generation

The large catalog is generated from the installed base-game and Shattered Space master files. Base-game display names resolve only through the main English `STRINGS` table; dialogue and interface tables are kept separate because they reuse numeric keys. Shattered Space records use cleaned Editor IDs because this installation does not expose a separate verified localization table that can be safely paired with its records. Internal test, debug, template, placeholder, dummy, long-description faction, creature-attack, sentence-like subtitle collision, and engine-only records are excluded. Visible labels are capped at 72 characters. The smaller hand-reviewed catalog remains authoritative when a generated record has the same Form ID.

The generated data covers player-facing weapons, armor and apparel, ammunition, aid, resources and miscellaneous items, books and notes, object mods, factions, NPCs, named locations and cells, and weather. The existing hand-reviewed entries continue to cover skills, traits, powers, environmental effects, ships, common utility IDs, companions, and frequently used records.

## Expansion labeling

An expansion-only entry must name its requirement in `detail`, where it is visible in the selected-result panel. Generated Shattered Space records are labeled **Requires the Shattered Space expansion.**

Quest Browser localization is generated separately using the matching base-game and Shattered Space string tables. Its quest names and stage records are not part of the packaged ID Browser item catalog.

## Safety rules

- Do not restore the removed `console.command-center.searchForms` bridge route without a separately verified game-safe API.
- Reject duplicate Form IDs in the packaged catalog unless a documented record intentionally needs multiple user-facing aliases.
- Label DLC, Creation, or mod requirements on every affected entry.
- Prefer IDs corroborated by two independent lists or by direct inspection of the shipped game data.
