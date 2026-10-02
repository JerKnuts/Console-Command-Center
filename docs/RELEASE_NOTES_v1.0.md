# Console Command Center v1.0

Version 1.0 is the first public Nexus release of Console Command Center. It brings the tested work from the 0.3 development series into one mouse-and-keyboard interface for everyday fixes, cheats, quest work, and advanced console access.

## Command interface

- Includes 144 established commands organized into Gameplay, Player, Inventory, Skills, Camera, World, Targets, Quests, and Ship categories.
- Uses compact two-column command cards, full-width Recent rows, Favorites, confirmation prompts, risk labels, and an Activity Log.
- Keeps 1,547 commands that still need verification in a separate Untested area with its own search and collapsible groups.
- Supports raw multiline command batches and up to 100 named reusable Custom Command entries.

## ID and Quest browsers

- Searches 16,528 packaged IDs without scanning live game memory.
- Provides filtered pickers for items, equipment, NPCs, mods, ships, perks, powers, effects, factions, companions, weather, locations, and cells.
- Offers safe quick actions such as adding an item, applying weather, or teleporting to a cell when the record type is unambiguous.
- Includes 2,318 quests and 16,844 recorded stage indexes from the base game and Shattered Space.
- Reads current quest stages and stage history through the native quest interface, without console-output scraping.

## Native tools and safety

- Provides direct results for supported inventory, reference, actor-value, Game Setting, ship, and quest inspections.
- Supports modifier-aware effective-total setters for carry weight, boostpack values, ship cargo, and reactor power.
- Targets Starfield 1.16.244. Native gameplay handlers stay disabled on unverified runtimes.
- Leaves known-broken actions visible but unavailable with an explanation.

## Interface improvements

- Keeps browser scroll position and expanded rows stable after selections, pagination, and quest inspections.
- Collapses unrelated ID categories when one category opens and restores the complete catalog after clearing a search.
- Adds clear buttons to search fields, compact ID tiles, equal-height field controls, and persistent utility navigation.
- Preserves the originating command values when an ID or quest selection is canceled.

See `COMMAND_CATALOG.md` for command-by-command verification and `RELEASE_VALIDATION.md` for the final test checklist.
