# Quest Fixes Dataset

Console Command Center v0.3.0 includes a dedicated Quest Fixes browser with:

- 248 guided quest-stage selections (246 unique `setstage` commands)
- 80 named quest/objective entries
- 78 unique Quest FormIDs
- Search by quest name, Quest FormID, or stage number
- A confirmation warning before every repair command

Each entry executes the vanilla Starfield command:

```text
setstage <QuestFormID> <Stage>
```

The dataset contains curated quest FormIDs and stage mappings used to construct vanilla Starfield console commands directly inside Console Command Center.

## Safety

`setstage` is a repair tool, not a normal progression shortcut. Moving to the wrong quest stage can skip dialogue, scripts, rewards, scenes, prerequisites, or other state changes. Make a manual save before using a guided quest fix.

## Live quest diagnostics

Before applying a repair stage, use **Check Status** on that quest card. CCC asks the native plugin to inspect the live `TESQuest` state and displays:

- **Current / Highest Completed Stage** — matches Starfield's `GetCurrentStageID` / `getstage` semantics.
- **Completed Stages** — every stage number that Starfield reports as already completed for that quest.
- Repair-stage buttons are annotated **DONE** or **CURRENT** when they match the live quest state.
- **Full SQS** runs `sqs <QuestFormID>` so the complete stage-status table can still be printed to Starfield's console for deeper inspection.

The status scan is performed **on demand** per quest rather than for every quest when the page opens. This keeps the Quest Fixes browser responsive.

### Current-stage caveat

Starfield defines `GetCurrentStageID` as the **highest completed stage**. A quest that deliberately returns to a lower/repeating stage can therefore report a higher historical stage than the stage it most recently visited.
