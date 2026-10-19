# Furniture report audit — 1.3.5

Source: CCC-Dev-Feedback-2026-10-17_22-52-57-517_8544-242445171-1.txt (reported build 1.3.3).
44 reports describe 42 unique records. Audit uses original installed ESM records and assets, not screenshots alone.

## Corrected

- 24 records below point to authored marker NIFs. They are Reference Only, hidden under default filters, and cannot be spawned from CCC. They are not missing chair, robot, or toilet meshes.
- Five pilot-seat records load 157 or 185 pieces. The 128-piece limit rejected them; the new bounded limit is 512. Existing 400,000 vertex, 1,800,000 index and 64 MiB normal transfer limits remain enforced.
- Elevated Cabin beds 083839 / 08383A / 08383B now apply their authored blue / purple / red material swaps. Leading material-root separators in the source data were previously rejected. This normalization does not allow absolute filesystem paths.

## Still open

- Sleeping Bag, Starfield.esm:155D2E: its authored SetDressing/Neon/HoboBed01.nif is unavailable in the tested installation. No substitute model or working status was invented.
- Material findings on Asteroid Manor dining chair/armchair, Hacker Laptop, Taiyo crew seat, Starborn pilot seat, Elevated Cabin cosy chair, Freestar chemistry workbench and Astral Lounge Artifact remain open. Successful geometry decoding does not establish complete material fidelity. Some surfaces use layered paint, constant colors, effect materials or normal-only decals, so lack of a base-color map alone is not proof of a missing texture.
- Starfield.esm:3551B9 is a real Starborn chair with a supported mesh, not an invisible marker. Its repeated inventory test is not evidence that it cannot be spawned. Keep its physical-object action; placement still needs in-game testing.

## Confirmed invisible markers

- SFBGS00D.esm:02F08C — SFFL_MS01_NPCLeaningBartopFront_ExitToTalk
- SFBGS00D.esm:086564 — SFBGS00D_MilliWhaleSleeping
- Starfield.esm:061F91 — Player_ShipLadder
- Starfield.esm:0CC45B — Ship_ToiletSit01_FURN
- Starfield.esm:0EFC6F — Invisible_GalleyWorkbench01
- Starfield.esm:139C83 — Invisible_NPC_Terminal_Sitting
- Starfield.esm:17B689 — Invisible_GalleyWorkbench02
- Starfield.esm:1C2C9A — VideoOnlyCockPitDoor
- Starfield.esm:1C8031 — VideoOnlyTableFurn
- Starfield.esm:1CF571 — VideoOnlyShipsConsole
- Starfield.esm:1D4810 — VideoOnlyLadderFurn
- Starfield.esm:36717D — LocDungeonCaptiveMarker
- Starfield.esm:36717E — LocStoryMysteryCaptiveMarker
- SFBGS050.esm:03C79D — SFBGS050_TerranRobotPoweredDown_A
- SFBGS050.esm:03C79E — SFBGS050_TerranRobotPoweredDown_B
- SFBGS050.esm:03C79F — SFBGS050_TerranRobotPoweredDown_C
- SFBGS050.esm:04586E — SFBGS050_UpgradingRobot
- SFBGS050.esm:07E8FB — SFTER_NPCDeskLean
- SFBGS050.esm:0A0C82 — SFBGS050_DeltaPoweredUp
- SFBGS050.esm:0AC57D — SFTER_Terminal_Console_Standing_NoChair_NoScale
- ShatteredSpace.esm:0F9D83 — SFBGS001_GenuflectSinglePlay
- ShatteredSpace.esm:0F9D85 — SFBGS001_Genuflect
- ShatteredSpace.esm:0FC0B0 — SFBGS001_CitadelEscapeFurniture
- ShatteredSpace.esm:11CFF7 — SFBGS001_MourningDevice_NPCConsoleStanding
