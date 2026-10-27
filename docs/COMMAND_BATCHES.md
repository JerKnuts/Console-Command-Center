# Batch Commander

## Included files and saved files

Batch Commander's flat INCLUDED sidebar lists files in Documents\My Games\Starfield\Console Command Center\Included Batches. Each file is an actual runnable .txt batch with comments explaining its effects. Selecting one loads its contents for review/editing and never executes it. Editing files in a text editor and selecting Refresh updates the list/content. Saving a draft uses the separate Command Batches folder.

The source defaults live in batches/included and are bundled into the UI from those exact .txt files. Defaults are installed once per filename. Existing user files are retained, modified files are not overwritten, and deleted defaults are not recreated. The three original native samples still seed only an empty Command Batches folder; they are separate from the included library.

## Editing and execution

One command goes on each line. Blank lines are ignored. Both # and ; start full-line or trailing comments outside double-quoted arguments; escaped quotes inside a quoted string do not start comments. Native and browser parsing follow the same rules.

Commands are bold/blue, targets are gold, Form IDs purple, numbers amber and quoted text green in the dark theme, with matching readable light-theme colors. Comments are muted/italic. Highlighting is visual only and does not rewrite the draft or validate that an engine command exists. The underlying textarea preserves cursor selection, undo, IME/controller text entry, copy/paste and accessibility. Long lines wrap visually without changing the file or command boundaries. Line numbers mark logical source lines and align with their wrapped text. Highlighting and line numbers follow vertical scrolling; forced-colors mode exposes ordinary text.

Review Commands displays executable lines and requires confirmation. Commands run in order and stop at the first reported execution failure. Successful submission is not proof of the intended gameplay result. Files are limited to 1 MB and commands to 1,024 characters, with up to 100 files per list and no fixed command-count limit.

## New included batches

All Playing Cards adds one complete 52-card deck. All Baseball Caps adds one each of the ten base-game cap variants. Both include item-name comments, add to inventory without equipping anything, and add another copy when run again. These two files install automatically under INCLUDED; existing user-edited batches remain untouched.

Adventure Starter Kit adds modest supplies, tools, a weapon/ammo and a suit set without advancing NG+ or equipping anything. Medical Supplies adds healing and affliction treatments. Outpost Starter Kit supplies common building materials, while Manufactured Components and Cooking Pantry provide focused ingredients. Weapon Test Kit files separate ballistic, laser, particle and melee gear. Spacesuit Collection supplies five matching sets; Clothing Wardrobe supplies selected uniforms and headwear.

Quick Surveying sets flora/fauna scan requirements to 1. Scanner Visibility extends base/scan range to 100/50. Boostpack Explosions sets BoostpackDeathChance to 75. Each has a separate Name RESET file restoring the documented base-game values (8/8 scans, 50/10 range, 25 explosion chance). These resets do not capture or restore mod-specific overrides. Preset effects and balance still need in-game testing.

Known official-plugin figure/ammunition IDs are remapped when loading their included files, using plugin identity rather than assuming a fixed load-order index. Missing required plugins produce a message. This is scoped to the known supplied ID set and does not rewrite unrelated user commands.

## Auto-Run

Saved files can be marked On Load and controlled by a master Auto-Run switch, off by default. They run alphabetically three seconds after loading an existing save, with contents read fresh. Repeated loads repeat additive commands and toggles. Missing or invalid files are skipped and reported; one failed batch does not prevent other selected batches. New games do not trigger this workflow. Existing browser-stored saved batches migrate without overwriting a different same-name file. Setup, preview loading and selecting an included file do not execute it or enable Auto-Run.

## Reset filenames (1.3.15)

Boostpack Explosions RESET.txt, Quick Surveying RESET.txt and Scanner Visibility RESET.txt sort after their matching presets. The former More Boostpack Explosions.txt is now Boostpack Explosions.txt. During included-file setup, old names migrate without changing their contents. Previously deleted defaults stay deleted. If both old and new filenames already exist, both user files are kept without overwriting either. Saved Command Batches and Auto-Run selections are separate and unchanged.

## Controller navigation

Entering Batch Commander focuses the first saved file’s Load button, or Save .txt File when no saved file is available. Up from the first saved row reaches Save; Up again reaches Refresh. Left/Right moves across Refresh and Auto-Run. Left from Save reaches Entry Name, then Left reaches the center Review Commands control. Right from the Included sidebar also reaches Review Commands. Up reaches the editor and Down returns to Review; A opens the existing command review. Left crosses the center controls back to Included files, and Right returns to saved files. Select an included file with A to load it for review. The saved-file panel itself is not a focus target.

## Controller navigation

The saved-files panel starts on the first saved Load button, or Save .txt File when empty. Up reaches Save, Refresh and Auto-Run; Left/Right connects the header controls. The panel itself is not a focus stop. Right from Included files reaches the center Review Commands button; Up reaches the editor and Down returns to Review. Left from the saved-panel boundary returns to the center. Loading a file focuses its editor so it can be reviewed and run.
