# Translate CCC

1. Open `Translation.json`. It contains all exported text, including interface labels, command descriptions, item names and quest names. Rename it for your language, such as `zh-CN.json`.
2. Set `locale` and `languageName` at the top. For example: `zh-CN` / `简体中文`, or `zh-TW` / `繁體中文`.
3. Under `messages`, find the section you want: Interface, Commands, Game Settings, Items, Quests, Game Messages, or Batch Labels and Comments. Fill the blank values with translations. Keep section names, English keys and placeholders such as `{0}` unchanged. Leave anything unfinished blank to use English.
4. Save as UTF-8 JSON. Keep commands, IDs and filenames unchanged.
5. Install CCC 1.3.17 or later. Put your JSON file in this folder inside Starfield:

   `Data/SFSE/Plugins/OSF/UI/views/console.command-center/main/translations/`

6. Start CCC. Your installed translation is selected automatically unless you previously chose a language. Use **Settings → Reload Translation** after editing; you can change languages there.
7. Test the menus and dialogs, then share your JSON file. For a Nexus patch, package it under the same path above, starting with `SFSE/`.

**Browser preview:** put the JSON in the source project's `translations/` folder instead.

The kit has only two files: `Translation.json` to edit and this README. Start with the text you want to translate; you do not need to finish everything before testing. No SWF editing or compiling is required.

## Package as a separate mod

1. Create this folder layout with your completed language JSON:

   ```text
   CCC Chinese Translation.zip
   └── SFSE/
       └── Plugins/
           └── OSF/
               └── UI/
                   └── views/
                       └── console.command-center/
                           └── main/
                               └── translations/
                                   └── zh-CN.json
   ```

2. ZIP the `SFSE` folder directly. Do not add a `Data` folder or another wrapper folder.
3. List **Console Command Center 1.3.17 or newer** as a requirement on Nexus.
4. Users install CCC, then install and enable your translation ZIP in their mod manager. CCC selects the installed translation automatically unless the user already chose a language. Settings allows switching or reloading languages.

Include only your language JSON. No ESP, ESM, DLL or replacement interface files are needed. Use separate filenames, such as `zh-CN.json` and `zh-TW.json`, so languages can coexist.

If several translations are installed, CCC prefers the browser/system language, then the first available pack. The bundled Chinese example is never selected automatically.
