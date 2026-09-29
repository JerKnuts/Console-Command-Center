# Console Command Center v0.3.0 — Extended Batch Test Checklist

Latest reported outcomes are recorded in [TEST_RESULTS_2026-09-27.md](TEST_RESULTS_2026-09-27.md). For the historical output-fix build, see [TEST_BUILD_OUTPUT_FIXES.md](testing-history/TEST_BUILD_OUTPUT_FIXES.md). Results now open in their own window and can be reopened from Activity Log. These unchecked boxes remain a reusable test checklist, not the current pass/fail record.

Use one manual/disposable save for this pass. The goal is to test as much as possible in a single Starfield launch.


## 0. ID Browser

- [ ] Open **ID Browser** from the fixed sidebar utility buttons.
- [ ] Search the built-in catalog for `Beowulf`; verify the weapon and Form ID appear.
- [ ] Search the built-in catalog for `Aluminum`; verify the resource and Form ID appear.
- [ ] Search the built-in catalog for `Mark I Spacesuit` and `Boost Pack Training`; verify Armor and Perk starter records appear.
- [ ] Change **Built-in Category** to Weapons, Armor, Ammo, Resources, Perks, and Mods; verify the result list follows the selected category.
- [ ] Set **Game Record Type** to WEAP, search `Beowulf`, click **Search Game**, and verify a live WEAP result is parsed from Starfield.
- [ ] Select a built-in/live item row and verify the selected-ID card updates.
- [ ] On a safe item/ammo record, use **Add 1 to Player** and verify the normal confirmation appears before execution.
- [ ] Select an OMOD record and verify CCC does **not** offer an automatic attach action.
- [ ] If a known Creation/mod is installed, search part of its record name and verify **Search Game** can return a loaded mod/DLC record.
- [ ] Clear Live results and verify the built-in catalog remains available.

## 1. Read-only tools first

- [ ] Show Player Inventory — output is captured; multiline result is readable in Activity Log.
- [ ] Search Form IDs — search a known item name such as `drum beat`.
- [ ] Search Form IDs by Type — search `drum beat`, choose `WEAP`, and verify matching weapon records.
- [ ] Inspect Player Actor Value — `Health`.
- [ ] Inspect Game Setting — `uSpaceshipMaximumOwnedSpaceships`.
- [ ] Show Current Quest Targets — verify `sqt` output is captured.
- [ ] Get Current Quest Stage — use a known active Quest ID.
- [ ] Show Quest Stage History — use the same Quest ID and inspect Activity Log.
- [ ] Get Grabbed Object Reference ID — hold/move a loose world object first.
- [ ] Inspect Reference Open State — use a normal door Reference ID.
- [ ] Inspect Reference Actor Value — use `Health` on an NPC or `CarryWeight` on a suitable reference.

## 2. Repair / state tools

- [ ] Force Enable Player Controls — only if comfortable testing; immediately test the reset command afterward.
- [ ] Reset Forced Player Controls.
- [ ] Reset Actor AI — use a disposable/non-quest NPC if possible.
- [ ] Force Actor Repath — use an NPC in a safe area.
- [ ] Set Reference Open State — normal door: test `1` open, then `0` closed.

## 3. Ship tools

Be aboard the ship before running **Get Current Ship Reference ID**. Record original values before changing them.

- [ ] Get Current Ship Reference ID.
- [ ] Inspect Ship Actor Value — `CarryWeight`.
- [ ] Inspect Ship Actor Value — `CarryWeightShielded`.
- [ ] Inspect Ship Actor Value — `SpaceshipCrewRating`.
- [ ] Inspect Ship Actor Value — `SpaceshipReactorPower`.
- [ ] Inspect Ship Actor Value — `SpaceshipGravJumpFuel`.
- [ ] Inspect Ship Actor Value — `SpaceshipBoostFuel`.
- [ ] Inspect Ship Actor Value — `SpaceshipBoostRechargeRate`.
- [ ] Set Ship Cargo Capacity — make a small, obvious change and verify in the ship UI.
- [ ] Set Shielded Cargo Capacity — verify if the current ship supports/displays it.
- [ ] Set Ship Crew Capacity — make a small change.
- [ ] Set Player Ship Command Slots — make a small change.
- [ ] Set Ship Reactor Power Actor Value — make a small change and note whether final displayed power is direct or derived/additive.
- [ ] Set Ship Grav Jump Fuel — make a small change.
- [ ] Set Ship Boost Fuel — make a small change.
- [ ] Set Ship Boost Recharge Rate — make a small change.

## 4. Session-only ship Game Settings

These normally reset after restarting Starfield. Use **Inspect Game Setting** first if you want to record the live value.

- [ ] Set Maximum Owned Ships — vanilla hint: 10.
- [ ] Set Ship Looting Distance — vanilla hint: 500.
- [ ] Set Maximum Docking Distance — vanilla hint: 500.
- [ ] Set Ship Cargo Transfer Distance — inspect first; commonly reported around 1000.
- [ ] Set Ship Builder Module Limit — vanilla hint: 130.
- [ ] Set Ship Builder Module Hard Limit — vanilla hint: 130. Keep both module limits matched when testing higher caps.

## 5. Reddit-derived command additions

Start with the read-only companion checks, then make small reversible changes on a disposable save.

- [ ] Open Wait Menu — verify the normal wait/sleep menu appears.
- [ ] Inspect Companion Affinity — choose one core companion and verify a numeric result is captured.
- [ ] Inspect Companion Relationship Level — same companion.
- [ ] Inspect Companion Anger Level — same companion.
- [ ] Set Star Power Recharge Rate — inspect `starpowerratemult` first, change it modestly, then restore the original value.
- [ ] Set Scanner Scan Range — inspect the current Game Setting first; make a modest change and verify scanner range behavior.
- [ ] Set Scanner Base Range — inspect the current Game Setting first; make a modest change and verify scanner range behavior.
- [ ] Set Scanner Social Range — inspect first, then make a modest change.
- [ ] Set Boostpack Horizontal Percentage — inspect the actor value first, make a modest change, then restore it.
- [ ] Set Boostpack Initial Thrust — inspect first, make a modest change, then restore it.
- [ ] Set Boostpack Sustained Thrust — inspect first, make a modest change, then restore it.
- [ ] Set Boostpack Time to Sustained — inspect first, make a modest change, then restore it.
- [ ] Set Ship Builder Max Height — inspect the Game Setting first and test only on a backup save; restore the original value afterward.
- [ ] Set Landable Ship Max Size X/Y/Z — inspect each Game Setting first; test only with a backup save and restore afterward.
- [ ] Set Landable Small Ship Size — inspect first; test with a backup save and restore afterward.

## 6. Dangerous command — last only

- [ ] Mark Reference for Permanent Deletion — test only on an object you spawned yourself with CCC. Record its Reference ID, mark it, leave/reload the cell, and confirm it is gone. Do not use a vanilla/quest/persistent reference.

## Existing new-command batch still awaiting verification

- [ ] Add Skill Points
- [ ] Restore Player Health
- [ ] Restore Actor Health
- [ ] Stop Actor Combat
- [ ] Activate Reference
- [ ] Set Exact Reference Position
- [ ] Set Exact Reference Rotation
- [ ] Inspect Reference Position
- [ ] Inspect Reference Rotation
- [ ] Inspect Reference Scale
- [ ] Set Companion Anger Level
