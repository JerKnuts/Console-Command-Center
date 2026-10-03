# Console Command Center v1.0.5

Version 1.0.5 refines the advanced fallback shown for commands that CCC has blocked.

## Interface

- Restyled the Unavailable hover and keyboard-focus popup to match CCC's Caution and Danger explanation panels.
- Added the same anchored pointer, dark panel, red top edge, compact width, and typography used by Danger explanations.
- Kept the underlying console command selectable so experienced users can copy or enter it manually.

## Safety

- Blocked commands remain unavailable through CCC.
- The popup exposes command syntax without weakening the execution guard.

## Validation

- Run the automated behavior suite.
- Pass the OSF UI compatibility check.
- Build the production OSF UI view and native plugin.
- Hover and keyboard-focus an Unavailable badge in-game and confirm the popup remains visible and readable.
