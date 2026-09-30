# v0.3.0 — Expanded safe ID catalog

## Install

Close Starfield, extract the v0.3.0 patch into the current CCC project, run **npm run build**, deploy the resulting mod, and restart Starfield. The footer must show **v0.3.0**. The native DLL and interface both changed.

## Priority checks

1. Load the same save that passed with test9-hotfix1.
2. Open ID Browser and confirm there are **340 included IDs**.
3. Choose **Aid / Consumables** and search for `Trauma Pack`, `Emergency Kit`, and `Med Pack`.
4. Choose **Perks / Skills / Traits** and search for `Boxing`, `Xenosociology`, `Aneutronic Fusion`, and `Wanted`.
5. Choose **Weapons** and search for `Big Bang`, `Kraken`, and `Old Earth Shotgun`.
6. Choose **Ammo** and search for `Heavy Particle Fuse` and `Caseless Shotgun Shell`.
7. Select several results and confirm **Copy ID** works. Quick actions should still appear for items and perks.
8. Search for `Shattered Space`; confirm its two faction entries visibly say **Shattered Space DLC bounty faction**.
9. Confirm there is no **Search Loaded Game** or **Clear Game Results** control.
10. Recheck one inventory inspection and one actor-value inspection as native regressions.

## Expected behavior

- Search is immediate and reads only CCC's packaged catalog.
- Search never walks Starfield's live form memory.
- Base-game records require no expansion label.
- Expansion-specific records identify their requirement in the selected result details.
- The footer and native runtime report both show v0.3.0.

## Versioning

Future bug-fix releases increment the patch number: v0.3.1, v0.3.2, and so forth. A substantial new feature release increments the minor number to v0.4.0.
