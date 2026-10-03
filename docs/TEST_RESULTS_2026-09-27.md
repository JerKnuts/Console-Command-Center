# Starfield Console Command Center — historical in-game test record

This file preserves user-reported testing from September 27 through October 2, 2026. Entries are chronological, and later sections supersede earlier failures or pending notes. The current release behavior is summarized in [`RELEASE_NOTES_v1.0.md`](RELEASE_NOTES_v1.0.md), [`../COMMAND_CATALOG.md`](../COMMAND_CATALOG.md), and [`../RELEASE_VALIDATION.md`](../RELEASE_VALIDATION.md).

These results were reported from in-game testing rather than independently reproduced. Earlier test-build failures remain here because they explain why unsafe native adapters and unreliable console-output capture paths were removed.

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

## v0.3.7 catalog and quest-safety pass — September 30, 2026

- Footer and native connection reported v0.3.7.
- ID Browser and Quest Browser both opened immediately on their first and subsequent openings; no visible loading message was needed.
- ID Browser search opened matching categories and clearing the search collapsed every category.
- The three reported collision IDs were absent, cleaned weapon results looked correct, and sampled Shattered Space labels no longer displayed dialogue subtitles.
- Quest Browser search, category grouping, paging, Copy Quest ID, disabled inspection controls, and new Start/Reset guidance passed.
- Player Health, Player Inventory, adding two Med Packs, and a harmless two-line Custom Command batch passed as regressions.
- The adjacent value fields and **Choose** buttons had mismatched heights. The next source revision standardized both controls at 40 CSS pixels, and the later in-game retest passed.
- The following ten-check regression round passed in full, including the standardized value-field and **Choose** control sizing.
- The next source revision added up to 10 persistent named entries to the Custom Command screen; the later in-game build and retest passed.

### v0.3.7 saved Custom Command pass

- The 60/40 Custom Command layout, top-aligned Saved Commands panel, compact saved rows, and side-by-side **Load** / **Delete** controls passed.
- Saving one-line and multiline entries, loading without automatic execution, updating an existing name without duplication, and deleting while preserving the editor passed.
- Saved entries persisted after closing and reopening CCC.
- A loaded multiline entry executed in order and produced separate Activity Log records.
- Value fields and their adjacent **Choose** buttons now match in height in game.
- Empty-name and empty-command validation, case-insensitive saved-entry updates, the 10-entry limit, freeing a slot, click-to-select, and persistence all passed.
- ID Browser quantity/search-collapse, inventory search/sort/Copy ID, Results-window Escape, unavailable quest inspections, and cancelled quest execution all passed as regressions.
- **Search Form IDs** and **Search Form IDs by Type** were reworked to use packaged browser data; both passed the later in-game release-candidate retest.

## Final v0.3.7 release-candidate pass — October 1, 2026

- Packaged Search Form IDs and Search Form IDs by Type passed in game without invoking the removed live scanner or unreliable console-output capture path.
- All browser-backed item, equipment, NPC, modifier, ship, quest, perk, power, and effect fields returned the selected ID without executing the command.
- Filtered ID Browser selection placed the permitted category at the top, expanded it automatically, and removed unrelated categories.
- Quest badges remained visible in collapsed rows, including the compact New Game Plus variant tag beside the quest title.
- Wait Anywhere advanced time without opening the broken WAIT/B prompt.
- Open or Close Reference worked with the Open/Closed chooser.
- Starfield's manual `getplayergrabbedref` console command returned the held Reference ID and `00000000` after release. CCC's unavailable held-object card was removed because its native event source remains unresolved.
- Set Interior Gravity worked inside a building: `0` removed gravity and `1` restored normal gravity. The command did not apply outdoors, so the UI states the interior-only limitation.
- Direct `player.setav carryweight 500` produced an effective value of 508 due to an active +8 modifier. CCC therefore exposes a modifier-aware Set Carry Weight Effective Total control instead of describing SetAV as an exact total.
- Reevaluate Actor Behavior (`{refId}.evp`) released an NPC from a stopped interaction and made him resume walking.
- Release Weather Override, Reset Reference 3D State, Set Actor Alert State, and Reference-ID Force Bleedout were rejected after they produced no dependable result or could not be parsed.

## v1.0.5 WIP pass — October 2, 2026

- The Unavailable command fallback appeared as a browser-style title on the large action while the full custom popup remained attached to the small status badge. v1.0.6 removes the small badge and attaches the custom popup to the large disabled action.
- WIP automatically opened Ready to Test. v1.0.6 starts every WIP group collapsed.
- Inspect Reference Scale safely rejected a stale Reference ID first. Retesting with live reference `0006A243` caused CommonLibSF to report missing Address Library ID 0 from `REL/IDDB.cpp(459)` and terminated Starfield. The direct `TESObjectREFR::GetScale()` adapter is now removed and both UI and native layers block scale inspection.
- Show Current Quest Targets executed, but `sqt` flooded Starfield's console with too much unfiltered output to parse. It is now blocked under Executed — Issues pending a filtered native replacement.
- Screenshot executed without an error, but gave no confirmation and no output file was located.
- Save Game by Name was rejected by Starfield with “The Game Cannot Be Saved Now.” The test context may have prohibited saving, so the command remains available under Executed — Issues for a controlled retest.
- Toggle Game Pause worked.
- Advance One Frame executed without a noticeable effect.
- Use Nearest Teleport Door worked and moved the player through the nearest door.
- Enter Workshop Mode executed without an error, but could not be verified because no outpost was available.
- Select Console Reference by ID worked; opening the console showed the requested object selected.
- Select Closest Ship executed inside and outside the player ship without a confirmed selection.
- Toggle Volume Geometry, Toggle Material Geometry, and Toggle Borders executed without a visible overlay.
- The next WIP round was interrupted by the reference-scale crash before its remaining commands were tested.

## v1.0.6 WIP renderer pass — October 2, 2026

- Toggle Debug Text executed without an error but displayed no visible debug text.
- Toggle NavMesh and Toggle NavMesh Info executed without errors but displayed no visible navigation overlay.
- Toggle Path Line, Toggle Primitives, Show Light Bounds, and Toggle Lite Brite executed without errors but produced no confirmed visible change.
- Toggle First-Person Hands visibly put away the held weapon. It is promoted to Camera as a verified reversible visual control.
- Toggle Decal Rendering crashed Starfield before the remaining tests could run.
- Crash log `2026-10-02-23-49-44.log` reports `EXCEPTION_ACCESS_VIOLATION` at `Starfield.exe+2A5FDB9`. The probable call stack stays within Starfield's renderer; `SkyOcclusionMaskRenderPass`, `SkyOcclusionRenderPass`, `RenderSceneSubGraph`, and the DX12 pipeline appear in the captured state. No CCC frame appears in the probable call stack. The command is blocked because its execution triggered this renderer crash path.

## v1.0.7 WIP practical-command pass — October 3, 2026

- Toggle Full Screen Motion Blur, Toggle Bound Visualization Geometry, and Toggle Detection Stats executed without errors but produced no confirmed visible effect.
- Save Game by Name failed again with “The Game Cannot Be Saved Now” even though quicksave and the normal full-save control worked in the same location. The prepared action is now unavailable under Executed — Issues.
- Load Game by Name closed CCC but did not load the existing displayed save name `Jemison - New Atlantis`. The prepared action is now unavailable under Executed — Issues; Starfield may require an internal filename rather than its displayed save label.
- PrintMessage executed with visible-message arguments but displayed nothing.
- Show1stPerson worked and displayed the first-person arms and weapon model beside the third-person character. It is promoted to Camera with a warning that the overlapping models intentionally look incorrect.
- ToggleMovement executed, but nearby NPCs continued walking normally.
- ToggleAnimations worked and froze nearby actors' animations. It is promoted to World with instructions to run it again to resume animations.
- PickNextActor and PickNextRef both worked; opening Starfield's console afterward showed the expected actor or reference selected. Both are promoted to Targets.
- Search displayed two Toggle Game Pause cards because the original established `tgp` entry and a separately promoted intake entry were both present. The duplicate intake entry is removed in v1.0.8.
- Testing ended after item 8; the remaining proposed commands were not run.
