# Command Browser catalog

Current source: v1.4.0. The prepared catalog contains 213 cards, including 43 WIP entries, plus 1,468 remaining lazy-loaded engine reference cards. Displayed counts can differ with Advanced Options, saved test outcomes and promoted WIP entries.

| Prepared category | Cards |
| --- | ---: |
| Camera | 8 |
| Gameplay | 11 |
| Inventory | 14 |
| Player | 25 |
| Quests | 7 |
| Ship | 25 |
| Skills | 8 |
| Targets | 33 |
| World | 22 |
| MISC | 16 |
| Advanced Settings | 1 |
| WIP | 43 |

Commands sort alphabetically within categories. MISC, Advanced Settings and WIP are pinned after the ordinary categories. Recent and Favorites preserve their own ordering. Advanced Options reveals WIP and Advanced Settings.

## Instructions and test outcomes

Caution/Danger badges are removed from the interface. Command-specific instructions, review before execution and unavailable-action blocks remain. Internal risk metadata is retained for compatibility; it does not create visible badges. Make a manual save before changing quests or important game state.

Working is a manual Dev Mode toggle: click again to clear it. A successful dispatch or build never marks a command Working. Reporting Issues or Not noticeable retains the displayed category. Some explicitly reviewed unresolved commands remain assigned to WIP. Saved outcomes survive report export and reload.

A historical Verified source status records a reported command result; it does not certify every input or the current Results adapter. The actual card definitions, templates, instructions and status notes are maintained in commands.ts, untested-commands.ts and confirmed-readout-commands.ts under src/views/console.command-center/main. The engine-command library is generated from [the help-derived reference](docs/ENGINE_COMMAND_REFERENCE.md). Inclusion is not proof that an engine command is available or useful in the retail game.

## Results and remaining query limits

Supported read-only commands use typed native readers or narrowly checked execute adapters where available. Companion affinity and player inventory provide direct reads; the revised numeric paths avoid depending on printed console text where supported. Timeouts and unsupported results are failures to verify a value, not zero results. See [the capture investigation](docs/QUERY_CAPTURE_1345.md) for the original failure and subsequent direct-query work.

Get Current Cell and Get Starting Position remain under WIP / Executed — Issues. Is It Raining? and Is It Snowing? are also there: the supported runtime's commands are constant-zero stubs, so they are not reliable weather observations. Actor state, distance and lock readouts have parameter/target and runtime validation; their in-game review remains separate from successful native fixtures. Do not infer Working status from the readout module's name.

Raw engine references accept optional arguments and, for supported target-scoped entries, an optional target/prefix. They must be reviewed before execution. Known crash paths remain disabled. LinkFullAccount is unavailable because entering credentials would retain them in command history.

## Browser and quest actions

The packaged ID Browser contains 23,308 entries; Mod Browser scans supported records from the active load order. The Quest Browser separately contains 2,568 quests with 19,061 structurally recorded stage indexes. These counts are data coverage, not gameplay certification. See [ID catalog sources](docs/ID_CATALOG_SOURCES.md) and [Mod Browser](docs/MOD_ID_CATALOGS.md).

Supported quick actions include adding inventory/perks/powers, placing supported objects, weather changes and cell teleports. Reference-only and unavailable records block gameplay actions. Quest Start, Stop, Complete, Reset and Set Stage require review and can skip scripts or prerequisites; inspection itself is read-only.

Historical player observations are retained in [console test findings](docs/CONSOLE_TEST_FINDINGS.md). Current release checks and remaining in-game limits are in [release validation](RELEASE_VALIDATION.md). The [README](README.md) describes current navigation, shortcut behavior and feature availability.
