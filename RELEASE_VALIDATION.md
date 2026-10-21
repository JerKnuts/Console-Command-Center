# Release validation — 1.3.31

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
