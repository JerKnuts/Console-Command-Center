# v1.1.26 release validation

This is the maintained release checklist. It covers behavior most likely to break and avoids repeating implementation-level unit tests.

## Build and install

1. Run `npm test`, `npm run check`, and `npm run build` successfully.
2. Install the generated archive over the previous release without clearing OSF UI browser data.
3. Confirm the view is under `SFSE/Plugins/OSF/UI/views/console.command-center/main` and the native DLL is under `SFSE/Plugins/`.
4. Launch through SFSE and confirm the footer and native connection both report **v1.1.26**, **OSF UI 2.0 API**, and **NATIVE READY**.
5. Confirm existing command favorites, ID favorites, Recent entries, Activity Log entries, and saved Custom Command batches remain available.

## Navigation and layout

1. With a controller, use LB/RB to cycle through Commands, ID Browser, Mod Browser, Quest Browser, Custom Command, and Activity Log.
2. Confirm A activates controls, B returns one layer, holding B closes CCC, and the right stick scrolls long panels.
3. Open an editable text, numeric, and hexadecimal field and verify the appropriate controller keyboard layout.
4. Open and close Help, Results, confirmation, Reference ID Picker, inspection, and welcome windows. Focus must stay inside the active window and return to the control that opened it.
5. Inspect quest state, close Results with B, and confirm focus returns to the right-panel **Inspect Quest State** control.
6. Check long names in Commands, ID Browser, and Mod Browser. Rows must grow to fit, titles must be left aligned and vertically centered, counts must stay centered in their own column, and dividers must not overlap text.
7. Confirm a focused or selected category has an orange border on all four sides.

## Commands and saved batches

1. Search for a common command, select it, and confirm its raw console syntax appears beneath the title.
2. Execute one harmless command and one read-only inspection; confirm both add accurate Activity Log entries.
3. Confirm blocked crash-prone commands remain unavailable and expose their syntax only from the large disabled action.
4. Save, load, favorite, update, and delete a Custom Command batch without executing it during Load.
5. With a controller focused on a saved batch, confirm Right from Load moves to Delete.
6. Confirm saved-batch favorites appear in Favorites and open the batch for review.

## Packaged ID Browser

1. Open ID Browser and confirm it reports **16,528 included IDs** without starting a mod scan.
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
10. Favorite a scanned ID and use **Open** from Favorites to return to its mod, category, and record.
11. Open Activity Log and verify the **Mod Browser Scan** entry reports load-order entries, discovered and loaded mods, IDs, zero-ID mods, failures, opened and missing files, and elapsed time.
12. Close and reopen Mod Browser in the same session and confirm the scanned catalog remains available. Restarting the game may require another manual scan.
13. Run `npm run dev:game`, open Mod Browser in the OSF UI webview, and select **Scan Mods**. Confirm it displays the configured MO2 profile's real plugins and IDs rather than Browser Fixture Arsenal.

## Quest Browser

1. Confirm the browser contains 2,318 quest records and 16,844 recorded stage indexes.
2. Search a base-game mission, a Shattered Space mission, and an internal/system quest by name, Editor ID, and Form ID.
3. Confirm Shattered Space quests show their actual quest titles rather than dialogue subtitles.
4. Confirm obvious holder, support, patch, debug, dialogue, scene, tracker, template, and always-on records remain available under **Internal / System**.
5. Inspect a safe quest and confirm current stage, running/completed state, and completed-stage history display correctly.
6. On a disposable save only, confirm Start, Stop, Complete, Reset, and Set Stage always show a Danger confirmation.

## Release artifacts

1. Open the Nexus-ready ZIP and confirm it contains the expected `SFSE` layout and no source or development files.
2. Open the source ZIP and confirm it excludes `node_modules`, CommonLibSF checkout, build output, local caches, prior archives, and generated artifacts.
3. Confirm the source ZIP includes `README.md`, `CHANGELOG.md`, license files, current docs, source, scripts, tests, package lock, and native dependency setup script.
4. Verify the SHA-256 values in the generated package manifest.
