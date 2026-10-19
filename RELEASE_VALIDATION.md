# Release validation — 1.3.15

Release artifacts validated locally; see GitHub for publication status.

## This release

- All 245 JavaScript tests passed; UI/TypeScript checks passed. Reset migration coverage includes edited sources, deleted defaults, destination collisions, repeat setup and filename validation. Existing batch command checks confirm unchanged preset/reset values.
- Included reset defaults use suffix RESET. Boostpack Explosions and its RESET file sort together. The existing native included-file setup performs equivalent validated migration; saved batch/Auto-Run files are untouched.
- Mod grouping uses the existing plugin view or category counts across scanned records. Tests verify cross-plugin category aggregation, exact filtering, reference visibility and exclusion of packaged records.
- Browser fixture checks confirmed category grouping, cross-plugin source labels, selection and global search. The switch-back assertion needed a render-frame wait; the corrected full browser run remains pending because the permission-review service was unavailable and sandboxed Edge could not launch. Complete the final switching check in the game.
- UI production build, release metadata checks and native release build passed. The native build used a workspace-local dependency cache. Native SampleBatchTests passed, including edited-file migration, deletion handling, repeated migration and destination collisions. Installable and source archives are built from the maintained source roots; generated caches and test executables are excluded.
- No live game files were modified during development.

## Previous preview validation retained (1.3.11)

- All 232 JavaScript tests, UI/TypeScript and release checks passed; native preview fixtures passed for 1.3.11. These prior checks cover the preview changes retained in this release.
- Native Ultra asset check produced a 101,099,772-byte Mauling Axe packet with two 2048-pixel color/normal/metal sets. The packet decoded and rendered without WebGL errors using the Ultra transfer path. Source texture sizes remain respected.
- Browser pixel checks confirm bloom outside a bright object, greater blur away from the focus plane, subtle three-level grain on a flat midtone, allocation-failure fallback, and zero retained postprocess textures/framebuffers/programs/shaders/VAOs after disposal.
- Real-model browser checks cover Ultra, quality switching, light marker, camera controls and Textures Off without WebGL errors.
- Geometry-first browser checks hold material replies pending and verify visible pixels before the first texture request. Inline-to-fullscreen reuse works while inline textures remain pending. Low-to-Ultra updates preserve the rotation matrix; failed upgrades retain the visible model.
- Ultra is available in both quality menus and saved preferences; controller quality selection uses the same option list. Other presets keep their existing limits.
- Temporary game-asset test files were removed from the application source before packaging. No game assets are distributed.

## In-game check still required

Install both DLL and UI. Compare Ultra to High on a weapon and an outfit; confirm geometry appears before material loading, and verify performance in the OSF webview. The attached report provides matching live current-cell evidence for ten accepted names, confirming the current-area tool returned names during play. Outstanding furniture material limitations remain documented.
