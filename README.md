# Console Command Center

Console Command Center is an in-game console-command interface for **Starfield**. It provides a searchable mouse-and-keyboard menu for useful console commands without requiring the player to type them manually every time. Controller support is in development for a future release.

The mod uses an OSF UI frontend and a native SFSE/CommonLibSF plugin to execute commands inside Starfield.

## Project status

**Current development version: v0.3.7 Beta. Current published release: v0.3.3.** The current build corrects generated ID labels, removes internal catalog records, and prevents Quest Browser inspections from invoking the unreliable console-output capture route. Follow [the current test checklist](TEST_BUILD_RESULT_ACTIONS.md). Historical build notes live under [`docs/`](docs/).

The core command execution system is working in-game. The command catalog is being tested command-by-command, and current development focuses on input reliability. The current interface supports mouse and keyboard. Controller navigation, activation, text entry, and adaptive larger controls are being developed together for a future release.

Commands that rely on known curated IDs use a reusable searchable Reference ID Picker instead of crowded preset-button grids. A separate **ID Browser** searches the catalog packaged with CCC.

Some commands can affect achievements, progression, quests, save-game state, NPCs, ships, or world objects. Make a manual save before using commands that modify important game state.

## Features

- Native Starfield console-command execution
- Native read-only results for supported inventory, reference, actor-value, Game Setting, and ship inspections
- Searchable command library
- Category browsing
- Recent commands and favorites stay fixed at the top of the sidebar while the category list scrolls independently
- Multiline custom-command batches that execute one command per line
- Activity log
- Parameter inputs for Form IDs, amounts, values, Ref IDs, axes, and other arguments
- Searchable Reference ID Picker for supported faction, companion, weather, and popular location commands
- Standalone **ID Browser** with 16,518 included IDs, collapsed categories, selectable results, Copy ID, and conservative quick actions
- Searchable choice boxes for packaged perks, skills, traits, Starborn powers, and known removable environmental effects
- Confirmation before execution
- Caution and Danger warnings
- Compact mouse-and-keyboard interface; controller support is in development
- Compact Starfield-inspired OSF UI
- Searchable **Quest Browser** with quest actions and recorded stage indexes
- Guided quest-stage skip choices with unavailable diagnostics clearly disabled
- Curated ID choices use the same compact field + **CHOOSE ...** box used by the companion-affinity commands; manual ID entry remains available


## ID Browser and Reference ID Picker

The standalone **ID Browser** is a dedicated utility screen for finding Form/Reference IDs without leaving CCC. It searches **16,518 included IDs** instantly by name, Form ID, type, category, and Editor ID. The catalog covers weapons, armor and apparel, ammunition, aid, resources and miscellaneous items, books and notes, skills, traits, powers, effects, object mods, factions, NPCs, named locations and cells, and weather. Location and cell selections can copy either the Form ID or Editor ID. Shattered Space records display an expansion requirement and use cleaned Editor IDs where a verified localized display name is unavailable. Long descriptive labels, internal factions, creature attacks, test weapons, and known subtitle collisions are excluded. Large categories load 100 rows at a time so browsing and searching stay responsive. Every selected result offers **Copy ID** plus a conservative quick action when the record type is unambiguous.

CCC does not scan Starfield's live form memory. That experimental path caused an access violation during test9 and was removed. Expansion-only records carry a visible requirement such as **Shattered Space DLC**.

The reusable Reference ID Picker remains the compact command-specific chooser. **Pay Bounty** opens bounty-relevant factions, companion affinity commands open Sarah Morgan, Barrett, Sam Coe, and Andreja, and weather commands open common weather records. Selecting an entry fills the normal command input; users can still type any valid hexadecimal ID manually. Inline preset-button grids are intentionally avoided.

## Quest Browser

ID Browser, Quest Browser, Custom Command, and Activity Log live in a dedicated horizontal utility bar along the bottom of CCC. Recent and Favorites remain fixed in the left sidebar while Categories scroll independently.

Quest Browser includes recorded quest-stage selections for inspecting or advancing quest state. Every packaged Quest ID and stage number is structurally validated against its installed master file. Console Command Center uses those mappings to execute vanilla commands such as:

```text
setstage <QuestFormID> <Stage>
```

Quest changes are intentionally marked **Danger** because starting, completing, or forcing a stage can skip dialogue, scripts, rewards, scenes, prerequisites, or other quest state. Use these actions on a backup or disposable save. Some quests do not appear in the mission log until a stage is activated. Reset clears recorded stages and removes the quest from the log without restarting it.

Quest Browser contains 2,318 base-game and Shattered Space quest records with 16,844 recorded stage indexes. It supports searching by quest name, Editor ID, Form ID, source, and stage, plus confirmed Start, Stop, Complete, Reset, and Set Stage actions. Shattered Space entries are labeled in the interface. **Check Current Stage** and **Show Stage History** are visibly unavailable until CCC has a verified native quest-state reader; they do not use the unreliable console-capture fallback.

See [`QUEST_BROWSER.md`](QUEST_BROWSER.md) for details.

## Command catalog

The command library is deliberately curated instead of trying to expose every internal developer command. v0.3.7 contains **141 curated command entries** plus the standalone ID Browser and Quest Browser datasets. Nine known-broken entries remain visible but disabled with an explanation. Verification status is documented in [`COMMAND_CATALOG.md`](COMMAND_CATALOG.md).

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
- `artifacts/`
- `.xmake/`
- `.osfui/`

The local `native/lib/commonlibsf/` checkout is also ignored because it can be recreated automatically.

## Development notes

- `npm run build` builds both the native plugin and OSF UI frontend.
- `npm run build:native` builds only the native plugin after ensuring CommonLibSF is available.
- `npm run setup:deps` restores CommonLibSF without starting a build.
- `npm run check` runs the OSF UI checks.

Release-specific changes are recorded in [`docs/RELEASE_NOTES_v0.3.7.md`](docs/RELEASE_NOTES_v0.3.7.md).
