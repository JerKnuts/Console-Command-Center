# Console Command Center

Console Command Center turns Starfield console commands into a searchable in-game menu for mouse, keyboard, and controller. It provides command inputs, ID selection, quest tools, mod scanning, editable command batches, read-only Results popups, item previews, and book/slate playback.

**Current release: v1.4.0.** See the [changelog](CHANGELOG.md) for release history and [release validation](RELEASE_VALIDATION.md) for completed checks and remaining in-game checks.

Translation authors can use the [JSON/CSV translator guide](docs/TRANSLATION_GUIDE.md). CCC uses a web interface; SWF editing is not required. Translation packs are optional and fall back to English.

## Requirements

- Starfield runtime **1.16.244**
- [Starfield Script Extender (SFSE)](https://sfse.silverlock.org/), matching that runtime
- Address Library for SFSE Plugins
- OSF UI **2.0.0 or newer**
- OSF Settings **1.0.0 or newer**
- Microsoft Edge WebView2 Runtime

Optional official content is identified by its loaded plugin. Shattered Space and Terran Armada require their respective DLC; Free Lanes records require its update module. Packaged optional records can remain searchable when their plugin is absent, with runtime-ID copying, picker use, and gameplay actions disabled.

## Install and open

Install the Nexus-ready ZIP with a mod manager, or copy its `SFSE` folder into Starfield's `Data` folder. Launch through SFSE. Open **MOD SETTINGS** in the pause menu, or bind **Open Mod Settings** to a key such as F10 in OSF Settings, then select **Console Command Center** from the launcher. To open CCC directly, bind **Open Console Command Center** on its OSF Settings page (initially unbound). Restart Starfield after installing an update that adds a binding.

For updates, install the complete archive, including `SFSE/Plugins/ConsoleCommandCenter.dll`, and restart the game. Updating only the web page can leave new native features unavailable. Keep OSF browser data and the user CCC folder to preserve favorites, history, reports, and batch files.

CCC v1.0.13 and later use `SFSE/Plugins/OSF/UI/views/console.command-center/`. When upgrading from an older layout, remove the obsolete `SFSE/Plugins/OSFUI/views/console.command-center/` folder. Uninstall by removing the current view folder and DLL.

Make a manual save before changing quests or important game state. Each page has contextual **Help**, and the first-time overview remains available there.

## Menu keyboard shortcut

The assigned CCC keyboard shortcut also opens CCC over inventory, containers, shops, the data menu, maps, missions, skills, research and crafting screens. Closing CCC returns to the existing menu. This uses Starfield's saved Controls binding; finish saving a rebind before using it. The menu fallback does not handle controller bindings. Pause/Controls, text-entry dialogs, loading screens and OSF Settings are excluded. The separate two-press issue remains under investigation.

## Known bugs

- **The CCC keybind can require two presses.** This has been reported with F10 and F11, including after closing CCC with Escape or its Close button. Switching away from Starfield and back may temporarily restore one-press opening. The cause remains under investigation.
- **CCC can remain stuck on Loading in OSF UI.** The keybind may also stop opening CCC, particularly after repeated teleports. If this happens, wait **10–15 minutes**, then try opening CCC again; the page has recovered within the same game session in testing, but recovery is not guaranteed. If it remains stuck, restart Starfield. Native-connection retries in 1.3.36 can restore descriptions/stats after the page recovers; they do not fix the loading hang itself.

## Features

- **Command Browser:** alphabetical commands within categories, with WIP and engine-reference entries available through Advanced Options. Command-specific instructions and review dialogs remain; Caution/Danger badges have been removed.
- Search, command and ID favorites, Recent commands, saved batch favorites, and Command Log. Favorite IDs use compact selectable rows with their details and supported actions on the right.
- **ID Browser: 23,308 packaged entries**, including reviewed ships, vehicle forms, workshop objects, and supported Free Lanes/Terran Armada record types. Duplicate names can identify different underlying records.
- **Descriptions and base stats:** inspect aid effects, gear values, skill ranks, traits and powers before adding them. Description/stats appear on the left, with a sticky model preview on the right. See [item details and reading](docs/ID_BROWSER_DETAILS.md).
- **Books / Notes:** read books, notes and supported text slates in a scrolling popup. Image slates share this category; embedded image layouts are not decoded. Reading does not add inventory or grant skill-book rewards.
- **Audio Slates:** listen inside CCC while the game stays paused, with themed playback controls, volume, speed and a scrolling line transcript. Missing voice files report unavailable. See [books and slates](docs/AUDIO_SLATES.md).
- **Item previews:** 4,822 official-item thumbnail mappings, on-demand mod still previews, and a full Model Viewer for supported items. Books/slates use stills with Read/Listen beneath them; complete ships have no viewer.
- **JSON translations:** install a separate language pack, choose it in Settings or use automatic selection, and reload translations without editing SWF files.
- **Advanced Settings in Command Browser:** Search grouped game-setting references, inspect live values, review numeric changes, and reset to supplied base-game values. String settings remain read-only.
- **Quest Browser: 2,568 quests and 19,061 recorded stage indexes** from Base Game, Shattered Space, Free Lanes, and Terran Armada. Packaged quests are kept out of ID Browser.
- **Mod Browser:** scan loaded mods and Official Creations, sort by mod or category, search scanned records and inspect quest stages.
- Editable user-owned `.txt` command batches, persistent in-session drafts, synchronized line numbers, Clear, Refresh, and Add to Batch.
- Optional **On Load Auto-Run**, controlled by a master switch and per-file selections. Fresh empty folders receive three sample batches without Auto-Run enabled.
- Controller navigation, scrolling, dialogs, and alphabetic/numeric/hexadecimal/symbol text entry.
- Persistent **Advanced Options** and **Light/Dark Mode**, plus **Dev Mode** test reports and a combined text export.

Terran Armada, Free Lanes and Shattered Space display names are matched to each plugin’s own English localization, including books, notes, equipment and locations. See [Shattered Space name verification](docs/SHATTERED_SPACE_NAMES.md) and [Free Lanes name verification](docs/FREE_LANES_NAMES.md).

In Dev Mode, Working is a manual toggle: click it again to clear the designation. Reporting an issue retains the command in its displayed category rather than making it disappear into WIP. Explicitly reviewed unresolved commands can still be assigned to WIP. Saved outcomes survive reload and report export. Reporting never executes the command or clears unavailable-action blocks.

Workshop / Outpost Objects offer **Spawn Object** for supported physical records. Review places one object at the player; it does not register outpost ownership, add a construction recipe, or create power/storage connections. Reference-only and unavailable records have no spawn action.

## Interface Settings

Supported loaded items in ID Browser, Mod Browser and Favorites offer a still preview and, where supported, **Model Viewer** without Advanced Options. The viewer reads installed meshes/materials, with Low through Ultra quality, progressive color loading, studio reflections, smooth object/ground shadows and movable lighting. Complex Ultra loads can still be slow. Upgrades retain the camera. Supported wearables can show an optional male/female mannequin; its on/off choice is remembered for the page session. Suits use neck/head only; helmets, hats and packs use full-size mannequins. Your player character is not used. See [Model previews](docs/MODEL_PREVIEWS.md).

Advanced Options reveals technical record types, categories, plugin filenames and IDs. Descriptions, stats, requirements, model previews and Copy ID buttons remain available in ordinary browsing. Base stats can differ from equipped items because of upgrades, legendary effects, scaling and player skills.

Open **Settings** beside Help. Dark Mode and Advanced Options off are the defaults. Advanced Options reveals WIP commands, Advanced Settings in Command Browser, Locations (Reference Only), Ship Parts / Other Forms, reference-only items, and Internal / System quests. Basic-mode searches and ID Favorites hide these records without deleting saved favorites. Cells/Teleport is visible by default and provides teleport actions; reviewed internal/test cells are reference-only and hidden outside Advanced Options; Locations are reference-only area metadata.

Categories are alphabetical, with MISC, Advanced Settings and WIP pinned last in Command Browser. Quest sections are ordered Base Game, Shattered Space, Free Lanes, and Terran Armada. Reference-only records sort below normal records, alphabetically within each group, and do not offer gameplay quick actions. They use muted backgrounds and text with a red X before the name and a bordered Reference Only badge, including in Favorites and outside Dev Mode. Marking an ID Working clears its reference styling and restrictions.

Dark Mode uses blue-black backgrounds, slate rows, gray selection, pale text, and muted blue detail headers. Light Mode uses pale gray surfaces, teal rules, charcoal selection, and yellow accents. Viewer backgrounds default to Graphite in Dark Mode and Pearl in Light Mode, with additional subtle gradients and colors available in either Basic or Advanced mode. Background choices are saved separately by theme.

## Browsers and quest tools

ID Browser has conservative quick actions for supported record types. Ship and vehicle spawning is experimental: placement, boarding, ownership, and normal registration are not guaranteed. Reviewed ships cover 104 names and 152 unique Base IDs; components and vehicle module forms remain reference-only. See [ID catalog sources](docs/ID_CATALOG_SOURCES.md).

Opening a browser never starts a mod scan. Select **Scan Mods** once per session to collect supported records and recorded QUST stage indexes. Other Bethesda creations stay under **Official Creations** in Mod Browser; official modules already packaged with CCC are omitted from the primary scan to avoid duplication. See [Mod ID catalogs](docs/MOD_ID_CATALOGS.md) and [display-name guidance](docs/MOD_ID_CATALOGS.md#display-names).

Packaged and scanned quests provide live inspection and confirmed Start, Stop, Complete, Reset, and Set Stage actions. Stage indexes describe the plugin's structure, not a guarantee that skipping a stage is safe. Some QUST records are internal systems rather than journal missions. Mod scan stage lists can differ from later plugin overrides.

## Command batches

Batch Commander offers a flat **INCLUDED** list of ready-to-run, user-editable `.txt` files. Select a file to load it into the editor, then edit or review before running. Included files live in `Documents\My Games\Starfield\Console Command Center\Included Batches`; saved user batches remain in `Command Batches`. Refresh rereads files. Default installation preserves existing files, edits and deletions.

The INCLUDED library contains 25 files covering unlocks, supplies, outposts, components, cooking, playing cards, baseball caps, four weapon kits, suit/clothing collections and three settings presets with matching resets. The new kits use base-game item IDs. Reset files restore documented base-game values, not a backup of modded settings.

The editor highlights commands, targets, IDs, numbers and quoted strings, with italic comments. One command goes on each line; `#` and `;` start comments outside double-quoted strings. Blank lines are ignored. Normal text editing and controller entry remain available.

There is no 100-command limit. Files are limited to 1 MB and commands to 1,024 characters; the saved-file list includes up to 100 files. Optional On Load Auto-Run reads selected saved batches after an existing-save load. Adding items is additive on every execution. See [Command batches](docs/COMMAND_BATCHES.md).

## Dev Mode feedback

Click the bottom-left dot five times to toggle Dev Mode. Item rows in ID Browser, Mod Browser and Favorites offer **Working**, **Issues** and **Reference Only**. Working and Reference Only save immediately; Issues opens a comment popup. Not noticeable uses orange with a question mark. Command rows also offer Working and Issues; Working can be clicked again to clear it. Quests and settings retain the Test Report popup. Plain Working confirmations stay local. Export Reports writes queued reports to the user CCC folder without clearing saved row outcomes. The missing-material checkerboard is disabled; incomplete-material notices remain. Cell rows also offer **Identify Current Area**: review a name from the current game area, accept or decline, then export accepted changes with the reports. See [current-area identification](docs/CURRENT_AREA.md) and [Dev Mode](docs/DEV_MODE.md).

## Build from source

Install Node.js 24.x/npm, Git, XMake, and the SFSE/CommonLibSF C++ build prerequisites. The native build restores the CommonLibSF revision pinned in `native/setup-deps.mjs`, including submodules. XMake restores nlohmann_json and static zlib 1.3.2.

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
