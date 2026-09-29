# Quest Fixes Dataset

Console Command Center v0.3.0 includes a dedicated Quest Fixes browser with:

- 247 guided quest-stage selections (245 unique `setstage` commands)
- 79 named quest/objective entries
- 77 unique Quest FormIDs
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

**Check Status** and **Full SQS** are currently unavailable. The previous native inspection adapter was disabled after a crash, and long console-output capture has not been reliable enough to use as a replacement. The controls remain visible and disabled so the limitation is clear.

The stage list is a repair aid whose IDs and stage numbers are validated against the installed `Starfield.esm`. Run `npm run validate:quests -- "C:\\path\\to\\Starfield.esm"` to repeat that structural check. This confirms that each Quest ID and stage exists; it does not prove that forcing the stage is safe for a particular save. Check the quest in Starfield, make a manual save, and choose a stage only when the quest is already stuck.
