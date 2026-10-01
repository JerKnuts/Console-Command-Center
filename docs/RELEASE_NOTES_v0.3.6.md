# Console Command Center v0.3.6 Beta

## ID Browser name correction

- Fixed a localization-table collision that could display dialogue subtitles as weapon, armor, or item names.
- Restricted localized catalog names to Starfield's main `STRINGS` table instead of merging `STRINGS`, `DLSTRINGS`, and `ILSTRINGS` entries that reuse numeric keys.
- Uses cleaned Editor IDs for Shattered Space records when a verified localized display name is unavailable.
- Filters sentence-like subtitle collisions, internal Vortex enemy weapons, non-equippable records, pack-in storage cells, generated interiors/exteriors, and other engine-only forms.
- The corrected merged catalog contains 16,787 unique entries, including 1,739 filtered Shattered Space records.

## Validation

- Confirmed the three reported internal weapon IDs no longer appear in the packaged browser.
- Confirmed the generated data contains no replacement characters or known reported dialogue phrases.
- Retained staged 100-row category loading, category-wide search, expansion labels, quantity actions, and Form ID/Editor ID copy actions.
