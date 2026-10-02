# Console Command Center v0.3.14 Beta

This version fixes the temporary ID Browser filtering left behind by the Location-to-Cell workflow and records the latest v0.3.11 in-game command tests.

## ID Browser fix

- Choosing **Find Teleportable Cell** still narrows the results to matching Cell records.
- Clearing that search now resets the browser to All Categories and removes the temporary `CELL` record-type filter.
- Filtered command-field pickers retain their intended filters when their search text is cleared.

## Command verification

- Toggle Sky passed using `ts` and the raw `ToggleSky` form. The prepared entry moved to World; `ts` is the engine command's short alias.
- Select Closest Actor passed and moved to Targets.
- Set Camera Field of View, Toggle Collision Geometry, and Always Show Subtitles produced no visible effect. Their prepared entries and raw duplicates are disabled with explanations.
- Reload Current Weather and Reload Current Climate were accepted without a visible change and remain unverified.
- Save Game by Name reached the engine but Starfield reported that the game could not be saved in the current state, so it remains unverified and context dependent.

## Catalog totals

- 144 established commands
- 34 prepared Ready to Test commands
- 565 raw engine console commands
- 948 raw script functions
- 1,547 total Untested entries
