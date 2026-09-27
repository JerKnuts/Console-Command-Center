# Console Command Center

Console Command Center is an in-game console-command interface for **Starfield**. It provides a searchable, controller-friendly menu for useful console commands without requiring the player to type them manually every time.

The mod uses an OSF UI frontend and a native SFSE/CommonLibSF plugin to execute commands inside Starfield.

## Project status

**Current development version: v0.3.0 Beta**

The core command execution system is working in-game. The command catalog is being tested command-by-command, and v0.3.0 adds guided quest diagnostics and quest-repair tools.

Commands that rely on common IDs use a reusable searchable Reference ID Picker instead of crowded preset-button grids. Current integrations cover bounty factions, the four core affinity companions, and common weather records.

Some commands can affect achievements, progression, quests, save-game state, NPCs, ships, or world objects. Make a manual save before using commands that modify important game state.

## Features

- Native Starfield console-command execution
- Searchable command library
- Category browsing
- Recent commands and favorites stay fixed at the top of the sidebar while the category list scrolls independently
- Custom console commands
- Activity log
- Parameter inputs for Form IDs, amounts, values, Ref IDs, axes, and other arguments
- Searchable Reference ID Picker for supported faction, companion, and weather commands
- Confirmation before execution
- Caution and Danger warnings
- Mouse, keyboard, and controller-friendly interface
- Compact Starfield-inspired OSF UI
- Guided **Quest Fixes** browser
- Live quest-stage diagnostics before applying a repair
- Full `sqs` inspection for supported quest fixes
- Curated ID choices use the same compact field + **CHOOSE ...** box used by the companion-affinity commands; manual ID entry remains available


## Reference ID Picker

The reusable Reference ID Picker keeps long choice lists out of the command cards. **Pay Bounty** opens bounty-relevant factions, companion affinity commands open Sarah Morgan, Barrett, Sam Coe, and Andreja, and weather commands open common weather records. Selecting an entry fills the normal command input; users can still type any valid hexadecimal ID manually.

The choice-list data lives separately from command definitions so it can later power a standalone **ID Browser** without maintaining duplicate ID lists. Inline preset-button grids are intentionally avoided.

## Quest Fixes

Quest Fixes appears as its own dedicated sidebar utility below the normal command Categories, followed by Custom Command and Activity Log.

v0.3.0 includes 248 guided quest-stage selections for repairing known quest-progression problems. Console Command Center uses the quest FormIDs and stage mappings to execute vanilla commands such as:

```text
setstage <QuestFormID> <Stage>
```

Before applying a repair, **Check Status** reads the live quest state and shows the current/highest completed stage plus completed-stage history. Quest repair is intentionally marked **Danger** because forcing a stage can skip dialogue, scripts, rewards, scenes, prerequisites, or other quest state.

See [`QUEST_FIXES.md`](QUEST_FIXES.md) for details.

## Command catalog

The command library is deliberately curated instead of trying to expose every internal developer command. Verification status is documented in [`COMMAND_CATALOG.md`](COMMAND_CATALOG.md).

## Architecture

```text
Console Command Center UI
        ↓
OSF UI native bridge
        ↓
ConsoleCommandCenter.dll
        ↓
Starfield native console executor
        ↓
Console command
```

The native plugin also exposes read-only quest diagnostics used by the Quest Fixes screen.

## Source setup

Requirements include Node.js/npm, Git, XMake, SFSE/CommonLibSF build prerequisites, and the OSF UI toolchain.

Install the JavaScript dependencies:

```powershell
npm install
```

Then build:

```powershell
npm run build
```

`native/lib/commonlibsf/` is intentionally not stored in this repository. The native build automatically restores the pinned CommonLibSF revision when that folder is missing, including its recursive submodules. You can also restore it explicitly with:

```powershell
npm run setup:deps
```

The dependency revision is pinned in `native/setup-deps.mjs`, so fresh clones use the same CommonLibSF revision as the development build.

## Generated folders

The following are local/generated and should not be committed or included in source archives:

- `node_modules/`
- `build/`
- `dist/`
- `mod/`
- `.xmake/`
- `.osfui/`

The local `native/lib/commonlibsf/` checkout is also ignored because it can be recreated automatically.

## Development notes

- `npm run build` builds both the native plugin and OSF UI frontend.
- `npm run build:native` builds only the native plugin after ensuring CommonLibSF is available.
- `npm run setup:deps` restores CommonLibSF without starting a build.
- `npm run check` runs the OSF UI checks.

Release-specific changes are recorded in [`RELEASE_NOTES_v0.3.0.md`](RELEASE_NOTES_v0.3.0.md).
