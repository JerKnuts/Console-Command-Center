# Dev Mode test reports

Click the small dot at the bottom left five times to toggle Dev Mode. It starts off each time CCC loads. The dot highlights when active. Five more clicks turn it off without deleting reports.

ID Browser, Mod Browser and ID favorites show three buttons on each item row: **Working**, **Issues**, and **Reference Only**. Working saves a green check immediately and is not added to the export queue. Reference Only saves a dark gray, struck-through row immediately, with no comment popup; it queues a request for review of whether Add to Player should be disabled. Issues opens a comment popup with Issue found (yellow exclamation mark) or Not noticeable (orange question mark). Cancel or Escape discards the unsaved popup. Saving retains the selected item, list scroll and action focus. Controller Left/Right moves across the item name and its report buttons; Up/Down moves between item names; B returns from a report button to its item name.

Commands, quests and settings retain their Test Report popup. Reporting never runs a console command or enables a blocked action.

Reports include the CCC version, time, record kind/name, runtime ID or command ID, local ID when provided, plugin/source, category, displayed command when applicable, selected result, and comment. Comment-only reports are allowed. When testing command inputs, mention the values used in the comment if they are not shown in the command text.

Export Reports saves the current batch as UTF-8 text in Documents\My Games\Starfield\Console Command Center\CCC-Dev-Feedback-YYYY-MM-DD_HH-MM-SS-mmm_unique.txt. Each export creates a new file without replacing earlier exports. After successful saving, the exported reports are cleared from game storage. Reports added while saving remain for the next batch. Exports are limited to 4 MB; failures keep stored reports and show an error. The controlled native endpoint accepts text only and cannot write to arbitrary paths or installed mod files.

In the browser preview, export downloads a timestamped CCC-Dev-Feedback file instead. Browser reports remain in that preview's local storage; game reports remain in the game's WebView storage. Send the exported file for review. The user has supplied an in-game export, confirming reporting and file export. Controller navigation and popup behavior remain part of the release checklist.

In Dev Mode, rows show the latest saved result: green/check for Working, yellow/exclamation for Issues, orange/question mark for Not noticeable, and dark gray/strikethrough for Reference Only. Reviewed working items also receive green markers. Outcomes persist separately from pending reports, so exporting does not reset row colors. Markers and row report buttons are hidden when Dev Mode is off.
