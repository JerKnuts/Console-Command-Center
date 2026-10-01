# Console Command Center v0.3.7 Beta

This release contains 141 curated commands, 16,528 included Form IDs, and 2,318 quest records with 16,844 recorded stage indexes. It targets Starfield 1.16.244 and disables native gameplay handlers on unverified runtimes rather than risking incompatible calls.

## Additional verified commands

- Added **Set Interior Gravity** after confirming that `setgravityscale 0` removes gravity inside a building and `setgravityscale 1` restores it. The card clearly states that the command only works in interior cells.
- Added **Reevaluate Actor Behavior** using `{refId}.evp`; in-game testing confirmed that it released an NPC from a stopped interaction and made him resume walking.
- Added **Set Carry Weight Effective Total** through CCC's modifier-aware native setter. Direct testing showed that a base value of 500 produced an effective total of 508 because of an active +8 modifier.
- Rejected Release Weather Override, Reset Reference 3D State, Set Actor Alert State, and Force Bleedout after they produced no dependable result or could not be parsed as Reference-ID commands.

## Open and close references

- Removed the unavailable **Inspect Reference Open State** card because its old native reader shared the unsafe adapter removed after the test1 crash.
- Renamed the verified state-changing command to **Open or Close Reference** and added a compact Open/Closed chooser.
- Keeps manual `0` and `1` entry available while making the intended states clear.

## Held-object Reference ID

- Confirmed in Starfield's own console that `getplayergrabbedref` returns the held object's Reference ID and returns `00000000` after release.
- Removed CCC's unavailable held-object card because the console result cannot be captured reliably and the native grab/release event source remains unresolved in CommonLibSF.
- Did not restore the event adapter that previously prevented saves from loading.

## Wait Anywhere

- Replaced the unavailable **Open Wait Menu** card with **Wait Anywhere**, a 1–24 hour control using the verified `passtime` command.
- Testing on Starfield 1.16.244 confirmed `SitWaitMenu` only shows a nonfunctional seated-wait prompt when invoked in the open world, while `SleepWaitMenu` dismisses it without opening the hour selector.
- Removed both unsupported menu names from CCC's executable command catalog so they cannot leave movement controls stuck.

## Quest Browser safety

- Disabled **Check Current Stage** and **Show Stage History** in the Quest Browser because Starfield's console output cannot be captured reliably.
- Removed the Quest Browser execution route that could still invoke `getstage` and `sqs` despite the matching command cards being unavailable.
- Added visible guidance that Start Quest may need a stage before it appears in the mission log and Reset Quest clears stages without restarting the quest.

## ID Browser cleanup

- Cleaned the merged catalog and added a reviewed ship selection, resulting in 16,528 included entries.
- Removed long internal faction descriptions, creature-attack weapons, debug and non-playable weapons, and additional localization collisions.
- Uses cleaned Editor IDs for Shattered Space records rather than pairing expansion records with reused base-game localization keys.
- Caps generated display labels at 72 characters while preserving Editor IDs for search.
- Collapses every ID Browser category when the search is cleared or the user leaves a search session.

## Startup and documentation

- Loads the 3 MB ID dataset and the Quest Browser dataset only when their corresponding screens are opened.
- Keeps the on-demand load silent because both datasets initialize immediately during in-game testing.
- Gives command value fields and their adjacent **Choose** buttons the same height.
- Removed obsolete test-build prose and contradictory quest-capture claims from the README.
- Updated the command catalog, current checklist, dataset counts, and Quest Browser documentation.

## Custom Command workspace

- Uses the open right side of the Custom Command screen for up to 10 named saved entries.
- Saved entries persist between sessions and can contain a single command or a multiline batch.
- **Load** restores an entry to the editor for review without running it; **Delete** removes it.
- Saving under an existing name updates that entry instead of using another slot.
- Uses a 60/40 editor-to-saved-entry layout, aligns the saved panel with the top of the workspace, and keeps saved rows compact by showing only their name and command count.
- Places **Load** and **Delete** side by side for shorter, denser saved-entry rows.

## Form ID command searches

- Re-enabled **Search Form IDs** and **Search Form IDs by Type** using CCC’s packaged catalogs.
- Search results open directly in ID Browser with copy buttons, categories, and supported quick actions.
- Typed searches apply an exact record-type filter; `QUST` searches open the packaged Quest Browser.
- Does not restore the console-output scraper or the native live-form scanner that failed earlier testing.

## Browser-backed command fields

- Added browser selection modes for item, equipment, base-object, NPC, modifier, ship, perk, power, effect, and quest IDs.
- Add/Remove Perk open ID Browser with only packaged PERK records. Add Power shows only Powers, while Remove Spell/Effect shows both Powers and known removable Effects.
- Filtered command-field selections place their permitted categories at the top of the results area and open them automatically.
- Quest requirement, internal/system, original-story, and New Game Plus variant badges remain visible while a quest row is collapsed.
- Choosing a record restores the originating command card and its other entered values without executing anything.
- Every Quest ID command can choose from Quest Browser; Set Quest Stage can then choose one of that quest’s recorded stages.
- Runtime Reference ID fields remain manual because a packaged base Form ID cannot safely identify a placed object, ship instance, or dropped item.
