# v0.3.0-test9 — Loaded-game search repair

## Install

Close Starfield, extract the patch into the current CCC project, run **npm run build**, deploy the resulting mod, and restart Starfield. The footer must show **v0.3.0-test9**. The native DLL and interface both changed.

## Priority tests

1. Load a saved game and confirm there is no Address Library error.
2. Open ID Browser, choose **Aid / Consumables**, and enter `Med Pack`. The instant included-ID filter should show no result because Med Pack was deliberately removed from the included catalog.
3. Click **Search Loaded Game**. A Med Pack row with a **GAME** badge should appear. Record the status message, including the number of supported forms scanned.
4. Select Med Pack, test **Copy ID**, and confirm **Add 1 to Player** appears.
5. Click **Clear Game Results** and confirm the Med Pack game result disappears.
6. Choose **NPCs / Companions**, enter `npcfsarahmorgan`, and use **Search Loaded Game**. Record the result and scanned-form count.
7. Confirm included rows no longer repeat a BUILT-IN badge and that the summary uses **included** and **from game** wording.
8. Run one previously verified inventory or inspection command as a regression check.

## Expected behavior

- The normal search field filters CCC's 190 included IDs immediately.
- **Search Loaded Game** explicitly scans supported records currently loaded by Starfield, including DLC, Creations, and mods.
- The status bar reports how many supported records were scanned even when no match is found.
- Only loaded-game results display a **GAME** source badge.
- **Clear Game Results** removes loaded-game results without affecting the included catalog.

## Changes retained

- The unresolved grab/release adapter remains removed, and Get Grabbed Object Reference ID remains unavailable.
- Seven known-broken commands remain visibly disabled.
- Effective-total controls compensate for detected modifiers. Boostpack Horizontal/Initial and Ship Cargo/Shielded Cargo/Reactor totals are verified in game.
- Quest IDs and stages remain structurally validated against `Starfield.esm`.
