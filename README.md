# Console Command Center

Console Command Center is an in-game console-command interface for **Starfield**. It provides a searchable mouse-and-keyboard menu for useful console commands without requiring the player to type them manually every time. Controller support is in development for a future release.

The mod uses an OSF UI frontend and a native SFSE/CommonLibSF plugin to execute commands inside Starfield.

## Project status

**Current development version: v1.0.12.** The v1.0 release is the first public Nexus build. v1.0.12 promotes the paired Speech Challenge Failure control from WIP to Gameplay. See the [v1.0.12 notes](docs/RELEASE_NOTES_v1.0.12.md) and [validation checklist](RELEASE_VALIDATION.md).

The core command execution system is working in-game. The command catalog is being tested command-by-command, and current development focuses on input reliability. The current interface supports mouse and keyboard. Controller navigation, activation, text entry, and adaptive larger controls are being developed together for a future release.

Planned additions, including controller support and editable `.txt` command-batch files, are tracked in [Future features](docs/FUTURE_FEATURES.md).

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

To update, replace the existing CCC files with the files from the new archive. To uninstall, remove `Data/SFSE/Plugins/ConsoleCommandCenter.dll` and `Data/SFSE/Plugins/OSFUI/views/console.command-center/`.

## Features

- Native Starfield console-command execution
- Native read-only results for supported inventory, reference, actor-value, Game Setting, and ship inspections
- Searchable command library
- Category browsing
- Recent commands and favorites stay fixed at the top of the sidebar while the category list scrolls independently
- Multiline custom-command batches that execute one command per line, with up to 100 named saved entries, a visible usage counter, and typed confirmation before deleting every saved entry
- Separate **WIP** category with 34 prepared cards grouped by test result and a lazily loaded library of 1,505 engine commands and script functions
- Activity log
- Contextual Help for Recent, Favorites, command categories, ID Browser, Quest Browser, Custom Command, and Activity Log
- Separate first-time welcome overview that remains available from each Help window
- Parameter inputs for Form IDs, amounts, values, Ref IDs, axes, and other arguments
- Searchable Reference ID Picker for supported faction, companion, weather, and popular location commands
- Standalone **ID Browser** with 16,528 included IDs, collapsed categories, selectable results, Copy ID, and conservative quick actions
- Working **Search Form IDs** command cards that open the packaged ID Browser directly; typed `QUST` searches open Quest Browser
- **Browse Items**, **Browse Equipment**, **Browse Base IDs**, **Browse Mods**, and **Browse Ships** controls that return packaged IDs directly to command fields without executing them
- Filtered **ID Browser** controls for packaged perks, skills, traits, Starborn powers, and known removable environmental effects
- Confirmation before execution
- Caution and Danger warnings
- Compact mouse-and-keyboard interface; controller support is in development
- Compact Starfield-inspired OSF UI
- Searchable **Quest Browser** with quest actions and recorded stage indexes
- **Choose Quest** controls on every Quest ID field and a recorded-stage chooser for Set Quest Stage
- Guided quest-stage skip choices with unavailable diagnostics clearly disabled
- Curated ID choices use the same compact field + **CHOOSE ...** box used by the companion-affinity commands; manual ID entry remains available


## ID Browser and Reference ID Picker

The standalone **ID Browser** is a dedicated utility screen for finding Form/Reference IDs without leaving CCC. It searches **16,528 included IDs** instantly by name, Form ID, type, category, and Editor ID. The catalog covers weapons, armor and apparel, ammunition, aid, resources and miscellaneous items, books and notes, skills, traits, powers, effects, object mods, factions, NPCs, ships, named locations and cells, and weather. Location and cell selections can copy either the Form ID or Editor ID. Weather records can be applied immediately, Cell records can teleport through their Editor ID, and Location records can narrow the browser to matching teleportable Cells. Shattered Space records display an expansion requirement and use cleaned Editor IDs where a verified localized display name is unavailable. Long descriptive labels, internal factions, creature attacks, test weapons, and known subtitle collisions are excluded. Large categories load 100 tiles at a time so browsing and searching stay responsive. Every selected result offers **Copy ID** plus a conservative quick action when the record type is unambiguous.

CCC does not scan Starfield's live form memory. That experimental path caused an access violation during test9 and was removed. Expansion-only records carry a visible requirement such as **Shattered Space DLC**.

The reusable Reference ID Picker remains the compact command-specific chooser. **Pay Bounty** opens bounty-relevant factions, companion affinity commands open Sarah Morgan, Barrett, Sam Coe, and Andreja, and weather commands open common weather records. Selecting an entry fills the normal command input; users can still type any valid hexadecimal ID manually. Inline preset-button grids are intentionally avoided.

## Quest Browser

ID Browser, Quest Browser, Custom Command, and Activity Log live in a dedicated horizontal utility bar along the bottom of CCC. Recent and Favorites remain fixed in the left sidebar while Categories scroll independently.

Quest Browser includes recorded quest-stage selections for inspecting or advancing quest state. Every packaged Quest ID and stage number is structurally validated against its installed master file. Console Command Center uses those mappings to execute vanilla commands such as:

```text
setstage <QuestFormID> <Stage>
```

Quest changes are intentionally marked **Danger** because starting, completing, or forcing a stage can skip dialogue, scripts, rewards, scenes, prerequisites, or other quest state. Use these actions on a backup or disposable save. Some quests do not appear in the mission log until a stage is activated. Reset clears recorded stages and removes the quest from the log without restarting it.

Quest Browser contains 2,318 base-game and Shattered Space quest records with 16,844 recorded stage indexes. It supports searching by quest name, Editor ID, Form ID, source, and stage, plus confirmed Start, Stop, Complete, Reset, and Set Stage actions. Shattered Space entries are labeled in the interface. **Inspect Quest State** reads the current stage and completed-stage history through Starfield's quest scripting interface, then marks that progress directly on the stage list.

See [`QUEST_BROWSER.md`](QUEST_BROWSER.md) for details.

## Command catalog

The established command library remains curated, while commands still under investigation live in a separate **WIP** category. CCC contains **148 established command cards** plus **1,538 WIP cards**: 33 prepared cards, 557 engine console commands, and 948 script functions. A card can contain paired actions when one command enables an override and another restores normal behavior. Prepared cards are separated into Ready to Test, Executed — Effect Unconfirmed, Executed — Issues, and Blocked — Known Crash groups. The top-right search covers only established commands on normal command screens and automatically switches to WIP-only search inside WIP. The raw engine library loads only when WIP is opened, and each group displays 100 entries at a time. Commands with an inconclusive result remain available for advanced users; known crash paths, confirmed unusable actions, and credential-handling commands remain unavailable. Hover or focus the large disabled Unavailable action to see the underlying console command. Verification status is documented in [`COMMAND_CATALOG.md`](COMMAND_CATALOG.md).

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

The native plugin exposes direct game reads for inventory, supported reference inspection, player/companion/ship actor values, current spaceship, Game Settings, and quest state. Unsupported inspections are visibly unavailable instead of executing a known-broken adapter. Results open in a dedicated window and can be reopened from Activity Log.

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
- `artifacts/`
- `.xmake/`
- `.osfui/`

The local `native/lib/commonlibsf/` checkout is also ignored because it can be recreated automatically.

## Development notes

- `npm run build` builds both the native plugin and OSF UI frontend.
- `npm run build:native` builds only the native plugin after ensuring CommonLibSF is available.
- `npm run setup:deps` restores CommonLibSF without starting a build.
- `npm run check` runs the OSF UI checks.

Release-specific changes are recorded under [`docs/`](docs/), including [`RELEASE_NOTES_v1.0.12.md`](docs/RELEASE_NOTES_v1.0.12.md).
