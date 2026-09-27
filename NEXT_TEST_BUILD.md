# Console Command Center v0.3.0 — Next Test Build

This is a cumulative overlay for the next in-game test launch.

Included since the last tested build:
- Quest Fixes Check Status delayed console-output capture (native DLL rebuild required)
- Quest Fixes moved below Categories, before Custom Command and Activity Log
- Search auto-focus retains its verified fix and selects existing query text
- Pay Bounty naming/behavior documentation and searchable faction ID picker
- Searchable companion ID picker for affinity/relationship commands
- Weather preset selections
- Latest command verification statuses (59 verified / 14 untested)

After overlaying this ZIP onto the working project, run:

    npm run build

Then deploy the newly built mod output as usual.
