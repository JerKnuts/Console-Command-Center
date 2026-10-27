# Mod ID detection

Console Command Center detects supported records created by the plugins currently loaded in Starfield. Players do not need xEdit, catalog files, or a separate setup step.

Open **Mod Browser** and select **Scan Mods** to scan the active load order and collect supported IDs in one operation. Plugins remain separate from the packaged records in **ID Browser**. Opening CCC, ID Browser, or Mod Browser does not start a scan. Results remain available for the current game session; select **Scan Mods** again after restarting the game or changing the load order.

Bethesda plugins whose filenames begin with `SFBGS` are included under **Official Creations**, except modules already packaged in the official catalogs (SFBGS004, SFBGS047, SFBGS00D, and SFBGS050). Their packaged item and quest records remain in ID Browser and Quest Browser rather than appearing twice. Community plugins appear under **Mods**. Both groups are sorted by supported ID count after a scan.

The native scanner reports plugin filenames because Starfield plugins do not contain a reliable Nexus or Creations page title. CCC translates known filenames through its bundled display-name map. Unknown plugins use a clean filename-derived fallback. The raw plugin filename is preserved in Selected ID details and remains searchable. See [Display names](#display-names) for the lookup format and contribution guidance.

Large catalogs are divided into collapsible record categories such as Weapons, Armor / Apparel, Ships, Ship Parts & Other Forms, and Quests. A **base form** is Starfield's generic `GBFM` data record. Mods use GBFM records for complete ships, but also for engines, grav drives, reactors, shields, fuel tanks, landing gear, weapons, templates, and other reusable definitions. CCC uses Editor ID naming to put complete ships under **Ships** and supporting GBFM records under **Ship Parts & Other Forms**. Category contents are created only when opened, which keeps very large plugins responsive.

With no mod selected, **Search All** searches IDs across every scanned plugin. After selecting a mod, **Search Mod** limits results to that plugin. Global results identify their source mod.

## What the scan reads

The manual scan discovers active plugins through Starfield's loaded file list where available, with active `loadorder.txt` / `plugins.txt` discovery as a fallback. It walks supported record headers in each plugin exposed through the game's `Data` folder and resolves owned records through the running game. Mod Organizer 2 virtualizes both locations for the running game. Vortex and direct/Creations installations expose the same in-game load order and Data files, so they use the same scanner.

Only record types CCC can present or act on safely are included:

- Weapons, armor, ammunition, aid, miscellaneous items, books, perks, powers, NPCs, and object mods
- Factions, quests, cells, locations, ship/base forms, furniture, and weather

Each record is assigned to its owning full, medium, or small plugin from its runtime Form ID. This naturally excludes ordinary overrides: if a compatibility patch changes a base-game weapon, the Form ID is still owned by the base game and the weapon remains in the built-in catalog. Records created by the patch receive the patch's own Mod Catalog entry.

Deleted records are skipped. CCC asks the running game for each record's localized display name or Editor ID; when neither exists, the record type and Form ID are shown. The scan has a hard session limit of 100,000 mod records.

## Performance and lifetime

Full scanning happens only when **Scan Mods** is selected. The progress window remains visible with an elapsed timer, plugin counter, and running ID total while CCC discovers loaded plugins and reads supported records. Opening ID Browser does not start scanning; its packaged catalog stays separate from the Mod Browser. The session scan walks plugin record headers, resolves matching IDs through the running game, and reads QUST payloads for stage indexes. It does not continually scan during gameplay or modify plugin files.

Every manual **Scan Mods** run creates a Command Log entry. **Open Results** shows the active load-order count, discovered and loaded plugin counts, supported ID total, zero-ID and failed plugin counts, opened and missing plugin files, and elapsed time. Failed scans record their error and elapsed time as well.

The Mod Browser tab displays the total number of scanned mod IDs. Any packaged or scanned record can be added to Favorites. CCC stores the record metadata needed to display it and reopen the correct browser. Favoriting an ID does not copy or modify its plugin and does not trigger a scan.

Select **Cancel Scan** to stop after the current plugin request completes. Cancellation preserves the previously completed catalog.

## Quest stages

Scan Mods reads QUST stage indexes from plugin records, including zlib-compressed records. Stage numbers are sorted and deduplicated and remain attached to the current runtime quest ID. Select a scanned quest to use recorded stage buttons or inspect current, running, completed, and per-stage completion state.

Stage indexes come from the scanned owning plugin file, not quest journal objectives; later plugin overrides may change those stages, and they do not guarantee that skipping a stage is safe. If stage extraction fails, the quest remains available and reports the error. Rescan after updating to a version with stage scanning.

## Display names

Starfield exposes loaded plugins by filename, such as `darkstar.esm`. A plugin file does not reliably contain the public title used on Nexus Mods or Creations, and the installation folder name belongs to the local mod manager rather than the running game.

Console Command Center therefore uses a case-insensitive filename lookup in `src/views/console.command-center/main/mod-display-names.ts`. The bundled map includes 853 aliases generated from a broad real-world Starfield load order, with ambiguous high-profile entries reviewed by hand. Examples include:

- `darkstar.esm` → `DarkStar - Total Gameplay Overhaul`
- `Cross Heavy Industries M3.esm` → `Cross Heavy Industries - Model 3 Ship Modules`
- `du_retrograde.esm` → `Dark Universe - Retrograde`
- `kinggathcreations_spaceship.esm` → `Watchtower`

Blueprint plugins retain separate filename keys. A readable alias does not change plugin ownership or the Official Creations grouping.

An alias changes only the title shown in the Mod Browser. CCC still displays the raw plugin filename in Selected ID details and includes it in search keywords. If a plugin has no alias, CCC keeps the scanner's cleaned filename-derived name.

### Adding or correcting a name

Add one entry to `MOD_DISPLAY_NAMES` using the complete lowercase plugin filename as the key:

```ts
'exampleplugin.esm': 'Example Mod Title',
```

Keep `.esm`, `.esp`, or `.esl` in the key. Prefer the title published by the mod author. Do not include a version number unless it is part of the permanent mod title. The fallback means missing entries never prevent scanning or browsing.

## Browser grouping (1.3.15)

Below Scan Mods, Sort by Mod shows the existing plugin list. Sort by Category shows record categories across all scanned mods, with counts and an All Categories option. Selecting a category lists its items with source-mod labels. Switching grouping does not rescan or execute commands. Search All searches all scanned records; Search Mod is enabled when a plugin is selected in the mod view. Reference visibility still follows Advanced Options.
