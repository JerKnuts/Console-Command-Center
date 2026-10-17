# Release validation — 1.3.0

## Scope

This release cleans and documents the maintained source without changing preview or command behavior. It retains the existing Custom Command interface and only Basic Supplies, Workshop Materials and Ballistic Starter Kit. The expanded INCLUDED batch library and comment-parser update are deferred. User Documents files and installed game/mod files are not replaced by this cleanup.

## Repeatable build checks

Run from the source root on Windows with the toolchain in [Development](docs/DEVELOPMENT.md):

```powershell
npm ci
npm run check:release
npm run package
xmake build PreviewGeometryTests
.\build\windows\x64\release\PreviewGeometryTests.exe
xmake build SampleBatchTests
.\build\windows\x64\release\SampleBatchTests.exe
```

`package` validates release metadata and documentation links, type-checks the UI, runs the automated test suite, builds native/UI output and packages both archives. Check that the source ZIP contains only maintained source, tests, fixtures, scripts, documentation and licenses; no dependencies, local settings, build products, game assets or deferred batch modules. Check that the runtime contains the DLL, current OSF UI view and bcdec license, with no legacy OSFUI view.

## Completed for 1.3.0

- Release versions agree across package metadata, lockfile, native build ID, UI and XMake. All 31 local Markdown file links resolve.
- All 197 automated tests pass; UI type-checking and native/UI release builds pass.
- PreviewGeometryTests and SampleBatchTests pass, including material/geometry safeguards and sample edit/deletion/existing-folder preservation.
- Both release ZIPs were inspected for deferred modules/APIs and obsolete/generated source files. The source contains 133 maintained files; required licenses, fixtures and dependency bootstrap scripts are present. Only the three original native sample definitions are included.
- The unpacked source is checked against the packaged source bytes. The native/UI package uses the current OSF UI view path and includes the decoder license.

The existing lazy-loaded ID catalog still produces Vite's large-chunk advisory; this is not a build failure. No game installation, user Documents files or published GitHub/Nexus release was changed. Historical feature changes remain in [Changelog](CHANGELOG.md).

## Existing audit evidence

The catalog material-variant audit scanned 977 ARMO and 93 WEAP records across four official plugins. All 1,606 rules for 388 default-variant entries pass the native reader; the fixture is retained. Both Syndicate Boss Suit body types were rendered with their three authored materials in prior browser checks. This establishes the corrected selection route, not complete game shader equivalence. See [Variant audit](docs/PREVIEW_VARIANT_AUDIT.md).

Prior material/overlay checks resolve the reported resource assets, authored inline colors and normal-only decals. The Ecliptic masked-layer limitation remains documented in [Model previews](docs/MODEL_PREVIEWS.md). Catalog expectations and regression fixtures remain part of the automated suite.

## In-game release smoke test

Install the complete 1.3.0 archive and restart Starfield through SFSE; do not clear OSF browser data or the user CCC folder.

- Confirm footer and native connection report 1.3.0, OSF UI 2.0 API and Native Ready. Confirm favorites, history and user batches survive.
- Browse Commands, ID Browser, Mod Browser, Quest Browser, Custom Command and Activity Log with mouse and controller. B closes one layer and restores selection/scroll; long lists remain within their panel.
- Inspect one read-only result, copy an ID and review a harmless command. Confirm blocked/reference-only records do not gain gameplay actions.
- Scan mods manually; inspect a community asset and an Official Creation. Opening a browser must not start a scan.
- Open a 3D Viewer using Y. Check pan without side stretching, rotate, pointer zoom, L2/R2 zoom, light marker tracking, brightness, texture toggle and Low/Medium/High upgrades. Close/reopen from Apparel and verify focus returns to the same list row.
- Compare Syndicate Boss Suit, Akila Security Uniform/gloves, a cap, Beowulf and representative miscellaneous objects to their intended game appearance. Test both bodies and mannequin toggles. Check documented layered/glass limitations separately.
- In Dev Mode, mark an item Working, Issues, Not noticeable and Reference Only; check green/check, yellow/exclamation, orange/question and gray/strikethrough. Only Issues needs text entry on item rows. Export a report; successful export clears pending reports without resetting row outcomes. Plain Working stays local.
- Save/load/refresh a user .txt batch, preserving edits. Blank/full-line # comments are ignored. Load must populate the editor before execution confirmation. Verify the three originals only seed an empty folder, and existing files/deletions are preserved.
- With a harmless selected batch, check Auto-Run once after an existing-save load and no run with the master switch off; this changes game state and must be checked deliberately in game.

These live checks are not claimed completed by source/package verification.
