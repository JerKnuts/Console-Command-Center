# ID Browser descriptions and stats

Descriptions and stats load when you select a supported loaded record. The same panel is used for supported Mod Browser items and favorites. Inspection does not add, equip, cast, or execute commands.

- Aid: installed description and visible effects, with magnitude, duration and conditions where supplied.
- Suits, helmets, packs and weapons: available base mass, value, damage/resistance, ammo and magazine values, plus fixed enchantment effects. These are base record values, not an inventory-instance comparison. Upgrades, curves, legendary rolls and player skills can change the result.
- Perks, skills and traits: summary and available rank descriptions. Skill rank text is separate from activity/challenge descriptions.
- Powers: description and visible effects. This does not calculate the player's current ranked cost or bonuses.
- Other supported inventory records: available description, mass and value. Missing fields are not invented.

Engine objects are copied on the game task queue. Description archive access, decompression and perk-rank record parsing run on a separate bounded worker. The client debounces selections, serializes requests, ignores detached selections and keeps up to 100 successful records in memory.

Localized DESC fields use the description owner's DLSTRINGS table, in the game language with English fallback. STRINGS and ILSTRINGS reuse IDs and must not be merged with DLSTRINGS. Loose files take precedence over associated BA2 archives. Inline descriptions and perk ranks use loaded plugin identities and winning overrides. Descriptions are rendered as text, never executable markup. File, record, table, effect and text sizes are bounded.

Record layouts were checked against local CommonLibSF headers and the primary xEdit definitions:
https://github.com/TES5Edit/TES5Edit/blob/dev-4.1.6/Core/wbDefinitionsSF1.pas
https://github.com/TES5Edit/TES5Edit/blob/dev-4.1.6/Core/wbDefinitionsCommon.pas

The native endpoint is registered only for the supported runtime (1.16.244.0) and accepts requests only from CCC's view. Live engine stat extraction still needs in-game verification for this build; native file-reader and browser checks cannot establish that every mod supplies complete descriptions or matching inventory values.

Advanced Options shows technical record types, categories, plugin filenames, original names, Form/Local/Editor IDs. Ordinary browsing keeps useful descriptions, stats, requirements and actions. Quest details follow the same rule for categories and IDs. Without the live backend, the overview explains that game records are available in-game.

Copy ID and Copy Editor ID buttons remain available with Advanced Options off.

## Books and notes

Read opens a scrolling popup for the installed BOOK record's DESC text, in the game language with English fallback. The compact details panel shows the item's stats rather than the book body. Audio/image-only slates may not supply readable text. Reading here does not execute commands, add inventory, mark the original book read or grant skill rewards.

The reader accepts up to 256 KiB per text entry, preserves basic paragraph/emphasis/list formatting, strips attributes and executable markup, and does not load images or links. Close or Escape dismisses the popup. Successful reads are cached for up to 12 entries. A standalone WebView explains that the live CCC plugin is required.

Small previews and Model Viewer are available for supported loaded model types with Advanced Options either on or off. Technical metadata still follows Advanced Options.

The selected-item panel places descriptions, effects, stats and optional metadata in the left half, with a sticky model preview in the right half. Items without a supported model use the full text width. Action buttons stay below the columns.
