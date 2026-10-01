# Console Command Center v0.3.5 Beta

## ID Browser expansion

- Expanded the packaged ID Browser from 370 to 16,307 unique entries.
- Added player-facing weapons, armor and apparel, ammunition, aid, resources, books and notes, object mods, factions, NPCs, named locations and cells, and weather extracted from installed Bethesda master files.
- Added visible Shattered Space requirements to expansion records.
- Added separate **Copy ID** and **Copy Editor ID** actions for locations and cells.
- Preserved the existing hand-reviewed records when a generated entry shares the same Form ID.

## Performance and data quality

- Kept ID Browser categories collapsed by default.
- Limited an opened category to 100 rendered rows at a time, with a **Show more** control for large result sets.
- Kept search active across every category while limiting the number of rows created at once.
- Removed internal test, debug, template, placeholder, dummy, and engine-only records from the generated browser data.
- Corrected Bethesda localization decoding for accented characters and punctuation.

## Validation

- Verified 16,153 generated entries have unique normalized Form IDs.
- Verified the merged catalog contains 16,307 unique entries.
- Retained the removed live-memory scanner and all existing native crash guards.
