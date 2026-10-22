# Release validation — 1.3.36

- The player confirmed the restored full 1.3.36 source works. The two-press keybind remains reproducible; the intermittent Loading hang remains unresolved. Both are documented in [Known bugs](README.md#known-bugs).
- Waiting 10–15 minutes and trying again is a reported workaround for the Loading hang, not a guaranteed recovery. A captured session recovered after about 12 minutes without a game restart.
- Retained the original OSF Settings RegisterHotkey callback and callback-only openCCC schema. No native-menu launcher code or menu target is included. The withdrawn 1.3.37 experiment is excluded from this release.
- A live F10 trace showed three first presses without corresponding menu-open requests and successful requests on each second press. Starfield retained foreground and keyboard focus during those examples. Both Escape and the Close button can precede the issue; changing application focus may temporarily restore one-press behavior.
- No OSF framework files, shared browser processes, player reports or saved bindings are modified by this release.

## 1.3.36 checks and evidence


- Added red reference crosses while retaining the existing reference classification, selected-row distinction and Working override.
- All 283 JavaScript tests and UI/TypeScript checks passed. Isolated browser testing reproduced a failed startup handshake followed by automatic reconnect: current selection details loaded, search was preserved and no command was replayed.
- Live capture with original OSF helper: CCC hidden at 21:29:46.104, CDP input timeout at 21:29:51.651, then automatic view reload remained unready until the page showed again at 21:41:53.731. OSF Settings continued requesting the same view and timing out. This identifies the failure sequence, not its cause.
- Saved host/renderer/GPU stack snapshots and logs before recovery. The returned player checklist has 45 passes, one failure and 121 untested entries; it also reports the keybind sometimes needs two presses.
- No OSF binaries or player browser storage are changed by this build. The freeze remains unresolved; the translation-disabled comparison is a separate diagnostic.

- The recovered page showed NATIVE NOT CONNECTED. CCC previously attempted its native handshake only once; this build retries that handshake. The original browser hang is not resolved by this change.

## Previous 1.3.35 validation

- All 280 JavaScript tests and UI/TypeScript checks passed.
- Isolated browser checks verified normal and selected Reference Only rows in dark/light themes, without Dev Mode; text contrast exceeded 4.5:1 in those tested states. Favorites retains the reference treatment and badge; Working removes both.
- This changes presentation only. No attached report comments were applied as catalog corrections. The loading-freeze investigation remains separate.

## Previous 1.3.34 validation

- Reproduced Favorites information collapsing to zero height in the actual browser layout. The wrapper inherited the two-row command layout although it contains a single item panel.
- One-row layout restores the description/preview scroll area to 381, 377 and 281 pixels at 1500×820, 2048×816 and 1280×720 respectively. Information and preview containers remained visible. Browser replies were mocked; the in-game Armada helmet needs retesting.
- No change to translation processing, teleport behavior or OSF framework files. The loading freeze remains unresolved.

## Previous 1.3.33 validation

- All 280 JavaScript tests pass, including Working clearing a shipped reference restriction across actions, visibility, sorting, report export, restart and plugin/load-order identity.
- Updated the earlier suit regression to reflect the player's new successful test of Starfield.esm 0016D2C4. Other Deepseeker classifications remain unchanged.
- Isolated browser verification passed: the confirmed suit has Add to Player; marking a reference pack Working clears its tag, restores Add to Player, turns its row green, saves an exportable correction and survives reload outside Advanced Options. No inventory commands were run.
- Native behavior is unchanged from 1.3.32; the DLL version is rebuilt to match the view. No OSF UI or OSF Settings files are modified.

## Previous 1.3.32 validation

## New checks

- All 279 JavaScript tests and UI/TypeScript compatibility checks passed.
- Isolated browser reproduction confirmed Add to Player stopped responding after Favorites → ID Browser. With scoped bindings, both panels sent the correct item and quantity exactly once. Browser replies were mocked; no inventory was changed.
- Read-only Starfield.esm audit verified ARMO Non-Playable flag 0x4 on 000FBA03, 0019228E, 00192290 and 00255521. 0016D15B and 0016D15C remain available. 0016D2C4 lacks that flag but retains its earlier failed-inventory report and reference-only classification.
- Offline preview tests decoded textured Deepseeker pack, helmet and female upper-body/lower-body/sleeve models. No preview-specific fix is claimed from those checks.
- Native DLL rebuilt successfully and all eight native test executables passed.
- Hotkey schema omits a default binding and registers openCCC with the OSF Settings native API. Live key assignment and game opening still need verification after restart.

## Previous 1.3.31 validation

## Included changes

This release includes translation packs, descriptions/effects/base stats, book reading, reviewed cell names and classifications, report export fixes and the split item-details/model-preview layout. Technical metadata follows Advanced Options; Copy ID and supported previews remain available in ordinary browsing.

## Completed checks

- All 277 JavaScript regression tests and UI/TypeScript compatibility checks passed, including in the clean publishing checkout. Included-batch tests create their own temporary build parent when run before any build.
- All eight native test executables passed. Source line endings are normalized to LF and declared in .gitattributes.
- Native request tests use the actual OSF reject callback: omitted/default, explicit inspect and read-book operations retain a usable reply token; malformed operations are refused. This covers the 1.3.29 inspection rejection fixed in 1.3.30.
- Native description tests cover bounds, long book text, English fallback, namespace separation, inline descriptions, perk-rank text and remapped identities. Installed-file checks loaded Addichrone, Ballistics and A Christmas Carol. Model geometry/attachment, controller trigger, quest-stage, scalar-result, batch and feedback checks are included in the native test suite.
- Browser checks with simulated native replies verified the Read popup, scrolling, basic formatting, hostile-markup removal, close/Escape, cached reopening and no inventory/console mutation. They also verified normal/advanced metadata toggling and retained copy/action buttons.
- Layout checks measured equal description/preview columns with a 14 px gap. The preview stayed at the same vertical position during a 120 px scroll. Items without previews use the full text width.
- Matching native/UI builds, translation export, release metadata/documentation links and source/runtime archive contents checked before packaging. No game assets, reports, profiles, local caches or experimental OSF helper are part of the CCC release.

## Remaining limits

- Browser tests simulate native replies; they do not replace in-game checks across every record, language or mod. Base stats can differ from inventory instances with upgrades, legendary effects, curves or player bonuses.
- Audio/image-only slates may not supply readable text. Reading in CCC does not add items, mark the original book read or grant rewards.
- The static viewer does not simulate cloth. The Caped House Veth'aal Suit's separate banner can appear detached in its authored rest pose; no guessed offsets or deleted pieces are applied.
- The intermittent OSF loading freeze is not claimed fixed. The experimental OSF visibility-helper replacement remains a separate test project; it is not included here.

Install the matching DLL and view together, then restart Starfield for live verification.
