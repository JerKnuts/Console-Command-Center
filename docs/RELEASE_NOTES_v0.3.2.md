# Console Command Center v0.3.2 Beta

## Controller navigation

- Removed automatic Search focus when CCC opens. OSF UI reserves gamepad input while a text field owns text-entry focus, which prevented controller navigation from starting.
- Added explicit spatial focus movement for OSF UI's D-pad and left-stick arrow mapping.
- Directional navigation respects the active Results, chooser, or confirmation window and scrolls newly focused controls into view.
- CCC now begins on the active navigation button when opened or restored.

### In-game follow-up

The controller experiment was not usable in game. Directional movement worked, but text fields trapped focus, A did not activate controls, B closed CCC, and spatial movement could jump into unrelated command fields. Custom controller navigation has therefore been removed from the next source revision. CCC now identifies controller support as in development instead of presenting partial support as complete. The current layout uses compact mouse-and-keyboard controls; adaptive larger controls will return with a complete controller input design.

## Picker follow-up in the next source revision

- Add Perk and Remove Perk now offer a searchable box containing the packaged perk, skill, and trait catalog.
- Add Power / Spell now offers all 24 base-game Starborn powers.
- Remove Spell / Status Effect offers the power list plus six conservative environmental-effect repair choices.
- Manual hexadecimal ID entry remains available beside every picker.

## Input behavior

- Every editable value input selects its existing contents when clicked.
- Numeric command fields use selectable text controls with numeric/decimal input hints and retain CCC's minimum, maximum, and step validation.
- ID Browser quantity can be cleared and replaced normally, then validates when Add to Player is requested.

## ID Browser

- Every result button now fills the complete category width, making the whole visible row selectable.
- Retains collapsed categories, full-catalog search, quantity actions, and Copy ID.

## Reliability

- Disabled Search Form IDs and Search Form IDs by Type after repeated v0.3.1 tests timed out without returning complete console output.
- The packaged ID Browser remains the supported ID lookup path.
- Marked Boostpack Sustained Thrust Effective Total, Boostpack Transition-Time Effective Total, and Set Companion Anger Level verified from v0.3.1 testing.
