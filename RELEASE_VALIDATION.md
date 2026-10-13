# v1.2.38 release validation

This is the maintained release checklist. It covers behavior most likely to break and avoids repeating implementation-level unit tests.

## Current verification status

149 automated checks and native/UI builds pass. The native export test also passes. Native export tests cover UTF-8 content and distinct timestamped exports. Browser checks exercised both themes, Advanced Options transitions, Dev Mode markers, persistence after export, and crowded ID details scrolling above fixed buttons, report submission retaining list position/selection/focus, and merged outfits with searchable alternate IDs; the previous reporting/export flow has been exercised in game; the new timestamped export and batch clearing need an in-game check. The user confirmed Auto-Run triggering, Workshop inside ships, and Workshop FlyCam inside and outside Workshop mode. The user confirmed the latest Custom Command layout looks correct. ActorExposedToSky works in the ordinary console, but its new v1.2.18 popup adapter still needs an indoor/outdoor comparison. Mod quest controls and stage progress should be checked in game before treating them as release-verified.

## Build and install

1. Run `npm test`, `npm run check`, and `npm run build` successfully.
2. Install the generated archive over the previous release without clearing OSF UI browser data.
3. Confirm the view is under `SFSE/Plugins/OSF/UI/views/console.command-center/main` and the native DLL is under `SFSE/Plugins/`.
4. Launch through SFSE and confirm the footer and native connection both report **v1.2.38**, **OSF UI 2.0 API**, and **NATIVE READY**.
5. Confirm existing command favorites, ID favorites, Recent entries, Activity Log entries, and saved Custom Command batches remain available.

## Navigation and layout

1. With a controller, use LB/RB to cycle through Commands, ID Browser, Mod Browser, Quest Browser, Custom Command, and Activity Log.
2. Confirm A activates controls, B returns one layer, holding B closes CCC, and the right stick scrolls long panels.
3. Open an editable text, numeric, and hexadecimal field and verify the appropriate controller keyboard layout.
4. Open and close Help, Results, confirmation, Reference ID Picker, inspection, and welcome windows. Focus must stay inside the active window and return to the control that opened it.
5. Inspect quest state, close Results with B, and confirm focus returns to the right-panel **Inspect Quest State** control.
6. Check long names in Commands, ID Browser, and Mod Browser. Rows must grow to fit, titles must be left aligned and vertically centered, counts must stay centered in their own column, and dividers must not overlap text.
7. Confirm a focused or selected category has a clearly visible theme-specific border on all four sides.

## Commands and saved batches

1. Search for a common command, select it, and confirm its raw console syntax appears beneath the title.
2. Execute one harmless command and one read-only inspection; confirm both add accurate Activity Log entries.
3. Confirm blocked crash-prone commands remain unavailable and expose their syntax only from the large disabled action.
4. Save, load, favorite, update, and delete a Custom Command batch without executing it during Load.
5. With a controller focused on a saved batch, confirm Right from Load moves to Delete.
6. Confirm saved-batch favorites appear in Favorites and open the batch for review.
7. Confirm the Custom Command screen creates `Documents\My Games\Starfield\Console Command Center\Command Batches` and lists its `.txt` files.
8. Add or edit a `.txt` file outside CCC, select Refresh, and confirm the filename and commands update in game.
9. Confirm blank lines and lines beginning with `#` do not count or execute.
10. Confirm faint line numbers stay aligned while typing and vertically scrolling in the command editor.
11. With an empty editor, confirm the example explains comments, section labels, blank lines, and quantities; its top edge must align with the Batch Files panel, with no Raw Console Commands label above it.
12. Confirm the right panel uses the compact Batch Files heading and its saved-batch list fills the remaining height so additional entries stay visible before scrolling.
13. Confirm the command editor has no visible Commands label, aligns with the Batch Files panel, and has no resize handle.
14. Confirm saved batch rows use compact spacing with the title moved upward and equal-height Favorite, Load, and Delete buttons.
15. Create enough saved batches to overflow the right panel and confirm only the batch list scrolls; the CCC window and Custom Command workspace must remain fixed to the screen.
16. Confirm a batch containing more than 100 commands can be saved, loaded, reviewed, and executed; commands over 1,024 characters and files over 1 MB must still show an error.
17. Upgrade from a build with browser-stored batches and confirm every existing batch migrates without overwriting a different same-name file.
18. Mark two safe batches **On Load**, turn **Auto-Run On**, load an existing save, and confirm both run once in filename order after the three-second delay without opening CCC.
19. Open Activity Log after that load and confirm **Automatic Batch Run** reports the batch and command totals. Reload the same save and confirm one new run is recorded.
20. Turn **Auto-Run Off** and confirm loading a save runs nothing. Start a new game and confirm On Load batches do not run.
21. Delete an On Load batch and confirm it is removed from the automatic selection. Rename or make a selected file unreadable outside CCC and confirm the next load reports the problem without crashing.

## Packaged ID Browser

1. Open ID Browser and confirm it reports **23,319 included IDs** without starting a mod scan.
2. Search by name, Editor ID, Form ID, type, and category.
3. Select an inventory item, copy its ID, and add a quantity greater than one.
4. Select a Cell, Location, Weather, Book/Note, and Furniture record and verify only the actions appropriate to that record appear.
5. Favorite an ID, open it from Favorites, and remove the favorite.
6. Confirm Shattered Space records show their expansion requirement.

## Mod Browser

1. Open CCC, ID Browser, and Mod Browser. None may start scanning automatically or show the scan window.
2. Confirm Mod Browser is empty at the beginning of a new game session and offers one **Scan Mods** button.
3. Select **Scan Mods**. Keep the progress window visible for the entire scan and show mod progress, the current plugin, elapsed time, and running IDs found.
4. On a large load order, confirm CCC remains responsive after the scan and populated mods sort by ID count descending with zero-ID plugins hidden.
5. Confirm Bethesda `SFBGS...` plugins appear under **Official Creations** and other plugins under **Mods**.
6. With no mod selected, Search All must search IDs across every scanned plugin. With a mod selected, Search Mod must restrict results to that plugin.
7. Open a mod with thousands of records. Confirm categories start collapsed and only the opened category creates its rows.
8. Confirm complete ships appear under **Ships** while engines, grav drives, reactors, shields, fuel tanks, landing parts, weapons, templates, and other GBFM records remain under **Ship Parts & Other Forms**.
9. Add or spawn a supported record from a full, medium, and small plugin and verify each runtime Form ID resolves correctly.
10. Favorite a scanned ID and select its Favorites row to show its record details and supported actions in the right panel without leaving Favorites.
11. Open Activity Log and verify the **Mod Browser Scan** entry reports load-order entries, discovered and loaded mods, IDs, zero-ID mods, failures, opened and missing files, and elapsed time.
12. Close and reopen Mod Browser in the same session and confirm the scanned catalog remains available. Restarting the game may require another manual scan.
13. Run `npm run dev:game`, open Mod Browser in the OSF UI webview, and select **Scan Mods**. Confirm it displays the configured MO2 profile's real plugins and IDs rather than Browser Fixture Arsenal.

## Quest Browser

1. Confirm the browser contains 2,568 quest records and 19,061 recorded stage indexes.
2. Search a base-game mission, a Shattered Space mission, Free Lanes and Terran Armada quests, and an internal/system quest by name, Editor ID, and Form ID.
3. Confirm Shattered Space quests show their actual quest titles rather than dialogue subtitles.
4. Confirm obvious holder, support, patch, debug, dialogue, scene, tracker, template, and always-on records remain available under **Internal / System**.
5. Inspect a safe quest and confirm current stage, running/completed state, and completed-stage history display correctly.
6. On a disposable save only, confirm Start, Stop, Complete, Reset, and Set Stage always show a Danger confirmation.

## Catalog and sample checks

1. Confirm all v1.2.18 editor, Auto-Run, sky-result, and Mod Browser quest fixes are retained.
2. On a fresh empty batch folder, verify the three samples appear without Auto-Run selections. Existing or migrated files must not be overwritten; deleted samples must stay deleted.
3. Check Ships, Ship Parts / Other Forms, Workshop / Outpost Objects, and Vehicles. Components/module records must remain reference-only. Test ship/vehicle spawning only on a disposable save.
4. Confirm official items remain in their normal categories. Disable an optional master in a disposable profile: entries must stay searchable but gameplay/copy/picker actions must be unavailable.
5. Check official quest IDs against the active load order and verify Free Lanes/Terran Armada stage history and confirmed quest actions. Original Shattered Space quest names must remain readable.
6. Run SampleBatchTests, QuestStagesTests, ScalarResultTests, DevFeedbackTests, and the automated UI/catalog tests before packaging.

## Release artifacts

1. Open the Nexus-ready ZIP and confirm it contains the expected `SFSE` layout and no source or development files.
2. Open the source ZIP and confirm it excludes `node_modules`, CommonLibSF checkout, build output, local caches, prior archives, and generated artifacts.
3. Confirm the source ZIP includes `README.md`, `CHANGELOG.md`, license files, current docs, source, scripts, tests, package lock, and native dependency setup script.
4. Verify the SHA-256 values in the generated package manifest.

## Mod Browser quest controls

1. Scan mods, select a QUST record, and confirm its runtime ID is used for Inspect, Start, Stop, Complete, Reset, and Set Stage.
2. Inspect a mod quest and verify current stage plus running/completed state appear in Results and Activity Log.
3. On a disposable save, confirm all quest-changing actions require confirmation; blank, fractional, negative, or greater-than-65535 stage values must be rejected.
4. With a controller, enter mod quest details, navigate to Set Stage, and press B to return to the selected mod quest row. Confirm favorite, Copy Quest ID, and Copy Editor ID remain available.
5. Confirm scanned mod quests show clickable recorded stages and full history after inspection; packaged quests retain their stage history.
6. Run `xmake build QuestStagesTests` and `xmake run QuestStagesTests` to verify compressed, uncompressed, extended, duplicate, empty, and malformed stage payloads.

## Sky-exposure Results popup

1. Run `player.ActorExposedToSky` outdoors and inside a building. Confirm the Results popup returns 1.00 and 0.00 respectively, matching the ordinary console.
2. Confirm the same result is retained in Activity Log. Use an invalid/non-actor reference or extra arguments and confirm a readable error.
3. Confirm ordinary console use is unaffected and other query captures still work.

## 1.2.38 feedback checks

- Settings stays at the bottom of ID Browser without a sidebar count.
- Tested creature skin and Akila child/crowd armor show Reference Only and no Add to Player action, including old Favorites.
- Five dot clicks enable report buttons; five more hide them without losing reports.
- Save each result status and a multiline comment; confirm comment-only reports work and Cancel/Escape do not save.
- Export writes a new timestamped UTF-8 file in the user CCC folder. Successful export clears that batch, failed export retains it, and reports added during export remain pending. Verify earlier files are preserved and browser preview downloads a timestamped file.
- Test controller focus and text entry in the report popup.

## 1.2.38 interface checks

- Fresh preferences hide WIP, Settings, Cells, Ship Parts, reference-only items, and Internal / System. Global searches do not reveal those records.
- Enable Advanced Options and confirm all categories return without losing Favorites. Disable while viewing an advanced category and confirm fallback to a visible view.
- Toggle light/dark and check all pages, Results, Help, report popups, controller keyboard, warnings, and input fields. Close/reopen to confirm preferences persist.
- Settings Escape and controller B close only the popup.
- Check exported reference-only items and Cydonia Pack in game.
