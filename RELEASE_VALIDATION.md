# v1.1.0 validation checklist

## Install

Close Starfield, replace the existing CCC files with the v1.1.0 build, and restart the game. The footer and native connection message must both report **v1.1.0**.

## Upgrade and controller checks

1. Before updating, use v1.0.13 to add a favorite, execute a harmless command, create an Activity Log entry, and save a named Custom Command batch. Close CCC normally.
2. Install v1.1.0 without clearing OSF UI browser data. Confirm the favorite, Recent entry, Activity Log entry, and saved Custom Command batch all remain. Do not release the update if any are missing.
3. Confirm the installed view is under `SFSE/Plugins/OSF/UI/views/console.command-center/main` and no CCC files remain under the legacy `OSFUI/views` path.
4. Open OSF Settings, choose Launcher, and confirm **Console Command Center** appears and opens normally.
5. Confirm the footer reports **CCC v1.1.0**, **OSF UI 2.0 API**, and **NATIVE READY**.
6. Use only a controller. Confirm **LB/RB** cycle through Commands, ID Browser, Quest Browser, Custom Command, and Activity Log in the navigation bar below the header.
7. On Commands, ID Browser, and Quest Browser, confirm focus begins on the first category. Press **A** to enter the main list, **A** again to enter the selected detail pane, and **B** to return one layer at a time.
8. Confirm tapping **B** while a category is focused closes CCC, and holding **B** closes CCC from any layer.
9. Confirm the D-pad and left stick move predictably, held directions repeat smoothly, and the right stick scrolls long lists and Results windows.
10. Confirm directional input cannot escape Selected ID or Selected Quest; only **B** returns to the main list.
11. Focus Search and press **A**. Enter text with the onscreen keyboard, use **X** for backspace, **Y** for space, **LB/RB** to move the cursor, and select **Done**. Confirm the search spans all categories in the active browser.
12. Test a numeric command field and a Form ID field. Confirm they open number and hexadecimal layouts instead of the full alphabetic layout.
13. Open and close confirmation, Help, Results, Reference ID Picker, inspection, and first-time welcome windows. Confirm focus stays inside the active window and returns to the control that opened it.
14. Confirm Close and Cancel show **B**, Search shows **Start**, Help shows **Select**, the top navigation shows **LB/RB**, and keyboard Backspace and Space show **X/Y** while a controller is active.
15. Confirm moving right from the favorite star reaches Execute and moving left from Execute returns to the star.
16. Confirm Custom Command opens at Reusable Entries and Activity Log opens at its newest entry. From the newest Activity entry, Up must reach Clear Log.
17. Switch between mouse and controller. Confirm mouse clicks work normally and the bright controller focus outline returns after the next controller input.
18. Execute a harmless command and a read-only inspection to confirm modern request/reply handling works.
19. Press Escape with a Results window open. Confirm Results closes first; press Escape again and confirm CCC closes.
20. Confirm blocked WIP cards expose their syntax only from the large disabled **Unavailable** action.
21. Open Recent, choose **Clear Recent**, and confirm its cards and sidebar count clear.
22. Confirm Inspect Reference Scale and Toggle Decal Rendering remain under **Blocked — Known Crash** and cannot execute through CCC.
23. Confirm Show Current Quest Targets and Spawn Ship by Base ID remain under **Executed — Issues** and unavailable.
24. Search for Toggle Game Pause and confirm exactly one established result appears.
25. Confirm Show First-Person Model in Third Person, Toggle All Actor Animations, Select Next Actor, and Select Next Reference appear in their established categories rather than WIP.
26. Confirm Save Game by Name and Load Game by Name appear under Executed — Issues and cannot execute through CCC.
27. Confirm Speech Challenge Success and Failure each use one compact card with two equally sized action buttons beside the favorite star.
28. Open Help from every page and confirm each page has its own title and instructions. Open **First-time Overview** from Help and confirm the separate welcome window appears.

## Safe priority checks

1. Confirm the first launch opens the welcome guide, **Start Exploring** closes it, and **Help** opens the guide for the current page.
2. Confirm the footer and native connection both report v1.1.0.
3. Open **ID Browser**. It should report **16,528 included IDs**.
4. Confirm ID Browser categories appear in the sidebar and choosing one displays its compact result list.
5. Open NPCs, Mods, and Locations. Each selected category should load completely without a **Show More** control.
6. Search for **Med Pack**, **Beowulf**, an Editor ID, and a hexadecimal Form ID. Search should cover all ID Browser categories automatically.
7. Select a normal inventory item, copy its Form ID, then add a quantity greater than one.
8. Select a cell and a location. Each should show both **Copy ID** and **Copy Editor ID**.
9. Select a Shattered Space record and confirm its expansion requirement is visible.
10. Confirm internal test, template, dummy, and creature-attack records do not dominate the results.
11. Clear the search and confirm the previously selected category and result list return.
12. Close and reopen ID Browser and confirm its catalog appears immediately.

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

1. Confirm **Inspect Quest State** reports the current stage and marks completed stages through the native reader.
2. Confirm each expanded quest explains that Start may need a stage before appearing in the mission log and Reset does not restart the quest.
3. Close and reopen Quest Browser and confirm its category and quest list appear immediately.
4. Find an original-story quest, New Game Plus variant, expansion quest, and internal/system quest. Confirm each applicable note appears in the Selected Quest pane.

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

- Mouse and keyboard behavior remains intact alongside controller navigation and text entry.
- Quest records are grouped by Base Game and Shattered Space sidebar categories, globally searchable, and shown in compact scrollable lists.
- Quest modification buttons always show a Danger confirmation.
- The packaged ID Browser contains no live game scanner.
- Known-broken commands remain visibly unavailable.

Historical in-game results are kept in [`docs/TEST_RESULTS_2026-09-27.md`](docs/TEST_RESULTS_2026-09-27.md).
