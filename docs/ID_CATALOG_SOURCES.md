# ID Catalog Sources

The packaged ID Browser uses a static, searchable catalog. The separate Mod Browser scans active plugin records and resolves runtime IDs and names through Starfield; those session records are not included in the packaged counts below. The current source contains 23,317 displayed entries from 23,052 generated records plus 267 additional reviewed records, with two tested duplicate outfit pairs combined. Both Form IDs remain in the information panel for each combined outfit. Display IDs are normalized to eight uppercase hexadecimal characters. Optional content also stores its plugin and local Form ID; duplicate checks use that identity rather than assuming a fixed load-order prefix. Runtime IDs and availability are resolved through the lightweight native load-order endpoint.

## Catalog generation

The large catalog is generated from installed base-game, Shattered Space, Free Lanes (SFBGS00D.esm), and Terran Armada (SFBGS050.esm) master files. Base-game display names resolve only through the main English `STRINGS` table; dialogue and interface tables are kept separate because they reuse numeric keys. Shattered Space records use cleaned Editor IDs because this installation does not expose a separate verified localization table that can be safely paired with its records. Base-game and Shattered Space internal test, debug, template, placeholder, dummy, long-description faction, creature-attack, and engine-only records are filtered. Free Lanes and Terran Armada use the complete supported-type import described below. Visible labels are capped at 72 characters. The smaller hand-reviewed catalog remains authoritative when a generated record has the same Form ID.

The generated data covers player-facing weapons, armor and apparel, ammunition, aid, resources and miscellaneous items, books and notes, object mods, factions, NPCs, named locations and cells, and weather. The existing hand-reviewed entries continue to cover skills, traits, powers, environmental effects, ships, common utility IDs, companions, and frequently used records.

Ships use a reviewed 104-name table with 152 unique Base IDs. Generated GBFM records are retained in Ship Parts / Other Forms, and reviewed ships take precedence over matching generated records. Named FURN records are retained under Workshop / Outpost Objects, excluding animation/scene markers and templates; these records do not offer placement actions. REV-8 and Moonjumper are separate vehicle entries keyed to their small-master plugin/local IDs.

## Expansion labeling

An expansion-only entry must name its requirement in `detail`, where it is visible in the selected-result panel. Shattered Space and Terran Armada records show their paid-DLC requirements. Free Lanes records show their free-update source. Items are distributed into normal record categories; there are no source-only ID Browser sidebar categories. Unloaded masters remain searchable, but runtime-ID copying, gameplay actions, and picker use are disabled.

Quest Browser localization is generated separately using the matching master-file localization data. Its quest names and stage records are not part of the packaged ID Browser item catalog.

## Safety rules

- Do not restore the removed `console.command-center.searchForms` bridge route without a separately verified game-safe API.
- Reject duplicate Form IDs in the packaged catalog unless a documented record intentionally needs multiple user-facing aliases.
- Label DLC, Creation, or mod requirements on every affected entry.
- Prefer IDs corroborated by two independent lists or by direct inspection of the shipped game data.

## Free Lanes and Terran Armada records

Free Lanes supplies 1,666 named owned non-quest records and Terran Armada supplies 2,043. Both include WEAP, ARMO, AMMO, ALCH, MISC, BOOK, OMOD, FACT, NPC_, WTHR, CELL, LCTN, FURN, GBFM, PERK, and SPEL wherever present. Records are placed in matching type categories. Deleted records, unnamed records, placed references, scenery, and other engine record types are outside this ID catalog. Internal/test records are included with a reference-only note and no quick action. Matching master-file ownership avoids assigning DLC prefixes to base-game overrides; those IDs remain in their original master catalog. Localization falls back to cleaned Editor IDs.


## Settings reference

The separate lazy-loaded Settings category imports 8,705 unique names from the supplied Starfield_Game_Settings_Database_1-1.xlsx workbook (Creation Kit All Settings tab). 2,312 have supplied master-record Form IDs; the others can still be queried by name if supported by the runtime. The spreadsheet is not bundled. Metadata retains type, source category, reference effective value, Starfield.esm value, and engine default; null means not supplied, never zero. Reference values are not native observations. The first release only prepares getgs inspections and does not provide setters, item actions, or Form-ID picker entries. Source page: https://www.nexusmods.com/starfield/mods/18443 .

As of 1.2.25, Game Settings group headings preserve original spreadsheet categories. MAIN alone uses labeled subgroups (MAIN / Scanner, Ships, Combat, Camera, Other). The detail panel retains the original category for every setting.

As of 1.2.30, packaged QUST records are exclusively in Quest Browser. All 244 removed DLC quest records were matched by plugin/local ID against its existing entries. Quest Browser remains at 2,568 entries. Scanned mod quests remain available in Mod Browser.

## Visibility and findings

Advanced Options hides reference-only items, Cells, Ship Parts, and the Settings catalog by default, including searches and ID Favorites. Enable it from the Settings popup beside Help to reveal those entries. Normal and reference-only records are independently alphabetical, with reference-only last. Restrictions from reported tests are applied by owning plugin/local ID and also protect previously saved Favorites.
