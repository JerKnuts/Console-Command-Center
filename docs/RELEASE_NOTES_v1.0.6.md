# Console Command Center v1.0.6

Version 1.0.6 incorporates the latest in-game WIP results and removes a second unsafe reference-scale adapter.

## Interface

- Moved the advanced command popup from the small status area to the large disabled **Unavailable** action.
- Removed the duplicate Unavailable badge beside the test-status tag.
- Kept the anchored Danger-style panel available by mouse hover and keyboard focus.
- Changed WIP so every category starts collapsed.

## Safety and test results

- Blocked Inspect Reference Scale after `TESObjectREFR::GetScale()` attempted to resolve missing Address Library ID 0 and terminated Starfield 1.16.244 while inspecting reference `0006A243`.
- Retained the native execution guard for scale so an old UI cannot reach either unsafe adapter.
- Blocked Show Current Quest Targets through CCC after `sqt` produced an impractically large unfiltered console dump.
- Recorded Screenshot, Advance One Frame, Select Closest Ship, Toggle Volume Geometry, Toggle Material Geometry, and Toggle Borders as executed with no confirmed effect.
- Recorded Save Game by Name under Executed — Issues after Starfield reported that the game could not be saved at the test moment.

## Validation

- Run the automated behavior suite and OSF UI compatibility check.
- Compile the native plugin and production view.
- Confirm all WIP groups begin collapsed.
- Confirm blocked commands expose syntax only from their large disabled action.
- Confirm both UI and native layers reject reference-scale inspection.
