# Console Command Center v1.1.0

This controller-support update adds complete gamepad navigation and text entry to CCC through OSF UI 2.0, together with compact layouts for Commands, ID Browser, and Quest Browser.

## Changes

- Navigate the full interface with the D-pad or left stick.
- Press **A** to select buttons, open cards, and activate controls.
- Press **B** to back out one layer at a time, or hold **B** to close CCC from anywhere.
- Scroll long pages with the right stick.
- Press **A** on any editable field to open CCC's controller keyboard.
- Use **X** for backspace, **Y** for space, and **LB/RB** to move the text cursor.
- Use dedicated letter, symbol, number, and hexadecimal keyboard layouts.
- Enter line breaks in Custom Command batches from the controller keyboard.
- Restore controller focus after page changes, searches, and dialogs.
- Show a clear focus outline only while a controller is active.
- Add controller directions to the welcome screen and contextual Help.
- Use **LB/RB** to cycle through Commands, ID Browser, Quest Browser, Custom Command, and Activity Log.
- Enter Commands, ID Browser, and Quest Browser through their category lists, then move from the result list into the selected detail panel.
- Move directly between the favorite star and Execute, through the quest action grid, and vertically through uneven virtual-keyboard rows.
- Enter Custom Command at Reusable Entries and Activity Log at the newest activity entry.
- Load complete WIP, ID, and quest result lists without Show More or pagination controls.
- Repeat directional navigation while the D-pad or left stick is held.
- Keep controller focus inside the Quest Browser detail pane until B is pressed.
- Scroll result and information windows with the right analog stick.
- Return from a command, ID, or quest list to the category that is currently open.
- Return from inspection results to the control that opened the window.
- Move from the bottom keyboard letter row to the nearest action button.
- Reassert exclusive controller capture when the virtual keyboard opens so input stays in CCC.
- Show compact Select, Start, LB, and RB hints while controller navigation is active.
- Search every category on Commands, ID Browser, and Quest Browser from each page's search field.
- Show B on Close and modal Cancel controls, X on keyboard Backspace, and Y on keyboard Space while using a controller.
- Keep directional focus inside the Selected ID pane until B is pressed.
- Move up from the newest Activity Log entry to Clear Log, and back down to the newest entry.
- Route selected engine status commands through CCC's captured Results window instead of discarding their console text.
- Add an optional target prefix to target-scoped engine diagnostics such as ShowAnim and Show Inventory.

## Updating

Install the archive normally over v1.0.13. Favorites, Recent entries, Activity Log history, and saved Custom Commands continue using the same storage keys and should remain intact. Do not clear OSF UI browser data while updating.

The release requires Starfield 1.16.244, SFSE, Address Library for SFSE Plugins, OSF Settings 1.0.0 or newer, OSF UI 2.0.0 or newer, and Microsoft Edge WebView2 Runtime.

If updating from v1.0.12 or earlier, remove `Data/SFSE/Plugins/OSFUI/views/console.command-center/`. v1.1.0 installs its view under `Data/SFSE/Plugins/OSF/UI/views/console.command-center/`.
