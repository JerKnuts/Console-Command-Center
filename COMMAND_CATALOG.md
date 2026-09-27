# Console Command Center — Command Catalog

Version: 0.3.0

Curated commands: 73

Guided quest repairs: 248 stage selections (246 unique setstage commands) across 80 named entries / 78 unique quest FormIDs

Risk levels:
- **Normal** — ordinary confirmation before execution.
- **Caution** — command can materially change gameplay/state; review the command-specific warning.
- **Danger** — command can significantly alter quests, actors, world state, or save behavior; use a backup/disposable save.

Testing status is intentionally conservative. Only commands confirmed through Console Command Center are marked **Verified**.

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
| Always Succeed Speech Challenges | `setforcespeechchallengealwayssucceed 1` | Caution | Untested |
| Restore Normal Speech Challenges | `setforcespeechchallengealwayssucceed 0` | Normal | Untested |
| Pay Bounty | `player.paycrimegold 0 0 {factionId}` | Caution | Verified |

**Pay Bounty** uses the compact ID field + **CHOOSE FACTION** box layout. The choice list is intentionally limited to bounty-relevant faction records (including supported Shattered Space entries), while manual faction-ID entry remains available. Inline preset-button grids are not used. The command spends the player's credits; it does not erase the bounty for free.

## Player (10)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Experience | `player.modav experience {amount}` | Caution | Verified |
| Increase Player Level | `player.setlevel {level}` | Caution | Verified |
| Adjust Carry Weight (+/-) | `player.modav carryweight {amount}` | Caution | Verified |
| Change Player Size | `player.setscale {scale}` | Caution | Verified |
| Set Movement Speed | `player.setav speedmult {value}` | Caution | Verified |
| Set Max Health | `player.setav health {value}` | Caution | Verified |
| Open Full Character Creator (Advanced) | `showlooksmenu player 1` | Danger | Verified |
| Open Appearance Editor | `showlooksmenu player 2` | Normal | Verified |
| Teleport Player to Reference | `player.moveto {refId}` | Caution | Verified |
| Set Player Coordinate Axis | `player.setpos {axis} {value}` | Caution | Verified |

## Inventory (10)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Credits | `player.additem 0000000F {amount}` | Normal | Verified |
| Add Digipicks | `player.additem 0000000A {amount}` | Normal | Verified |
| Add Med Packs | `player.additem 0000ABF9 {amount}` | Normal | Verified |
| Add Ship Parts | `player.additem 0003FB19 {amount}` | Normal | Verified |
| Add Item by Form ID | `player.additem {formId} {amount}` | Caution | Verified |
| Remove Item by Form ID | `player.removeitem {formId} {amount}` | Danger | Verified |
| Equip Item by Form ID | `player.equipitem {formId}` | Caution | Verified |
| Unequip Item by Form ID | `player.unequipitem {formId}` | Normal | Verified |
| Drop Item by Form ID | `player.drop {formId} {amount}` | Caution | Verified |
| Spawn Object / NPC by Base ID | `player.placeatme {baseId} {amount}` | Danger | Verified |

## Skills (6)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Perk / Skill by Form ID | `player.addperk {formId}` | Caution | Verified |
| Remove Perk / Skill by Form ID | `player.removeperk {formId}` | Danger | Verified |
| Grant All Powers | `psb` | Danger | Verified |
| Set Star Power | `player.setav starpower {value}` | Caution | Verified |
| Add Spell / Effect by Form ID | `player.addspell {formId}` | Danger | Verified |
| Remove Spell / Status Effect by Form ID | `player.removespell {formId}` | Caution | Verified |

## Camera (5)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Toggle Free Camera | `tfc` | Normal | Verified |
| Enter Free Camera + Freeze | `tfc 1` | Caution | Verified |
| Toggle HUD / Interface | `tm` | Caution | Verified |
| Set Free Camera Speed | `sucsm {speed}` | Normal | Verified |
| Clear Screen Blood | `ClearScreenBlood` | Normal | Untested |

## World (7)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Toggle Game Pause | `tgp` | Normal | Verified |
| Set Game Speed | `sgtm {value}` | Caution | Verified |
| Pass Time | `passtime {hours}` | Normal | Verified |
| Reveal Planet Map Markers | `tmm 1` | Danger | Verified |
| Teleport to Cell | `coc {cellName}` | Danger | Verified |
| Force Weather | `fw {weatherId}` | Caution | Verified |
| Set Weather Gradually | `setweather {weatherId}` | Caution | Verified |

**Weather choices:** both weather commands use the same compact ID field + **CHOOSE WEATHER** box layout as the companion commands. Clear, Rain, Snow, Heavy Snow, Thunderstorm, Sandstorm, Dense Mist, Light Mist, and Burning Haze are available through the chooser, while manual Weather Form IDs remain supported. No inline weather-button grid is used.

## Targets (16)

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
| Attach Weapon / Armor Mod | `{refId}.amod {modId}` | Caution | Untested |
| Remove Weapon / Armor Mod | `{refId}.rmod {modId}` | Caution | Untested |
| Set Companion Affinity | `{refId}.setav com_affinity {value}` | Danger | Untested |
| Set Companion Relationship Level | `{refId}.setav com_affinitylevel {value}` | Danger | Untested |

**Companion choices:** the affinity commands use the compact ID field + **CHOOSE COMPANION** box for Sarah Morgan (`00005986`), Barrett (`00005788`), Sam Coe (`0029D488`), and Andreja (`000059A9`). These are the four core companions that use Starfield's affinity/relationship progression; other recruitable crew are intentionally not presented for these commands. Manual Reference ID entry remains available.

## Quests (6)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Start Quest by ID | `startquest {questId}` | Danger | Untested |
| Stop Quest by ID | `stopquest {questId}` | Danger | Untested |
| Set Quest Stage | `setstage {questId} {stage}` | Danger | Untested |
| Complete Quest by ID | `completequest {questId}` | Danger | Untested |
| Reset Quest by ID | `resetquest {questId}` | Danger | Untested |
| Teleport to Quest Target | `movetoqt {questId}` | Caution | Verified |

## Ship (2)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Refuel Player Spaceship | `RefuelSpaceship` | Normal | Untested |
| Spawn Ship by Base ID | `player.placeatme {baseId}` | Danger | Untested |



## Reference ID Picker

v0.3.0 uses one consistent choice-control pattern for commands that depend on known Form/Reference IDs: keep the editable ID field visible and place a boxed **CHOOSE ...** control beside it. The chooser can search by display name, aliases/keywords, and hexadecimal ID, then fills the existing field so the generated console command remains visible before confirmation. Inline preset-button grids are not used.

This is the foundation for a future standalone ID Browser. Large ID catalogs are deliberately not dumped into individual command cards.

## Quest Fixes (248 guided stage repairs)

Version 0.3.0 adds a dedicated **Quest Fixes** browser separate from the normal command catalog.
It contains 248 curated `setstage` targets for known quest-progression repair scenarios.
CCC executes the vanilla Starfield console command directly.

Every guided quest repair is treated as **Danger** because `setstage` can skip dialogue, scripts, rewards, scenes, or prerequisites. Make a manual save first and use these entries only to repair a quest that is already stuck.
