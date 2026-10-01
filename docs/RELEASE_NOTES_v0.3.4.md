# Console Command Center v0.3.4 Beta

## Quest Browser

- Renamed the former Quest Skips feature to **Quest Browser** throughout the active interface and documentation.
- Expanded the browser to 2,318 quest records and 16,844 recorded stages from the base game and Shattered Space.
- Added collapsible source and category groups, 50-record pages, search, Editor IDs, expansion labels, internal/system labels, and Copy Quest ID.
- Added confirmed Start Quest, Stop Quest, Complete Quest, Reset Quest, and Set Stage actions to quest entries.
- Added read-only Current Stage and Stage History actions through delayed console-output capture.
- Included quests without explicit stage indexes and explained their empty stage list in the interface.

## Interface and input

- Made the main interface and popup surfaces opaque for clearer use over gameplay.
- Added Up/Down and Enter navigation to searchable choice boxes.
- Prevented duplicate entries in Recent commands.
- Kept the compact mouse-and-keyboard layout and identified controller support as future work.

## Validation

- Validated all 2,318 packaged quest records and all 16,844 recorded stages against the installed base-game and Shattered Space master files.
- Kept dangerous quest-changing actions behind explicit confirmation.
- Retained disabled guards for known-broken commands.
