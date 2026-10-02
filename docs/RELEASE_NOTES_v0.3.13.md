# Console Command Center v0.3.13 Beta

This version incorporates the October 1 in-game review of v0.3.11 and focuses on keeping dense mouse-and-keyboard workflows stable and compact.

## Interface changes

- Recent Commands now displays full-width rows instead of the general two-column command grid.
- Saved Custom Commands has a Delete All action. The destructive action stays disabled until the user types exactly `Delete`, and the current editor contents are preserved.
- Quest Browser retains the expanded category, expanded quest card, and scroll position after Check Current Stage or Show Stage History completes.

## Command verification updates

- Toggle Grass passed in-game testing and moved from Ready to Test into the established World category.
- Toggle Wireframe produced no visible result in v0.3.11 testing. Both the prepared entry and raw engine-library duplicate remain visible but are disabled with the reason shown.
- Take Screenshot now explains that Starfield may write the file silently without an on-screen confirmation.
- `GetSFSEVersion` remains in the raw engine reference. CCC can submit it, but ordinary execution does not capture a console text return.

## Catalog totals

- 142 established commands
- 36 prepared Ready to Test commands
- 565 raw engine console commands
- 948 raw script functions
- 1,549 total Untested entries
