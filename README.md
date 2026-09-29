# Console Command Center

Console Command Center is an in-game console-command interface for **Starfield**. It provides a searchable, controller-friendly menu for useful console commands without requiring the player to type them manually every time.

The mod uses an OSF UI frontend and a native SFSE/CommonLibSF plugin to execute commands inside Starfield.

## Project status

**Current development version: v0.3.0 Beta**

**Current test build: v0.3.0-test8.** This build replaces ID Browser console scraping with native loaded-form search, adds calculated effective-total controls for boostpack and ship values, tracks held objects through Starfield's grab/release events, disables known-broken inspection cards, hardens query scheduling, and validates the Quest Fix dataset against `Starfield.esm`. Follow [the test8 instructions](TEST_BUILD_RESULT_ACTIONS.md).

**Previous hotfix: v0.3.0-test2.** Test1 crashed during scale inspection. The shared evaluator calls remain removed, and Scale/Open State/GetStage/Quest Status remain temporarily disabled. Test2 verified Escape handling, inventory, companion readouts, and ship readouts in game.

**Historical test1 notes:** Test1 introduced dropdown contrast, direct inspection reads, and the dedicated Results window. Its unsafe Scale adapter must not be used; test2 and test3 contain the crash guard.

The core command execution system is working in-game. The command catalog is being tested command-by-command, and v0.3.0 adds guided quest-repair tools, a standalone ID Browser, and a larger inspection/ship-control command set.

Commands that rely on known curated IDs use a reusable searchable Reference ID Picker instead of crowded preset-button grids. A separate **ID Browser** combines a built-in starter catalog with live searches against Starfield's loaded records.

Some commands can affect achievements, progression, quests, save-game state, NPCs, ships, or world objects. Make a manual save before using commands that modify important game state.

## Features

- Native Starfield console-command execution
- Read-only console-output capture for reference inspection commands
- Searchable command library
- Category browsing
- Recent commands and favorites stay fixed at the top of the sidebar while the category list scrolls independently
- Custom console commands
- Activity log
- Parameter inputs for Form IDs, amounts, values, Ref IDs, axes, and other arguments
- Searchable Reference ID Picker for supported faction, companion, weather, and popular location commands
- Standalone **ID Browser** with common built-in IDs, native loaded-form searches, selectable results, and conservative quick actions
- Confirmation before execution
- Caution and Danger warnings
- Mouse, keyboard, and controller-friendly interface
- Compact Starfield-inspired OSF UI
- Guided **Quest Fixes** browser
- Guided quest-stage repair choices with unavailable diagnostics clearly disabled
- Curated ID choices use the same compact field + **CHOOSE ...** box used by the companion-affinity commands; manual ID entry remains available


## ID Browser and Reference ID Picker

The standalone **ID Browser** is a dedicated utility screen for finding Form/Reference IDs without leaving CCC. It includes **193 built-in starter IDs** covering common weapons, armor, ammo, resources, perks, object modifiers, factions, core companions, and weather records. Search and filters work locally against that catalog.

**Search Game** searches Starfield's loaded forms directly by display name and EditorID. It does not scrape the rolling console buffer. Because the lookup runs against the loaded game, it can surface matching base-game, DLC, Creation, and mod records that are not part of the built-in starter list. Supported type filters include common groups such as WEAP, ARMO, AMMO, ALCH, MISC, PERK, SPEL, NPC_, OMOD, FACT, QUST, CELL, GBFM, FURN, and WTHR. Results can be selected and, when the record type is unambiguous, CCC offers a conservative quick action such as **Add 1**, **Add Perk**, **Add Spell / Power**, or **Spawn 1**.

The reusable Reference ID Picker remains the compact command-specific chooser. **Pay Bounty** opens bounty-relevant factions, companion affinity commands open Sarah Morgan, Barrett, Sam Coe, and Andreja, and weather commands open common weather records. Selecting an entry fills the normal command input; users can still type any valid hexadecimal ID manually. Inline preset-button grids are intentionally avoided.

## Quest Fixes

ID Browser, Quest Fixes, Custom Command, and Activity Log live in a dedicated horizontal utility bar along the bottom of CCC. Recent and Favorites remain fixed in the left sidebar while Categories scroll independently.

v0.3.0 includes 247 guided quest-stage selections for repairing known quest-progression problems. Every listed Quest ID and stage number is structurally validated against `Starfield.esm`. Console Command Center uses those mappings to execute vanilla commands such as:

```text
setstage <QuestFormID> <Stage>
```

Live quest diagnostics are currently disabled while a safe native adapter is developed. Quest repair is intentionally marked **Danger** because forcing a stage can skip dialogue, scripts, rewards, scenes, prerequisites, or other quest state. Treat every listed stage as unverified until its Quest ID and stage table have been checked against the game data.

See [`QUEST_FIXES.md`](QUEST_FIXES.md) for details.

## Command catalog

The command library is deliberately curated instead of trying to expose every internal developer command. v0.3.0 currently contains **141 curated command entries** plus the standalone ID Browser and the separate guided Quest Fixes dataset. Six known-broken entries remain visible but disabled with an explanation. Verification status is documented in [`COMMAND_CATALOG.md`](COMMAND_CATALOG.md).

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

The native plugin exposes direct game reads for inventory, supported reference inspection, player/companion/ship actor values, current spaceship, and Game Settings. Unsupported inspections are visibly unavailable instead of executing a known-broken adapter. Results open in a dedicated window and can be reopened from Activity Log.

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

## License and corresponding source

Console Command Center is licensed under **GPL-3.0-or-later with the CommonLibSF Modding Exception and GPL-3.0 Linking Exception (with Corresponding Source)**. See [`LICENSE`](LICENSE) and [`EXCEPTIONS`](EXCEPTIONS).

The native DLL links against CommonLibSF. The exact corresponding CommonLibSF revision and restoration instructions are recorded in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and `native/setup-deps.mjs`. Binary releases must be accompanied by this project's source and access to that pinned dependency source.

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

Release-specific changes are recorded in [`docs/RELEASE_NOTES_v0.3.0.md`](docs/RELEASE_NOTES_v0.3.0.md).
