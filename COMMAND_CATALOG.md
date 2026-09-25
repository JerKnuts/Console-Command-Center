# Console Command Center — Command Catalog

Version: 0.2.7

Curated commands: 75

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
| Toggle All AI | `tai` | Caution | Untested |
| Kill Nearby Hostiles | `kah` | Caution | Untested |
| Kill Everyone Nearby | `killall` | Danger | Untested |
| Always Succeed Speech Challenges | `setforcespeechchallengealwayssucceed 1` | Caution | Untested |
| Restore Normal Speech Challenges | `setforcespeechchallengealwayssucceed 0` | Normal | Untested |
| Clear Faction Bounty | `player.paycrimegold 0 0 {factionId}` | Caution | Untested |

## Player (11)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Experience | `player.modav experience {amount}` | Caution | Verified |
| Set Player Level | `player.setlevel {level}` | Caution | Untested |
| Set Carry Weight | `player.setav carryweight {value}` | Normal | Untested |
| Adjust Carry Weight (+/-) | `player.modav carryweight {amount}` | Caution | Verified |
| Change Player Size | `player.setscale {scale}` | Caution | Untested |
| Set Movement Speed | `player.setav speedmult {value}` | Caution | Verified |
| Set Max Health | `player.setav health {value}` | Caution | Verified |
| Open Full Character Creator (Advanced) | `showlooksmenu player 1` | Danger | Verified |
| Open Appearance Editor | `showlooksmenu player 2` | Normal | Verified |
| Teleport Player to Reference | `player.moveto {refId}` | Caution | Untested |
| Set Player Position Axis | `player.setpos {axis} {value}` | Caution | Untested |

## Inventory (10)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Credits | `player.additem 0000000F {amount}` | Normal | Verified |
| Add Digipicks | `player.additem 0000000A {amount}` | Normal | Verified |
| Add Med Packs | `player.additem 0000ABF9 {amount}` | Normal | Verified |
| Add Ship Parts | `player.additem 0003FB19 {amount}` | Normal | Verified |
| Add Item by Form ID | `player.additem {formId} {amount}` | Caution | Verified |
| Remove Item by Form ID | `player.removeitem {formId} {amount}` | Danger | Verified |
| Equip Item by Form ID | `player.equipitem {formId}` | Caution | Untested |
| Unequip Item by Form ID | `player.unequipitem {formId}` | Normal | Untested |
| Drop Item by Form ID | `player.drop {formId} {amount}` | Caution | Verified |
| Spawn Object / NPC by Base ID | `player.placeatme {baseId} {amount}` | Danger | Untested |

## Skills (6)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Add Perk / Skill by Form ID | `player.addperk {formId}` | Caution | Untested |
| Remove Perk / Skill by Form ID | `player.removeperk {formId}` | Danger | Untested |
| Grant All Powers | `psb` | Danger | Untested |
| Set Star Power | `player.setav starpower {value}` | Caution | Untested |
| Add Spell / Effect by Form ID | `player.addspell {formId}` | Danger | Untested |
| Remove Spell / Status Effect by Form ID | `player.removespell {formId}` | Caution | Untested |

## Camera (5)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Toggle Free Camera | `tfc` | Normal | Verified |
| Enter Free Camera + Freeze | `tfc 1` | Caution | Verified |
| Toggle HUD / Interface | `tm` | Caution | Untested |
| Set Free Camera Speed | `sucsm {speed}` | Normal | Verified |
| Clear Screen Blood | `ClearScreenBlood` | Normal | Untested |

## World (8)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Toggle Game Pause | `tgp` | Normal | Untested |
| Set Game Speed | `sgtm {value}` | Caution | Verified |
| Pass Time | `passtime {hours}` | Normal | Verified |
| Set Local Gravity Scale | `setgravityscale {value}` | Caution | Untested |
| Reveal Planet Map Markers | `tmm 1` | Danger | Untested |
| Teleport to Cell | `coc {cellName}` | Danger | Untested |
| Force Weather | `fw {weatherId}` | Caution | Untested |
| Set Weather Gradually | `setweather {weatherId}` | Caution | Untested |

## Targets (16)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Move Reference to Player | `{refId}.moveto player` | Caution | Untested |
| Kill Actor by Reference ID | `{refId}.kill` | Danger | Untested |
| Resurrect Actor by Reference ID | `{refId}.resurrect` | Danger | Untested |
| Recycle Actor / Reference | `{refId}.recycleactor` | Danger | Untested |
| Disable Reference | `{refId}.disable` | Danger | Untested |
| Enable Reference | `{refId}.enable` | Caution | Untested |
| Unlock Door / Container by Reference ID | `{refId}.unlock` | Danger | Untested |
| Lock Door / Container by Reference ID | `{refId}.lock {level}` | Caution | Untested |
| Set Target / Reference Scale | `{refId}.setscale {scale}` | Caution | Untested |
| Set Reference Ownership | `{refId}.setownership` | Caution | Untested |
| Move Reference Along Axis | `{refId}.modpos {axis} {amount}` | Caution | Untested |
| Rotate Reference Along Axis | `{refId}.modangle {axis} {degrees}` | Caution | Untested |
| Attach Weapon / Armor Mod | `{refId}.amod {modId}` | Caution | Untested |
| Remove Weapon / Armor Mod | `{refId}.rmod {modId}` | Caution | Untested |
| Set Companion Affinity | `{refId}.setav com_affinity {value}` | Danger | Untested |
| Set Companion Relationship Level | `{refId}.setav com_affinitylevel {value}` | Danger | Untested |

## Quests (6)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Start Quest by ID | `startquest {questId}` | Danger | Untested |
| Stop Quest by ID | `stopquest {questId}` | Danger | Untested |
| Set Quest Stage | `setstage {questId} {stage}` | Danger | Untested |
| Complete Quest by ID | `completequest {questId}` | Danger | Untested |
| Reset Quest by ID | `resetquest {questId}` | Danger | Untested |
| Teleport to Quest Target | `movetoqt {questId}` | Caution | Untested |

## Ship (2)

| Command | Console syntax | Risk | CCC test |
|---|---|---|---|
| Refuel Player Spaceship | `RefuelSpaceship` | Normal | Untested |
| Spawn Ship by Base ID | `player.placeatme {baseId}` | Danger | Untested |
