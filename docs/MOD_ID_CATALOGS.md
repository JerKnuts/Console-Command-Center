# Mod ID detection

Console Command Center detects supported records created by the plugins currently loaded in Starfield. Players do not need xEdit, catalog files, or a separate setup step.

Open **Mod Browser** and select **Scan Mods** to scan the active load order and collect supported IDs in one operation. Plugins remain separate from the packaged records in **ID Browser**. Opening CCC, ID Browser, or Mod Browser does not start a scan. Results remain available for the current game session; select **Scan Mods** again after restarting the game or changing the load order.

Bethesda plugins whose filenames begin with `SFBGS` are included under **Official Creations**. Community plugins appear under **Mods**. Both groups are sorted by supported ID count after a scan.

The native scanner reports plugin filenames because Starfield plugins do not contain a reliable Nexus or Creations page title. CCC translates known filenames through its bundled display-name map. Unknown plugins use a clean filename-derived fallback. The raw plugin filename is preserved in Selected ID details and remains searchable. See [Mod display names](MOD_DISPLAY_NAMES.md) for the lookup format and contribution guidance.

Large catalogs are divided into collapsible record categories such as Weapons, Armor, Ships, Ship Parts & Other Forms, and Quests. A **base form** is Starfield's generic `GBFM` data record. Mods use GBFM records for complete ships, but also for engines, grav drives, reactors, shields, fuel tanks, landing gear, weapons, templates, and other reusable definitions. CCC uses Editor ID naming to put complete ships under **Ships** and supporting GBFM records under **Ship Parts & Other Forms**. Category contents are created only when opened, which keeps very large plugins responsive.

With no mod selected, **Search All** searches IDs across every scanned plugin. After selecting a mod, **Search Mod** limits results to that plugin. Global results identify their source mod.

## What the scan reads

CCC first uses Starfield's loaded plugin and record lists. On runtimes where those lists are unavailable, it automatically reads the active `loadorder.txt` and the plugin headers exposed through the game's `Data` folder. Mod Organizer 2 virtualizes both locations for the running game. Vortex and direct/Creations installations expose the same in-game load order and Data files, so they use the same scanner.

Only record types CCC can present or act on safely are included:

- Weapons, armor, ammunition, aid, miscellaneous items, books, perks, powers, NPCs, and object mods
- Factions, quests, cells, locations, ship/base forms, furniture, and weather

Each record is assigned to its owning full, medium, or small plugin from its runtime Form ID. This naturally excludes ordinary overrides: if a compatibility patch changes a base-game weapon, the Form ID is still owned by the base game and the weapon remains in the built-in catalog. Records created by the patch receive the patch's own Mod Catalog entry.

Deleted records are skipped. CCC asks the running game for each record's localized display name or Editor ID; when neither exists, the record type and Form ID are shown. The scan has a hard session limit of 100,000 mod records.

## Performance and lifetime

Full scanning happens only when **Scan Mods** is selected. The progress window remains visible with an elapsed timer, plugin counter, and running ID total while CCC discovers loaded plugins and reads supported records. ID Browser never loads or scans mod catalogs. The primary scanner copies pointers while holding Starfield's read lock. The fallback walks only plugin record headers, then resolves matching IDs through the running game. It does not continually scan during gameplay or modify plugin files.

Every manual **Scan Mods** run creates an Activity Log entry. **Open Results** shows the active load-order count, discovered and loaded plugin counts, supported ID total, zero-ID and failed plugin counts, opened and missing plugin files, and elapsed time. Failed scans record their error and elapsed time as well.

The Mod Browser tab displays the total number of scanned mod IDs. Any packaged or scanned record can be added to Favorites. CCC stores the record metadata needed to display it and reopen the correct browser. Favoriting an ID does not copy or modify its plugin and does not trigger a scan.
