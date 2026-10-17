# Console Command Center

Console Command Center turns Starfield console commands into a searchable in-game menu for mouse, keyboard, and controller. It provides command inputs, safety warnings, ID selection, quest tools, mod scanning, editable command batches, and read-only Results popups.

**Current release: v1.3.0.** See the [changelog](CHANGELOG.md) for release history and [release validation](RELEASE_VALIDATION.md) for completed checks and remaining in-game checks.

## Requirements

- Starfield runtime **1.16.244**
- [Starfield Script Extender (SFSE)](https://sfse.silverlock.org/), matching that runtime
- Address Library for SFSE Plugins
- OSF UI **2.0.0 or newer**
- OSF Settings **1.0.0 or newer**
- Microsoft Edge WebView2 Runtime

Optional official content is identified by its loaded plugin. Shattered Space and Terran Armada require their respective DLC; Free Lanes records require its update module. Packaged optional records can remain searchable when their plugin is absent, with runtime-ID copying, picker use, and gameplay actions disabled.

## Install and open

Install the Nexus-ready ZIP with a mod manager, or copy its `SFSE` folder into Starfield's `Data` folder. Launch through SFSE. Open **MOD SETTINGS** in the pause menu, or bind **Open Mod Settings** to a key such as F10 in OSF Settings, then select **Console Command Center** from the launcher.

For updates, install the complete archive, including `SFSE/Plugins/ConsoleCommandCenter.dll`, and restart the game. Updating only the web page can leave new native features unavailable. Keep OSF browser data and the user CCC folder to preserve favorites, history, reports, and batch files.

CCC v1.0.13 and later use `SFSE/Plugins/OSF/UI/views/console.command-center/`. When upgrading from an older layout, remove the obsolete `SFSE/Plugins/OSFUI/views/console.command-center/` folder. Uninstall by removing the current view folder and DLL.

Make a manual save before changing quests or important game state. Each page has contextual **Help**, and the first-time overview remains available there.

## Features

- **149 established command cards** and **1,532 WIP entries** (39 prepared cards and 1,493 engine commands/script functions).
- Search, command and ID favorites, Recent commands, saved batch favorites, and Activity Log. Favorite IDs use compact selectable rows with their details and supported actions on the right.
- **ID Browser: 23,308 packaged entries**, including reviewed ships, vehicle forms, workshop objects, and supported Free Lanes/Terran Armada record types. Duplicate names can identify different underlying records.
- **Settings catalog: 8,705 game-setting references**, including 2,312 supplied Form IDs. Inspect Current Value uses a setting name; workbook values are labeled reference values, and editing is disabled.
- **Quest Browser: 2,568 quests and 19,061 recorded stage indexes** from Base Game, Shattered Space, Free Lanes, and Terran Armada. Packaged quests are kept out of ID Browser.
- **Mod Browser:** manually scan loaded mods and Official Creations, browse categories, search one plugin or every scanned plugin, and inspect scanned quest stages.
- Editable user-owned `.txt` command batches, persistent in-session drafts, synchronized line numbers, Clear, Refresh, and Add to Batch.
- Optional **On Load Auto-Run**, controlled by a master switch and per-file selections. Fresh empty folders receive three sample batches without Auto-Run enabled.
- Controller navigation, scrolling, dialogs, and alphabetic/numeric/hexadecimal/symbol text entry.
- Persistent **Advanced Options** and **Light/Dark Mode**, plus **Dev Mode** test reports and a combined text export.

## Interface Settings

**Experimental in v1.3.0:** Supported ID Browser and mod assets offer an inline preview and **3D Viewer**, opened with **Y** on a controller. The viewer reads installed geometry and materials without screenshots or online processing. Low, Medium and High preserve the original mesh and share material roughness, studio reflections, tone mapping, normal maps and a movable light; texture and screen resolution differ by preset. Previous Ultra selections migrate to High. Previews start without a mannequin; supported wearables can enable one and choose male/female. Colors start at Low resolution and upgrade in place, retaining the camera. Controller controls include direct stick pan/rotation, analog-trigger zoom, texture toggle, quality selection and light/brightness modes. ID Browser controller navigation returns to the selected row after closing the viewer and stays inside the middle list for Up/Down. Cap branding and Barrett previews use original game textures without changing installed texture mods. Your player character is not used. See [Model previews](docs/MODEL_PREVIEWS.md).

Open **Settings** beside Help. Dark Mode and Advanced Options off are the defaults. Advanced Options reveals WIP commands, the ID Browser Settings catalog, Cells, Ship Parts / Other Forms, reference-only items, and Internal / System quests. Basic-mode searches and ID Favorites hide these records without deleting saved favorites. Locations remain separate from Cells.

Categories are alphabetical, with WIP last in Commands and Settings last in ID Browser. Quest sections are ordered Base Game, Shattered Space, Free Lanes, and Terran Armada. Reference-only records sort below normal records, alphabetically within each group, and do not offer gameplay quick actions.

Dark Mode uses blue-black backgrounds, slate rows, gray selection, pale text, and muted blue detail headers. Light Mode uses pale gray surfaces, teal rules, charcoal selection, and yellow accents. Both keep distinct warning and danger indicators.

## Browsers and quest tools

ID Browser has conservative quick actions for supported record types. Ship and vehicle spawning is experimental: placement, boarding, ownership, and normal registration are not guaranteed. Reviewed ships cover 104 names and 152 unique Base IDs; components and vehicle module forms remain reference-only. See [ID catalog sources](docs/ID_CATALOG_SOURCES.md).

Opening a browser never starts a mod scan. Select **Scan Mods** once per session to collect supported records and recorded QUST stage indexes. Other Bethesda creations stay under **Official Creations** in Mod Browser; official modules already packaged with CCC are omitted from the primary scan to avoid duplication. See [Mod ID catalogs](docs/MOD_ID_CATALOGS.md) and [display-name guidance](docs/MOD_ID_CATALOGS.md#display-names).

Packaged and scanned quests provide live inspection and confirmed Start, Stop, Complete, Reset, and Set Stage actions. Stage indexes describe the plugin's structure, not a guarantee that skipping a stage is safe. Some QUST records are internal systems rather than journal missions. Mod scan stage lists can differ from later plugin overrides.

## Command batches

Files live in `Documents\My Games\Starfield\Console Command Center\Command Batches`. Write one command per line; blank lines and lines beginning with `#` are ignored. Load fills the editor; Review Commands opens confirmation. Existing browser-stored batches migrate without overwriting different contents. Updates do not replace user files.

There is no 100-command limit. Native validation still limits file size to 1 MB and command length to 1,024 characters; the saved-file list includes up to 100 files. On Load Auto-Run waits three seconds after existing-save loads, reads selected files fresh, and executes them alphabetically. Repeated toggles and additive commands run again on each load. See [Command batches](docs/COMMAND_BATCHES.md).

## Dev Mode feedback

Click the bottom-left dot five times to toggle Dev Mode. Item rows in ID Browser, Mod Browser and Favorites offer **Working**, **Issues** and **Reference Only**. Working and Reference Only save immediately; Issues opens a comment popup. Not noticeable uses orange with a question mark. Commands, quests and settings retain the Test Report popup. Plain Working confirmations stay local. Export Reports writes queued reports to the user CCC folder without clearing saved row outcomes. Dev Mode also marks unresolved model materials with a red/blue checker. See [Dev Mode](docs/DEV_MODE.md).

## Build from source

Install Node.js/npm, Git, XMake, and the SFSE/CommonLibSF C++ build prerequisites. The native build restores the CommonLibSF revision pinned in `native/setup-deps.mjs`, including submodules. XMake restores nlohmann_json and static zlib 1.3.2.

~~~powershell
npm ci
npm test
npm run check
npm run build
~~~

`npm run setup:deps` restores the pinned native dependency explicitly. `npm run dev:game` starts the OSF preview and deploys to its configured local mod directory. `npm run package` checks, tests, builds, and creates the Nexus-ready and full-source ZIPs under `artifacts/`. `npm run clean` removes disposable build caches while preserving compiled output, artifacts, dependencies, and local preview settings.

Generated catalogs are committed so normal builds do not need the game data or spreadsheet. Catalog extraction inputs, dependencies, binaries, local caches, and prior ZIPs are excluded from the published source. Supporting scripts regenerate catalogs from separately supplied source inputs. See [Development](docs/DEVELOPMENT.md) for the source layout, dependency restoration and packaging workflow.

## License

CCC is **GPL-3.0-or-later with the CommonLibSF Modding Exception and GPL-3.0 Linking Exception (with Corresponding Source)**. See [LICENSE](LICENSE), [EXCEPTIONS](EXCEPTIONS), and [third-party notices](THIRD_PARTY_NOTICES.md) for dependency pins, licenses, and source restoration.

Current test findings are maintained in [Command catalog](COMMAND_CATALOG.md) and [Console test findings](docs/CONSOLE_TEST_FINDINGS.md). Candidate future improvements are in [Future features](docs/FUTURE_FEATURES.md).

Test Report result bars in Dev Mode: Working uses green with a checkmark; Issues uses yellow with an exclamation; choose Not noticeable under Issues for orange with a question mark. Reference Only uses dark gray with a struck-through name. Latest explicit results remain saved after export and restart; comment-only reports preserve the existing classification. Plain Working confirmations stay local unless a comment is added. Dev Mode also marks unresolved model textures with a red/blue checker in both preview sizes.
