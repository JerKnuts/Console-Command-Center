# v0.3.0-test1 — inspection results test build

**Superseded by test2 following a scale-inspection crash. Do not use test1 to test Scale, Open State, GetStage, or Quest Status. See [TEST_BUILD_CRASH_GUARD.md](TEST_BUILD_CRASH_GUARD.md).** The instructions below document the older build only.

Built from the user's Desktop project on September 27, 2026. The original Desktop checkout was not changed. Synced project reference files were not changed.

## Packages and installation

- **Patch ZIP:** changed source/documentation files at the project root, the rebuilt DLL under `mod/SFSE/Plugins/`, and a complete ready-to-test mod under `dist/`.
- **Full source ZIP:** the complete project source, the same rebuilt DLL, and the same `dist/` mod. Excludes Git history, caches, `node_modules`, downloaded CommonLibSF, and previous releases. The existing setup script restores the pinned CommonLibSF dependency on a clean build.

Close Starfield before replacing its mod files. Extract the patch into the existing `console-command-center` project folder and allow the listed files to overwrite, or extract the full source into a separate folder. The patch is based on the exact folder supplied for this task; preserve any newer edits before applying it.

For immediate testing, install the contents of **`dist/`** as your CCC mod: its `SFSE` folder belongs beneath Starfield's `Data` folder (or the root of the CCC mod in your mod manager). Update **both** `ConsoleCommandCenter.dll` and the `OSFUI/views/console.command-center` files. The outer patch/source ZIP is a project archive, not a direct mod-manager installer. Start a fresh Starfield process so the new DLL is loaded. CCC's footer should show **v0.3.0-test1**.

To rebuild from source, use the existing `npm install` (fresh source only), `npm run build`, and `npm run check` workflow. The new handler regression tests run with `npm test` and require Node 22.13+ because they use Node's built-in TypeScript stripping.

## Changes

- Dropdowns now set explicit light text, dark popup backgrounds, selected-option colors, and keyboard focus outlines.
- Inspections open a dedicated modal results window with selectable, scrollable text. Activity Log has an **Open Results** button instead of embedding large outputs. Status messages stay compact. Errors and empty replies are distinguished from valid zero results.
- Inventory, position, rotation, actor values, and current spaceship use direct game reads instead of waiting for console text. Actor references use the game's RTTI cast so player/NPC subclasses are accepted. Rotation is converted from radians to degrees.
- Inventory snapshots include base Form IDs, total stack counts, base names, and equipped markers. They do not expand custom instance names or modification details. A 512 KiB output cap is explicitly marked if reached.
- Scale, open state, and GetStage use the game's registered condition evaluators, with signature checks. The pinned library's unmapped GetScale relocation is deliberately avoided.
- Quest Skips reads GetStage directly and still attempts SQS for full history. If the history capture times out, it shows the current stage with **history unavailable**, never a false empty-history claim.
- Remaining console captures reject overlapping CCC commands and avoid attributing unrelated old console history after buffer rollover. The existing Help search route is retained.
- Activity history keeps at most 100 entries and drops oldest entries when result text exceeds one million characters, retaining the newest result. Local-storage failure still permits session use.
- Command catalog and source statuses now reflect the latest user tests. Failed commands remain marked failed until an in-game retest passes. Stop Combat remains inconclusive and its command is unchanged.

## Validation and limits

The native DLL compiled and linked with the installed MSVC/XMake toolchain. TypeScript/OSF UI compatibility and production UI build passed. Six automated response-handler regression tests passed: large output, zero values, empty responses, errors, ordinary execution, and reopening saved text without executing a command again.

Starfield was not launched, so the native adapter results and runtime compatibility are **not yet verified in game**. The browser preview could not be opened by the available browser tool, so popup colors, scrolling, focus, and Escape behavior need visual testing. The browser-only mock now supplies long inventory output, a zero result, ship output, Help output, and a failure toggle for future UI checks.

**SQS, SQT, and other commands without a direct adapter still depend on console capture and may still time out.** This build does not claim those issues are resolved. No automatic ship selection or Stop Combat behavior change is included.

## Retest order

1. ID Browser: open both dropdowns and inspect normal/selected text. Repeat the previously working Beowulf/WEAP live search.
2. Show Player Inventory: check names/counts/IDs against the game inventory; scroll to the end. Close Results, open Activity Log, and reopen the snapshot without running the command again.
3. Reference position X/Y/Z, rotation X/Y/Z, scale, and door open state: compare with values in Starfield's own console. Confirm invalid/Base IDs produce errors rather than invented values.
4. Companion affinity, relationship level, and anger: compare each with the vanilla console. Include a legitimate zero value. Also inspect player and ship actor values.
5. Get Current Ship ID: test aboard a ship and elsewhere. Verify the returned Reference ID manually; no ship available must be a readable message, not a timeout.
6. GetStage and Quest Skips Check Status: compare the current stage. If SQS is unavailable, verify that history is explicitly unknown. Retest SQS and SQT separately and report any remaining failures.
7. Close Results using Close and Escape; verify Escape does not close CCC too. Check Stop Combat separately on a disposable test save and report whether combat resumes immediately.

Record new pass/fail results in `../TEST_RESULTS_2026-09-27.md`; compilation alone does not upgrade an in-game status.
