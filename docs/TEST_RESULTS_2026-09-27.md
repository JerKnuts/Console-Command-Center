# Starfield Console Command Center — latest in-game test results

Source: user testing reported during the September 27, 2026 development session.

These are user-reported results, not independently reproduced. The previous conversation describes the output failures as timeouts; screenshots have not yet been inspected. This test build replaces the main inspections with direct game reads and adds a results window. Fixes have not been verified in game; the table preserves the last user-reported results.

| Feature | Latest status | Notes / next test |
| --- | --- | --- |
| ID Browser built-in search, filtering, selection and quick actions | Passed | User reported all of test group 1 works. |
| ID Browser Search Game / WEAP search | Passed | Preserve the working live-search path when repairing other queries. |
| Dropdown readability | Needs adjustment | Menu colors are nearly unreadable. |
| Show Player Inventory | Failed | Output capture reported as timing out; consider a dedicated scrollable results window. |
| Reference position / rotation / scale inspection | Failed (group report) | Retest each command separately after output handling is repaired. |
| Quest getstage / sqs / targets diagnostics | Failed (group report) | Retest each command separately. |
| Restore Player Health | Passed | User verified in game. |
| Add Skill Points | Passed | User verified in game. |
| Restore Actor Health | Passed | User verified in game. |
| Reset AI | Passed | User verified in game. |
| Force Repath | Passed | User verified in game. |
| Stop Combat | Inconclusive / appears ineffective | User: “Doesnt seem to work.” Investigate separately from read-only output. |
| Companion affinity / relationship / anger inspection | Failed (group report) | Output capture reported as timing out. |
| Activate Reference | Passed | User verified in game. |
| Get Open State | Failed | Output capture reported as timing out. |
| Open / Close Reference | Passed | User verified in game. |
| Set Exact Position | Passed | User verified in game. |
| Set Exact Rotation | Passed | User verified in game. |
| Get Current Ship ID | Failed | Output capture reported as timing out. |
| Ship actor-value inspection | Not tested | Follow-up ship tests were left blank. |
| Automatic current-ship handling | Not tested / future work | Depends on reliable current-ship output. |

## Source baseline

Built from the existing project folder supplied by the user: `C:\Users\knuts\Desktop\Starfield Modding\console-command-center`. Changes were made in an isolated working copy. See `testing-history/TEST_BUILD_OUTPUT_FIXES.md` for the historical test1 installation, scope, and retest instructions.

## v0.3.0-test1 — latest in-game retest, batch 1

These results supersede the earlier outcomes for the features listed here.

| Feature | Latest result | Evidence / follow-up |
| --- | --- | --- |
| Installation workflow | Build needed in user's setup | User ran npm run build before changes took effect. Clarify source overlay versus deploying bundled dist; retain build step for this workflow. |
| Dropdown readability | Passed | User: Looks good. |
| ID Browser live Beowulf / WEAP search | Failed (regression from previous test) | Screenshot: query-timeout: No complete console output was captured. |
| Show Player Inventory | Failed | Results window opens; screenshot: serialization-error: could not serialize response. This is a response-serialization failure, not a console-capture timeout. |
| Activity Log Open Results | Not available after failed inventory query | Current implementation only offers Open Results for successful result entries. Successful-result reopening remains untested. |
| Escape closes only Results | Not tested | Can be tested using the existing error dialog. |

Requested follow-up: add an explicit Copy ID action for inventory entries when inventory output works; selectable text alone is not sufficient discoverability. Also allow reopening diagnostic errors from Activity Log and make the results footer accurate for failures.

Next in-game batch: Escape from error Results; Inspect Player Actor Value (Health); reference position, rotation, scale and open state; companion affinity/relationship/anger; current ship ID and ship values; GetStage / Quest Skips. Record each separately and retain exact errors. No new package has been built for this retest report.

## v0.3.0-test1 — latest in-game retest, batch 2 / crash

- Escape from Results: FAILED. Closes CCC back to the game instead of just closing Results.
- Inspect Player Actor Value / Health: PASSED; correct health displayed. Other values not yet verified.
- Reference position and rotation: PASSED as reported; no axis-specific breakdown supplied.
- Inspect Reference Scale: CRASH. Log `2026-09-27-22-02-18.log`: Starfield 1.16.244 access violation at Starfield.exe+0C16E22, with ConsoleCommandCenter.dll+0041C7E and +0004EA2 in the probable call stack. User triggered it by inspecting scale.
- Requested: searchable actor-value choices using the existing weather-style chooser.

Test2 mitigation: removed all direct condition-evaluator calls and explicitly blocked Scale, Open State, GetStage, and Quest Status. Those functions are unavailable, NOT repaired or verified. Registered OSF UI native Back ownership and handled document-targeted Escape for Results. Added common player actor-value choices. In-game verification remains pending.

## v0.3.0-test2 — in-game retest

These results supersede the earlier outcomes for the listed features.

| Feature | Latest result | Notes |
| --- | --- | --- |
| Results Escape / Back handling | Passed | Escape closes Results and returns to CCC. |
| Player actor-value chooser and Health | Passed | Health displayed correctly; chooser works. |
| Show Player Inventory | Passed | Structured inventory readout works. Test3 adds search, sorting/grouping, and Copy ID. |
| Position and rotation inspections | Passed | No regression reported. |
| Scale, Open State, GetStage, Quest Status crash guards | Passed | Guarded commands return safely; their actual inspections remain disabled. |
| Companion affinity / relationship / anger | Passed | All three readouts work. Test3 adds value/maximum guidance. |
| Get Current Ship Reference ID | Passed | Correct ship Reference ID displayed. |
| Inspect Ship Actor Value | Passed | Ship actor-value readout works. |

Requested for test3: inventory-specific search, sorting by item type, click-to-select search fields, companion affinity guidance, and popular city/location choices for Teleport to Cell.

## v0.3.0-test3 — in-game retest

All requested test3 groups passed in game:

- Inventory search by name/type/Form ID, clearing, and large-inventory display.
- Inventory sorting by type, name, Form ID, and quantity.
- Per-item Copy ID.
- Click-to-select behavior in the main, chooser, and inventory searches.
- Popular location chooser and Teleport to Cell workflow.
- Companion affinity, relationship, and anger inspections.
- Set Companion Relationship Level and Set Companion Affinity.
- Health, position, rotation, current ship ID, ship actor value, and Results Escape regression checks.

Requested for test4: make inventory type categories collapsible and initially collapsed while keeping search global across every category. Test4 automatically opens categories containing search matches.

## v0.3.0-test4 — in-game retest

The collapsible inventory test passed completely: collapsed starting state, opening/closing groups, global search, multi-group matches, clearing/reset, all sort modes, Copy ID inside groups, and Close/Escape behavior.

Additional command results:

- Open Wait Menu: failed; no menu appeared while CCC remained open.
- Inspect Reference Actor Value: passed; requested a searchable value chooser.
- Get Grabbed Object Reference ID: failed with query-timeout.
- Set Companion Anger Level: passed.
- Boostpack Horizontal Percentage, Initial Thrust, Sustained Thrust, and Time to Sustained: commands work, but SetAV changes the base while GetAV reports the effective total. Reusing the inspected total stacked with modifiers and increased the result.
- Inspect/Set Player Ship Command Slots: passed.
- Set Ship Cargo Capacity: command works, but the entered value became a base beneath module modifiers and raised the effective total.
- Refuel Player Spaceship: passed.
- Clear Screen Blood: accepted as working at the user's request without a visible blood-overlay test.
- Inspect Game Setting: failed with query-timeout.
- Force Enable / Reset Forced Player Controls: passed.
- Speech Success On / Off: passed without an available persuasion check.
- Stop Actor Combat: still appeared ineffective.
- Ship inspections passed: Reactor Power 5.0, Shielded Cargo 3160.0, Crew Rating 12.0.
- Current ship output format: `Current Spaceship Reference ID: FF1C8011`.
- An unnamed inventory Key still displayed a working Copy ID action.

Test5 adds native replacements for the two simple timed-out reads, a delayed wait-menu handoff, actor-value choosers, generic Results Copy ID actions, and corrected base-value labels/warnings. These new adapters still require in-game verification.

## Test5 follow-up

- Open Wait Menu: failed again. CCC closed quickly after the command was executed, but the wait menu did not appear. A later game crash is currently unassigned because there is no evidence connecting it to CCC.
- Inspect Game Setting: passed. `fHandScannerScanRange` returned `60.0` through the native reader.
- Get Grabbed Object Reference ID: failed. It returned `00000024`, the player reference, both while holding an object and after dropping it.
- Current Ship Reference ID Copy ID action: passed.
- Copy ID action after reopening the result from Activity Log: passed.
- Reference actor-value chooser and inspection: passed.
- Ship actor-value chooser and inspection: passed.
- Set Scanner Scan Range: not completed because the setting command was not discoverable from Inspect Game Setting.
- Set Scanner Base Range and Set Scanner Social Range: passed.
- Maximum Owned Ships, Ship Looting Distance, Maximum Docking Distance, and Ship Cargo Transfer Distance settings: passed.
- Requested for the next build: add a searchable Choose Value box to Inspect Game Setting. The source now includes every Game Setting controlled by CCC in that chooser.
- Ship Builder Maximum Height, all four Landable Ship Size settings, and both Ship Builder Module Limit settings: passed.
- Set Star Power Recharge Rate: passed after inspecting and reusing the current `starpowerratemult` value.
- Ship setters: Shielded Cargo and Reactor Power passed but were additive because the entered base value stacked with module modifiers. Crew Capacity, Grav Jump Fuel, Boost Fuel, and Boost Recharge Rate passed without an observed additive result.
- ID Browser built-in and typed live searches returned results, but neither offered a Copy ID button. A Copy ID action for every selected built-in or live result has been added to the next build's source.
- Set Scanner Scan Range: passed.
- Form-ID searches for Beowulf, Adaptive Frame, and Sarah displayed no Copy ID action in Build 5. Quest search returned no matching IDs. Reopening a custom `help "beow" 4` attempt from Activity Log showed that the underlying query had timed out after 10 seconds.
- Invalid Game Setting handling: passed with a clear error and correct Escape behavior.
- The two similar ID Browser selectors were replaced with one expanded Category selector. Its 17 choices jointly filter built-in entries and select the corresponding live-game record type.

## Test8 and hotfix1 session

- Initial test8 failed while loading a save with `REL/IDDB.cpp(459)` and Address Library ID `0`. The cause was the new `TESGrabReleaseEvent::GetEventSource()` adapter. Hotfix1 removed it, disabled Get Grabbed Object Reference ID, and loaded the same save successfully.
- ID Browser included-ID filtering passed.
- Disabled command cards passed: they display Unavailable and cannot execute.
- Boostpack Horizontal Effective Total passed. Example: current base `100`, effective `100.6`, modifier `0.6`, calculated base `99.4` for a requested total of `100`.
- Boostpack Initial Thrust Effective Total passed.
- Ship Cargo, Shielded Cargo, and Reactor Effective Total controls passed.
- Quest Skip controls and footer/runtime reporting passed.
- Inventory search/collapse/Copy ID and Results-window Escape behavior passed again as regression tests.
- Native loaded-game searches failed cleanly. `Aid_MedPack` under ALCH and `npcfsarahmorgan` under NPC_ both returned “No loaded-game records matched that name or EditorID.”
- Test9 replaces the per-type form-array scan with the global loaded-form map and reports the number of supported forms scanned.

## v0.3.0-test9 crash and hotfix

- The updated footer and save loading passed.
- Searching the loaded game for Med Pack under ALCH crashed Starfield.
- Crash log `2026-09-29-21-48-00.log` shows an access violation in `ConsoleCommandCenter.dll` during the `console.command-center.searchForms` bridge request, with `med pack` and `ALCH` present on the request stack.
- Test9 is superseded. Hotfix1 removes the native scanner and request route, removes its two UI controls, and restores Med Pack to the safe included catalog.

## v0.3.1 in-game interface pass

All eight priority checks passed in game:

- The footer reported v0.3.1 and the native backend connected normally.
- The redundant Command Library sidebar heading was gone.
- ID Browser categories started collapsed, expanded correctly, and opened matching groups while searching.
- ID Browser quantity successfully added four Med Packs.
- Copy ID worked.
- The larger multiline Custom Command editor worked.
- Multiple custom commands executed in order and appeared as separate Activity Log entries.
- The simplified Activity Log, footer layout, and Quest Skips naming looked correct.

One interface adjustment was requested for the next source revision: each ID Browser result button should fill the entire category width so the full visible row is selectable. The source now applies a full-width result button; this remains pending an in-game build and retest.

### v0.3.1 follow-up round

- Favorites persisted after closing and reopening CCC.
- Recent commands updated correctly without duplicate entries.
- Multiple open ID Browser categories stayed open while selecting results.
- Quantity validation correctly rejected values outside the supported 1–999999 whole-number range, but the number control made clearing and replacing its current text awkward. The next source revision uses a freely editable numeric-text field and validates only when the action is requested.
- Boostpack Sustained Thrust Effective Total passed.
- Boostpack Transition-Time Effective Total passed.
- Current Ship Reference ID remained copyable both from the live Results window and after reopening the saved result from Activity Log.
- Disabled commands remained visibly unavailable and could not execute.

### v0.3.1 final pre-v0.3.2 round

- Set Companion Anger Level passed.
- Search Form IDs failed again: `help "beowulf" 4` timed out without a verified result.
- Search Form IDs by Type failed again: `help "beowulf" 4 WEAP` timed out without a verified result.
- Controller navigation did not work anywhere in CCC. The next revision removes automatic Search focus and adds explicit directional focus movement for OSF UI's D-pad/left-stick arrow mapping.
- Canceling confirmation with Escape passed without creating an Activity Log entry.
- Picker Back/Escape behavior passed.
- Full restart persistence, v0.3.1 reporting, and native reconnection passed.

The two console-output `help` searches are disabled for v0.3.2. The packaged ID Browser remains the supported ID lookup path.

### v0.3.2 in-game pass

- Version, native connection, full-width ID Browser rows, quantity replacement, click-to-select value fields, numeric validation, disabled searches, and the full regression group passed.
- Directional controller movement worked until focus reached a text field, where input became trapped and B closed CCC.
- Controller A did not activate focused buttons or category headers.
- ID Browser could receive directional focus but could not be opened with A; moving right jumped to an unrelated Inspect Player Actor Value field.
- Custom controller navigation is removed from the next source revision. The interface now states that controller support is in development for the future.
- Controller-sized spacing has been removed from the next source revision. The current layout is compact for mouse and keyboard; input-aware larger controls will be considered with the complete controller navigation, activation, and text-entry design.
- The next source revision adds searchable choice boxes to Add/Remove Perk, Add Power/Spell, and Remove Spell/Status Effect. These picker controls and the 30 newly packaged power/effect IDs still require an in-game test build.

## v0.3.4 Quest Browser in-game pass — September 30, 2026

- Version display, opaque surfaces, searchable-picker keyboard controls, Quest Browser grouping, pagination, search, labels, and Copy Quest ID passed.
- Repeated executions correctly remained as separate Activity Log records.
- `getstage` and `sqs` executed through CCC but returned `query-timeout`; no result was verified in CCC. Running the same commands manually in Starfield's console succeeded: FC08 reported Running, current stage 220; `getstage` returned 220.00 and `sqs` displayed the expected done/not-set stage list. The defect was isolated to CCC's console-output capture.
- The packaged data includes the original One Small Step quest (`MQ101`, `00003448`) plus ten legitimate New Game Plus variants (`MQ401a` through `MQ401j`). The interface labels these roles explicitly.
- Start, Complete, and Set Stage confirmation cancellation passed; cancelled commands did not execute.
- Start Quest submitted successfully for Vlad's Home but did not create a visible quest objective by itself. Setting stage 10 activated the quest, confirming the stage action works.
- Complete Quest did not finish Vlad's Home but successfully completed another active quest. Generic completion is verified with a quest-specific limitation.
- Stop Quest was verified on Vlad's Home: `sqs` reported MQMisc01 as Stopped.
- Reset Quest removed Vlad's Home from the quest log and cleared both recorded stages 10 and 100. `sqs` continued to report the quest as Stopped, confirming that Reset clears its state without automatically restarting it.
