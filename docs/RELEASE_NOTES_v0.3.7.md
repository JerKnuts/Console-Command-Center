# Console Command Center v0.3.7 Beta

## Quest Browser safety

- Disabled **Check Current Stage** and **Show Stage History** in the Quest Browser because Starfield's console output cannot be captured reliably.
- Removed the Quest Browser execution route that could still invoke `getstage` and `sqs` despite the matching command cards being unavailable.
- Added visible guidance that Start Quest may need a stage before it appears in the mission log and Reset Quest clears stages without restarting the quest.

## ID Browser cleanup

- Reduced the merged catalog from 16,787 to 16,518 reviewed/generated entries.
- Removed long internal faction descriptions, creature-attack weapons, debug and non-playable weapons, and additional localization collisions.
- Uses cleaned Editor IDs for Shattered Space records rather than pairing expansion records with reused base-game localization keys.
- Caps generated display labels at 72 characters while preserving Editor IDs for search.
- Collapses every ID Browser category when the search is cleared or the user leaves a search session.

## Startup and documentation

- Loads the 3 MB ID dataset and the Quest Browser dataset only when their corresponding screens are opened.
- Removed obsolete test-build prose and contradictory quest-capture claims from the README.
- Updated the command catalog, current checklist, dataset counts, and Quest Browser documentation.
