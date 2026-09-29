# v0.3.0-test7 — Interface consistency pass

## Install

Close Starfield, extract the patch into the existing CCC project, run **npm run build**, deploy the resulting mod through the existing workflow, and restart Starfield. The footer must show **v0.3.0-test7**. This update changes the UI; the included native DLL retains the test6 fixes.

## Test7 changes

- Added the OSF tricolor bar to Results and Quick Choices windows so all secondary windows use the same header treatment.
- Unified secondary-window backgrounds, borders, shadows, title spacing, close buttons, output areas, and focus states.
- Replaced the older blue Results and inventory palette with the same dark-neutral and orange palette as the main command screen.
- Standardized alternating rows, hover highlights, borders, and minimum row heights across inventory, activity, quest, ID Browser, and command lists.
- Matched dropdown, input, and button states across the main interface and secondary windows.
- Added matching orange scrollbars to long command, activity, inventory, picker, ID, and output lists.

## Priority test

1. Open a command with **Choose Value** and confirm the Quick Choices window has a tricolor bar at the top and a second divider above its rows.
2. Run any working inspection command and confirm the Results window has the same tricolor bar, neutral background, orange command text, and matching Close button.
3. Open Show Player Inventory and confirm its search, sort, categories, item rows, hover states, and Copy ID buttons match the rest of CCC.
4. Compare command, Activity Log, Quest Fix, and ID Browser rows for consistent spacing, alternating color, and orange hover treatment.
5. Check keyboard focus on fields and buttons in the main screen, Results, and Quick Choices windows; each should use the same orange outline.

## Test6 changes retained

## Test6 changes

- Replaced the overlapping Built-in Category and Game Record Type selectors with one Category selector containing 17 useful groups.
- A selected built-in or live ID Browser result now always shows Copy ID beside any available quick action.
- Inspect Game Setting now has a searchable chooser containing every Game Setting controlled by CCC.
- Added Star Power and Star Power Recharge Rate to the player actor-value chooser.
- Updated verification badges and warnings from the full test5 session, including additive shielded-cargo and reactor-power behavior.
- Open Wait Menu now asks Starfield's native UI queue to show `SleepWaitMenu` after CCC closes instead of sending another console command.
- Get Grabbed Object Reference ID now rejects the player reference instead of presenting `00000024` as a grabbed object. A reliable grabbed-object source still needs investigation.

## Test6 priority test

1. Open ID Browser and confirm there is one Category selector with all 17 categories.
2. Select a built-in Beowulf result and confirm Copy ID copies `0004716C`.
3. Use Search Game for Beowulf under Weapons, select a live result, and confirm Copy ID works.
4. Open Inspect Game Setting and confirm Choose Value is searchable and fills the selected setting.
5. Run Open Wait Menu and confirm CCC closes and the wait menu appears.
6. Run Get Grabbed Object Reference ID while holding an object. It must never return `00000024`; record the returned ID or error.

## Test5 record

- Successful non-inventory Results scan returned text for unique eight-digit Form/Reference IDs and show a **Copy ID** button for each one. Activity Log results gain the same buttons when reopened.
- Inspect Reference Actor Value has choices for common general and companion values.
- Inspect Ship Actor Value has choices for cargo, shielded cargo, crew, reactor, grav fuel, boost fuel, and boost recharge.
- Inspect Game Setting reads supported values directly from Starfield instead of waiting for console text.
- Get Grabbed Object Reference ID uses a native candidate reader based on the player's current command target. It needs specific in-game verification while holding an object and while nothing is targeted.
- Open Wait Menu closes CCC, waits briefly, and then sends the menu command.
- Boostpack and ship cargo SetAV cards now state that they change a base value while GetAV can include active equipment, perk, or module modifiers.
- Test4 and the subsequent command tests are recorded in the catalog and test log.

Scale, Open State, GetStage, and Quest Status remain disabled after the test1 native crash. Stop Actor Combat remains marked Needs Adjustment.

## Test5 final results

1. **Open Wait Menu — Failed in test5.** The command executed and CCC closed quickly, but the wait menu did not appear. A later game crash is unassigned because no connection to CCC was established.
2. **Inspect Game Setting — Passed.** `fHandScannerScanRange` returned `60.0`.
3. **Get Grabbed Object Reference ID — Failed.** Returned player Ref ID `00000024` both while holding an object and after dropping it.
4. **Current Ship Reference ID Copy ID — Passed.**
5. **Activity Log Copy ID — Passed.**
6. **Reference and ship actor-value choice boxes — Passed.**

Native DLL build, OSF UI compatibility, production UI build, and all eleven automated response/parser/navigation/category/handoff tests passed before packaging.
