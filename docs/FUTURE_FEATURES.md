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

## Controller support

Add complete controller support as one coordinated feature rather than restoring the earlier partial navigation experiment.

Planned behavior:

- Predictable directional navigation through menus, cards, fields, dialogs, and browser results.
- Reliable activation, Back, confirmation, and popup controls.
- Controller-compatible text entry for search fields, IDs, values, and custom commands.
- Clear focus indicators and sensible focus restoration after dialogs and screen changes.
- Input-aware control sizing and spacing that remains compact for mouse and keyboard.
- In-game testing with OSF UI and OSF Settings before the feature is marked supported.
