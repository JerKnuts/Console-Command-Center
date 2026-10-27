# Favorites follow-up testing — October 22, 2026

The player report says Command Log shows success but the item does not appear. No affected item name or logged command was supplied. The issue reproduced below is a confirmed local defect, not confirmation of the reporter's exact cause.

## Reproduced defect

Opening Favorites immediately after starting the page did not load the ID catalog or refresh saved runtime IDs. Packaged favorites were refreshed only after opening ID Browser; saved mod favorites were excluded from that refresh entirely. An old ID could therefore be dispatched after the owning plugin moved. Favorites from removed mods could remain actionable.

The native console executor returns after dispatching the command. Its success reply does not inspect or verify the resulting inventory. A simulated successful reply therefore reproduces the reported UI pattern without establishing actual game behavior.

## Implemented resolution

Favorites now loads the catalog before exposing saved item actions. Saved records are matched by owning plugin, record type and local ID, then resolved against the current full, medium or small plugin slot. Missing or unresolvable owners disable actions; names alone are never used to substitute a different item. The selected favorite is retained if its legacy key changes.

The initial 1.3.37 investigation established this path; the current release includes it and the mod-ID refresh described below. The isolated checks simulate dispatch rather than changing game inventory.

## Isolated browser results

| Case | Before local fix | After local fix |
| --- | --- | --- |
| .27 Caliber (002B559C) | Expected command | Pass |
| Addichrone (0029A851) | Expected command | Pass |
| Med Pack (0000ABF9) | Expected command | Pass |
| Deepseeker Pack (0016D15B) | Expected command | Pass |
| Deepseeker Space Helmet (0016D15C) | Expected command | Pass |
| Deepseeker Spacesuit (0016D2C4) | Expected command | Pass |
| Shattered Space weapon, plugin moved from 01 to 03 | Old 01 ID sent | Current 03 ID sent |
| Full mod moved from 05 to 07 | Old ID sent | Current ID sent |
| Medium mod moved from FD02 to FD06 | Old ID sent | Current ID sent |
| Small mod moved from FE002 to FE005 | Old ID sent | Current ID sent |
| Removed mod favorite | Add command still sent | No add action or command |

Each corrected case was also checked after page reload and switching away from Favorites and back. A favorited Add Item by Form ID command was tested separately from the saved ID control. Quantity 3 and quantity 1 were dispatched exactly once on their respective submissions. No browser page errors were observed. Inventory changes in these tests were simulated, not game inventory changes.

At the time of the initial investigation, all 287 automated tests and the UI/TypeScript checks passed. The browser fixture and machine-readable results are retained in the local diagnostic workspace.

## Remaining in-game checks

1. Use a disposable test save and record the current item count before each attempt.
2. Add one of each base-game item above directly from ID Browser, then add the same item from Favorites. Check the count changes by the requested amount, not just the Command Log status.
3. Restart/reload CCC and open Favorites before ID Browser. Repeat with a known playable DLC item and a loaded mod item; verify the displayed/copyable ID matches the current plugin slot.
4. Compare mouse and controller submission, quantity changes and switching between different favorites. Confirm only the selected item is affected.
5. If a case fails, retain the item name, Form ID, plugin name, requested quantity, full Command Log command and whether the same ID works directly from ID Browser or the game console.

Do not assume the reporter's issue is resolved until their affected item/path is identified and the candidate passes in-game testing.


## 1.3.57 follow-up: mod favorites

Every ID quick action refreshes plugin load order immediately before composing the command. Resolve owning plugin plus local Form ID for full, medium and small plugins; saved runtime IDs are not permanent. Preserve quantity and save the refreshed identity. Missing plugins block execution. Recover missing legacy local IDs only with a known owner and compatible saved ID format; ownerless legacy mod favorites require removing/re-favoriting from Mod Browser.

Tests exercise slot changes between clicks, all three plugin kinds, legacy recovery and removed plugins. They verify dispatched commands, not the reporter's inventory. In game, favorite a mod item, change its plugin slot, restart, then add it from Favorites and check inventory and Command Log. A successful console dispatch alone does not verify that the item was added.
