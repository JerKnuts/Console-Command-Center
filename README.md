# console-command-center

Run `npm run dev` for instant browser HMR. Run `npm run dev:game -- --deploy "path-to-MO2-mods"`
to create this mod's folder under MO2 and sync into Starfield with temporary
author mode, automatic view reload, and F12 DevTools.

Use `npm run package` to create a release-ready zip. Files under `mod/`
are copied into the mod archive beside the generated view.

## Native SFSE backend

The paired `native/src/main.cpp` and view source are an end-to-end bridge
example built on the optional `OSFUI_JSON.h` facade:

- **Send command to C++** sends a typed fire-and-forget `JsonCommand`; C++
  changes its state and pushes the serialized struct back to JavaScript.
- **Call C++ and await reply** sends a `JsonRequest`; C++ validates the
  required `name`, replies with JSON, and lets OSF UI own correlation.
- The plugin registers this view, a runtime settings schema, settings/ready
  callbacks, and an **F9** open-view hotkey. Edit the generated code down to
  the pieces your mod needs. `osfui.mock.ts` mirrors the round trips in the
  browser harness and exposes settings/hotkey callback controls in its toolbar.

1. Install xmake and Visual Studio's C++ workload.
2. Add CommonLibSF: `git submodule add https://github.com/ozooma10/commonlibsf.git native/lib/commonlibsf`.
3. Run `npm run build:native`. xmake fetches nlohmann/json and puts the DLL in `mod/SFSE/Plugins/`.
4. Run `npm run package` to build the DLL and view into one mod archive.

