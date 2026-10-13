# Changelog

This file replaces the individual release-note documents. It records user-visible changes without repeating install and compatibility text for every version.

## 1.2.35

- Moved reference-only items behind Advanced Options across ID lists, searches, and ID Favorites. Saved favorites are preserved; reference-only entries still sort last when advanced content is enabled.

## 1.2.34

- Applied the exported reference-only findings for 66 unique item records and corrected the working Cydonia Pack label.
- Added a Settings popup beside Help with persistent Advanced Options and Light/Dark Mode toggles.
- Basic mode hides WIP, Settings, Cells, Ship Parts, and Internal / System quests. Locations and Cells now have separate categories.
- Added light and dark palettes based on Starfield research, inventory, and skill menus. Light uses pale gray/teal/charcoal/yellow; dark uses blue-black/slate/pale text/gray selection and blue detail headers.

## 1.2.33

- Added Reference Only for item Dev Mode reports and Executed (no effect) for command reports. Exports explain the observation and requested item-action cleanup.
- Result choices use toggle buttons with controller-friendly focus and allow comment-only reports.

## 1.2.32

- Moved reference-only records to the bottom of every ID Browser category and ID Favorites list, keeping normal and reference-only groups independently alphabetical.

## 1.2.31

- Renamed the ID Browser Game Settings category to Settings and removed its sidebar counter.
- Marked 36 tested creature-skin and Akila child/crowd armor records reference-only, disabling Add to Player including in Favorites.
- Added a five-click Dev Mode dot with per-entry status/comment reports and a combined text export in the user CCC folder. Reports remain saved when Dev Mode is off.

## 1.2.30

- Removed 244 packaged Free Lanes/Terran Armada quest IDs and the Quests category from ID Browser. All removed records remain in Quest Browser with its quest tools. Scanned mod quests remain in Mod Browser.
- Updated the packaged ID Browser count to 23,319; Quest Browser remains at 2,568.

## 1.2.29

- Moved companion and reference-only ammo below normal ammunition, keeping each group alphabetical.

## 1.2.28

- Marked 39 tested companion, creature, torpedo, missile, and special-effect ammo records reference-only after inventory tests showed no visible additions. Add to Player is disabled in browser and Favorite selections.
- Labeled companion ammo variants and added Reference Only badges to the ID list.

## 1.2.27

- Ordered quest sections as Base Game, Shattered Space, Free Lanes, and Terran Armada, retaining alphabetical categories within each.
- Fixed Quest Browser category clicks for Free Lanes and Terran Armada. The handler now accepts all four packaged quest sources and rejects invalid source/category values.

## 1.2.26

- Sorted command, ID Browser, and quest categories alphabetically. WIP stays last in Commands, and Game Settings stays last in ID Browser.

## 1.2.25

- Preserved the spreadsheet categories in Game Settings. Only MAIN is split into Scanner, Ships, Combat, Camera, and Other; original category metadata remains visible in the right panel.

## 1.2.24

- Added a searchable, inspection-only Game Settings category with 8,705 reference entries, grouped by Scanner, Ships, Combat, Camera, and Other.
- Show setting names, types, available Form IDs, and labeled workbook reference values beside Inspect Current Value. No setting-edit actions are enabled.

## 1.2.23

- Expanded Free Lanes and Terran Armada ID catalogs to all named owned records in supported types, including perks, spells, and quest IDs, in their matching categories.
- Marked internal/test records reference-only and corrected master ownership for DLC override records. The ID Browser now contains 23,563 entries.

## 1.2.22

- Corrected ID Favorites to clickable name-only rows. Selecting an ID shows its details, quantity, favorite, copy, and supported actions in the right panel without leaving Favorites.

## 1.2.21

- Made ID Favorites compact rows with inline record details and matching control heights.
- Added quantity and Add to Player controls directly to supported favorite items, using the existing confirmation flow and quantity limits.

## 1.2.20

- Removed the Common Items category; credits and digipicks remain under Resources / Miscellaneous, and ship repair parts under Aid / Consumables.
- Condensed saved-batch and ID Favorites cards to two text rows and matched the star and Open/Load button heights.

## 1.2.19

- Consolidated the changes made since the published 1.2.18 build and synchronized native/UI version markers.
- Recovered sample batches and expanded ship, vehicle, workshop, and official quest catalogs onto the published baseline.
- Made sidebar rows grow with wrapped labels so two- and three-line names do not overlap adjacent entries.
- Condensed sidebar category rows and Recent/Favorites spacing so more entries fit on screen.
- Made Quest Browser game and DLC headings more prominent with larger bold text and orange section accents.
- Recorded new quest/global/help tests, corrected subtitle-hide behavior, added the required planet marker name, and refreshed engine-help descriptions from the in-game export.

## 1.2.18

- Added exact command-return capture for ActorExposedToSky Results popups to address the printed-console-log timeout. Zero remains a valid result; the new native path awaits in-game confirmation.
- Updated release documentation, catalog counts, batch instructions, and cleanup behavior.

## 1.2.17

- Restored the Custom Command text field to the full available editor height.
- Synchronized line numbers with command scrolling, including the end of long batches; the gutter widens for larger line counts.

## 1.2.16

- Scan Mods now extracts recorded quest-stage indexes, including compressed quest records.
- Mod quests show clickable stage buttons and full stage-history inspection, with current/completed stage indicators.

## 1.2.15

- Added Quest Browser inspection and confirmed Start, Stop, Complete, and Reset controls to Mod Browser quest records.
- Added manual Set Stage for mod quests using their current runtime IDs. Mod scans do not include recorded stage lists.

## 1.2.14

- Removed the headingless Ready to Test group and placed its commands into Engine Console Commands or Script Functions according to the engine catalog.

## 1.2.13

- Promoted Workshop Fly Camera to Camera after successful testing inside and outside Workshop mode.
- Disabled FXCam after testing trapped the player in free-camera mode, froze actors, and required a game restart. Its card retains the test details.

## 1.2.12

- Added Results popups and Activity Log output for ten read-only WIP queries.
- Recorded verified position, rotation, time, sky-exposure, and home-ship queries; kept five queries unconfirmed pending output testing.

## 1.2.11

- Fixed the Custom Command line-number gutter overlapping text and extending below the editor.
- Added readable official plugin names from the AFK Mods module list.
- Added the reported NPC movement side effect to Toggle Collision.
- Verified Workshop inside ships; marked KAP, TakeOffToSpace, and SetAtStart as effect unconfirmed.
- Recorded successful in-game Auto-Run testing.

## 1.2.10

- Added per-batch **On Load** selection and a master **Auto-Run** switch.
- Selected `.txt` batches run in filename order three seconds after an existing save loads, even when CCC has not been opened.
- Auto-Run is disabled by default, ignores new games, prevents duplicate runs from overlapping load events, and records results for the Activity Log.
- Stored Auto-Run settings in the user-owned CCC folder so mod updates cannot replace them.

## 1.2.9

- Constrained the Custom Command workspace to the available screen height.
- Saved batch files now scroll inside the Batch Files panel instead of extending the window.

## 1.2.8

- Removed the visible Commands label, aligned the editor with Batch Files, and disabled manual resizing.
- Compacted saved batch rows and matched the Favorite, Load, and Delete button heights.

## 1.2.7

- Condensed the Saved Commands heading into a single Batch Files label.
- Expanded the scrollable batch list to use all remaining panel height.

## 1.2.6

- Removed the remaining Raw Console Commands label.
- Extended the command editor upward and enlarged it to align with the Saved Commands panel.

## 1.2.5

- Moved Format Tips alongside the Clear and Review Commands actions.
- Enlarged the command editor and removed its redundant heading and description.

## 1.2.4

- Expanded the Custom Command example with comments, section labels, blank-line spacing, quantities, and multiple command types.
- Added compact formatting tips beneath the editor.

## 1.2.3

- Added faint, synchronized line numbers to the Custom Command editor.
- Removed the 100-command limit from active and saved batches while retaining the 1 MB file and 1,024-character per-command safeguards.

## 1.2.2

- Turned the Speech Challenge Success and Failure action pairs into command selectors.
- The highlighted action now controls the displayed command, execution confirmation, and **Add to Batch** result.
- Selecting the inactive action switches commands; selecting the highlighted action again opens execution confirmation.
- Added an on-screen double-click instruction and requires two activations before paired Speech Challenge actions execute.
- Added **Cancel Scan** to the Mod Browser progress window while preserving the previously completed catalog.

## 1.2.1

- Kept the current Custom Command draft populated while switching pages and added a nearby **Clear** action.
- Added **Add to Batch** to command cards so prepared commands can be appended to the current batch.
- Matched the Favorite, **Add to Batch**, and Execute button heights on command cards.

## 1.2.0

- Moved saved Custom Command batches into user-owned `.txt` files with refresh, `#` comments, validation, and automatic migration from browser storage.
- Removed generated dependencies, build output, old patch manifests, superseded test-build notes, and duplicate release-note files from the distributed source archive.
- Consolidated release history into this changelog and folded the Quest Browser guide into the README.
- Replaced the accumulated release checklist with a shorter checklist for the current session-based Mod Browser workflow.
- Added a development-only Mod Browser scanner to the OSF UI webview.
- The preview now discovers the active MO2 profile, resolves enabled plugin files from the MO2 mods folder and stock Data folder, and calculates full, medium, and small runtime Form IDs.
- **Scan Mods** in the webview now loads real supported records instead of the three-item fixture catalog.
- Added explicit preview configuration for the MO2 profile and stock game Data folder when automatic detection is not appropriate.

## 1.1.26

- Finalized the release packaging and source cleanup, including the OSF UI webview Mod Browser preview scanner.

## 1.1.25

- Kept wrapped Command, ID Browser, and Mod Browser sidebar titles left aligned and vertically centered.
- Kept counts vertically centered in their own column and preserved padding around multi-line names.

## 1.1.24

- Made shared sidebar rows grow to fit wrapped names and kept their counts aligned.

## 1.1.23

- Corrected Shattered Space quest localization and classification.
- Kept dialogue, scene, template, shell, tracker, and ambient-support quests under Internal / System.

## 1.1.22

- Changed Mod Browser to a deliberate, session-only **Scan Mods** workflow with no automatic persistent-catalog restore.
- Added Bethesda `SFBGS...` plugins under **Official Creations**.
- Reduced Quest Browser clutter while retaining all 2,318 Bethesda quest records.

## 1.1.21

- Added total ID progress and automatic row growth for long names.

## 1.1.20

- Added detailed Mod Browser scan reports to Activity Log.
- Widened the shared category sidebar and improved spacing between mod entries.

## 1.1.19

- Added persistent favorites for individual ID Browser and Mod Browser records.
- Added readable names for hundreds of known plugin filenames.

## 1.1.18

- Split large Mod Browser transfers into per-plugin replies so very large load orders could finish reliably.

## 1.1.17

- Removed the browser-side scan timeout and preserved the working catalog when a scan failed.
- Displayed the raw console command beneath the selected command title.

## 1.1.16

- Combined Mod Browser discovery and ID collection into one **Scan Mods** action.
- Made Search All search records across scanned mods instead of filtering the mod list.

## 1.1.15

- Added favorites for saved Custom Command batches.
- Corrected controller movement between saved-command Load and Delete controls.
- Improved category selection borders and Mod Browser ordering.

## 1.1.14

- Improved ship and ship-part classification and scan feedback.

## 1.1.13

- Added scan progress, Add to Player for books and notes, Spawn for furniture, and a compact quantity/action row.

## 1.1.12

- Added collapsible record categories for large mod catalogs and Search Mod/Search All scopes.

## 1.1.11

- Added the complete large-load-order scanning workflow, ID-count sorting, and zero-ID filtering.

## 1.1.1

- Introduced automatic loaded-plugin discovery and the separate Mod Browser.
- Added full, medium, and small plugin Form ID ownership handling.

## 1.1.0

- Added complete controller navigation and text entry through OSF UI 2.0.
- Introduced compact Commands, ID Browser, and Quest Browser layouts.

## 1.0.0–1.0.13

- Published the first Nexus-ready release with the established command library, ID Browser, Quest Browser, favorites, Recent, Activity Log, and saved command batches.
- Migrated the native and browser bridge to OSF UI 2.0 and moved the installed view to the modern `OSF/UI/views` path.
- Added the first-run guide, command-specific browser filters, paired command actions, WIP result groups, and crash guards for unsafe commands.
- Expanded controller-ready dialogs, help, result windows, browser-backed fields, and command verification records.

## 0.3.0–0.3.14 beta

- Built the original searchable command interface and native SFSE execution bridge.
- Added categorized commands, confirmation levels, favorites, Recent, Activity Log, Custom Command batches, ID data, quest data, and early inspection tools.
- Iterated through in-game command testing, packaging, native safety checks, and release validation before v1.0.
