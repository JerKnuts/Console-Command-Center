# Development and source layout

The release source contains the files needed to build, test and maintain CCC. It intentionally omits restored dependencies, compiled output, local OSF settings, extracted catalog inputs, old archives, obsolete screenshot/background experiments. Generated runtime catalogs and their regression fixtures are included so a normal build needs no installed game data or workbook.

## Build on Windows

Install Node.js/npm, Git, XMake and Visual Studio C++ Build Tools with a Windows SDK (the CommonLibSF toolchain uses C++23). Put their executables in PATH. OSF UI and Starfield are needed for live testing, not UI type-checking.

```powershell
npm ci
npm run check:release
npm test
npm run check
npm run build
npm run package
```

The native build restores the exact CommonLibSF revision in native/setup-deps.mjs and recursive submodules. XMake restores nlohmann_json and static zlib 1.3.2. First-time setup therefore needs network access. `npm run setup:deps` restores CommonLibSF explicitly. Dependency licenses, source revisions and restoration instructions are in [Third-party notices](../THIRD_PARTY_NOTICES.md).

`npm run package` performs metadata/link checks, UI checking, automated tests, native/UI builds and ZIP creation. Outputs are artifacts/Console-Command-Center-v1.3.15-Nexus.zip, artifacts/console-command-center-v1.3.15-source.zip and a source manifest. `npm run clean` removes disposable caches according to scripts/clean.mjs; it does not erase user Documents files or install a release into the game.

## Maintained source

| Path | Purpose |
| --- | --- |
| src/views/console.command-center/main | UI, controller handling, preview renderer and bundled catalogs |
| src/osfui.d.ts | OSF browser API declarations |
| native/src | SFSE plugin and native request handlers |
| native/include | Command, scan, feedback, preview and OSF SDK headers |
| native/third_party | Unmodified bcdec decoder and license |
| scripts | UI checking/building, catalog extraction, audits and release packaging |
| tests | Browser/native regression checks and portable fixtures |
| docs | Current feature guides, catalog provenance and repeatable audit |
| batches/included | Canonical editable .txt defaults, bundled by the UI |
| xmake.lua | Native targets and build dependencies |
| osfui.config.ts / osfui.mock.ts | Local browser preview configuration and request fixtures |

Do not distribute node_modules, native/lib, build, dist, mod, artifacts, .xmake or .osfui as source. They are recreated locally. The packaging script uses explicit root files and maintained directories and prunes dependency/cache folders. If adding a new maintained root, update scripts/package-release.ps1. The original supplied archive is kept separately as a reference.

## Local preview and catalog work

`npm run dev` starts the standalone UI development server. `npm run dev:game` starts the OSF preview/deployment helper; review its destination/configuration before using it. Browser fixtures approximate native replies and cannot validate game execution or the real asset resolver.

Catalog extraction/generation scripts consume separately supplied records or a workbook. Read [ID catalog sources](ID_CATALOG_SOURCES.md), [Mod ID catalogs](MOD_ID_CATALOGS.md) and [Engine command reference](ENGINE_COMMAND_REFERENCE.md) before regenerating. Do not hand-delete bundled catalog data merely because a feature loads it lazily. Material-variant audit commands and their limits are in [Preview variant audit](PREVIEW_VARIANT_AUDIT.md).

Keep user-facing behavior and known limits in feature guides; keep release changes in CHANGELOG.md and the current verification checklist in RELEASE_VALIDATION.md. Dated feedback expectations belong in test fixtures/reviewed findings, avoiding conflicting copies of old behavior.
