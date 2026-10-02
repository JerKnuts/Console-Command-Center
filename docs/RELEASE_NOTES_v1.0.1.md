# Console Command Center v1.0.1

Version 1.0.1 is the first follow-up to the public v1.0 release.

## Changes

- Added a compact first-run welcome guide that explains command search, the ID Browser, Quest Browser, and saved workflows. The guide can be reopened with **Help**.
- Made **Inspect Player Actor Value** discoverable when users search for `health`, carry weight, or speed.
- Replaced the overlapping Quest Browser buttons with one **Inspect Quest State** action. It reads the current stage and completed-stage history together and marks the results on the stage list.
- Restored execution for FOV, wireframe, collision-geometry, and subtitle commands that previously produced no visible effect. Their failed test notes remain visible for advanced users.
- Commands tied to a known game crash or credential handling remain unavailable.

## Compatibility

- Starfield runtime 1.16.244
- SFSE
- OSF UI

Make a manual save before using commands that change quests or important game state.
