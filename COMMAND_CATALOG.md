# Console Command Center — Command Catalog

Version: 1.0

Curated commands: 144 (4 currently disabled)

WIP command intake: 1,550 (37 prepared cards, 565 engine console commands, 948 script functions)

Quest Browser: 2,318 quest records with 16,844 structurally recorded stages across the base game and Shattered Space

Risk levels:
- **Normal** — ordinary confirmation before execution.
- **Caution** — command can materially change gameplay/state; review the command-specific warning.
- **Danger** — command can significantly alter quests, actors, world state, or save behavior; use a backup/disposable save.

Testing status is intentionally conservative. Only commands confirmed through Console Command Center are marked **Verified**.

Latest user test report: October 1, 2026. See `docs/TEST_RESULTS_2026-09-27.md` for the accumulated in-game record.

## Gameplay (11)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| God Mode | `tgm` | Normal | Verified |
| Immortal Mode | `tim` | Normal | Verified |
| Toggle Collision | `tcl` | Normal | Verified |
| Toggle Detection | `tdetect` | Normal | Verified |
| Toggle Combat AI | `tcai` | Normal | Verified |
| Toggle All AI | `tai` | Caution | Verified |
| Kill Nearby Hostiles | `kah` | Caution | Verified |
| Kill Everyone Nearby | `killall` | Danger | Verified |
| Always Succeed Speech Challenges | `setforcespeechchallengealwayssucceed 1` | Caution | Verified |
| Restore Normal Speech Challenges | `setforcespeechchallengealwayssucceed 0` | Normal | Verified |
| Pay Bounty | `player.paycrimegold 0 0 {factionId}` | Caution | Verified |

**Pay Bounty** uses the compact ID field + **CHOOSE FACTION** box layout. The choice list is intentionally limited to bounty-relevant faction records (including supported Shattered Space entries), while manual faction-ID entry remains available. Inline preset-button grids are not used. The command spends the player's credits; it does not erase the bounty for free.

## Player (23)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Experience | `player.modav experience {amount}` | Caution | Verified |
| Increase Player Level | `player.setlevel {level}` | Caution | Verified |
| Adjust Carry Weight (+/-) | `player.modav carryweight {amount}` | Caution | Verified |
| Set Carry Weight Effective Total | calculated native setter | Caution | Verified — compensates for active modifiers |
| Change Player Size | `player.setscale {scale}` | Caution | Verified |
| Set Movement Speed | `player.setav speedmult {value}` | Caution | Verified |
| Set Max Health | `player.setav health {value}` | Caution | Verified |
| Restore Player Health | `player.resethealth` | Normal | Verified |
| Inspect Player Actor Value | `player.getav {actorValue}` | Normal | Verified (Health only) |
| Force Enable Player Controls | `fepc` | Caution | Verified |
| Reset Forced Player Controls | `resetforceenabledplayercontrols` | Normal | Verified |
| Open Full Character Creator (Advanced) | `showlooksmenu player 1` | Danger | Verified |
| Open Appearance Editor | `showlooksmenu player 2` | Normal | Verified |
| Teleport Player to Reference | `player.moveto {refId}` | Caution | Verified |
| Set Player Coordinate Axis | `player.setpos {axis} {value}` | Caution | Verified |
| Set Boostpack Horizontal Base Value | `player.setav BoostpackHorizontalPercentage {value}` | Caution | Verified — base value stacks with modifiers |
| Set Boostpack Horizontal Effective Total | calculated native setter | Caution | Verified |
| Set Boostpack Initial Thrust Base | `player.setav BoostpackThrustInitial {value}` | Caution | Verified — base value stacks with modifiers |
| Set Boostpack Initial Thrust Effective Total | calculated native setter | Caution | Verified |
| Set Boostpack Sustained Thrust Base | `player.setav BoostpackThrustSustained {value}` | Caution | Verified — base value stacks with modifiers |
| Set Boostpack Sustained Thrust Effective Total | calculated native setter | Caution | Verified in v0.3.1 |
| Set Boostpack Transition-Time Base | `player.setav BoostpackTimetoSustained {value}` | Caution | Verified — base value stacks with modifiers |
| Set Boostpack Transition-Time Effective Total | calculated native setter | Caution | Verified in v0.3.1 |


**Full Character Creator warning:** `showlooksmenu player 1` resets the player's current appearance when it opens and enters the original character-creation flow. Treat it as a very dangerous command: make a manual save first and use **Open Appearance Editor** (`showlooksmenu player 2`) for safer appearance-only edits.

## Inventory (13)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Show Player Inventory | `player.showinventory` | Normal | Verified |
| Search Form IDs | Packaged ID Browser search | Normal | Verified in game |
| Search Form IDs by Type | Packaged ID/Quest Browser search with exact record-type filter | Normal | Verified in game |
| Add Credits | `player.additem 0000000F {amount}` | Caution | Verified |
| Add Digipicks | `player.additem 0000000A {amount}` | Normal | Verified |
| Add Med Packs | `player.additem 0000ABF9 {amount}` | Normal | Verified |
| Add Ship Parts | `player.additem 0003FB19 {amount}` | Normal | Verified |
| Add Item by Form ID | `player.additem {formId} {amount}` | Caution | Verified |
| Remove Item by Form ID | `player.removeitem {formId} {amount}` | Danger | Verified |
| Equip Item by Form ID | `player.equipitem {formId}` | Caution | Verified |
| Unequip Item by Form ID | `player.unequipitem {formId}` | Normal | Verified |
| Drop Item by Form ID | `player.drop {formId} {amount}` | Caution | Verified |
| Spawn Object / NPC by Base ID | `player.placeatme {baseId} {amount}` | Danger | Verified |


**Credits safety:** CCC limits **Add Credits** to 100,000,000 credits per execution. Starfield becomes unreliable as the total approaches or exceeds 999,999,999 credits. CCC does not know the player's current balance, so users should avoid pushing the total near that limit; the command can be run multiple times when more credits are needed.

## Skills (8)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Skill Points | `CGF "Game.AddPerkPoints" {amount}` | Caution | Verified |
| Add Perk / Skill by Form ID | `player.addperk {formId}` | Caution | Verified |
| Remove Perk / Skill by Form ID | `player.removeperk {formId}` | Danger | Verified |
| Grant All Powers | `psb` | Danger | Verified |
| Set Star Power | `player.setav starpower {value}` | Caution | Verified |
| Set Star Power Recharge Rate | `player.setav starpowerratemult {value}` | Caution | Verified |
| Add Power / Spell by Form ID | `player.addspell {formId}` | Danger | Verified |
| Remove Spell / Status Effect by Form ID | `player.removespell {formId}` | Caution | Verified |

## Camera (5)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Toggle Free Camera | `tfc` | Normal | Verified |
| Enter Free Camera + Freeze | `tfc 1` | Caution | Verified |
| Toggle HUD / Interface | `tm` | Caution | Verified |
| Set Free Camera Speed | `sucsm {speed}` | Normal | Verified |
| Clear Screen Blood | `ClearScreenBlood` | Normal | Accepted in game; no active blood overlay was available for a visual check |

## World (14)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Toggle Game Pause | `tgp` | Normal | Verified |
| Set Game Speed | `sgtm {value}` | Caution | Verified |
| Wait Anywhere | `passtime {hours}` | Normal | Verified; replaces the removed post-1.10.32 wait-menu command |
| Toggle Grass | `ToggleGrass` | Normal | Verified |
| Toggle Sky | `ts` | Normal | Verified; `ts` is the short alias for the raw engine command `ToggleSky` |
| Set Interior Gravity | `setgravityscale {value}` | Caution | Verified — interior cells only; 1 restores normal gravity |
| Set Scanner Scan Range | `setgs fHandScannerScanRange {value}` | Caution | Verified |
| Set Scanner Base Range | `setgs fHandScannerBaseRange {value}` | Caution | Verified |
| Set Scanner Social Range | `setgs fHandScannerSocialRange {value}` | Caution | Verified |
| Reveal Planet Map Markers | `tmm 1` | Danger | Verified |
| Teleport to Cell | `coc {cellName}` | Danger | Verified |
| Inspect Game Setting | `getgs {setting}` | Normal | Verified — `fHandScannerScanRange` returned 60.0 |
| Force Weather | `fw {weatherId}` | Caution | Verified |
| Set Weather Gradually | `setweather {weatherId}` | Caution | Verified |

**Weather choices:** both weather commands use the same compact ID field + **CHOOSE WEATHER** box layout as the companion commands. Clear, Rain, Snow, Heavy Snow, Thunderstorm, Sandstorm, Dense Mist, Light Mist, and Burning Haze are available through the chooser, while manual Weather Form IDs remain supported. No inline weather-button grid is used.

## Targets (35)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Select Closest Actor | `PickClosestActor` | Normal | Verified |
| Move Reference to Player | `{refId}.moveto player` | Caution | Verified |
| Kill Actor by Reference ID | `{refId}.kill` | Danger | Verified |
| Resurrect Actor by Reference ID | `{refId}.resurrect` | Danger | Verified |
| Recycle Actor / Reference | `{refId}.recycleactor` | Danger | Verified |
| Disable Reference | `{refId}.disable` | Danger | Verified |
| Enable Reference | `{refId}.enable` | Caution | Verified |
| Unlock Door / Container by Reference ID | `{refId}.unlock` | Danger | Verified |
| Lock Door / Container by Reference ID | `{refId}.lock {level}` | Caution | Verified |
| Set Target / Reference Scale | `{refId}.setscale {scale}` | Caution | Verified |
| Set Reference Ownership | `{refId}.setownership` | Caution | Verified |
| Move Reference Along Axis | `{refId}.modpos {axis} {amount}` | Caution | Verified |
| Rotate Reference Along Axis | `{refId}.modangle {axis} {degrees}` | Caution | Verified |
| Restore Actor Health | `{refId}.resethealth` | Normal | Verified |
| Stop Actor Combat | `{refId}.stopcombat` | Caution | Needs adjustment / inconclusive |
| Activate Reference | `{refId}.activate` | Caution | Verified |
| Reset Actor AI | `{refId}.resetai` | Caution | Verified |
| Force Actor Repath | `{refId}.forcerepath` | Caution | Verified |
| Reevaluate Actor Behavior | `{refId}.evp` | Caution | Verified — resumed a stopped NPC's movement |
| Open or Close Reference | `{refId}.setopenstate {state}` | Caution | Verified; includes Open/Closed chooser |
| Inspect Reference Actor Value | `{refId}.getav {actorValue}` | Normal | Verified |
| Mark Reference for Permanent Deletion | `{refId}.markfordelete` | Danger | Untested |
| Set Exact Reference Position | `{refId}.setpos {axis} {value}` | Caution | Verified |
| Set Exact Reference Rotation | `{refId}.setangle {axis} {degrees}` | Caution | Verified |
| Inspect Reference Position | `{refId}.getpos {axis}` | Normal | Verified |
| Inspect Reference Rotation | `{refId}.getangle {axis}` | Normal | Verified |
| Inspect Reference Scale | `{refId}.getscale` | Normal | Ready to retest with direct `TESObjectREFR::GetScale()` adapter |
| Attach Weapon / Armor Mod | `{refId}.amod {modId}` | Caution | Untested |
| Remove Weapon / Armor Mod | `{refId}.rmod {modId}` | Caution | Untested |
| Inspect Companion Affinity | `{refId}.getav com_affinity` | Normal | Verified |
| Inspect Companion Relationship Level | `{refId}.getav com_affinitylevel` | Normal | Verified |
| Inspect Companion Anger Level | `{refId}.getav com_angerlevel` | Normal | Verified |
| Set Companion Affinity | `{refId}.setav com_affinity {value}` | Danger | Verified |
| Set Companion Relationship Level | `{refId}.setav com_affinitylevel {value}` | Danger | Verified |
| Set Companion Anger Level | `{refId}.setav com_angerlevel {value}` | Danger | Verified in v0.3.1 |

**Companion choices:** the affinity and anger commands use the compact ID field + **CHOOSE COMPANION** box for Sarah Morgan (`00005986`), Barrett (`00005788`), Sam Coe (`0029D488`), and Andreja (`000059A9`). These are the four core companions that use Starfield's affinity/relationship progression; other recruitable crew are intentionally not presented for these commands. Manual Reference ID entry remains available.


**Read-only inspection:** CCC's native query bridge powers supported reference inspection, inventory listing, Game Setting inspection, player/ship actor-value inspection, and ship-ID lookup. Known-broken Scale and quest inspections are displayed as unavailable and cannot be executed. Open-state inspection was removed because CommonLibSF does not expose a verified safe reader; the verified Open/Close action remains available. Held-object inspection was also removed because the native event source remains unresolved. Advanced users can hold an object and run `getplayergrabbedref` in Starfield's own console; testing confirmed it returns the held Reference ID and `00000000` after release. Results from supported CCC inspections are preserved in the Results window and Activity Log. This requires rebuilding `ConsoleCommandCenter.dll`.

## Quests (9)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Show Current Quest Targets | `sqt` | Normal | Ready to retest without CCC capture; results remain in Starfield console history |
| Get Current Quest Stage | `getstage {questId}` | Normal | Verified — native quest read returned the running quest's current stage immediately |
| Show Quest Stage History | `sqs {questId}` | Normal | Verified — native stage checks returned the full done/not-set history without console capture |
| Start Quest by ID | `startquest {questId}` | Danger | Needs adjustment — command was sent, but some quests need a stage before visible activation |
| Stop Quest by ID | `stopquest {questId}` | Danger | Verified — quest changed to Stopped |
| Set Quest Stage | `setstage {questId} {stage}` | Danger | Verified — activated the selected quest stage |
| Complete Quest by ID | `completequest {questId}` | Danger | Verified on an ordinary active quest; not every quest accepts generic completion |
| Reset Quest by ID | `resetquest {questId}` | Danger | Verified — cleared recorded stages and removed the quest from the log; quest remained Stopped |
| Teleport to Quest Target | `movetoqt {questId}` | Caution | Verified |

## Ship (26)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Get Current Ship Reference ID | `player.getspaceship` | Normal | Verified |
| Inspect Ship Actor Value | `{shipRef}.getav {actorValue}` | Normal | Verified |
| Set Ship Cargo Base Value | `{shipRef}.setav CarryWeight {value}` | Caution | Verified — base value stacks with module modifiers |
| Set Ship Cargo Effective Total | calculated native setter | Caution | Verified |
| Set Shielded Cargo Capacity | `{shipRef}.setav CarryWeightShielded {value}` | Caution | Verified — base value stacks with module modifiers |
| Set Shielded Cargo Effective Total | calculated native setter | Caution | Verified |
| Set Ship Crew Capacity | `{shipRef}.setav SpaceshipCrewRating {value}` | Caution | Verified |
| Set Player Ship Command Slots | `player.setav SpaceshipCrewCommandSlots {value}` | Caution | Verified |
| Set Ship Reactor Power Actor Value | `{shipRef}.setav SpaceshipReactorPower {value}` | Caution | Verified — base value stacks with module modifiers |
| Set Ship Reactor Power Effective Total | calculated native setter | Caution | Verified |
| Set Ship Grav Jump Fuel | `{shipRef}.setav SpaceshipGravJumpFuel {value}` | Caution | Verified |
| Set Ship Boost Fuel | `{shipRef}.setav SpaceshipBoostFuel {value}` | Caution | Verified |
| Set Ship Boost Recharge Rate | `{shipRef}.setav SpaceshipBoostRechargeRate {value}` | Caution | Verified |
| Set Maximum Owned Ships | `setgs uSpaceshipMaximumOwnedSpaceships {value}` | Caution | Verified |
| Set Ship Looting Distance | `setgs fSpaceshipLootingDistanceDefault {value}` | Caution | Verified |
| Set Maximum Docking Distance | `setgs fSpaceshipMaxDockingDistance {value}` | Caution | Verified |
| Set Ship Cargo Transfer Distance | `setgs fMaxShipTransferDistance {value}` | Caution | Verified |
| Set Ship Builder Max Height | `setgs fSpaceshipBuilderMaxSizeZ {value}` | Caution | Verified |
| Set Landable Ship Max Size X | `setgs fSpaceshipLandableMaxSizeX {value}` | Caution | Verified |
| Set Landable Ship Max Size Y | `setgs fSpaceshipLandableMaxSizeY {value}` | Caution | Verified |
| Set Landable Ship Max Size Z | `setgs fSpaceshipLandableMaxSizeZ {value}` | Caution | Verified |
| Set Landable Small Ship Size | `setgs fSpaceshipLandableSmallSize {value}` | Caution | Verified |
| Set Ship Builder Module Limit | `setgs uSpaceshipBuilderMaxModules {value}` | Caution | Verified |
| Set Ship Builder Module Hard Limit | `setgs uSpaceshipBuilderModuleHardLimit {value}` | Caution | Verified |
| Refuel Player Spaceship | `RefuelSpaceship` | Normal | Verified |
| Spawn Ship by Base ID | `player.placeatme {baseId}` | Danger | WIP Executed — Issues; ship spawned directly on the player and partly underground, leaving the boarding ramp inaccessible |

**Ship workflow:** run **Get Current Ship Reference ID** while aboard the ship, then use that Reference ID with the ship actor-value commands. Use **Inspect Ship Actor Value** before changing a stat so you can record its existing value. Game Setting commands (owned-ship limit, docking/looting/transfer distance, and builder module limits) normally reset when Starfield restarts. The documented vanilla values used in CCC hints are 10 owned ships, 500 docking distance, 500 looting distance, and 130 for both ship-builder module limits; the transfer-distance default is less consistently documented, so inspect it first if exact restoration matters.

## Work in Progress command intake (1,550)

Newly discovered commands enter this isolated category before they can appear alongside verified everyday, cheat, repair, or developer tools. Commands with destructive or uncertain effects retain Caution or Danger confirmation. Test them on a disposable save; successful commands can then move into their permanent category with an accurate description and warning.

Prepared cards are split into four result groups: **Ready to Test** contains commands awaiting a useful in-game result, **Executed — Effect Unconfirmed** keeps commands that ran without errors but produced no observable effect, **Executed — Issues** keeps commands with confirmed usability problems, and **Blocked — Known Crash** keeps dangerous crash paths visible without allowing execution. **Engine Console Commands** contains 565 reference entries, and **Script Functions** contains 948 reference entries. The 1,513-entry engine library loads only when WIP is opened or searched. Open groups render 100 cards at a time. Raw engine cards accept optional arguments, and script-function cards also accept an optional target or prefix. Their parameters are not fully documented, so the final command must be reviewed before execution. `LinkFullAccount` remains visible for completeness but is disabled because entering account credentials would save them in CCC history. Hovering or focusing an Unavailable badge reveals the underlying console syntax for advanced manual use.

The first intake includes:

- Speech failure overrides, player body-type switching, player death, Start All Quests, and Complete All Quest Stages
- Camera FOV plus sky, wireframe, collision-geometry, motion-blur, TAA, FSR2, VRS, rain-occlusion, lens-flare, and marker toggles
- Subtitle overrides, one-frame advancement, nearest teleport-door use, projectile cleanup, and weather/climate reloads
- Workshop entry, ship takeoff, planetary-marker landing, and console target selection
- Returning a reference to its start position, forcing combat, resetting dialogue flags, screenshots, and named save/load commands

The syntax and descriptions were imported from and cross-checked against the game-help-derived [SFSE console-command list](https://gist.github.com/eacpereira/25f00410b1940d04a24f8a49b0b1bf44) and public Starfield command references. Inclusion means “available for controlled testing,” not “verified.” The complete reference is included even when required parameters are unclear; those entries use optional raw argument fields and remain isolated from the established catalog.



## ID Browser + Reference ID Picker

The current source includes a standalone **ID Browser** with **16,528 included IDs** covering weapons, armor and apparel, ammunition, aid, resources and miscellaneous items, books and notes, skills, traits, powers, effects, object mods, factions, NPCs, ships, named locations and cells, and weather. Search filters the catalog instantly by name, Form ID, type, category, and Editor ID. Location and cell selections expose separate Form ID and Editor ID copy actions. Large categories render 100 tiles at a time. Every selected result offers **Copy ID**, with conservative quick actions for supported record types, including **Change Weather** for Weather records and **Teleport Here** for Cell records. Location records can narrow the browser to matching teleportable Cells because the console's `coc` command requires a Cell Editor ID rather than a Location Form ID. The experimental loaded-game scanner was removed after test9 caused an access violation on Starfield 1.16.244. Shattered Space entries are labeled in their visible detail text and use cleaned Editor IDs when no verified localized name is available. Long descriptions, internal factions, creature attacks, test weapons, and known subtitle collisions are excluded.

The browser supports category filtering across its packaged records and exposes conservative quick actions such as **Add to Player**, **Add Perk**, **Add Spell / Power**, **Spawn**, **Change Weather**, and **Teleport Here** where the record type makes the action reasonably clear. It does not query or scrape Starfield's live console output.

The command cards continue to use the compact editable ID field + boxed **CHOOSE ...** control for known curated choices. Inline preset-button grids are intentionally avoided.

## Quest Browser (2,318 quests / 16,844 recorded stages)

Quest Browser is separate from the normal command catalog and groups base-game and Shattered Space records into collapsible, paginated categories.
Its packaged Quest IDs and 16,844 recorded stage indexes are structurally validated against `Starfield.esm` and `ShatteredSpace.esm`.
CCC executes the vanilla Starfield console command directly.

Quest Browser offers confirmed `startquest`, `stopquest`, `completequest`, `resetquest`, and `setstage` actions. Every state-changing action is treated as **Danger** because it can skip dialogue, scripts, rewards, scenes, or prerequisites. Make a manual save first. **Inspect Quest State** uses the verified native reader to show the current stage and mark completed stages without depending on console-output capture.
