# v0.3.0-test3 — inventory tools and location choices

## Install

Close Starfield, extract the patch into the existing CCC project, run **npm run build**, deploy the resulting mod through the existing workflow, and restart Starfield. The footer must show **v0.3.0-test3**. This update changes both the native DLL and the UI.

The full-source ZIP is a complete source snapshot without dependencies/caches. The patch ZIP contains changed project files plus the complete built `dist/` output. The original Desktop project was not edited while creating these archives.

## Changes

- Show Player Inventory now returns structured item type, base Form ID, combined count, and display name data.
- The Results window has an inventory-only search field, sorting by type/name/Form ID/quantity, type headings, and a **Copy ID** button on each item.
- Clicking the main command search, Reference ID picker search, or inventory search selects all current text.
- Companion affinity guidance notes that 1300 is the commonly used progression target, relationship level 3 is the maximum, and anger level 2 is the maximum.
- Teleport to Cell has searchable quick choices for New Atlantis, Akila City, Neon, and Cydonia spaceports or landmarks. Manual Editor ID entry remains available.
- Test2 passes are recorded for inventory, Escape/Back, crash guards, companion readouts, current ship ID, and ship actor values.

Scale, Open State, GetStage, and Quest Status remain disabled after the test1 native crash. This build does not re-enable them.

## Suggested in-game test

1. Open **Show Player Inventory**. Search for part of an item name and for an eight-digit Form ID. Clear the field, then try each sort option. Confirm type headings appear under the default type sort.
2. Choose **Copy ID** on an item and paste it into a safe text field or CCC item command.
3. Enter text in the main search and a chooser search, then click the field again. Confirm all text is selected.
4. Open **Teleport to Cell**, choose one familiar location, and verify the chosen Editor ID fills the command field. Only teleport after making a save.
5. Open the three companion inspection cards and confirm the new maximum/progression notes are readable.

Native DLL build, OSF UI compatibility check, UI production build, and all eight automated response/parser/navigation tests passed before packaging.
