# Console Command Center v0.3.0 Beta

### v0.3.0-test2 — scale crash mitigation
- Removed the unsafe test1 condition-evaluator path; Scale, Open State, GetStage, and Quest Status are temporarily unavailable.
- Added native Back ownership, Results-first Escape handling, common player-value choices, and reopening logged errors.
- Direct query JSON serialization tolerates invalid text bytes; inventory needs retesting.
- Recorded the scale crash and Health/position/rotation passes. See [TEST_BUILD_CRASH_GUARD.md](testing-history/TEST_BUILD_CRASH_GUARD.md).

### v0.3.0-test1 — inspection output and dropdown fixes
- Added explicit dark dropdown popup backgrounds and high-contrast text.
- Added a dedicated Results window and Activity Log links to reopen output.
- Replaced the main failed inspections with direct native reads; GetStage, scale, and open state use registered condition evaluators.
- Quest Fixes can show a readable current stage while marking full history unavailable. SQS/SQT capture remains a known retest item.
- Recorded the latest user test statuses without treating compilation as in-game verification.
- Rebuilt the native DLL and frontend. See [TEST_BUILD_OUTPUT_FIXES.md](testing-history/TEST_BUILD_OUTPUT_FIXES.md) for installation, validation, limits, and retest order. Earlier release notes below describe previous iterations.

### ID Browser layout cleanup
- Removed the large introductory catalog card from the ID Browser because the built-in/live counts are already shown in the screen header and result summary.
- Tightened filter controls, selected-ID strip, spacing, and result summary so the ID list starts much higher on screen.


## Bottom utility bar and ID Browser divider cleanup

- Moved **ID Browser**, **Quest Fixes**, **Custom Command**, and **Activity Log** out of the vertical sidebar into a dedicated four-button horizontal bar along the bottom of CCC.
- **Recent** and **Favorites** remain stationary in the left sidebar and the normal Categories list remains independently scrollable.
- Fixed the ID Browser result divider so the tricolor line sits below the matching/built-in counts instead of intersecting the count text.

## ID Browser and Reddit command expansion

- Added a standalone **ID Browser** to the sidebar.
- Added a **191-entry built-in starter catalog** for common weapons, armor, ammo, resources/components, perks, object modifiers, bounty factions, core companions, and weather records.
- Added local search plus built-in category and record-type filtering.
- Added **Search Game**, which runs Starfield's `help` command through CCC's read-only query bridge and parses loaded-game Form IDs into selectable rows. This lets the browser discover DLC/Creation/mod records without baking every possible ID into CCC.
- Added conservative ID Browser quick actions where the record type is clear: **Add 1**, **Add Perk**, **Add Spell / Power**, and **Spawn 1**. Object-mod records deliberately do not get a one-click attach action because many OMODs are item-specific.
- Expanded the curated command library from **117 to 134 commands**.
- Added boostpack actor-value controls for horizontal percentage, initial thrust, sustained thrust, and time-to-sustained.
- Added **Set Star Power Recharge Rate**.
- Added **Open Wait Menu** using `showmenu sleepwaitmenu`.
- Added scanner range controls for `fHandScannerScanRange`, `fHandScannerBaseRange`, and `fHandScannerSocialRange`.
- Added read-only companion inspectors for affinity, relationship level, and anger level.
- Added **Set Ship Builder Max Height** (`fSpaceshipBuilderMaxSizeZ`) plus the Reddit-documented landable-size settings for X, Y, Z, and small-ship size.
- Strengthened Attach/Remove Mod warnings to note that many OMOD records are weapon/armor-specific and mismatched modifiers can create broken or nonsensical gear.
- Deliberately did **not** add the experimental `set 00155F4A 1` large-ship-module toggle from the Reddit compilation because the same discussion reports ship-builder crashes; it can be considered later as an explicitly experimental/Danger tool.

- Moved the Reference ID Picker tricolor accent from the popup top edge to the divider directly below the matching-ID count.

## Extended diagnostics, repair, and ship-control batch

- Expanded the curated command library from **84 to 117 commands** in the earlier diagnostics batch; the later ID Browser/Reddit batch brings the current total to **134**.
- Added **Show Player Inventory** with captured multiline console output.
- Added general **Form ID Search** plus typed Form ID search with a **CHOOSE TYPE** picker for WEAP, ARMO, AMMO, PERK, NPC_, OMOD, QUST, CELL, MISC, and FURN records.
- Added **Inspect Player Actor Value**, **Inspect Reference Actor Value**, and **Inspect Game Setting** read-only tools.
- Added **Force Enable Player Controls** plus the matching reset command for stuck control-layer situations.
- Added NPC repair tools: **Reset Actor AI** and **Force Actor Repath**.
- Added door/reference tools: **Inspect Reference Open State** and **Set Reference Open State**.
- Added **Get Grabbed Object Reference ID** for object-placement workflows.
- Added **Mark Reference for Permanent Deletion** with an explicit extreme-danger warning.
- Added quest inspection commands **Show Current Quest Targets**, **Get Current Quest Stage**, and **Show Quest Stage History**.
- Expanded Ship from 2 commands to 18 commands, including current ship ID lookup, ship actor-value inspection, cargo/shielded cargo, crew capacity, player crew command slots, reactor power, grav fuel, boost fuel/recharge, owned-ship limit, docking/looting/transfer distances, and ship-builder module limits.
- Long or multiline captured console output no longer floods the one-line status bar; it is saved as a scrollable/preformatted block in **Activity Log**.
- Extended the native generic query capture window and stabilization period so commands such as `player.showinventory`, `help`, and `sqs` have more time to finish printing before CCC returns the result.


## New command test batch

- Added **Add Skill Points** using `CGF "Game.AddPerkPoints" {amount}`.
- Added **Restore Player Health** and **Restore Actor Health** using `resethealth`.
- Added **Stop Actor Combat** and **Activate Reference**.
- Added exact reference transforms: **Set Exact Reference Position** (`setpos`) and **Set Exact Reference Rotation** (`setangle`).
- Added **Set Companion Anger Level** with the existing **CHOOSE COMPANION** box.
- Added read-only **Inspect Reference Position**, **Inspect Reference Rotation**, and **Inspect Reference Scale** commands.
- Added a native read-only query bridge so inspection commands can capture Starfield console output and display it directly in CCC / Activity Log.
- **Add Credits** is now capped at 100,000,000 per execution, with a warning not to push the total near Starfield's ~999,999,999-credit limit.
- Strengthened the **Open Full Character Creator (Advanced)** warning: `showlooksmenu player 1` resets the current appearance and should be treated as very dangerous.


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

The curated catalog now contains **134 commands**. Testing remains intentionally conservative; new additions are marked untested until confirmed in-game through CCC.

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
- The picker data is shared with the standalone **ID Browser**, avoiding duplicate curated faction/companion/weather lists.
- Search auto-focus is suppressed while the picker is open, and Escape closes the picker before closing CCC.


- Standardized choice-list UX: commands with curated ID choices should use the compact field + boxed **CHOOSE ...** control rather than inline button grids.

- Moved each command preview beside its command title, removed the redundant `COMMAND` label, and allowed descriptions/input hints to use the reclaimed vertical space instead of truncating early.
- Shortened input helper text and allowed up to three wrapped lines so field guidance stays readable without truncation.
- Added the CCC tricolor identity stripe to popup dialogs so modal windows visually match the main command interface.
- Added alternating subtle-orange rows to Reference ID Picker results, matching the alternating command-card treatment.

- Compacted the Quest Fixes introduction into a slim safety strip so quest cards start much higher on screen. Duplicate dataset/count information was removed while retaining the Check Status, manual-save, and current-stage caveats.

## Test8 reliability and native-search update

- Replaced ID Browser `help` output scraping with a native search across supported loaded-form groups. Search Game no longer depends on Starfield's rolling console buffer.
- Added seven calculated **Effective Total** controls for boostpack and ship values. CCC previews the detected modifier contribution and calculated base before applying it.
- Replaced the incorrect command-target grabbed-object lookup with Starfield grab/release event tracking.
- Made query capture ownership atomic and removed detached polling threads. Delayed polls now stay on SFSE's task queue and report scheduling failure cleanly.
- Disabled six known-broken cards with visible explanations: Wait Menu, Open State inspection, Scale inspection, and three quest-inspection commands.
- Quest Fixes now contains **247 guided selections** covering **79 named entries** and **77 unique Quest FormIDs**. A local validator confirmed **245 unique Quest ID/stage pairs** exist structurally in `Starfield.esm`; this does not establish that every repair is semantically safe for every save.
- Added an explicit tested-runtime report for Starfield 1.16.244. On another runtime, CCC keeps its view available to explain the mismatch while withholding gameplay request handlers.
- Added GPL-3.0-or-later licensing, CommonLibSF exceptions/source notices, and removed the private conversation identifier from the published test log.
- The curated catalog now contains **141 commands**, including the six disabled entries.

## Test8 hotfix 1

- Removed the held-object grab/release event adapter after in-game loading exposed `TESGrabReleaseEvent::GetEventSource()` as unresolved Address Library ID `0` in the pinned CommonLibSF build.
- Disabled **Get Grabbed Object Reference ID** again with a visible explanation. The commented upstream numeric hint is not used without runtime verification.
- The catalog now has seven disabled entries. Native form search, effective-total controls, query hardening, quest validation, and runtime reporting remain unchanged.

## Test9 loaded-form search repair

- Replaced the empty per-type `TESDataHandler::formArrays` scan with the global loaded-form map exposed by the pinned CommonLibSF Address Library entry.
- Added a scanned-form count to native search responses and status messages so an empty result can be distinguished from an empty scanner.
- Renamed **Search Game** to **Search Loaded Game** and **Clear Live** to **Clear Game Results**.
- Replaced repeated Built-in/Live wording with **Included IDs** and a **GAME** badge only on loaded-game results.
- Removed Med Pack from the included catalog, leaving 190 curated IDs, so `Med Pack` is a simple controlled native-search test. This also corrects the older documented catalog count.
- Marked Boostpack Horizontal/Initial, Ship Cargo, Shielded Cargo, and Reactor Effective Total controls verified from the test8 in-game session.

## Test9 hotfix 1

- Removed the experimental loaded-game form scanner and its bridge request after a Med Pack/ALCH search caused an access violation inside `ConsoleCommandCenter.dll` on Starfield 1.16.244.
- Removed **Search Loaded Game**, **Clear Game Results**, and GAME-source badges from the ID Browser.
- Restored Med Pack to the included catalog, which now contains 191 IDs.
- Kept instant included-ID filtering, categories, Copy ID, and supported quick actions.
