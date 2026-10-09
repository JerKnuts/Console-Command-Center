# Console Command Center

Console Command Center is an in-game console-command interface for **Starfield**. It provides a searchable menu for useful console commands without requiring the player to type them manually every time. It supports mouse and keyboard or a game controller.

The mod uses an OSF UI frontend and a native SFSE/CommonLibSF plugin to execute commands inside Starfield.

## Project status

**Current release: v1.1.26.** This update cleans the distributed source and lets the OSF UI development webview scan a configured MO2 profile and display its real mod IDs. See the [changelog](CHANGELOG.md) and [validation checklist](RELEASE_VALIDATION.md).

The core command execution system is working in-game. The command catalog is being tested command-by-command. Controller support covers directional navigation, activation, Back, scrolling, dialogs, and an onscreen keyboard for editable fields.

Planned additions, including editable `.txt` command-batch files, are tracked in [Future features](docs/FUTURE_FEATURES.md). Manual loaded-mod ID scanning is documented in [Mod ID catalogs](docs/MOD_ID_CATALOGS.md).

Commands that rely on known curated IDs use a reusable searchable Reference ID Picker instead of crowded preset-button grids. A separate **ID Browser** searches the catalog packaged with CCC.

Some commands can affect achievements, progression, quests, save-game state, NPCs, ships, or world objects. Make a manual save before using commands that modify important game state.

## Requirements and compatibility

- Starfield runtime **1.16.244**
- [Starfield Script Extender (SFSE)](https://sfse.silverlock.org/)
- Address Library for SFSE Plugins
- OSF Settings **1.0.0 or newer**
- OSF UI **2.0.0 or newer**
- Microsoft Edge WebView2 Runtime

The native plugin enables its gameplay handlers only on the tested Starfield runtime. A different game version will leave CCC unavailable rather than attempting incompatible native calls. Shattered Space is optional; records from the expansion are clearly labeled and require the expansion when used.

In OSF Settings, bind **Open Mod Settings** to a key such as F10. Use that key in game, open **Launcher**, and select **Console Command Center**. The opening key may be unbound after installing or updating OSF Settings.

## Installation

Install the release archive with a Starfield mod manager, or copy its `SFSE` folder into the game's `Data` folder. Keep the archive's folder structure intact. Launch the game through SFSE and confirm the CCC footer reports the installed version and **NATIVE READY**.

To update from v1.0.12 or earlier, remove the old `Data/SFSE/Plugins/OSFUI/views/console.command-center/` folder and install the new archive. CCC v1.0.13 and newer place the view under `Data/SFSE/Plugins/OSF/UI/views/console.command-center/`. To uninstall, remove that view folder and `Data/SFSE/Plugins/ConsoleCommandCenter.dll`.

## Features

- Native Starfield console-command execution
- Native read-only results for supported inventory, reference, actor-value, Game Setting, and ship inspections
- Searchable command library
- Category browsing
- Recent commands and favorites stay fixed at the top of the sidebar while the category list scrolls independently
- Multiline custom-command batches that execute one command per line, with up to 100 named saved entries, a visible usage counter, and typed confirmation before deleting every saved entry
- Separate **WIP** category with 40 prepared cards grouped by test result and a lazily loaded library of 1,505 engine commands and script functions
- Activity log
- Contextual Help for Recent, Favorites, command categories, ID Browser, Quest Browser, Custom Command, and Activity Log
- Separate first-time welcome overview that remains available from each Help window
- Parameter inputs for Form IDs, amounts, values, Ref IDs, axes, and other arguments
- Searchable Reference ID Picker for supported faction, companion, weather, and popular location commands
- Standalone **ID Browser** with 16,528 included IDs, sidebar categories, compact selectable results, persistent ID favorites, Copy ID, and conservative quick actions
- Separate **Mod Browser** with manual session scanning, an Official Creations group, global ID search, readable names for known plugin files, and persistent ID favorites
- Working **Search Form IDs** command cards that open the packaged ID Browser directly; typed `QUST` searches open Quest Browser
- **Browse Items**, **Browse Equipment**, **Browse Base IDs**, **Browse Mods**, and **Browse Ships** controls that return packaged IDs directly to command fields without executing them
- Filtered **ID Browser** controls for packaged perks, skills, traits, Starborn powers, and known removable environmental effects
- Confirmation before execution
- Caution and Danger warnings
- Complete controller navigation with A to select, B to go back, right-stick scrolling, and an onscreen keyboard
- Compact Starfield-inspired OSF UI
- Searchable **Quest Browser** with quest actions and recorded stage indexes
- **Choose Quest** controls on every Quest ID field and a recorded-stage chooser for Set Quest Stage
- Guided quest-stage skip choices with unavailable diagnostics clearly disabled
- Curated ID choices use the same compact field + **CHOOSE ...** box used by the companion-affinity commands; manual ID entry remains available


## ID Browser and Reference ID Picker

The standalone **ID Browser** is a dedicated utility screen for finding Form/Reference IDs without leaving CCC. It searches **16,528 included IDs** instantly by name, Form ID, type, category, and Editor ID. The catalog covers weapons, armor and apparel, ammunition, aid, resources and miscellaneous items, books and notes, skills, traits, powers, effects, object mods, factions, NPCs, ships, named locations and cells, and weather. Location and cell selections can copy either the Form ID or Editor ID. Weather records can be applied immediately, Cell records can teleport through their Editor ID, and Location records can narrow the browser to matching teleportable Cells. Shattered Space records display an expansion requirement and use cleaned Editor IDs where a verified localized display name is unavailable. Long descriptive labels, internal factions, creature attacks, test weapons, and known subtitle collisions are excluded. The selected sidebar category loads as one scrollable compact list. Every selected result offers **Copy ID** plus a conservative quick action when the record type is unambiguous.

Records created by loaded mods live in the separate **Mod Browser**. Select **Scan Mods** once per game session to discover active plugins and collect their supported IDs. Opening CCC, ID Browser, or Mod Browser never starts a scan. Bethesda `SFBGS...` plugins appear under **Official Creations**; other plugins appear under **Mods**. With no mod selected, Search All searches IDs across every scanned plugin. CCC identifies each record's owning full, medium, or small plugin from its runtime Form ID and ignores overrides owned by the base game. Known plugin filenames are translated through a bundled community name map; unknown plugins retain a clean filename-derived name. See [Mod ID catalogs](docs/MOD_ID_CATALOGS.md) and [Mod display names](docs/MOD_DISPLAY_NAMES.md) for details.

Every record in ID Browser and Mod Browser can be starred. ID favorites persist between sessions and appear alongside command and saved-batch favorites. **Open** returns directly to the correct browser and record.

Expansion-only packaged records carry a visible requirement such as **Shattered Space DLC**.

The reusable Reference ID Picker remains the compact command-specific chooser. **Pay Bounty** opens bounty-relevant factions, companion affinity commands open Sarah Morgan, Barrett, Sam Coe, and Andreja, and weather commands open common weather records. Selecting an entry fills the normal command input; users can still type any valid hexadecimal ID manually. Inline preset-button grids are intentionally avoided.

## Quest Browser

Commands, ID Browser, Quest Browser, Custom Command, and Activity Log live in a dedicated navigation bar directly below the CCC header. Recent and Favorites remain fixed in the left sidebar while each browser supplies its own category list.

Quest Browser includes recorded quest-stage selections for inspecting or advancing quest state. Every packaged Quest ID and stage number is structurally validated against its installed master file. Console Command Center uses those mappings to execute vanilla commands such as:

```text
setstage <QuestFormID> <Stage>
```

Quest changes are intentionally marked **Danger** because starting, completing, or forcing a stage can skip dialogue, scripts, rewards, scenes, prerequisites, or other quest state. Use these actions on a backup or disposable save. Some quests do not appear in the mission log until a stage is activated. Reset clears recorded stages and removes the quest from the log without restarting it.

Every Quest Browser entry is a real `QUST` record from a Bethesda master file. Some are player-facing missions; others run dialogue, scenes, patches, holders, and game systems without appearing as normal missions. CCC keeps every record, but moves entries with no localized title or strong support-record names into **Internal / System** to reduce clutter in the player-facing categories.

Quest Browser contains 2,318 base-game and Shattered Space quest records with 16,844 recorded stage indexes. It supports searching by quest name, Editor ID, Form ID, source, and stage, plus confirmed Start, Stop, Complete, Reset, and Set Stage actions. Shattered Space entries are labeled in the interface. **Inspect Quest State** reads the current stage and completed-stage history through Starfield's quest scripting interface, then marks that progress directly on the stage list.

The dataset is generated from the installed Bethesda master records and matching English localization tables. Stage indexes confirm that a stage exists structurally; they do not prove that forcing it is safe for a particular save. Each quest provides state inspection, stage history, confirmed Start, Stop, Complete, Reset, Set Stage, and Copy ID actions where applicable.

## Command catalog

The established command library remains curated, while commands still under investigation live in a separate **WIP** category. CCC contains **147 established command cards** plus **1,545 WIP cards**: 40 prepared cards, 557 engine console commands, and 948 script functions. A card can contain paired actions when one command enables an override and another restores normal behavior. Prepared cards are separated into Ready to Test, Executed — Effect Unconfirmed, Executed — Issues, and Blocked — Known Crash groups. Search spans every category in the active browser; WIP searches include the complete raw engine library. Commands with an inconclusive result remain available for advanced users; known crash paths, confirmed unusable actions, and credential-handling commands remain unavailable. Hover or focus the large disabled Unavailable action to see the underlying console command. Verification status is documented in [`COMMAND_CATALOG.md`](COMMAND_CATALOG.md).

## Architecture

```text
Console Command Center UI
        ↓
OSF UI 2.0 native API
        ↓
ConsoleCommandCenter.dll
        ↓
Starfield native console executor
        ↓
Console command
```

The native plugin exposes direct game reads for inventory, supported reference inspection, player/companion/ship actor values, current spaceship, Game Settings, and quest state. Unsupported inspections are visibly unavailable instead of executing a known-broken adapter. Results open in a dedicated window and can be reopened from Activity Log.

## Source setup

Requirements include Node.js/npm, Git, XMake, and the SFSE/CommonLibSF build prerequisites. The repository includes the official OSF UI 2.0 native and browser declarations used by CCC.

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
- `artifacts/`
- `.xmake/`
- `.osfui/`

The local `native/lib/commonlibsf/` checkout is also ignored because it can be recreated automatically.

## Development notes

- `npm run build` builds both the native plugin and OSF UI frontend.
- `npm run dev:game` opens the game-sized browser harness with simulated CCC responses, keeps the modern OSF UI view under `mod/` updated, and mirrors the compiled mod into the configured MO2 mods directory as frontend files change. It temporarily enables OSF UI author mode so a running game can reload frontend edits; locked native files are left alone until Starfield closes. The first run asks for the MO2 mods directory and saves it in `.osfui/local.json`; use `--deploy "C:\\path\\to\\mods"` to override it.
- In the development webview, **Scan Mods** reads the active MO2 profile and parses supported records from its real plugin files. Set `profilePath` and `gameDataRoot` in `.osfui/local.json` when automatic profile or game-folder detection chooses the wrong location.
- `npm run build:native` builds only the native plugin after ensuring CommonLibSF is available.
- `npm run setup:deps` restores CommonLibSF without starting a build.
- `npm run check` runs the OSF UI 2.0 and TypeScript checks.
- `npm run package` validates, tests, builds, and creates both the Nexus-ready archive and corresponding full-source archive under `artifacts/`.

User-visible release history is recorded in [`CHANGELOG.md`](CHANGELOG.md). Current supporting references live under [`docs/`](docs/).
