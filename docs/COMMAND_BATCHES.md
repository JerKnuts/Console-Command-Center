# Custom Command batches

Current behavior: CCC v1.2.38.

## Files and editor

Saved batches live in Documents\My Games\Starfield\Console Command Center\Command Batches under the Windows Documents folder. The filename without .txt is the displayed batch name. CCC opens that folder's .txt files when Custom Command is selected and provides Refresh for external edits. Load fills the draft for review; it does not execute. Switching tabs preserves the draft during the UI session. Add to Batch on a command card appends its prepared command.

Write one console command per line. Blank lines and lines whose trimmed text starts with # are ignored. Comments must occupy their own lines; inline comments are not stripped. Line numbers shown in the gutter are display-only and are not saved or executed.

~~~text
# Player setup
player.modav carryweight 100

# Add four items
player.additem 0000ABF9 4
~~~

There is no 100-command limit. A file may be up to 1 MB, each command may be up to 1,024 characters, and the list currently shows up to 100 batch files. The UI accepts entry names up to 50 characters; native filename validation permits up to 120 bytes and rejects reserved Windows names, path separators, control characters, and invalid filename characters. Files should be UTF-8 text; a UTF-8 BOM is accepted.

Saving an existing case-insensitive batch name updates that file. Delete removes one file; Delete All requires typing Delete. Browser-stored legacy batches migrate on first load, keeping different same-name contents in separately named migrated files.

## Included samples

On first use, an empty batch folder receives Sample - Basic Supplies, Sample - Workshop Materials, and Sample - Ballistic Starter Kit. Samples do not overwrite existing files or enter Auto-Run automatically. A hidden setup marker prevents deleted samples from being recreated; migrated or existing batches take precedence. The browser preview includes the same examples.

## Manual execution

Review Commands shows the executable lines in file order and requires confirmation. CCC submits commands one at a time and stops on a reported native/bridge failure. The executor cannot reliably determine whether every console command had its intended effect; a submitted command is not proof of a gameplay change. Activity Log retains submitted commands and reported outcomes.

## Auto-Run

Select On Load beside each chosen file, then switch Auto-Run On in the Batch Files header. Both the master setting and individual selections are stored in Documents\My Games\Starfield\Console Command Center\Auto Run.json. Updates to the installed mod do not overwrite this user-owned folder.

Auto-Run targets existing-save loads, waits three seconds, and reads selected text files fresh without requiring CCC to be open. Files run in alphabetical filename order; commands run in file order. A newer load event supersedes a pending older run. New games are not intended to trigger these batches. Missing, unreadable, empty, or invalid files are skipped and reported. A native execution failure stops that batch; other selected batches continue.

Pending run summaries are kept in native memory for the current game session (up to 20) and imported into Activity Log when the UI connects. Quitting before opening CCC loses those pending summaries. The log reports submission counts and file errors; it does not verify every command's game effect.

These settings apply across saves and characters in this installation. Repeated toggles such as tgm and tcl flip their state on every load, and additive commands can repeatedly add items or values. Prefer deliberate, repeatable setup commands. Turn Auto-Run Off to stop future loads from executing selected files; it does not undo earlier commands.

In-game Auto-Run triggering was confirmed by the user. Validate individual batches and load behavior on a disposable save before using them for routine play.
