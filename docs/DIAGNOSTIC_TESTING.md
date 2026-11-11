# Diagnostic test build

Build with `CCC_DIAGNOSTIC_TEST=1` in the environment. This enables the clearly labelled **DIAGNOSTIC TEST BUILD** button. Without that variable, the built interface excludes the test panel and its module.

Open the panel and choose **Run All Tests** or an individual case. Each case shows whether its expected behavior occurred and whether the native logger acknowledged the result. A missing acknowledgement is a failed logging check, not evidence that the file contains the event.

Cases cover base-game fallback, empty/failed load order, missing DLC, invalid small-plugin IDs, slot remapping, native request validation, invalid record inspection, simulated empty results/timeouts, zero results, version context, Unicode/multiline text and long error text. The test run ID and case ID are written to each `test-case-result` log entry. Simulated cases are labelled; expected rejection is distinct from an unexpected test failure.

The harness executes no console commands and changes no inventory, quests, catalogs or game settings. Its live requests are ping, invalid read-only record inspection and diagnostic logging. Closing the panel stops subsequent cases after the current request completes. Nothing is automatically sent to the author.

After testing, copy `Documents/My Games/Starfield/SFSE/Logs/Console Command Center.log` before restarting Starfield. Look for all 14 case IDs and the matching run ID. Native acknowledgement verifies the logging call; inspect the physical file as the final check. Actual running-game verification is still required even after automated tests pass.

Normal UI errors use the same native logger without Dev Mode. Item-action diagnostics include plugin ownership, local/runtime IDs, available slot information and lookup errors. Every diagnostic line includes UI/native/runtime versions. Text is bounded and control characters are flattened to avoid multiline log injection; duplicate UI failures are suppressed within a page session. If the native bridge is disconnected, CCC cannot write through it: collect `OSF UI.log` from the same directory too.

Return to a normal build without `CCC_DIAGNOSTIC_TEST` after testing. Dev Mode **Export Reports** remains a separate author workflow and is not needed for user error reports.
