# v0.3.0-test9-hotfix1 — Remove unsafe loaded-game scanner

## Install

Close Starfield, extract the patch into the current CCC project, run **npm run build**, deploy the resulting mod, and restart Starfield. The footer must show **v0.3.0-test9-hotfix1**. The native DLL and interface both changed. Do not continue using test9.

## Priority tests

1. Load the same save that passed with test8-hotfix1.
2. Open ID Browser, choose **Aid / Consumables**, and enter `Med Pack`.
3. Confirm Med Pack appears instantly with Form ID `0000ABF9`.
4. Select Med Pack, test **Copy ID**, and confirm **Add 1 to Player** appears.
5. Confirm **Search Loaded Game** and **Clear Game Results** are gone.
6. Clear the search, choose another category, and confirm its included results still filter instantly.
7. Recheck one inventory inspection and one actor-value inspection as native regressions.
8. Confirm the footer reports the native runtime as ready and shows the hotfix build.

## Expected behavior

- Search operates only on CCC's 191 included IDs in this hotfix.
- The loaded-game request handler and unsafe global form-map scanner are absent from the DLL.
- Med Pack is included again so it can be found without touching runtime form memory.
- Result selection, Copy ID, and supported quick actions remain available.

## Changes retained

- The unresolved grab/release adapter remains removed, and Get Grabbed Object Reference ID remains unavailable.
- Seven known-broken commands remain visibly disabled.
- Effective-total controls compensate for detected modifiers. Boostpack Horizontal/Initial and Ship Cargo/Shielded Cargo/Reactor totals are verified in game.
- Quest IDs and stages remain structurally validated against `Starfield.esm`.
