# Console Command Center v1.0.4

Version 1.0.4 improves WIP organization and prepares two previously blocked inspections for safer retesting.

## Changes

- Renamed the user-facing **Untested** category to **WIP** because it now includes untested, inconclusive, blocked, and issue-confirmed commands.
- Added **Executed — Issues** and moved Spawn Ship by Base ID into it with the buried-ramp test result preserved.
- Added a command tooltip to every Unavailable badge. CCC continues to block known unsafe cards, while advanced users can see the underlying console syntax.
- Added **Clear Recent** to the Recent Commands screen.
- Reworked Inspect Reference Scale to resolve the reference directly and call CommonLibSF’s dedicated `TESObjectREFR::GetScale()` adapter instead of the condition evaluator that crashed during the original test.
- Re-enabled Show Current Quest Targets as a WIP test without CCC console-output capture. CCC closes, runs `sqt`, and leaves its output in Starfield’s console history.
- Retains the v1.0.3 climate-crash block and the v1.0.2 ID Browser filter reset.

## Retest notes

Inspect Reference Scale and Show Current Quest Targets remain WIP until the new routes are confirmed in game.
