# GetGlobalValue — separate test list

Player testing on October 23 found `GetGlobalValue GameHour` could not resolve the name. This does not establish that the command fails for all arguments. The six names/IDs below were verified against GLOB records in the installed base-game Starfield.esm. Subsequent player testing confirmed all six ID-based commands work in the game console, but CCC console-output capture timed out. Version 1.3.41 uses a direct loaded-global read instead; the replacement popup needs an in-game retest.

In CCC's World category, use GetGlobalValue and Choose Global to select one of the six tested globals. The card accepts a Global Form ID and has no target prefix. Run one at a time; do not execute as a combined batch.

| Global | Arguments | Complete console command |
|---|---|---|
| GameHour | 00000038 | GetGlobalValue 00000038 |
| TimeScale | 0000003A | GetGlobalValue 0000003A |
| GameDaysPassed | 00000039 | GetGlobalValue 00000039 |
| GameDay | 00000037 | GetGlobalValue 00000037 |
| GameMonth | 00000036 | GetGlobalValue 00000036 |
| GameYear | 00000035 | GetGlobalValue 00000035 |

Record the exact result or error, and distinguish native-console success from a successful CCC popup. Current values depend on the save; the values stored in the master are not live expectations. Preserve a result of zero as a real result. The already-tested GetCurrentTime is a separate comparison for the game hour.
