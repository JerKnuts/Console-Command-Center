import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { normalizeModCatalogs } from '../src/views/console.command-center/main/mod-catalog.ts';
import { MOD_DISPLAY_NAMES } from '../src/views/console.command-center/main/mod-display-names.ts';

const nativeSource = readFileSync(new URL('../native/include/ModCatalogs.h', import.meta.url), 'utf8');
const nativeMain = readFileSync(new URL('../native/src/main.cpp', import.meta.url), 'utf8');
const nativeJson = readFileSync(new URL('../native/include/OSFUI_JSON.h', import.meta.url), 'utf8');
const browserSource = readFileSync(new URL('../src/views/console.command-center/main/main.ts', import.meta.url), 'utf8');
const catalogSource = readFileSync(new URL('../src/views/console.command-center/main/mod-catalog.ts', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../docs/MOD_ID_CATALOGS.md', import.meta.url), 'utf8');

test('mod catalogs scan only supported record arrays under Starfield read locks', () => {
  assert.match(nativeSource, /kMaxRecordsTotal = 100'000/);
  assert.match(nativeSource, /handler->formArrays\[std::to_underlying\(recordType\.formType\)\]/);
  assert.match(nativeSource, /RE::BSAutoReadLock lock\{ source\.lock \}/);
  assert.match(nativeSource, /form->IsDeleted\(\)/);
  assert.doesNotMatch(nativeSource, /GetAllForms|searchForms/);
});

test('full, medium, and small runtime IDs map back to their owning plugins', () => {
  assert.match(nativeSource, /owners\.small/);
  assert.match(nativeSource, /owners\.medium/);
  assert.match(nativeSource, /owners\.full/);
  assert.match(nativeSource, /\(formID >> 12\) & 0xFFF/);
  assert.match(nativeSource, /\(formID >> 16\) & 0xFF/);
  assert.match(nativeSource, /formID & 0xFFFFFF/);
  assert.match(nativeMain, /CCC::ModCatalogs::ScanPluginFiles\(\)/);
  assert.match(nativeMain, /RegisterRequest\("console\.command-center\.modCatalogs", &OnModCatalogs/);
});

test('scanner falls back to the active load order and virtual Data folder', () => {
  assert.match(nativeSource, /ActiveLoadOrder\(\)/);
  assert.match(nativeSource, /"loadorder\.txt"/);
  assert.match(nativeSource, /"plugins\.txt"/);
  assert.match(nativeSource, /std::filesystem::current_path\(\) \/ "Data"/);
  assert.match(nativeSource, /RuntimeFormID\(plugin, rawFormID\)/);
  assert.match(nativeSource, /loadedFilesSeen == 0/);
  assert.match(nativeSource, /ScanPluginRecords\(std::string pluginName\)/);
  assert.match(nativeMain, /RegisterRequest\("console\.command-center\.modCatalogRecords", &OnModCatalogRecords/);
});

test('native JSON responses tolerate malformed bytes in mod and localized names', () => {
  assert.match(nativeJson, /Json::error_handler_t::replace/);
});

test('Mod Browser keeps active plugins separate from the built-in ID Browser', () => {
  assert.match(browserSource, /data-view="mod-browser"/);
  assert.match(browserSource, /categoryLabel = 'MOD CATALOGS'/);
  assert.match(browserSource, /data-scan-mod-catalogs/);
  assert.doesNotMatch(browserSource, /data-refresh-mod-catalogs|data-scan-all-mod-catalogs/);
  assert.match(browserSource, /activeView === 'mod-browser'/);
  assert.match(browserSource, /entry\.source !== 'mod'/);
  assert.match(browserSource, /entry\.localFormId/);
  assert.match(browserSource, /entry\.plugin/);
  assert.match(catalogSource, /source: 'mod'/);
});

test('Mod Browser waits for a manual scan and scans fresh records for the current session', () => {
  const recordScan = nativeSource.slice(
    nativeSource.indexOf('inline OSFUI::API::Json ScanPluginRecords'),
    nativeSource.indexOf('inline OSFUI::API::Json ScanLoadedMods'),
  );
  assert.doesNotMatch(browserSource, /console\.command-center\.modCatalogCache/);
  assert.doesNotMatch(browserSource, /restoreCachedModCatalogs/);
  assert.doesNotMatch(recordScan, /ReadCachedRecords|WriteCachedRecords/);
  assert.match(browserSource, /Select Scan Mods to load this session\\'s mod IDs/);
});

test('one manual Scan Mods action discovers mods, captures IDs, and sorts the session results', () => {
  assert.match(browserSource, /sidebar-mod-actions[\s\S]*data-scan-mod-catalogs[\s\S]*\$\{modState\}/);
  assert.match(browserSource, /async function scanModCatalogs\(\)/);
  assert.match(browserSource, /console\.command-center\.modCatalogs/);
  assert.match(browserSource, /console\.command-center\.modCatalogRecords/);
  assert.match(browserSource, /for \(let index = 0; index < discoveredCatalogs\.length; \+\+index\)/);
  assert.match(browserSource, /right\.entries\.length - left\.entries\.length/);
  assert.match(browserSource, /left\.recordsLoaded \? left\.entries\.length : left\.reportedCount/);
  assert.match(browserSource, /return rightCount - leftCount \|\| left\.name\.localeCompare\(right\.name\)/);
  assert.match(browserSource, /availableCount > 0 \? availableCount\.toLocaleString\(\)/);
  assert.match(browserSource, /modCatalogScanAllComplete \? modCatalogs\.filter\(\(catalog\) => catalog\.entries\.length > 0\)/);
  assert.match(browserSource, /searchAllMods \? entry\.source === 'mod'/);
  assert.match(browserSource, /loaded \$\{total\.toLocaleString\(\)\} IDs for this session/);
  assert.match(browserSource, /scannedIdTotal \+= loaded\.entries\.length/);
  assert.match(browserSource, /\$\{idsFound\.toLocaleString\(\)\} IDs found/);
  assert.match(browserSource, /\$\{scannedIdTotal\.toLocaleString\(\)\} IDs found/);
  assert.match(nativeSource, /\{ "recordsLoaded", true \}, \{ "cached", false \}/);
});

test('Mod Browser navigation reports the cached ID total instead of the mod count', () => {
  assert.match(browserSource, /modCount\.textContent = modCatalogs\.reduce\(\(total, catalog\) => total \+ catalog\.entries\.length, 0\)\.toLocaleString\(\)/);
  assert.doesNotMatch(browserSource, /modCount\.textContent = modCatalogs\.length\.toLocaleString\(\)/);
});

test('large scans use small per-plugin replies without replacing a working catalog mid-scan', () => {
  assert.match(browserSource, /console\.command-center\.modCatalogs', \{\}, \{ timeoutMs: 0 \}/);
  assert.match(browserSource, /console\.command-center\.modCatalogRecords', \{ plugin: catalog\.plugin \}, \{ timeoutMs: 0 \}/);
  assert.match(browserSource, /const discoveredCatalogs = normalizeModCatalogs\(reply\)/);
  assert.match(browserSource, /Mod \$\{\(index \+ 1\)\.toLocaleString\(\)\} \/ \$\{total\.toLocaleString\(\)\}/);
  assert.match(browserSource, /The existing catalog was kept/);
  assert.doesNotMatch(browserSource, /catch \(error\) \{[\s\S]{0,120}modCatalogs = \[\]/);
  assert.match(nativeSource, /"recordsLoaded", false[\s\S]{0,260}"records", OSFUI::API::Json::array\(\)/);
});

test('Mod Browser groups large catalogs and switches between current-mod and global search', () => {
  assert.match(browserSource, /data-mod-search-scope="mod"/);
  assert.match(browserSource, /data-mod-search-scope="all"/);
  assert.match(browserSource, /id-browser-category-group/);
  assert.match(browserSource, /openModCategories/);
  assert.match(browserSource, /globalModSearch/);
  assert.match(browserSource, /Search every loaded mod ID/);
});

test('opening Mod Browser remains idle until Scan Mods is selected', () => {
  assert.match(browserSource, /id="mod-scan-overlay"/);
  assert.doesNotMatch(browserSource, /restoreCachedModCatalogs|modCatalogCache/);
  assert.doesNotMatch(browserSource, /if \(idCatalogLoaded\) void scanModCatalogs\(\)/);
  assert.match(browserSource, /Select Scan Mods to load this session\\'s mod IDs/);
});

test('manual Mod Browser scans add detailed Activity Log entries', () => {
  assert.match(browserSource, /addActivitySummary\('Mod Browser Scan', 'Mod Browser', 'Scan Mods', 'success'/);
  assert.match(browserSource, /Active load-order entries:/);
  assert.match(browserSource, /Supported IDs found:/);
  assert.match(browserSource, /Mods that could not be read:/);
  assert.match(browserSource, /Elapsed:/);
  assert.match(browserSource, /addActivitySummary\('Mod Browser Scan', 'Mod Browser', 'Scan Mods', 'error'/);
});

test('Search All searches scanned IDs without requiring a selected mod', () => {
  assert.doesNotMatch(browserSource, /activeView === 'mod-browser' && !modCatalog\) return \[\]/);
  assert.match(browserSource, /Search All Mod IDs/);
  assert.match(browserSource, /matching IDs \/ \$\{includedTotal\.toLocaleString\(\)\} scanned mod IDs/);
  assert.match(browserSource, /searchAllMods \? entry\.source === 'mod'/);
});

test('official Bethesda Creation plugins are scanned and grouped separately', () => {
  assert.match(nativeSource, /IsOfficialCreationPlugin/);
  assert.doesNotMatch(nativeSource, /IsBuiltInPlugin[\s\S]{0,240}starts_with\("sfbgs"\)/);
  assert.match(catalogSource, /officialCreation = \/\^sfbgs/);
  assert.match(browserSource, /Official Creations/);
  assert.match(browserSource, /catalog\.officialCreation/);
});

test('Mod Browser distinguishes complete ships from templates and ship components', () => {
  const catalogs = normalizeModCatalogs({
    ok: true,
    directory: 'Data',
    totalRecords: 4,
    catalogs: [{
      file: 'darkstar.esm', loaded: true, name: 'DarkStar', plugin: 'darkstar.esm',
      records: [
        { label: 'Interceptor', value: '58001000', localFormId: '1000', type: 'GBFM', category: 'Ships & Base Forms', editorId: 'DarkStar_Ship_Interceptor_Mk01' },
        { label: 'Template', value: '58001001', localFormId: '1001', type: 'GBFM', category: 'Ships & Base Forms', editorId: '_DarkStarShipTemplate' },
        { label: 'Reactor', value: '58001002', localFormId: '1002', type: 'GBFM', category: 'Ships & Base Forms', editorId: 'SMC_Reactor_DarkStar' },
        { label: 'Engine', value: '58001003', localFormId: '1003', type: 'GBFM', category: 'Ships & Base Forms', editorId: 'DarkStar_Ship_Engine_Mk01' },
      ],
    }],
  });
  assert.deepEqual(catalogs[0].entries.map((entry) => entry.category), [
    'Ships', 'Ship Parts & Other Forms', 'Ship Parts & Other Forms', 'Ship Parts & Other Forms',
  ]);
  assert.equal(catalogs[0].name, 'DarkStar - Total Gameplay Overhaul');
  assert.match(browserSource, /'Ships', 'Ship Parts & Other Forms'/);
});

test('bundled plugin aliases provide readable mod names with filename fallback', () => {
  assert.ok(Object.keys(MOD_DISPLAY_NAMES).length >= 800);
  assert.equal(MOD_DISPLAY_NAMES['cross heavy industries m3.esm'], 'Cross Heavy Industries - Model 3 Ship Modules');
  assert.equal(MOD_DISPLAY_NAMES['kinggathcreations_spaceship.esm'], 'Watchtower');
  assert.match(catalogSource, /modDisplayName\(catalog\.plugin, catalog\.name\)/);
  assert.match(catalogSource, /new Set\(\[displayName, catalog\.name!, catalog\.plugin!/);
});

test('automatic scan documentation covers ownership, filtering, and limits', () => {
  assert.match(docs, /do not need xEdit/);
  assert.match(docs, /full, medium, or small plugin/);
  assert.match(docs, /Mod Organizer 2 virtualizes both locations/);
  assert.match(docs, /Deleted records are skipped/);
  assert.match(docs, /100,000 mod records/);
});

test('native catalog replies become searchable mod entries with source metadata', () => {
  const catalogs = normalizeModCatalogs({
    ok: true,
    directory: 'Data/SFSE/Plugins/ConsoleCommandCenter/catalogs',
    totalRecords: 1,
    catalogs: [{
      file: 'example.json', loaded: true, name: 'Example Arsenal', plugin: 'ExampleArsenal.esm', pluginKind: 'small',
      records: [{ label: 'Example Rifle', value: 'FE042800', localFormId: '800', type: 'weap', category: 'Weapons', editorId: 'Example_Rifle' }],
    }],
  });
  assert.equal(catalogs.length, 1);
  assert.equal(catalogs[0].pluginKind, 'small');
  assert.equal(catalogs[0].recordsLoaded, true);
  assert.equal(catalogs[0].reportedCount, 1);
  assert.deepEqual(catalogs[0].entries[0], {
    label: 'Example Rifle', value: 'FE042800', type: 'WEAP', category: 'Weapons', detail: undefined,
    editorId: 'Example_Rifle', keywords: ['Example Arsenal', 'ExampleArsenal.esm', '800', 'Example_Rifle'],
    source: 'mod', sourceName: 'Example Arsenal', plugin: 'ExampleArsenal.esm', localFormId: '800',
  });
});
