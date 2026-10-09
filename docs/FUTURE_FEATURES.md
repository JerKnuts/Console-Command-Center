# Future features

These ideas are planned for later releases. They are not included in the current build.

## Editable command-batch files

Allow saved Custom Command batches to be stored as individual `.txt` files in a user-owned CCC folder. A player could create or edit a batch in a text editor, return to CCC, refresh the list, and use it in game.

Planned behavior:

- Use the filename as the saved batch name.
- Treat each nonempty line as one Starfield console command.
- Ignore comment lines beginning with `#`.
- Load files when the Custom Command screen opens and provide a manual refresh action.
- Keep the current limit of 100 commands per batch.
- Safely handle invalid filenames, duplicate names, missing files, and unreadable content.
- Migrate existing browser-stored saved batches without losing them.
- Keep user-created batch files outside the installed mod files so updates do not replace them.

The native CCC plugin will provide the controlled file access because the OSF UI page cannot directly read and write arbitrary files.

## Optional automatic batch execution

Allow players to mark selected command-batch files for automatic execution without opening CCC. The native plugin loads with SFSE, but gameplay commands must wait until a save or new game has finished loading and the player and world are available.

Planned behavior:

- Automatic execution is disabled by default and enabled separately for each batch.
- Offer a clear choice between running once after the first playable game load in a session and running after every save or new-game load.
- Wait briefly after the game-load event before executing commands that depend on the player, current cell, quests, or references.
- Run commands in file order and stop when a command reports an error.
- Apply the same command-count and command-length limits used by manual batches.
- Record automatic runs and failures in a persistent log that CCC can show the next time it opens.
- Prevent one load event from launching the same batch more than once.
- Clearly warn that automatic commands can change saves before the player has an opportunity to make a new manual save.

The preferred configuration is an in-game **Run automatically** setting stored separately from the `.txt` content. This keeps batch files easy to edit and prevents a copied or downloaded text file from silently enabling itself.

## Mod ID catalog refinement

Manual in-game scanning, the separate **Mod Browser**, full/medium/small ownership resolution, supported-type limits, and global scanned-ID search are implemented. See [Mod ID catalogs](MOD_ID_CATALOGS.md).

Potential refinements include an optional reliable catalog cache, better display names for plugins, per-plugin visibility controls, additional carefully tested record types, and optional author-supplied descriptions for records whose game data exposes only an Editor ID.
