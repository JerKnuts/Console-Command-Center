# Console Command Center v0.3.0 Beta


### Choice-control cleanup
- Removed the inline preset-button-grid presentation from curated ID choices.
- **Pay Bounty**, **Force Weather**, **Set Weather Gradually**, **Set Companion Affinity**, and **Set Companion Relationship Level** now all use the same compact editable ID field + boxed **CHOOSE ...** control.
- Manual Form/Reference ID entry remains available for every one of these commands.
- Future curated choice lists should follow this same pattern instead of adding button grids inside command cards.


### Sidebar navigation cleanup
- **Recent** and **Favorites** are now stationary at the top of the command library.
- Only the **Categories** list scrolls, so Recent/Favorites stay visible while browsing lower categories.
- The category scroll position is preserved when the UI re-renders after switching views or updating search/results.

## Major feature: Quest Fixes

- Added a dedicated **Quest Fixes** browser.
- Added 248 guided quest-stage selections covering 80 named quest/objective entries and 78 unique Quest FormIDs.
- Search Quest Fixes by quest name, FormID, or stage number.
- Added **Check Status** for live quest diagnostics before applying a fix.
- Displays the quest's current/highest completed stage and completed-stage history.
- Repair buttons are marked **DONE** or **CURRENT** when they match the live save.
- Added **Full SQS** to print the complete stage-status table to Starfield's console.
- Each stage shows a full danger confirmation before executing.
- Quest fixes execute vanilla `setstage` commands directly through CCC.
- Quest-fix executions are recorded in the Activity Log but are not inserted into the normal Recent command list.

## Native diagnostics

- **Check Status** is read-only; it does not run `setstage` or otherwise modify the quest.
- Quest status is queried on demand through `ConsoleCommandCenter.dll`, so **v0.3.0 requires rebuilding the native plugin** when updating from v0.2.11.
- **Full SQS** remains available for the game's complete console-side stage table.

## Safety

Quest repair is intentionally marked **Danger**. `setstage` can bypass dialogue, scripts, rewards, scenes, prerequisites, and other quest state. Make a manual save before using a quest fix.

## Existing command library

The existing 73-command catalog remains intact. Current catalog status: **59 verified / 14 untested**.

- Moved **Quest Fixes** out of the Categories list into its own dedicated sidebar box below Categories. Sidebar utility order is now **Quest Fixes → Custom Command → Activity Log**.

## Project maintenance

- Cleaned generated build/cache folders from source snapshots.
- Added `npm run setup:deps` and automatic CommonLibSF restoration during native builds.
- Pinned the development CommonLibSF revision so fresh GitHub clones can reproduce the native dependency without committing the local checkout.
- Refreshed project version/author/description metadata and source setup documentation.

## Quest diagnostics hotfix

- Reworked **Check Status** to avoid `TESQuest::IsStageDone()`, which CommonLibSF currently exposes with an unresolved Address Library ID (`0`).
- Quest status now uses CCC's existing console executor to run `getstage` and `sqs`, then parses Starfield's console-log buffer for the current/highest stage and completed stages.
- This preserves the in-UI CURRENT/DONE labels without using the crashing relocation path.

## Latest in-game fixes

- Fixed **Search auto-focus on reopen** by listening for OSF UI's `ui.visibility` lifecycle event instead of relying only on normal browser focus/visibility events.
- Added short post-show focus retries so the search field wins focus after OSF UI finishes activating the menu.
- Fixed the **Check Status console-output race**: `getstage` and `sqs` output is now captured over subsequent SFSE main-thread ticks instead of being read immediately after command dispatch.
- SQS capture waits for the stage table to stop changing before parsing, preventing truncated completed-stage lists.
- Completed-stage results remain deduplicated before being returned to the UI.
- Marked **Toggle HUD / Interface** and **Toggle Game Pause** verified from in-game testing.
- **Refuel Player Spaceship**, **Clear Screen Blood**, and speech-challenge toggles remain untested.

## Quest status delayed-capture hotfix

- Search auto-focus remains verified working.
- Reworked Quest Fixes `Check Status` capture again after in-game testing showed same-frame SFSE task re-queuing still timed out before Starfield emitted `GetStage` output.
- Quest diagnostics now wait real elapsed time (50 ms for `getstage`, 75 ms between `sqs` reads) before returning to the game thread to inspect console output.
- Keeps the safe console-command approach and does not call the unresolved `TESQuest::IsStageDone()` relocation.

## Latest command testing and UI cleanup

- Marked **Set Star Power** verified from in-game testing.
- Renamed **Clear Faction Bounty** to **Pay Bounty** after confirming the command deducts the bounty amount from player credits.
- Marked **Pay Bounty** verified.
- Replaced the growing Pay Bounty faction-button grid with the compact editable ID field + **CHOOSE FACTION** box. The chooser is limited to bounty-relevant factions, includes supported Shattered Space bounty records, and still allows manual faction-ID entry.
- **Attach Weapon Mod** and **Remove Weapon Mod** remain untested.
- Search now selects the entire existing query whenever the Search field is automatically activated, so the next keystroke replaces the old query.
- **Teleport to Quest Target** is now marked Verified after an in-game test with Unearthed (`002A8001`).

- Verified **Force Weather**, **Set Weather Gradually**, and **Teleport to Cell** in-game.
- Replaced the weather preset-button grid with the same editable ID field + **CHOOSE WEATHER** box used by the other curated ID controls. Both weather commands offer Clear, Rain, Snow, Heavy Snow, Thunderstorm, Sandstorm, Dense Mist, Light Mist, and Burning Haze through the chooser while still allowing manual Weather Form IDs.

## Latest in-game command verification

- Verified **Grant All Powers**, **Reveal Planet Map Markers**, and **Kill Everyone Nearby** in-game.
- Verified **Add Spell / Effect by Form ID** and **Remove Spell / Status Effect by Form ID** as a reversible pair.
- **Open Full Character Creator (Advanced)** and **Open Appearance Editor** remain verified from in-game testing.
- **Set Companion Affinity** and **Set Companion Relationship Level** remain untested.
- Replaced the companion preset-button grids with the same searchable **Reference ID Picker** for Sarah Morgan, Barrett, Sam Coe, and Andreja. Other recruitable crew are not included because they do not use the same core affinity/relationship progression system.

## Reference ID Picker foundation

- Added a reusable ID-picker component with in-dialog search by name, alias/keyword, or hexadecimal ID.
- Selecting an entry fills the existing command input and immediately updates the command preview.
- Manual ID entry remains available for advanced/custom use.
- The picker data is stored separately from command definitions so a future standalone **ID Browser** can reuse the exact same catalogs.
- Search auto-focus is suppressed while the picker is open, and Escape closes the picker before closing CCC.


- Standardized choice-list UX: commands with curated ID choices should use the compact field + boxed **CHOOSE ...** control rather than inline button grids.
