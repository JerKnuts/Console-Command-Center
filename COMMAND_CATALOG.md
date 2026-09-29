# Console Command Center — Command Catalog

Version: 0.3.0

Curated commands: 134

Guided quest repairs: 248 stage selections (246 unique setstage commands) across 80 named entries / 78 unique quest FormIDs

Risk levels:
- **Normal** — ordinary confirmation before execution.
- **Caution** — command can materially change gameplay/state; review the command-specific warning.
- **Danger** — command can significantly alter quests, actors, world state, or save behavior; use a backup/disposable save.

Testing status is intentionally conservative. Only commands confirmed through Console Command Center are marked **Verified**.

Latest user test report: September 28, 2026. ID Browser passed as a feature group; this does not separately verify every search card. See `docs/TEST_RESULTS_2026-09-27.md`.

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

## Player (18)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Experience | `player.modav experience {amount}` | Caution | Verified |
| Increase Player Level | `player.setlevel {level}` | Caution | Verified |
| Adjust Carry Weight (+/-) | `player.modav carryweight {amount}` | Caution | Verified |
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
| Set Boostpack Initial Thrust Base | `player.setav BoostpackThrustInitial {value}` | Caution | Verified — base value stacks with modifiers |
| Set Boostpack Sustained Thrust Base | `player.setav BoostpackThrustSustained {value}` | Caution | Verified — base value stacks with modifiers |
| Set Boostpack Transition-Time Base | `player.setav BoostpackTimetoSustained {value}` | Caution | Verified — base value stacks with modifiers |


**Full Character Creator warning:** `showlooksmenu player 1` resets the player's current appearance when it opens and enters the original character-creation flow. Treat it as a very dangerous command: make a manual save first and use **Open Appearance Editor** (`showlooksmenu player 2`) for safer appearance-only edits.

## Inventory (13)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Show Player Inventory | `player.showinventory` | Normal | Verified |
| Search Form IDs | `help "{search}" 4` | Normal | Needs adjustment — search works; Copy ID added for next build |
| Search Form IDs by Type | `help "{search}" 4 {recordType}` | Normal | Needs adjustment — filtered search works; Copy ID added for next build |
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
| Add Spell / Effect by Form ID | `player.addspell {formId}` | Danger | Verified |
| Remove Spell / Status Effect by Form ID | `player.removespell {formId}` | Caution | Verified |

## Camera (5)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Toggle Free Camera | `tfc` | Normal | Verified |
| Enter Free Camera + Freeze | `tfc 1` | Caution | Verified |
| Toggle HUD / Interface | `tm` | Caution | Verified |
| Set Free Camera Speed | `sucsm {speed}` | Normal | Verified |
| Clear Screen Blood | `ClearScreenBlood` | Normal | Verified by user assumption |

## World (12)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Toggle Game Pause | `tgp` | Normal | Verified |
| Set Game Speed | `sgtm {value}` | Caution | Verified |
| Pass Time | `passtime {hours}` | Normal | Verified |
| Open Wait Menu | `showmenu sleepwaitmenu` | Normal | Failed — test5 closed CCC but no wait menu appeared |
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
| Inspect Reference Open State | `{refId}.getopenstate` | Normal | Failed — retest this build |
| Set Reference Open State | `{refId}.setopenstate {state}` | Caution | Verified |
| Get Grabbed Object Reference ID | `getplayergrabbedref` | Normal | Failed — test5 returned player Ref ID `00000024` while holding and after dropping an object |
| Inspect Reference Actor Value | `{refId}.getav {actorValue}` | Normal | Verified |
| Mark Reference for Permanent Deletion | `{refId}.markfordelete` | Danger | Untested |
| Set Exact Reference Position | `{refId}.setpos {axis} {value}` | Caution | Verified |
| Set Exact Reference Rotation | `{refId}.setangle {axis} {degrees}` | Caution | Verified |
| Inspect Reference Position | `{refId}.getpos {axis}` | Normal | Verified |
| Inspect Reference Rotation | `{refId}.getangle {axis}` | Normal | Verified |
| Inspect Reference Scale | `{refId}.getscale` | Normal | CRASH in test1; disabled in test2 |
| Attach Weapon / Armor Mod | `{refId}.amod {modId}` | Caution | Untested |
| Remove Weapon / Armor Mod | `{refId}.rmod {modId}` | Caution | Untested |
| Inspect Companion Affinity | `{refId}.getav com_affinity` | Normal | Verified |
| Inspect Companion Relationship Level | `{refId}.getav com_affinitylevel` | Normal | Verified |
| Inspect Companion Anger Level | `{refId}.getav com_angerlevel` | Normal | Verified |
| Set Companion Affinity | `{refId}.setav com_affinity {value}` | Danger | Verified |
| Set Companion Relationship Level | `{refId}.setav com_affinitylevel {value}` | Danger | Verified |
| Set Companion Anger Level | `{refId}.setav com_angerlevel {value}` | Danger | Untested |

**Companion choices:** the affinity and anger commands use the compact ID field + **CHOOSE COMPANION** box for Sarah Morgan (`00005986`), Barrett (`00005788`), Sam Coe (`0029D488`), and Andreja (`000059A9`). These are the four core companions that use Starfield's affinity/relationship progression; other recruitable crew are intentionally not presented for these commands. Manual Reference ID entry remains available.


**Read-only inspection:** CCC's native query bridge now powers reference inspection, inventory listing, Form-ID search, quest diagnostics, Game Setting inspection, player/ship actor-value inspection, and ship-ID lookup. Short results appear in the status bar; long/multiline results are preserved in a preformatted Activity Log block. Long-output capture waits for the console buffer to stabilize before returning. This requires rebuilding `ConsoleCommandCenter.dll`.

## Quests (9)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Show Current Quest Targets | `sqt` | Normal | Failed — retest this build |
| Get Current Quest Stage | `getstage {questId}` | Normal | Failed — retest this build |
| Show Quest Stage History | `sqs {questId}` | Normal | Failed — retest this build |
| Start Quest by ID | `startquest {questId}` | Danger | Untested |
| Stop Quest by ID | `stopquest {questId}` | Danger | Untested |
| Set Quest Stage | `setstage {questId} {stage}` | Danger | Untested |
| Complete Quest by ID | `completequest {questId}` | Danger | Untested |
| Reset Quest by ID | `resetquest {questId}` | Danger | Untested |
| Teleport to Quest Target | `movetoqt {questId}` | Caution | Verified |

## Ship (23)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Get Current Ship Reference ID | `player.getspaceship` | Normal | Verified |
| Inspect Ship Actor Value | `{shipRef}.getav {actorValue}` | Normal | Verified |
| Set Ship Cargo Base Value | `{shipRef}.setav CarryWeight {value}` | Caution | Verified — base value stacks with module modifiers |
| Set Shielded Cargo Capacity | `{shipRef}.setav CarryWeightShielded {value}` | Caution | Verified — base value stacks with module modifiers |
| Set Ship Crew Capacity | `{shipRef}.setav SpaceshipCrewRating {value}` | Caution | Verified |
| Set Player Ship Command Slots | `player.setav SpaceshipCrewCommandSlots {value}` | Caution | Verified |
| Set Ship Reactor Power Actor Value | `{shipRef}.setav SpaceshipReactorPower {value}` | Caution | Verified — base value stacks with module modifiers |
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
| Spawn Ship by Base ID | `player.placeatme {baseId}` | Danger | Untested |

**Ship workflow:** run **Get Current Ship Reference ID** while aboard the ship, then use that Reference ID with the ship actor-value commands. Use **Inspect Ship Actor Value** before changing a stat so you can record its existing value. Game Setting commands (owned-ship limit, docking/looting/transfer distance, and builder module limits) normally reset when Starfield restarts. The documented vanilla values used in CCC hints are 10 owned ships, 500 docking distance, 500 looting distance, and 130 for both ship-builder module limits; the transfer-distance default is less consistently documented, so inspect it first if exact restoration matters.



## ID Browser + Reference ID Picker

v0.3.0 now includes a standalone **ID Browser**. It combines a **193-entry built-in starter catalog** of common weapons, armor, ammo, resources, perks, modifier IDs, factions, companions, and weather records with live loaded-game search through Starfield's own `help` command. The live search is intentionally the primary way to discover records outside the starter catalog because it can see the user's currently loaded base game, DLC, and mods.

The browser supports record-type filtering (including WEAP, ARMO, AMMO, ALCH, MISC, PERK, SPEL, NPC_, OMOD, FACT, QUST, CELL, GBFM, and FURN), parses matching Form IDs into selectable rows, preserves raw console output if a result cannot be parsed, and exposes conservative quick actions such as **Add 1**, **Add Perk**, **Add Spell / Power**, or **Spawn 1** where the record type makes the action reasonably clear.

The command cards continue to use the compact editable ID field + boxed **CHOOSE ...** control for known curated choices. Inline preset-button grids are intentionally avoided.

## Quest Fixes (248 guided stage repairs)

Version 0.3.0 adds a dedicated **Quest Fixes** browser separate from the normal command catalog.
It contains 248 curated `setstage` targets for known quest-progression repair scenarios.
CCC executes the vanilla Starfield console command directly.

Every guided quest repair is treated as **Danger** because `setstage` can skip dialogue, scripts, rewards, scenes, or prerequisites. Make a manual save first and use these entries only to repair a quest that is already stuck.
