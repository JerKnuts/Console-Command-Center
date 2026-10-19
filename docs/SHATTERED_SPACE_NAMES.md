# Shattered Space name verification — 1.3.2

The prior catalog used cleaned Editor IDs because it had no verified expansion localization input. ShatteredSpace - Main02.ba2 contains strings/shatteredspace_en.strings. Extraction now selects exactly the table named for the plugin, avoiding base-game key collisions and unrelated dialogue/interface tables.

A label-only refresh corrected 1,138 existing records: 202 books/notes, 351 NPCs, 209 mods, 146 locations, 72 armor/apparel pieces, 57 cells, 41 miscellaneous items, 28 furniture objects, 14 weapons, 11 aid items, six base forms and one ammo record. Existing Form IDs, categories, actions, reviewed omissions and other metadata are preserved. Rows with no localized FULL name retain their fallback labels. This verifies names, not every record's in-game usability or model appearance.

Confirmed reports: An Unknown Ally (15E713), One Step Closer (0337DF), RE: Modulator Installation (010EF7), Misthaze Patrol Log (11CC3F), Misthaze Spacer Captain's Note #1 (05EAC5). Misthaze Spacer Grunt's Note is 01D263.

Reproduce with scripts/extract-id-records.mjs: pass ShatteredSpace.esm and ShatteredSpace - Main02.ba2, --allow-editor-names, and --output=records.json. Then scripts/refresh-catalog-names.mjs accepts the generated catalog path, records.json, ShatteredSpace.esm, and an audit JSON output path. Matching localization provenance and owning-plugin records are required; only labels change. Runtime load-order resolution remains unchanged.
