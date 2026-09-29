# v0.3.0-test4 — collapsible inventory categories

## Install

Close Starfield, extract the patch into the existing CCC project, run **npm run build**, deploy the resulting mod through the existing workflow, and restart Starfield. The footer must show **v0.3.0-test4**. Both the native DLL and UI are included so the build can be installed as one complete update.

## Changes

- Under the default **Type, then name** sort, every inventory type is a collapsible category.
- Categories begin collapsed each time the inventory Results window opens.
- Each category heading displays its number of matching entries.
- Inventory search still checks the complete inventory. Categories containing matches open automatically while search text is present.
- Name, Form ID, and quantity sorts retain the flat sorted list from test3.
- Test3's full in-game pass is recorded, including companion affinity and relationship setters.

Scale, Open State, GetStage, and Quest Status remain disabled after the test1 native crash.

## Suggested test

1. Open **Show Player Inventory** and confirm every type category starts collapsed.
2. Open and close several categories and verify the entries and Copy ID buttons remain usable.
3. Search for an item in a collapsed category. Confirm the matching category opens automatically and nonmatching items disappear.
4. Clear the search. Confirm the complete category list returns in its collapsed starting state.
5. Switch through the other three sort choices and confirm their flat sorted lists still work.

Native DLL build, OSF UI compatibility check, UI production build, and all nine automated response/parser/navigation/category tests passed before packaging.
