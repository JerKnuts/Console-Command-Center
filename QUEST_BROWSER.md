# Quest Browser

Quest Browser contains **2,318 quest records** and **16,844 recorded stage indexes**:

- 2,077 base-game records
- 241 Shattered Space records
- 972 records whose player-facing name is unavailable and therefore use their internal Editor ID

The browser supports search by quest name, Editor ID, Form ID, source, category, and stage number. Base Game and Shattered Space categories live in the sidebar, and the selected category loads as one compact scrollable list. Shattered Space records display an expansion requirement note.

Each quest provides:

- **Check Current Stage** — reads the current/highest completed stage plus running/completed state through Starfield's quest scripting interface.
- **Show Stage History** — checks every packaged stage through the same native scripting path and reports each as done or not set.
- **Start Quest** — runs `startquest` after a Danger confirmation.
- **Stop Quest** — runs `stopquest` after a Danger confirmation.
- **Complete Quest** — runs `completequest` after a Danger confirmation.
- **Reset Quest** — clears recorded stages and removes the quest from the quest log after a Danger confirmation; it does not restart the quest.
- **Copy Quest ID** — copies the displayed Form ID.
- **Stage buttons** — run `setstage` after a Danger confirmation.

The dataset is generated from the installed Bethesda master records and English localization data. It includes every quest record found in `Starfield.esm` and `ShatteredSpace.esm`, including records with no explicit stage indexes. Stage indexes establish that a stage exists structurally; they do not establish that forcing the stage is safe or appropriate for a particular save.

Internal and system quests are included for completeness and are clearly labeled. Avoid starting, completing, or changing these records unless you understand what the quest controls.

Always make a manual save before using Start Quest, Stop Quest, Complete Quest, Reset Quest, or Set Stage. These commands can bypass or disturb dialogue, scripts, scenes, rewards, prerequisites, and other state changes.

Start Quest can send successfully without adding a visible mission until a stage is activated. Reset Quest clears recorded stages and removes the mission from the log without restarting it. CCC reports that the command was sent and leaves the resulting state for the player to verify in game.
