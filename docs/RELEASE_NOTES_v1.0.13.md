# Console Command Center v1.0.13

Version 1.0.13 migrates Console Command Center to the native OSF UI 2.0 integration instead of relying on OSF UI's 1.x compatibility adapter.

## Changes

- Moved the packaged view from `SFSE/Plugins/OSFUI/views` to the OSF UI 2.0 path at `SFSE/Plugins/OSF/UI/views`.
- Added the versioned 2.0 manifest and OSF Settings Launcher registration.
- Rebuilt the native plugin against `OSFUI_RequestAPI` 2.0 and the current `OSFUI::API::Client` contract.
- Replaced legacy typed replies with OSF UI 2.0 JSON request replies.
- Updated the browser integration from `call()` and the legacy readiness promise to the 2.0 `request()` API.
- Replaced the legacy OSF UI authoring CLI dependency with a small local Vite build and compatibility check so release output cannot fall back to the old folder or manifest format.
- Added a Nexus-ready mod archive to the release packaging workflow alongside the corresponding full-source archive.

## Updating

Remove the old `SFSE/Plugins/OSFUI/views/console.command-center` folder when updating from v1.0.12 or earlier. Install the v1.0.13 archive normally; saved favorites, recent commands, activity history, and custom commands remain browser-local CCC data.

## Validation

- All 59 automated behavior and command-catalog tests pass.
- OSF UI 2.0 compatibility and TypeScript checks pass.
- The native plugin compiles against the official OSF UI 2.0 SDK header.
- Production output contains the modern view path and no legacy CCC view path.
