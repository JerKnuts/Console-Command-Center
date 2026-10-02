# v1.0 release validation checklist

## Install

Close Starfield, replace the existing CCC files with the v1.0 build, and restart the game. The footer and native connection message must both report **v1.0**.

## v1.0 interaction checks

1. In ID Browser, select Location **The Lodge**, choose **Find Teleportable Cell**, then clear the search with the X. Confirm all ID categories return rather than only Locations and Cells.
2. Run several harmless established commands, open **Recent**, and confirm its entries display as full-width rows rather than a grid.
3. Save two disposable Custom Command entries, choose **Delete All**, and confirm the action remains disabled until the field contains exactly `Delete`. Cancel once, then confirm deletion.
4. In Quest Browser, expand a category and quest, run **Check Current Stage**, and close Results. Confirm the same category and quest remain open at the same scroll position. Repeat with **Show Stage History**.
5. Find **Toggle Grass** and **Toggle Sky** under World and confirm each still toggles off and back on.
6. In Untested, confirm the failed FOV, Wireframe, Collision Geometry, and Subtitle entries and their raw duplicates are disabled with explanations.
7. Confirm **Select Closest Actor** now appears under Targets.

## Safe priority checks

1. Confirm the footer and native connection both report v1.0.
2. Open **ID Browser**. It should report **16,528 included IDs**.
3. Confirm all result categories begin collapsed and clicking the full category row opens it.
4. Open NPCs, Mods, and Locations. Each large group should initially show 100 rows and offer **Show 100 more**.
5. Search for **Med Pack**, **Beowulf**, an Editor ID, and a hexadecimal Form ID. Search should include collapsed groups automatically.
6. Select a normal inventory item, copy its Form ID, then add a quantity greater than one.
7. Select a cell and a location. Each should show both **Copy ID** and **Copy Editor ID**.
8. Select a Shattered Space record and confirm its expansion requirement is visible.
9. Confirm internal test, template, dummy, and creature-attack records do not dominate the results.
10. Clear the search and confirm every category returns to its collapsed state, including categories that were open before searching.
11. On the first ID Browser open, allow the brief loading state to finish; close and reopen it and confirm the catalog appears immediately.

## Form ID command searches

1. Run **Search Form IDs** for `Beowulf`. It should open ID Browser immediately with matching results and no confirmation or Results timeout window.
2. Run **Search Form IDs** for `Med Pack`, select the result, and confirm **Copy ID** and **Add to Player** remain available.
3. Run **Search Form IDs by Type** for `Beowulf` with `WEAP`. Every result should be a WEAP record.
4. Repeat `Beowulf` with `ARMO`. It should show no matches rather than unrelated record types.
5. Use the **Choose Type** box, choose NPCs, and search for `Sarah`. Results should open in ID Browser with the `NPC_` filter shown in the summary.
6. Search by type for a known quest name with `QUST`. It should open Quest Browser with the search already applied.
7. Disconnect or temporarily remove the native DLL only if convenient. Both packaged searches should remain available because they do not call the native bridge.

## Browser-backed command fields

1. In **Add Item by Form ID**, set Amount to 4, choose **Browse Items**, select Med Pack, and use the ID. Confirm the card returns with Med Pack’s ID and Amount still 4. Cancel before execution.
2. Confirm Remove Item, Equip Item, Unequip Item, and Drop Item expose the appropriate item/equipment browser and return the chosen ID.
3. Open **Spawn Object / NPC by Base ID**, browse base IDs, choose an NPC, and confirm its Base ID returns without spawning it.
4. In Attach or Remove Weapon / Armor Mod, confirm **Browse Mods** fills only the Modifier / Mod ID. The Item Reference ID must remain unchanged and manual.
5. In **Spawn Ship by Base ID**, confirm **Browse Ships** shows only GBFM records and returns the selected ID without spawning it.
6. Open Start, Stop, Set Stage, Complete, Reset, and Teleport to Quest Target. Confirm each offers **Choose Quest** and returns the chosen Quest ID without running a quest command.
7. In **Set Quest Stage**, choose a quest, then choose **Choose Stage**. Confirm the box lists that quest’s recorded stage numbers and fills the selected stage.
8. Start a browser selection, enter a search, then choose **Cancel Selection**. Confirm the original command values are preserved.
9. Open **Add Perk / Skill** and **Remove Perk / Skill**. Confirm **Browse Perks** shows only packaged PERK records and returns the chosen ID without executing it.
10. Open **Add Power**. Confirm **Browse Powers** shows Starborn powers and does not show environmental effects such as Poor Air Quality.
11. Open **Remove Spell / Effect**. Confirm **Browse Effects** includes both Starborn powers and known removable environmental effects, then returns the chosen ID without executing it.
12. Confirm each filtered browser opens its permitted result category directly below the controls, already expanded, with no large blank area.

## Name-correction checks

1. Search for `010CA4BE`, `010CA4BC`, and `01007540`. These internal/non-equippable weapon records should no longer appear.
2. Browse several Shattered Space weapons and confirm labels resemble item or cleaned Editor ID names rather than spoken dialogue.
3. Search for phrases such as `pretentious`, `deep space and back`, and `Getting Kaiser back`. None should appear as item names.

## Quest Browser safety checks

1. Confirm **Check Current Stage** reports the quest state through the native reader.
2. Confirm **Show Stage History** reports recorded stages through the native reader.
3. Confirm each expanded quest explains that Start may need a stage before appearing in the mission log and Reset does not restart the quest.
4. On the first Quest Browser open, allow the brief loading state to finish; close and reopen it and confirm the quest list appears immediately.
5. Find an original-story quest, New Game Plus variant, expansion quest, and internal/system quest. Confirm each applicable badge is visible before expanding the quest row.

## Disposable-save quest checks

Make a manual backup save first. Choose a minor quest that is safe to alter.

1. Cancel a **Start Quest**, **Stop Quest**, **Complete Quest**, **Reset Quest**, and **Set Stage** confirmation; no command should execute.
2. On a disposable save, start a known inactive minor quest and confirm it enters the quest log.
3. Set a known stage and confirm the quest advances to that stage.
4. Complete that disposable test quest and confirm it completes.
5. Reload the backup save after the checks.

## Regression checks

1. On a disposable save, open **Open or Close Reference**, choose **Closed**, and confirm only the state field changes to 0. Cancel the confirmation.
2. Repeat with **Open** and confirm the state changes to 1. On an ordinary non-quest door, execute Open and Closed and confirm both states work.
3. Inside a building, run **Set Interior Gravity** with 0 and confirm gravity is removed. Run it again with 1 and confirm normal gravity returns.
4. Inspect CarryWeight, run **Set Carry Weight Effective Total** with a distinct value, approve the calculated-base preview, and confirm the inspected result matches the requested total.
5. Run **Reevaluate Actor Behavior** on a harmless nonessential NPC and confirm it can resume movement or behavior without a console error.
6. Run **Wait Anywhere** for 1 hour. Confirm time advances and no WAIT/B prompt appears. Restore from a save if the surrounding game state makes time advancement undesirable.
7. Inspect Player Health and confirm Results contains a number.
8. Show Player Inventory and recheck search, collapsed groups, sorting, and Copy ID.
9. Add and remove an ordinary item from ID Browser using a quantity greater than one.
10. Run two harmless Custom Command lines and confirm ordered execution plus separate Activity Log entries.
11. Confirm Favorites and Activity Log survive closing and reopening CCC.
12. In Custom Command, save a named one-line entry and a named multiline entry. Load each and confirm the editor is restored without executing anything.
13. Save again under an existing name and confirm it updates that entry. Delete an entry and confirm it disappears.
14. Close and reopen CCC and confirm the remaining saved Custom Command entries persist.

## Expected behavior

- CCC remains a mouse-and-keyboard interface; controller support is identified as planned work.
- Quest records are grouped, searchable, paged, and collapsed by default.
- Quest modification buttons always show a Danger confirmation.
- The packaged ID Browser contains no live game scanner.
- Known-broken commands remain visibly unavailable.

Historical in-game results are kept in [`docs/TEST_RESULTS_2026-09-27.md`](docs/TEST_RESULTS_2026-09-27.md).
