# v0.3.3 — Picker and compact-layout test checklist

## Install

Close Starfield, replace the existing CCC files with the v0.3.3 build, and restart the game. The footer and native connection message must both report **v0.3.3**.

## Priority checks

1. Confirm CCC uses the tighter mouse-and-keyboard spacing and displays **Controller support is in development**.
2. Open **Add Perk / Skill** and **Remove Perk / Skill**. Each should offer a searchable **Choose Perk** box, fill the Form ID after selection, and still accept a manually entered ID.
3. Open **Add Power / Spell**. Confirm **Choose Power** contains 24 Starborn powers and selecting Anti-Gravity Field fills `002BACBA`.
4. Open **Remove Spell / Status Effect**. Confirm **Choose Effect** includes the power list and known environmental repair effects such as Poor Air Quality (`00163FE7`).
5. In ID Browser, choose **Powers / Effects** and confirm Powers and Effects appear as collapsed groups. Environmental effects must not offer an Add Spell quick action.
6. Confirm an ID Browser item row shows its category beside its name and remains selectable across the full row.
7. Verify Copy ID and search inside every new chooser.

## Regression checks

1. Run Inspect Player Health and confirm Results contains a number.
2. Show Player Inventory and recheck search, collapsed groups, sorting, and Copy ID.
3. Add an ordinary item from ID Browser with a quantity greater than one.
4. Run two harmless Custom Command lines and confirm ordered execution plus separate Activity Log entries.
5. Confirm Favorites and Activity Log survive closing and reopening CCC.

## Expected behavior

- CCC is presented as a mouse-and-keyboard interface; custom controller navigation is absent.
- Choice boxes fill the existing Form ID field and never prevent manual entry.
- The packaged ID Browser reports 370 included IDs and contains no live game scanner.
- Known-broken commands remain visibly unavailable.
