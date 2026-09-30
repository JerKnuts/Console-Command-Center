# Console Command Center v0.3.0 — Next Test Build

**Historical note:** v0.3.0-test2 used [TEST_BUILD_CRASH_GUARD.md](TEST_BUILD_CRASH_GUARD.md). Test1 was superseded after a scale-inspection crash; the shared evaluator was removed in test2.

**Superseded:** this file describes old test packages. See [the consolidated test results](../TEST_RESULTS_2026-09-27.md) for the latest recorded outcomes.

This is a cumulative overlay for the next in-game test launch.

Included since the last tested build:
- Quest Skips Check Status delayed console-output capture (native DLL rebuild required)
- Quest Skips moved below Categories, before Custom Command and Activity Log
- Search auto-focus retains its verified fix and selects existing query text
- Pay Bounty naming/behavior documentation and searchable faction ID picker
- Searchable companion ID picker for affinity/relationship commands
- Weather preset selections
- Latest command verification statuses (59 verified / 14 untested)

After overlaying this ZIP onto the working project, run:

    npm run build

Then deploy the newly built mod output as usual.
