# Console Command Center v1.0.7

Version 1.0.7 incorporates the second October 2 WIP test round and blocks another confirmed renderer crash.

## Safety

- Blocked Toggle Decal Rendering after it crashed Starfield 1.16.244.
- The attached Trainwreck log records an access violation in Starfield's DX12 render graph with SkyOcclusionMaskRenderPass and SkyOcclusionRenderPass on the stack.
- Kept the command visible under Blocked — Known Crash with its raw syntax available from the disabled action.

## Promoted commands

- Toggle Game Pause moved to World.
- Toggle First-Person Hands moved to Camera after it visibly hid the held weapon and first-person hands.
- Use Nearest Teleport Door moved to World.
- Select Console Reference by ID moved to Targets.
- Removed their raw engine-library duplicates.

## Inconclusive results

- Toggle Debug Text, Toggle NavMesh, Toggle NavMesh Info, Toggle Path Line, Toggle Primitives, Show Light Bounds, and Toggle Lite Brite executed without errors but produced no confirmed visible effect.
- These remain available under Executed — Effect Unconfirmed for advanced testing.

## Validation

- Run the automated behavior suite and OSF UI compatibility check.
- Compile the native plugin and production interface.
- Confirm Toggle Decal Rendering cannot execute through CCC.
- Confirm the four promoted commands appear in established categories and no longer have raw WIP duplicates.
