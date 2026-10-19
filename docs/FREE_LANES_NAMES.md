# Free Lanes name verification — 1.3.3

SFBGS00D - Main.ba2 supplies strings/sfbgs00d_en.strings for SFBGS00D.esm. The name refresh selects that owning-plugin English table and checks every existing Free Lanes catalog row. It corrects 663 labels, including 90 books/notes, while preserving Form IDs, plugin/source metadata, actions, categories and reviewed flags. Shattered Space and other plugins are unchanged. Records without a localized FULL name retain their fallback labels.

The reported SFFL Anchorpoint Audio Slate Final Report (local 070441, BOOK) is Chief Engineer's Final Log. Editor IDs remain searchable keywords.

Other corrected names cover 107 NPCs, 92 locations, 81 miscellaneous records, 75 mods, 74 perks, 61 cells, 43 effects, 22 base forms, six factions, five armor/apparel pieces, four furniture objects, two weapons and one aid item. This verifies catalog display names, not every record's gameplay usability.

Reproduce with scripts/extract-id-records.mjs: pass the installed SFBGS00D.esm and SFBGS00D - Main.ba2, --allow-editor-names and --output=records.json. Then use scripts/refresh-catalog-names.mjs with the generated catalog path, records.json, SFBGS00D.esm and an audit output path. Extraction requires the exact owning plugin STRINGS table, and refresh modifies labels only.
