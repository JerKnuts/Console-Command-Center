# Console Command Center v0.3.3 Beta

## Searchable progression choices

- Added a searchable **Choose Perk** box to Add Perk and Remove Perk.
- Added all 24 base-game Starborn powers to **Choose Power** for Add Power / Spell.
- Added **Choose Effect** to Remove Spell / Status Effect, containing the power list and six conservative environmental repair effects.
- Kept manual hexadecimal Form ID entry available for every command.
- Expanded the packaged ID Browser from 340 to 370 entries and enabled its Powers / Effects category.

## Compact interface

- Removed the unsuccessful custom controller navigation experiment.
- Marked controller support as in development for a future release with navigation, activation, text entry, and adaptive sizing designed together.
- Reduced oversized controller-oriented buttons, fields, navigation rows, utility controls, and picker entries for the current mouse-and-keyboard interface.
- Moved each ID Browser category label beside the item name and shortened rows without additional notes.

## Reliability and usability retained

- Every editable value field selects its current contents when clicked.
- ID Browser rows remain selectable across their full width.
- ID Browser quantity remains freely editable and validates before execution.
- Search Form IDs and Search Form IDs by Type remain disabled because their console-output capture was unreliable.
- Known-broken commands remain visible with explanations and cannot execute.

## Validation

- 26 automated behavior and catalog tests pass.
- OSF UI compatibility checks pass.
- The catalog continues to reject duplicate packaged Form IDs.
