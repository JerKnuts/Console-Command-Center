# Changelog

This file replaces the individual release-note documents. It records user-visible changes without repeating install and compatibility text for every version.

## 1.1.26

- Removed generated dependencies, build output, old patch manifests, superseded test-build notes, and duplicate release-note files from the distributed source archive.
- Consolidated release history into this changelog and folded the Quest Browser guide into the README.
- Replaced the accumulated release checklist with a shorter checklist for the current session-based Mod Browser workflow.

## 1.1.25

- Kept wrapped Command, ID Browser, and Mod Browser sidebar titles left aligned and vertically centered.
- Kept counts vertically centered in their own column and preserved padding around multi-line names.

## 1.1.24

- Made shared sidebar rows grow to fit wrapped names and kept their counts aligned.

## 1.1.23

- Corrected Shattered Space quest localization and classification.
- Kept dialogue, scene, template, shell, tracker, and ambient-support quests under Internal / System.

## 1.1.22

- Changed Mod Browser to a deliberate, session-only **Scan Mods** workflow with no automatic persistent-catalog restore.
- Added Bethesda `SFBGS...` plugins under **Official Creations**.
- Reduced Quest Browser clutter while retaining all 2,318 Bethesda quest records.

## 1.1.21

- Added total ID progress and automatic row growth for long names.

## 1.1.20

- Added detailed Mod Browser scan reports to Activity Log.
- Widened the shared category sidebar and improved spacing between mod entries.

## 1.1.19

- Added persistent favorites for individual ID Browser and Mod Browser records.
- Added readable names for hundreds of known plugin filenames.

## 1.1.18

- Split large Mod Browser transfers into per-plugin replies so very large load orders could finish reliably.

## 1.1.17

- Removed the browser-side scan timeout and preserved the working catalog when a scan failed.
- Displayed the raw console command beneath the selected command title.

## 1.1.16

- Combined Mod Browser discovery and ID collection into one **Scan Mods** action.
- Made Search All search records across scanned mods instead of filtering the mod list.

## 1.1.15

- Added favorites for saved Custom Command batches.
- Corrected controller movement between saved-command Load and Delete controls.
- Improved category selection borders and Mod Browser ordering.

## 1.1.14

- Improved ship and ship-part classification and scan feedback.

## 1.1.13

- Added scan progress, Add to Player for books and notes, Spawn for furniture, and a compact quantity/action row.

## 1.1.12

- Added collapsible record categories for large mod catalogs and Search Mod/Search All scopes.

## 1.1.11

- Added the complete large-load-order scanning workflow, ID-count sorting, and zero-ID filtering.

## 1.1.1

- Introduced automatic loaded-plugin discovery and the separate Mod Browser.
- Added full, medium, and small plugin Form ID ownership handling.

## 1.1.0

- Added complete controller navigation and text entry through OSF UI 2.0.
- Introduced compact Commands, ID Browser, and Quest Browser layouts.

## 1.0.0–1.0.13

- Published the first Nexus-ready release with the established command library, ID Browser, Quest Browser, favorites, Recent, Activity Log, and saved command batches.
- Migrated the native and browser bridge to OSF UI 2.0 and moved the installed view to the modern `OSF/UI/views` path.
- Added the first-run guide, command-specific browser filters, paired command actions, WIP result groups, and crash guards for unsafe commands.
- Expanded controller-ready dialogs, help, result windows, browser-backed fields, and command verification records.

## 0.3.0–0.3.14 beta

- Built the original searchable command interface and native SFSE execution bridge.
- Added categorized commands, confirmation levels, favorites, Recent, Activity Log, Custom Command batches, ID data, quest data, and early inspection tools.
- Iterated through in-game command testing, packaging, native safety checks, and release validation before v1.0.
