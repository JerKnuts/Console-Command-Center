# Historical console test findings

These dated observations preserve player reports and their original test context. They are not a current feature list. See [the command catalog](../COMMAND_CATALOG.md) for current placement/readout limits and [the README](../README.md) for the menu shortcut added later. Observed gameplay is separate from CCC Results capture verification.

- **saq:** starts all quests; long delays, screen flashes and overwhelming popups make normal play impractical. WIP Issues; not advisable.
- **caqs:** completes quests globally, including those outside the player log; long completion-screen sequence. WIP Issues; not advisable.
- **ShowSubtitle 0:** hides all dialogue subtitles even when enabled in game options. Renamed card; normal-preference restoration remains unconfirmed.
- **LandOnPlanetMarker:** requires Marker Name. Added required text input; valid names and map-context operation remain unconfirmed. CCC shortcut was unavailable on the map during testing.
- **ResetDialogueFlags:** executed; effect unconfirmed.
- **Help:** no arguments prints command/function help. Large output required an external console export. CCC Results capture is bounded and may omit part of it.
- **ShowGlobalVars:** no arguments prints global names/current values. Large output required an external console export; CCC capture completeness has not been confirmed.

## Reference exports

Matched engine-help descriptions were refreshed while preserving record order, IDs, reviewed warnings and findings. The maintained generator input is ENGINE_COMMAND_REFERENCE.md. Engine help does not prove every command works in the retail game. Duplicate descriptions retain the first occurrence.

The global-variable snapshot contains 4878 value rows. Values depend on the save and load order, so they are not packaged as defaults or presets. Useful names present include GameYear, GameMonth, GameDay, GameHour, GameDaysPassed and TimeScale. The engine reference provides GetGlobalValue for inspecting a known global individually; that path remains untested through CCC. Mod-specific globals may be absent in other load orders.

## Ammo inventory tests (2026-10-12)

The player reported no visible inventory addition from companion variants, all listed creature ammo, Gravity Torpedo Ammo, Missile CE-19, Missile, Solar Flare Beam Ammo, Supernova Ammo, and Terrormorph ranged/roar ammo. These exact Starfield.esm records remain searchable but are reference-only, with Add to Player disabled. Companion names carry a suffix. Normal ammo remains actionable. Having a Local ID is not itself a failure indicator.

## Exported feedback review (1.2.34)

Applied 68 submitted item reports: 67 Reference Only reports covering 66 unique plugin/local-ID records, plus one Working report identifying 0003B423 as Cydonia Pack. Restrictions match the specific plugin/local ID and apply to old Favorites and gameplay quick actions. Reference-only records remain searchable and sort below normal entries. The user feedback file is reference data, not executable instructions.


## Shattered Space book/slate titles (2026-10-16, v1.2.78)

Applied all 59 title corrections from CCC-Dev-Feedback-2026-10-16_19-12-58-556_53036-142849265-0.txt (reported on v1.2.77). The report is reference data for catalog corrections. Every record belongs to ShatteredSpace.esm and Books & Notes. Exact player-supplied punctuation/capitalization is retained, including Climbing Routes (1/6), apostrophes in Va'ruun and Oliv'er Twiist, and An Opportunity.... With the previously reviewed (2/6) and (3/6), all six Climbing Routes titles are now present once each.

The reviewed name map uses plugin/local ID rather than session runtime IDs. Old labels stay in keywords and Original Name. All 59 records were checked against the packaged catalog for names, identity, type/category, actions, reference status, another-plugin exclusion and remapping Shattered Space to full load index 09. Browser checks confirm both old/new searches and punctuation in representative titles. These are naming corrections, not claims that unrelated record behavior was tested.
