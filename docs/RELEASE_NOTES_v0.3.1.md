# Console Command Center v0.3.1 Beta

## Interface cleanup

- Removed the redundant **Command Library** label from the left sidebar.
- Standardized menu, row, popup, and accent treatments and extended the colored identity stripe to secondary windows.
- Simplified Activity Log by removing Session Executions, Last Command, and Saved Entries summary boxes.
- Moved CCC, Starfield, OSF UI, and native connection information into the persistent footer.

## ID Browser

- Organized included IDs into collapsible categories that start closed.
- Search still scans every category and opens the matching groups automatically.
- Added an item quantity field for supported `player.additem` actions. It defaults to 1 and accepts values from 1 through 999999.
- Kept Copy ID available for selected records and retained visible DLC requirements for expansion-specific entries.
- The removed live loaded-form scanner remains disabled; searches use the catalog packaged with CCC.

## Custom commands

- Replaced the single-line field with a larger resizable multiline editor.
- Runs one nonempty console command per line, in order.
- Shows the complete batch in the confirmation window before execution.
- Stops at the first command that reports an error and logs each attempted line separately.
- Limits batches to 100 commands and each command to the native 1,024-character limit.

## Naming and documentation

- Standardized **Quest Skips** throughout the interface, source, scripts, and documentation.
- Removed public ID-source attribution from the README while retaining internal catalog maintenance notes.
- Added a focused v0.3.1 in-game checklist in `TEST_BUILD_RESULT_ACTIONS.md`.
