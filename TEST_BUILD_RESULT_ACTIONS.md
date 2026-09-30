# v0.3.0-test8-hotfix1 — Save-load crash guard

## Install

Close Starfield, extract the patch into the existing CCC project, run **npm run build**, deploy the resulting mod through the existing workflow, and restart Starfield. The footer must show **v0.3.0-test8-hotfix1**. Both the interface and native DLL changed in this hotfix.

## Priority tests

1. Open **ID Browser**, choose Weapons, search the game for `Beowulf`, and confirm results arrive without a timeout. Select a result and test **Copy ID**.
2. Load a saved game and confirm no `REL/IDDB.cpp(459)` Address Library error appears.
3. Confirm **Get Grabbed Object Reference ID** now shows **UNAVAILABLE** and cannot execute.
4. Run one new boostpack **Effective Total** card. Confirm the warning shows current base, current effective total, modifier contribution, and the calculated base before execution. Apply a modest value, then inspect that actor value.
5. Use **Get Current Ship Reference ID**, then test **Set Ship Cargo Effective Total** with a modest target. Confirm the inspected final cargo total is close to the requested total rather than adding the requested amount on top of module bonuses.
6. Confirm **Open Wait Menu**, **Inspect Reference Open State**, **Inspect Reference Scale**, and the three read-only quest inspection cards show **UNAVAILABLE** and cannot execute.
7. Open Quest Fixes and confirm **Check Status** and **Full SQS** are disabled while the curated repair choices remain available.
8. Confirm the footer reports Starfield **1.16.244.0** and CCC **v0.3.0-test8-hotfix1**.

## What changed

- Search Game now searches loaded Starfield records directly instead of scraping `help` output from the console.
- The unsafe held-object event adapter has been removed; its command is disabled.
- Effective-total setters compensate for the currently detected equipment/module contribution.
- Console capture uses atomic ownership and SFSE task scheduling without detached polling threads.
- The Quest Fix dataset was checked against the installed `Starfield.esm`; all 77 Quest IDs and all 245 unique listed stages were found after removing one invalid mapping.
- The plugin reports and gates its tested runtime, Starfield 1.16.244.
- Known failures remain visible with explanations but are disabled.
- GPL licensing, CommonLibSF source/exception notices, and privacy cleanup are included.

## Expected limitations

- **Open Wait Menu** remains disabled. Both tested menu-opening routes failed in game, and the pinned CommonLibSF API does not expose a verified replacement adapter.
- Scale, Open State, and quest-stage inspection remain disabled after the unsafe or unreliable earlier adapters.
- Quest validation proves that the IDs and stages exist in the base master. It does not prove that forcing a stage is safe for every save; keep using a manual save first.
- Native Search Game and effective-total controls need this test8 in-game pass before they can be marked verified.

## Completed build checks

- 11 automated UI/bridge tests pass.
- OSF UI compatibility check passes.
- Production UI build passes.
- Native DLL compiles against pinned CommonLibSF.
- Quest Fix validation passes against the installed `Starfield.esm`.
