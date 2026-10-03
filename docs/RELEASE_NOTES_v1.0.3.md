# Console Command Center v1.0.3

Version 1.0.3 improves how CCC records uncertain command tests and blocks a newly confirmed crash path.

## Changes

- Added an **Executed — Effect Unconfirmed** group under Untested. Commands that execute without errors but have no observable result remain available there for advanced users and future testing.
- Added an **EFFECT UNCONFIRMED** status label to those command cards.
- Moved inconclusive visual and rendering commands into the new group, including Motion Blur, TAA, FSR2, VRS, Rain Occlusion, Lens Flare, World Markers, FOV, Wireframe, Collision Geometry, and the subtitle override.
- Moved Reload Current Weather into the same group after repeated tests produced no visible result.
- Disabled **Reload Current Climate**. An in-game v1.0 test on Starfield 1.16.244 caused an access violation in the game's sky and weather processing.
- Retains the v1.0.2 fix that resets command-specific ID Browser filters before returning to the standalone browser.

## Safety

Reload Current Climate remains listed so users can understand why it is unavailable. CCC will not execute it from its prepared card or search result.
