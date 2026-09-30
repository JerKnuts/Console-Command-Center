# v0.3.0-test2 — crash guard and Back navigation

## Install

This supersedes test1. Close Starfield, extract the patch into your existing CCC project, run **npm run build**, and deploy the resulting mod as in your working setup. Restart Starfield; the footer must say **v0.3.0-test2**. Both the native DLL and UI must be updated. Alternatively, deploy the bundled `dist/` contents explicitly; merely extracting a project archive does not install the mod.

The full-source archive is a separate complete project snapshot. Neither archive includes dependencies/caches or the private crash log. The Desktop project was not edited by this task.

## Crash mitigation — these inspections are disabled

The user triggered a crash by running Inspect Reference Scale. The supplied Trainwreck log records an access violation at `Starfield.exe+0C16E22`, with two CCC frames immediately below it. This is consistent with the new native evaluator path being unsafe. The exact ABI mismatch has not been established; compiling the code did not establish runtime safety.

All direct condition-evaluator calls added in test1 have been removed. **Scale, Open State, GetStage, and Quest Skips Check Status return an unavailable error**. They have not been functionally repaired. Do not continue testing those features with the old test1 DLL. Health/actor values, position, rotation, inventory, and current ship use separate adapters.

## Other changes

- CCC now requests `osfui.handleBack`, so native Escape/gamepad Back reaches the page instead of closing the menu immediately. Results closes first; Escape from CCC's main menu still closes CCC. The overlay toggle key remains controlled by OSF UI.
- Inspect Player Actor Value has a searchable **Choose Value** box, like the weather chooser: Health, Carry Weight, Movement Speed, Experience. Manual entry remains available. Only Health inspection is verified so far.
- Activity Log offers **Open Results** for errors too.
- Direct query replies replace invalid UTF-8 text bytes instead of failing JSON serialization. This is a targeted candidate fix for the inventory serialization error. Unsupported name characters may appear as replacement symbols; IDs and counts are ASCII. Inventory still requires in-game validation.
- Health, position, and rotation passes, Escape failure, and the scale crash are recorded in the test log/catalog.

## Verification and next test

Native DLL build, TypeScript/OSF UI compatibility, production UI build, and seven response/navigation regression tests passed. No new in-game or browser visual verification was performed.

First test Escape from a Results window, then the player-value chooser and Health, then inventory and reopening either output or error details. Position and rotation can be used as regression checks. The four guarded inspections should now return an unavailable message without calling the engine evaluator.

Remaining work: verified replacement adapters for the disabled inspections; live Help/SQS/SQT capture failures; explicit per-item Copy ID controls; further companion/ship tests. The inventory snapshot's existing text remains selectable for copying if output succeeds.
