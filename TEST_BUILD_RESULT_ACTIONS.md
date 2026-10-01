# v0.3.7 — Quest safety and catalog cleanup test checklist

## Install

Close Starfield, replace the existing CCC files with the v0.3.7 build, and restart the game. The footer and native connection message must both report **v0.3.7**.

## Safe priority checks

1. Confirm the footer and native connection both report v0.3.7.
2. Open **ID Browser**. It should report **16,518 included IDs**.
3. Confirm all result categories begin collapsed and clicking the full category row opens it.
4. Open NPCs, Mods, and Locations. Each large group should initially show 100 rows and offer **Show 100 more**.
5. Search for **Med Pack**, **Beowulf**, an Editor ID, and a hexadecimal Form ID. Search should include collapsed groups automatically.
6. Select a normal inventory item, copy its Form ID, then add a quantity greater than one.
7. Select a cell and a location. Each should show both **Copy ID** and **Copy Editor ID**.
8. Select a Shattered Space record and confirm its expansion requirement is visible.
9. Confirm internal test, template, dummy, and creature-attack records do not dominate the results.
10. Clear the search and confirm every category returns to its collapsed state, including categories that were open before searching.
11. On the first ID Browser open, allow the brief loading state to finish; close and reopen it and confirm the catalog appears immediately.

## Name-correction checks

1. Search for `010CA4BE`, `010CA4BC`, and `01007540`. These internal/non-equippable weapon records should no longer appear.
2. Browse several Shattered Space weapons and confirm labels resemble item or cleaned Editor ID names rather than spoken dialogue.
3. Search for phrases such as `pretentious`, `deep space and back`, and `Getting Kaiser back`. None should appear as item names.

## Quest Browser safety checks

1. Confirm **Check Current Stage — Unavailable** is visible and cannot be activated.
2. Confirm **Show Stage History — Unavailable** is visible and cannot be activated.
3. Confirm each expanded quest explains that Start may need a stage before appearing in the mission log and Reset does not restart the quest.
4. On the first Quest Browser open, allow the brief loading state to finish; close and reopen it and confirm the quest list appears immediately.

## Disposable-save quest checks

Make a manual backup save first. Choose a minor quest that is safe to alter.

1. Cancel a **Start Quest**, **Stop Quest**, **Complete Quest**, **Reset Quest**, and **Set Stage** confirmation; no command should execute.
2. On a disposable save, start a known inactive minor quest and confirm it enters the quest log.
3. Set a known stage and confirm the quest advances to that stage.
4. Complete that disposable test quest and confirm it completes.
5. Reload the backup save after the checks.

## Regression checks

1. Inspect Player Health and confirm Results contains a number.
2. Show Player Inventory and recheck search, collapsed groups, sorting, and Copy ID.
3. Add and remove an ordinary item from ID Browser using a quantity greater than one.
4. Run two harmless Custom Command lines and confirm ordered execution plus separate Activity Log entries.
5. Confirm Favorites and Activity Log survive closing and reopening CCC.

## Expected behavior

- CCC remains a mouse-and-keyboard interface; controller support is identified as planned work.
- Quest records are grouped, searchable, paged, and collapsed by default.
- Quest modification buttons always show a Danger confirmation.
- The packaged ID Browser contains no live game scanner.
- Known-broken commands remain visibly unavailable.

Historical in-game results are kept in [`docs/TEST_RESULTS_2026-09-27.md`](docs/TEST_RESULTS_2026-09-27.md).
