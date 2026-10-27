# Changelog

## 1.4.0

Public release consolidating the tested 1.3.37–1.3.69 updates:

- Add in-CCC Audio Slate playback with themed controls, volume, speed and a scrolling line transcript. Group books, notes, text slates and image slates as Books / Notes; keep Audio Slates separate. Read/Listen sit below compact still previews.
- Ship 4,822 official-item thumbnail mappings and generate still previews on demand for supported mod items. Add vehicle previews and correct their orientation; hide unsupported complete-ship viewers.
- Improve model materials, reflections, filtered object/ground shadows, male/female mannequins and theme-specific gradient backgrounds. Preserve the mannequin toggle between items. Suits use neck/head only; hats, helmets and packs use full-size mannequins. Omit the heat-distortion shell that obscured several mod blades. The checkerboard and experimental shop backdrops remain removed.
- Improve progressive color loading and negotiate larger native transfer chunks, retaining bounded transfers, cancellation and legacy fallback. Complex cold Ultra previews can still take time.
- Refresh mod favorite IDs from plugin ownership/current load order before actions, including full, medium and small plugins. Unavailable owners block execution.
- Improve read-only command results using supported direct queries, retain unverified results as unverified, and update reviewed names. Remove Caution/Danger tags; keep command instructions and review. Working is a manual toggle and issue reports retain the displayed category.
- Rename Commands to Command Browser, Custom Command to Batch Commander, and Activity Log to Command Log. Sort commands alphabetically and add favorite stars.
- Improve controller playback focus, transcript scrolling, modal-only B behavior, item-detail routes, focus outlines and navigation across all three Batch Commander columns. Stabilize the mod scan status layout.
- Allow the saved CCC keyboard binding over supported game menus. The separate two-press shortcut issue and occasional OSF Loading hang remain known issues.
- Consolidate current README, model, reading, controller, development and future-feature documentation. Ship maintained source and generated UI assets without local build caches, dependencies or raw game/mod assets.

## 1.3.69

- Omit the engine-only HeatDistortion material from model previews. This removes the gray shell covering Melee Madness blades such as Crimson Gutter and Crimson Shiv, including initial geometry and small previews, while preserving physical meshes and other effects.

## 1.3.68

- Connect all three Batch Commander columns for controller navigation. Right from Included files reaches the center Review Commands control; Left from the saved-panel boundary also reaches the center instead of skipping it. Up reaches the editor and Down returns to Review Commands. Keep saved-file initial focus and right-panel controls.

## 1.3.67

- Start the listening dialog on Play, link Left to Volume, use Up/Down to adjust a focused audio slider, and send right-stick scrolling to the transcript. Range controls no longer open the text-entry keyboard.
- Keep short/held controller B and Escape scoped to the reading/listening dialog. Retain the dialog scope for the entire B press, including if it closes before release.
- Add direct item-detail routes from Favorite to Copy ID and from Copy ID up to Model Viewer (or Read/Listen), with connected quantity/action rows.
- Start Batch Commander on a saved file’s Load control, or Save .txt File when empty. Remove the panel itself as a focus stop. Link saved files, entry name, Save, Refresh, Auto-Run and the Included sidebar; preserve deliberate sidebar focus instead of resetting it into the panel.
- Inset controller focus outlines so category and result-list clipping cannot hide their left edge.

## 1.3.66

- Make Read, Listen and Model Viewer buttons compact and centered beneath the preview instead of spanning its full width.

## 1.3.65

- Move Read for books/notes and Listen for audio slates directly below their small previews in the shared ID/Mod Browser details. Preserve the action while preview loading fails, and keep unavailable items disabled.
- Remove the surrounding border and frame padding from small item previews across all item types. Keep their image backgrounds and Model Viewer actions.

## 1.3.64

- Remove the new shop backdrops, automatic shop selection and six bundled shop images at user request. Keep the original colors/gradients and Basic-mode background controls. Saved shop choices fall back to the active theme default.

## 1.3.63

- Restore the Model Viewer Background selector and D-pad background cycling in Basic mode as well as Advanced Options.
- Resolve shop image URLs against the view document instead of the consuming stylesheet. This fixes the blank shop scenes in the bundled/in-game viewer. Keep the selected six images, theme defaults and remembered selections unchanged.

## 1.3.62

- Add the six selected shop backdrops in Advanced Options: stylized Centaurian weapons/helmet displays and CJ’s counter; realistic EIT dressing room and Rowland fitting room/pack stand. “Shop display (by item)” selects the appropriate scene in either browser. Retain Graphite/Pearl defaults and remembered theme choices.
- Keep background controls and controller background cycling in Advanced Options.
- Bundle REV-8 and Moonjumper thumbnails and rotate vehicle stills/full models 180 degrees.
- Negotiate 256 KiB native model chunks instead of 64 KiB, retaining four parallel replies and existing pacing. This reduces chunk requests by about 75% without changing texture pixels. Older native plugins retain 64 KiB transfers; this improvement needs the updated DLL loaded after a game restart.

## 1.3.61

- Rename Custom Command to **Batch Commander** and Activity Log to **Command Log**, including navigation, page titles, help, result-window messages, command descriptions, documentation and the example translation.

## 1.3.60

- Replace the rounded native audio player with square CCC controls using the active dark/light palette. Use one play/pause triangle, timeline, volume/mute and a direct playback-speed selector. Remove the separate Play Recording button, three-dot menu and download control.
- Follow the recording with a scrolling transcript: highlight the current recorded line, dim the preceding line, and fade upcoming lines. Clicking a line starts it; playback advances and keeps the chosen speed. Pause/resume preserves the current position, including pause requests made while a line is still loading.
- Correct the audio dialog's light-theme surface and remove the empty book-text panel from audio-only recordings.

## 1.3.59

- Keep only the small still preview for books and all slate types, without a Model Viewer button. Stand flat reading models upright and use a slight viewing angle.
- Combine books, image slates, notes and text slates into **Books / Notes** in the ID Browser and matching Mod Browser groups. Keep **Audio Slates** separate and preserve reading, listening and preview actions.

## 1.3.58

- Separate Books, Notes, Text Slates, Audio Slates and Image Slates using authored record and inventory model data. Audio Slates have an in-CCC player with transcripts, line selection, pause and seeking; playback reads installed voice assets without starting scenes or advancing quests. Books and slates can use their real inventory models in previews.
- Rename Commands to Command Browser and sort its commands alphabetically, including searches and WIP. Preserve Recent and Favorites order.
- Keep the Mod Browser scan panel steady for two-line mod names. Rename Armor to Armor / Apparel and face its previews forward.
- Expand and darken ground shadows with a separate shadow projection, preserving item self-shadow detail. Resolve the installed M82Bub rifle's renamed receiver attachment host.
- Remember the mannequin toggle across items. Use original full-size mannequins for helmets, hats and packs; use only the head/neck for spacesuits to eliminate body, hand and foot clipping.

## 1.3.57 (unpublished test build)

- Add 476 official update/DLC thumbnail mappings, including the reported Va'ruun and caped outfits. Restore on-demand small mod previews as static PNG captures with a bounded session cache.
- Read standalone JSON mod materials and exact texture slots to restore missing colors, detail maps and decals, including the Armat FZ44A rifle. Complex imported material layers remain approximate.
- Refresh plugin load order for every favorite/item quick action. Resolve stable plugin/local IDs and recover compatible legacy mod favorites; block unavailable or unidentified items.
- Add explicit female/male/automatic mannequin selection and slimmer torso/forearms. Keep outfit body selection separate. Hide unsupported complete-ship viewers.
- Remember separate background choices by theme, defaulting to Graphite for dark and Pearl for light, with five new light gradients.
- Improve shadow resolution/filtering and add a soft transparent ground shadow that follows the light beneath the model.

## 1.3.56 (unpublished test build)

- Replace the small ID Browser model with a bundled static WebP thumbnail. Generate base-game images offline, deduplicate identical model/material/orientation packets and ship the image files with CCC. The small preview makes no native model requests, creates no live renderer and writes no thumbnail cache. Keep the interactive Model Viewer button for every supported item, including unpictured mod/DLC and unsupported offline geometry.
- Preserve the selected thumbnail background, accessible item name and existing initial category orientations. Use worn armor models for offline apparel, spacesuit, pack and helmet images, with the same male/female fallback as live previews.
- Pace full-model texture transfers below the OSF UI host's 128 page-messages/second limit. The user's game log confirms that exceeding this cap dropped requests and caused the reported previewChunk timeout. Keep four bounded chunks, smaller retries, cancellation and retained-preview behavior.
- Include offline image regeneration tooling and coverage/asset checks. Normal builds and players do not run the generator.


## 1.3.55 (unpublished test build)

- Display a small base-color preview before preparing detailed textures in the full Model Viewer. Inline previews use the same lightweight color stage and share it with the full viewer. Preserve camera, zoom, lighting, opacity and material tint while the chosen quality loads.
- Skip normal/roughness, metal, ambient-occlusion texture composition and detailed material layers during the initial 128px color pass. Full quality continues to use all supported maps and layers.
- Replace whole-cache texture eviction with bounded least-recently-used eviction, allowing 256 MiB for Ultra decoded source maps. Retain large completed previews in bounded browser/native caches so reopening can avoid another transfer.
- Transfer four bounded 64 KiB chunks concurrently, with smaller retries and cancellation checks. Use stronger compression for detailed packets and avoid redundant renderer redraws during material upgrades. Record native stage duration and transfer sizes in the plugin log.


## 1.3.54 (unpublished test build)

- Restore the Model Viewer Background selector with five muted gradients (Graphite, Blue, Teal, Warm and Plum) and two solid backgrounds (Charcoal and Black). Default to Graphite gradient. Remember the chosen background across viewers and restarts and share it with inline previews. Background changes do not reload models or change the camera or lighting.
- Let controller users cycle backgrounds with D-pad left/right outside the Quality menu; retain the existing Quality navigation while that menu is open.
- Rotate the starting view of all Apparel and Spacesuits records by 180 degrees in both inline previews and the full Model Viewer, including the geometry-first loading stage and reset orientation. Preserve the user's camera during texture/quality upgrades and retain the existing helmet orientation.


## 1.3.53 (unpublished test build)

- Add a shared shadow-map pass so opaque model parts and cutouts cast shadows onto other surfaces. Shadows follow the movable light and model rotation, with quality-scaled resolution, filtered edges, and receiver-plane depth correction to prevent striped self-shadowing. Glass and animated transparent effects do not cast opaque shadows.
- Replace the bright gray reflection environment with a dark neutral studio and broad reflection cards. Reflections respond to viewing angle, light direction and authored roughness/metal maps. Lower ambient fill for better shape and recess contrast without darkening source textures.
- Render glass as a thin transparent surface with Fresnel edge reflections and reduced diffuse absorption, removing the gray veil over beer, visors and other glass. Honor authored roughness and always route glass through the transparent pass.
- Apply these changes to the shared inline/full model renderer for all items. Retain animations, material update/camera controls, texture toggle, and disabled missing-texture checkerboard. Keep the native inventory-renderer experiment separate; no OSF dependency changes or Working designations.


## 1.3.52 (unpublished test build)

- Fit the final unique preview texture maps within the existing 64 MiB / Ultra 256 MiB transfer budget, reducing the largest maps only when necessary. Preserve all geometry, map references, flags and alpha channels; keep cached source pixels unchanged. This shared fallback covers both preview viewers and all items, including the six new Aid reports, without raising the transfer limit.

- Add a CCC-owned keyboard shortcut fallback for inventory, containers, shops, data, maps, missions, skills, research, crafting, status, powers, crew, books and transfer menus. Read only the exact CCC keyboard action in Starfield's saved ControlMap_Custom.txt; do not change or duplicate the user's binding.
- Open CCC above the existing menu through the normal OSF request API; leave that menu open. Exclude Pause/Controls, OSF Settings, console, text/dialogue, character creation, loading and transition screens. The Pause menu exclusion also protects vanilla Controls key capture. Controller menu shortcuts are unchanged.
- Require a fresh press, reject malformed/unbound saves and held keys after rebinding, check game foreground focus, and suppress duplicate callback/polling requests. Keep the normal gameplay callback and existing preview controller lifecycle observer. No OSF source changes, native launcher menu, or automatic Working status changes. The separate two-press issue remains unresolved.


## 1.3.51 (unpublished test build)

- Apply food/drink preview findings through shared material rules, without per-item ID exceptions. Resolve HasOpacity and alpha-test thresholds independently through inherited AlphaSettings components. Opaque materials ignore unused inherited opacity maps; cutouts retain their authored threshold; effect/glass transparency remains supported.
- Read constant roughness, metalness and ambient-occlusion replacements, including inherited values. Supply material maps for scalar surfaces even when no normal/metal DDS is present, and honor tint weights without replacing textured detail. Use neutral studio reflections so silver materials do not acquire the old strong blue reflection color.
- Resolve the sole authored surface when an effect material's first layer is empty. This restores the dark/gold beer glass appearance rather than the generic glass fallback.
- Support normal-only decal passes without requiring a separate opacity DDS. Solid/cutout decal geometry writes depth so rotating food models correctly occlude their back faces; genuine transparent passes and normal-only overlays retain their existing blend behavior.
- Preserve the checkerboard-disabled setting. Do not invent bottom-logo geometry for Groat: its authored model has no separate normal-only logo pass. Live game review of the material improvements remains pending; do not add Working designations.


## 1.3.50 (unpublished test build)

- Move MISC immediately above Advanced Settings. Add a gold star before favorited command and ID list names, including favorite ID rows.
- Disable the missing-texture checkerboard at the user's request, including when Dev Mode is enabled. Keep material data and incomplete-layer notices for later review; do not claim the underlying texture reports are fixed.
- Rotate helmet preview starting/reset views by 180 degrees, for both full and inline previews. Keep other categories' orientation unchanged.
- Apply Boudicca Health (0029959F) and Boudicca Oxygen (0029A849) names from the export. Preserve its remaining preview reports for review in game with the checkerboard disabled.


## 1.3.49 (unpublished test build)

- Add the MISC command category. Move Get Random Percent, Toggle All Menus, Get Item Count, Get Scale, Are They Dead?, Are They Disabled?, Are They Sleeping?, and the ten newly reviewed actor/distance/lock queries there as requested in the exported 1.3.48 feedback.
- Keep Get Credit Count in Inventory: the later report cancels its earlier move request.
- Move Is It Raining? and Is It Snowing? into WIP → Issues alongside the existing unresolved cell/starting-position queries. Preserve command IDs, input selectors and readout behavior; do not add Working designations.


## 1.3.48 (unpublished test build)

- Apply the exported 1.3.47 results and requested titles for the next ten commands. The later IsRunning report supersedes the earlier failure report. All ten are reported working in the native console; popup validation remains pending and none ships green.
- Add actor/reference inputs, companion target pickers, a destination picker for distance, and explicit parameterless templates. Distance defaults to Player as its source. Explain that Is Magic Out? is the engine's combined weapon/magic check.
- Add direct Results readouts for the ten commands. Eight use inspected zero-argument execute adapters with address/byte/signature and output validation. IsInCombat uses the exact actor virtual used by the supported game's default check, avoiding its compiled optional argument parser and the mismatched CommonLib virtual declaration. Distance compares finite positions only for enabled, non-deleted references in the same cell without parent-relative coordinate flags; unsupported pairs return a clear limitation instead of a guessed distance.
- Move Get Current Cell and Get Starting Position into WIP → Issues as explicitly requested, including when older local reports retain their previous category. Preserve command IDs, Favorites and feedback.


## 1.3.47 (unpublished test build)

- Apply October 23 feedback: Toggle All Menus has no arguments, explains the second-use restore and working console; rename Get Credit Count, Are They Dead?, Are They Disabled?, and Are They Sleeping? Preserve saved command IDs and leave Working status under user control.
- Read GetScale from the live reference scale field using the same conversion as the supported game's handler. Do not call either previously unsafe adapter. Read GetLevel and GetSleeping through their exact zero-argument execute adapters, guarded by address, signature and byte prefix, with finite/domain validation.
- Explain that IsRaining and IsSnowing are constant-zero stubs in Starfield 1.16.244 rather than showing a timeout or claiming a reliable weather observation.
- Get Current Cell and Get Starting Position still require further capture work; no replacement result is fabricated. Live validation of the new direct paths remains pending.


## 1.3.46 (unpublished test build)

- Correct Get Random Percent to allow decimal percentages, as shown by the player’s 12.26 console readout. Remove the incorrect whole-number/0–99 description and validation restriction.
- Bypass console dispatch and text capture for this command by invoking its exact, verified no-argument game execute adapter once and returning that adapter’s float output. Validate the known opcode, zero-parameter signature, Address Library ID and adapter bytes before calling; do not invoke a condition callback or substitute a random generator. Reject failed, unwritten, nonfinite or out-of-range returns.
- Keep the card untested until the new native popup path is reviewed in game.

## 1.3.45 (unpublished test build)

- Read Get Item Count and Get Credits from the same locked, live inventory/stack data used by Show Player Inventory. Read Get Dead and Get Disabled from their typed runtime flags. These four no longer depend on printed console output or callback capture.
- Correct numeric capture lifetime: the console dispatcher queues commands, so an execution-scoped thread-local listener ended before the queued callback ran. Keep a bounded pending request and require matching compiled source, arguments, operation and target before accepting a returned value. Reject unreadable, unrelated, expired or completed requests.
- Read queued Script source through a checked, bounded copy using the verified 1.16.244 runtime layout rather than the mismatched dependency field. Do not invoke condition callbacks or revive the unsafe scale getter. Keep the 15 cards untested until player review. Live popup confirmation remains pending.

## 1.3.44 (unpublished test build)

- Remove Caution/Danger badges from command lists and details; use a neutral confirmation heading and retain command instructions and unavailable controls.
- Put Working and Issues controls beside each command name in Dev Mode using the same row controls as the ID Browser. Working remains a toggle.
- Keep reported issues and uncertain results in their command category instead of automatically moving them to WIP. Persist the displayed category with the outcome so promoted WIP commands can remain where they were reviewed.
- Record the supplied 1.3.43 failures for Get Item Count, Get Credits and Get Random Percent. The native log shows capture armed but no matching result; these popup issues remain unresolved.

## 1.3.43 (unpublished test build)

- Leave all 15 revised query cards untested until the user reviews them. Add a Working toggle to command details; clicking it again clears the designation, overrides any shipped green default, and persists across reload/export without deleting previous notes.
- Capture returned scalar values for Get Random Percent, Get Credits, Get Item Count, Get Level, Get Dead, Get Scale, Get Disabled, Get Sleeping, Get Starting Position and both weather checks. These commands can return a value without printing ConsoleLog text. Let Starfield compile and execute the original command with its own argument handling, then observe the return from that exact CCC invocation. No direct condition evaluator or previously unsafe scale adapter is enabled. Live verification remains pending.
- Limit capture to an explicit 11-command list, matching target and execution scope. Forward unrelated calls unchanged, validate supported signatures and arguments, preserve real zero/negative/fractional values, and reject absent or invalid results. Keep ActorExposedToSky’s separate adapter unchanged.
- Rename the weather cards Is It Raining? and Is It Snowing? Shorten the fallback timeout message so it fits the bridge error text.

## 1.3.42 (unpublished test build)

- Rewrite the last 15 query cards with readable titles and task-focused descriptions. Remove testing history and generic WIP instructions from these cards.
- Add Player/companion target selection with manual placed Reference IDs, an inventory item browser, actor-value choices and an X/Y/Z axis picker. Retain the six-global picker with useful descriptions. Remove target/argument fields from commands that do not need them; require valid arguments where needed. Preserve saved card IDs.
- Record the reported Get Random Percent Results timeout. This UI revision does not change its native output capture or mark the timeout fixed.

## 1.3.41 (unpublished test build)

- Move the 14 player-confirmed console queries from WIP into Player, Targets, Inventory, World, Gameplay and Advanced Settings. Load these cards at startup and retain their saved IDs; remove their WIP duplicates.
- Move GetGlobalValue into World with a selector for GameHour, TimeScale, GameDaysPassed, GameDay, GameMonth and GameYear after all six Form IDs were confirmed in the console. Replace its timed-out console capture with a typed read of the live loaded global; reject invalid IDs, non-global forms, target prefixes and nonfinite values. The replacement popup still needs an in-game retest.

## 1.3.40 (unpublished test build)

- Add Results popups and saved Activity Log readouts for 14 player-confirmed console queries: GetSFSEVersion, GetCurrentCell, GetLevel, GetScale, GetDead, GetDisabled, GetSleeping, GetItemCount, GetGold, GetValue, IsRaining, IsSnowing, GetRandomPercent and GetStartingPos. Console behavior is confirmed; live popup capture remains to be tested.
- Route GetScale through ordinary console-output capture without re-enabling either crashing direct adapter. Let GetValue use the existing GetAV direct read. Existing blocked prepared scale/open-state controls remain blocked.
- Keep GetGlobalValue unverified after the GameHour name failed. Add Form ID guidance and a separate six-global test list verified against base-game GLOB records.

## 1.3.39 (unpublished test build)

- Resolve authored material ownership, inherited maps, disabled texture replacements and emissive slots across the catalog, with the existing reader retained for unsupported databases. Apply supported masked layers from their data rather than item-name exceptions; respect tiling, position/contrast, intensity and channel switches.
- Restore dark mask-only printing and inherited glass colors. Add approximate flowing effects throughout the emissive-only inhaler family, including Amp and BattleUp, while retaining the jar caustics and bounded animation cleanup.
- Restore the Ecliptic pack's available layers before clearing its old incomplete-material warning. Materials needing unimplemented blend inputs remain flagged rather than receiving fabricated detail. The reported .27 Caliber inventory wear still needs further work and is not marked fixed.
- Rename the reported Fang's pack to Sturdy Fang's Balanced Pack. Mark Miner Survey Pack 0006AC01 and Pirate Survival Pack 00079206 Reference Only by owning plugin/local ID.

## 1.3.38 (unpublished test build)

- Move nine reported clothing helmets to Apparel by owning plugin/local ID. Keep UC AntiXeno Space Helmet under Helmets, as confirmed by the player and game records.
- Correct Addichrone's masked labels, AddiJack's incorrect red tint, and Alien Jerky's see-through meat while preserving wrapper transparency.
- Add the first animated preview effect for Alien Genetic Material's caustics: original texture and emissive color, soft additive blending, and an approximate idle motion. Redraw at most 30 fps only while visible with textures enabled; release the animation when closed. This does not implement arbitrary game animation or the full material binding/distortion system.

## 1.3.37 (unpublished test build)

- Resolve saved favorite item IDs against the current loaded plugins before displaying item actions, even when Favorites is opened before ID Browser. Refresh both packaged and mod favorites, including medium/small plugin slots, and disable entries whose owner cannot be resolved.
- Refresh saved catalog metadata and preserve selection across favorite-key migration. Isolated browser tests pass; actual in-game inventory behavior still needs verification.

## 1.3.36

- Retry the read-only native handshake after a startup timeout, with bounded backoff and an immediate retry when CCC reopens. Reconnection refreshes descriptions, stats and command availability without resetting any browser or replaying commands.
- Added a red X before Reference Only names in ID Browser, Mod Browser and Favorites. Working overrides remove the X together with the reference styling.
- Documented known bugs: the CCC keybind can require two presses, and CCC can remain stuck on Loading. Waiting 10–15 minutes and trying again may recover the page without restarting Starfield; recovery is not guaranteed. See [Known bugs](README.md#known-bugs).

## 1.3.35 (local test build)

- Made Reference Only ID and favorite rows visually distinct outside Dev Mode with darker backgrounds, muted readable text and a bordered badge. Selected/hovered reference rows retain their own appearance in both themes. Working overrides return rows to their normal styling.

## 1.3.34 (local test build)

- Fixed the Favorites item-details panel collapsing to zero height and hiding names, descriptions, stats and previews. The selected ID now fills its available pane while retaining the action buttons.

## 1.3.33 (local test build)

- Confirmed Deepseeker Spacesuit 0016D2C4 working from the October 21 player report and removed its earlier reference-only classification.
- Marking an ID Working now overrides Reference Only for its actions, normal-mode visibility, sorting and Dev Mode color. The choice persists across export/restart and stays scoped to the owning plugin/local ID.
- Clearing a reference classification with Working records the correction in Export Reports. Reference Only can still be reapplied.

## 1.3.32 (local test build)

- Fixed selected-item action controls binding to a hidden panel after switching between Favorites and the ID Browser. Quantity, copy, favorite and picker controls bind to their own panel.
- Marked four game-data-confirmed non-playable Deepseeker variants as reference only; preserved earlier failed-item findings and kept the normal helmet and pack available. Named the playable pack Deepseeker Pack.
- Added an assignable Open Console Command Center hotkey through OSF Settings, initially unbound.
- Deepseeker preview assets decode offline; the reported in-game preview failure has not been reproduced.

## 1.3.31

Release summary since the previous GitHub source update (1.3.15):

- Added installed JSON translations, automatic language selection, organized templates and a short translator guide.
- Added item descriptions, visible effects/durations, gear base stats, skill-rank text and a Read popup for books and notes. Fixed the native inspection request rejection.
- Split item details into text on the left and a sticky model preview on the right. Previews work without Advanced Options; technical fields remain optional and Copy ID stays available.
- Updated Model Viewer quality presets with shared enhanced reflections, bloom and grain, retaining distinct resolutions and removing depth of field.
- Improved report exports, editable area-name suggestions, reviewed cell labels and reference classifications. Preserved searchable old names and advanced exploration teleports.
- Improved Mod Browser sort controls and hidden-window/controller handling. The intermittent OSF loading freeze and static cloth rest-pose limitations remain under investigation.

Development increments are recorded below.

## 1.3.30

- Fixed in-game descriptions/stats being rejected when the optional inspection operation was omitted.
- Send the operation explicitly from the panel and preserve the native default for compatible callers.
- Show the returned error reason and log inspection failures to make future failures diagnosable.

## 1.3.29

- Enabled small model previews and Model Viewer in ordinary browsing, without requiring Advanced Options.
- Added a Read popup for books and notes, using their installed text without adding items or granting rewards.
- Kept book bodies out of the compact stats panel; retained safe formatting and a clear message for items without readable text.

## 1.3.28

- Moved record types, categories, plugin filenames, original names and IDs behind Advanced Options in ID/Mod Browser details; quest technical fields follow the same setting.
- Kept descriptions, stats, requirements, mod names, Copy ID buttons and item/quest actions visible.
- Replaced the failed live-details prompt with an in-game availability message when no native backend is connected.

## 1.3.27

- Added ID Browser descriptions, aid and power effects, skill ranks, and base gear stats from installed game records.
- Details load on selection without spawning or equipping items; supported Mod Browser records use the same inspection.
- Applied all 17 accepted cell names from the October 20 22:03 report, preserving searchable originals.

## 1.3.26

- Applied the October 20 21:43 report: 11 accepted cell names and 12 Reference Only markings.
- Retained searchable old names and exploration teleports under Advanced Options.

## 1.3.25

- Applied October 20 feedback: 17 accepted cell names and 57 Reference Only reports, keyed to their exact plugin/local IDs.
- Preserved old names for searching and Advanced Options teleport access to reference destinations.

## 1.3.24

- Matched Mod Browser sort buttons to Scan Mods' width with shorter stacked controls.
- Kept item previews visible while scrolling their details; renamed 3D Viewer to Model Viewer.
- Shared enhanced reflections, bloom and subtle grain across every preset; removed depth of field while retaining quality-specific resolutions.
- The reported in-game loading stall remains under investigation; this build does not claim to fix it.

## 1.3.23

- Stop held controller navigation and delayed Back actions when CCC hides, loses focus or the controller disconnects. Ignore hidden-window controller events and coalesce focus updates.
- English mode no longer rescans interface text after ordinary updates. Active translations update once per frame and do not observe their own changes.
- Removed the shrine-specific loading warning after the failure recurred elsewhere. The broader loading stall still requires in-game verification.

## 1.3.22

- Teleport Here and Teleport to Cell close CCC before issuing the teleport, reducing overlap between the paused overlay and a cell transition. This is a mitigation for the reported Shrine of the Fang loading stall; live verification is pending.
- Applied 47 reports: 10 cell-name corrections and 37 Reference Only destinations, including a shrine-specific warning about the repeated CCC/OSF loading failure.

## 1.3.21

- Fixed Identify Current Area disabling the name field when the current cell differs. Manual names now apply to the selected entry, with the mismatch recorded in Export Reports.

## 1.3.20

- Identify Current Area accepts typed names when no name is found, and allows editing suggestions. Custom names and area evidence are included in exported reports.
- Applied both new feedback files: 34 name corrections and 61 distinct Reference Only cells, retaining advanced exploration teleport access.

## 1.3.19

- Applied 173 exported reports: 80 direct cell-name corrections, 29 additional Dazra Outskirts label simplifications and 92 distinct reference-only cells. Original identifiers and prior names remain searchable; reference cells retain Advanced Options exploration teleport.

## 1.3.18

- Fixed large report exports timing out in the OSF WebView. Reports transfer in small chunks and save as one file; failed exports keep pending reports.

## 1.3.17

- Translation templates are organized into named sections; existing flat language files remain supported.

- Installed translations become the default automatically; saved language choices take priority and the bundled example stays opt-in.

- Settings discovers installed translation JSON files and remembers the selected language.
- Fixed translation discovery in the OSF WebView/browser preview; the partial Chinese example is selectable without renaming files. Invalid packs no longer hide other languages.

## 1.3.16

- Add editable JSON translation packs, an English fallback and Language / Reload Translation controls in Settings. Preserve commands, IDs and raw console text.
- Add a reproducible JSON/CSV translator kit with an interface-first template and optional catalog strings. Include a partial Chinese example and system CJK font fallbacks.

## 1.3.15

- Rename included reset batches to Name RESET and group Boostpack Explosions with its reset. Migrate existing included filenames while preserving edits and deletions.
- Add Sort by Mod and Sort by Category below Scan Mods. Category mode browses scanned records across plugins and shows each item's source mod.

## 1.3.14

- Wrap long Custom Command lines while preserving syntax highlighting, aligned line numbers and original command boundaries.
- Rename the category to Cells / Teleport.
- Identify 310 of 410 internally named cells using authored location or worldspace names; retain exterior coordinates and searchable original identifiers. Document the 100 unresolved records.
- Apply four reported name corrections and 24 exact Reference Only marks.

## 1.3.13

- Add editable All Playing Cards and All Baseball Caps included batches: one complete 52-card deck and ten wearable caps, with named comments.
- Apply 28 reported cell name corrections and 30 exact Reference Only classifications. Preserve original searches and Advanced Options exploration teleport.

## 1.3.12

- Apply twelve reported cell names, including Dazra Outskirts, Ervin's Apartment, Buried Temple and the two Dazra Dunes entries. Preserve original names for searching.
- Mark the 69 exact reported cells Reference Only, hidden outside Advanced Options and sorted below ordinary destinations. Keep exploration teleport available in Advanced Options.


## 1.3.11

- Restore Ultra in Settings and the 3D Viewer: full source textures up to 4K within a bounded budget, sharper material maps, additional studio reflections, bloom, gentle depth of field and subtle grain.
- Display untextured geometry before loading textures in both preview sizes, then apply low and selected-quality materials without resetting the camera. Reuse inline geometry when opening fullscreen and retain the model if texture loading fails.
- Restore the larger bounded Ultra transfer path; keep other preset budgets unchanged. Align the live native piece limit with the existing 512-piece reader/transport limit for pilot seats.


## 1.3.10

- Mark twenty raw sc cell labels and both reported Abandoned Mine Field cells Reference Only; retain Advanced Options exploration controls.

- Add Identify Current Area beside Working on Dev Mode cell rows. Read the player's current cell, location hierarchy and worldspace on the game thread.
- Review proposed names with Accept / Decline. Require the selected cell to match the player's current cell; explain broader or unavailable names.
- Accepted names persist locally, retain searchable original names, and add an entry with area evidence to Export Reports. Declining makes no change.


## 1.3.9

- Restore teleport controls for reference-only cells under Advanced Options, with an exploration warning. Keep them hidden by default and sorted last; reference-only locations and other objects remain non-executable.


## 1.3.8

- Rename the travel category Cells/Teleport. Classify reviewed marker scenes, test/asset cells, assembly storage, holding cells, placeholder destinations, and the two reported Abandoned Mine entries as Reference Only.
- Hide reference cells outside Advanced Options and sort them last when shown; remove their teleport action. Ordinary warehouses and other genuine destinations remain available.
- Reviewed reference classifications take precedence over older Working color markers. Reference-only reports no longer invent an inventory observation.


## 1.3.7

- Show Cells in the default ID Browser so teleport actions are available without Advanced Options.
- Move Locations behind Advanced Options, label them Reference Only, and remove their misleading cell-search action. Apply the reference classification to loaded mod locations too.


## 1.3.6

- Show test-result colors, icons and status badges only in Dev Mode, including reviewed WIP groups. Preserve warnings, blocked commands and saved results.
- Clarify that location records are not teleport destinations. Rename their name-search action to Find Matching Cells and explain that matches are not verified destinations.


## 1.3.5

- Correct blue, purple, and red Elevated Cabin bed variants by accepting authored material-root separators.
- Support pilot-seat previews with 157–185 pieces, retaining geometry and transfer size limits.
- Classify 24 confirmed invisible furniture interaction markers as Reference Only.
- Audit all 42 distinct records in the latest furniture report; unresolved materials and the unavailable Helgi sleeping-bag asset remain documented rather than marked fixed.

This file replaces the individual release-note documents. It records user-visible changes without repeating install and compatibility text for every version.

## 1.3.4

- All three reviewed WIP groups use orange status bars by default in both themes, including outside Dev Mode.
- All supported ID Browser and mod previews now carry authored metal maps when available. Low/Medium/High share metal-aware reflections; Textures Off stays neutral. Version 9 packets retain compatibility with versions 1–8.
- Corrected 817 Terran Armada catalog labels from its own English STRINGS table, including Mauling Axe and the MGP rifles. Applied the reported Particle Machine Gun/XM-2311 variant names and two reference-only weapon findings.
- Restored five reported Particle Machine Gun materials whose all-zero opacity was hiding them. Fixed the XM-2311's authored ScopeMount/Scope connection mismatch with an exact model-path alias.
- Added a reviewed Spawn Object action for supported Workshop / Outpost records. This places a loose object at the player; outpost registration and build-menu integration are separate features.

## 1.3.3

- Command test results now update their categories immediately and after reload: Working moves a WIP command to its functional category; Issues moves it to Executed — Issues in WIP; Not noticeable moves it to Executed — Effect Unconfirmed. Counts, search, favorites, details and execution use the same reported state. Existing native safety blocks stay in place.
- Corrected 663 Free Lanes names, including 90 books/notes, using SFBGS00D's own English STRINGS table. The reported slate is Chief Engineer's Final Log. Source plugins, Form IDs, reviewed flags and other catalog data are preserved.

## 1.3.2

- Moved the grouped settings catalog from ID Browser to Commands > Advanced Settings, behind Advanced Options. Kept search and live inspection; added reviewed numeric changes and base-game resets where references exist. Strings remain read-only.
- Corrected 1,138 Shattered Space display names, including 202 books/notes, from the DLC's own English STRINGS table. IDs and reviewed behavior are preserved.
- Localization extraction matches the owning plugin; a repeatable label-only refresh preserves reviewed catalog metadata.

## 1.3.1

- Added 17 ready-to-run batch files covering adventure and medical supplies, outpost materials, manufactured components, cooking, four weapon test kits, selected suit/outfit collections, surveying, scanner range and boostpack explosions. Settings presets include three explicit base-game reset files.
- Restored the flat INCLUDED sidebar with user-editable .txt files. Selecting a file loads it for review; edits and deletions survive default refreshes. The six existing user-selected defaults are retained, and original command-batch samples remain separate.
- Added syntax highlighting to the command editor: bold command names, colored targets/Form IDs/numbers/quoted text, and italic comments. Plain-text editing, controller input, line numbers, horizontal/vertical scrolling and both themes remain supported.
- Hash and semicolon comments are recognized outside quoted strings by browser and native batch parsing. Official figure/ammunition IDs follow plugin ownership when loading a known included file.
- New files and UI are validated offline; gameplay effects and balance still require in-game checks. No batches execute during setup or testing.

## 1.3.0

- Prepared a clean source release, excluding build products, dependency checkouts, local settings, obsolete screenshot/background experiments and deferred batch-library files.
- Consolidated material feedback into the current model-preview guide and mod display-name guidance into the Mod Browser guide. Replaced overlapping historical validation notes with a current release checklist and documented the source layout/build workflow.
- Hardened source packaging around explicit maintained roots, with version consistency and local documentation-link checks before packaging.
- Retains the existing Custom Command interface and only the three original sample batches. The expanded editable batch library is reserved for a later update; existing user batch files are preserved.
- Includes the prior preview/material, controller, catalog and Dev Mode fixes. No new rendering behavior is introduced by this source cleanup.

## 1.2.86

- Prepared the public update with the existing Custom Command batch interface and only its three original samples: Basic Supplies, Workshop Materials and Ballistic Starter Kit.
- Held the expanded batch library and INCLUDED file-management update for the following release. Existing user-owned batch files are preserved.
- Includes the default material-variant preview fix and latest catalog feedback from v1.2.82, covering the Syndicate Boss Suit and the catalog-wide template-swap route.

## 1.2.82

- Fixed default object-template material variants. Syndicate Boss Suit now selects its blue jacket and patterned light shirt rather than the generic white suit. Included OMOD properties and inherited default templates are bounded and plugin-remapped; addon defaults no longer block a later item variant.
- Normalized shipped material-swap paths containing developer export directories without reading outside the game asset directory.
- Audited 1,070 generated clothing/armor and weapon catalog records: 388 use the omitted route. All 1,606 material rules now pass the native audit. Added a repeatable audit tool and regression fixture; this does not claim visual parity for every item or mod.
- Applied the 22:04 test report: moved three child outfits to Apparel and marked 17 reported clothing/vehicle module records Reference Only. Small-master local IDs now match reviewed findings regardless of zero padding.

## 1.2.81

- Applied the 21:22 feedback report: moved 68 clothing records to Apparel, marked 25 unique reported non-inventory records Reference Only, and corrected 20 suit names. The latest Va'ruun Mining Spacesuit correction wins. Owning plugin/local IDs scope every correction, and original names remain searchable.
- Added normal-only decal rendering for the sample/bottle caps, Astra, Beaker Tongs and similar overlays. Their opacity and normal maps now modify lighting over the existing surface color. Genuine failed maps remain diagnostic-checkered; Textures Off and in-place quality changes remain supported.
- Restored inherited replacement-enable flags and uniform material tints, including the blue dart's flight and gold shaft. Eggmund's unnamed component now uses its authored inline color instead of a false missing-texture marker.
- Indexed miscellaneous material swaps and material-path forms. MOLM lists and MTPT-linked keys now resolve the Blue Fluted Vase's blue variant. Bio-Sensor's data-slate model was confirmed in the installed record and retained.
- The in-game log identified missing normal-only decals on the four upgrade items' 12-piece replacement model. All ten distinct material paths reported missing in that session now resolve, including both upgrade decal families. Full in-game appearance/game shader parity still needs checking.

## 1.2.80

- Added bounded material-parent lookup for previews whose main surface uses an inherited Layer/TextureSet. This restores shared metal, plastic and textile surfaces on reported resources and decorations while keeping already resolved texture maps.
- Texture archives now index authored DDS paths regardless of filename suffix, including the green crystal on the Priceless Gem. The inheritance table is built on demand and reused; original meshes are preserved.
- Combined the two Ancient Branch entries and the two Antique Piggy Bank entries. The generic item remains selectable, while the quest variant ID is retained under Alternate Form IDs and remains searchable. Catalog count is now 23,308.
- Reviewed both October 16 texture reports. Ecliptic's masked-layer rendering and Eggmund's material-free component remain limitations; data-slate display/game shader differences are not claimed fixed. See the feedback audit in docs.

## 1.2.79

- Moved Dev Mode item reports onto each item row in ID Browser, Mod Browser and ID favorites: Working, Issues and Reference Only sit beside the name.
- Working and Reference Only save immediately. Issues opens the comment popup with Issue found / Not noticeable. Plain Working confirmations stay local and are omitted from exported reports.
- Saving preserves list scroll, selection and action focus. Controller Left/Right selects row actions, Up/Down moves between item names, and B returns from an action to the item name. Removed the old item-details Test Report button.

## 1.2.78

- Applied all 59 Shattered Space book/slate title corrections from the October 16 feedback report. This completes the six Climbing Routes titles and updates the reported Dazra, Crater, Va'ruun book and Jinan recording names.
- Corrections use the owning plugin and local Form ID, so load-order changes preserve the names. Previous labels remain searchable and appear as Original Name. Record IDs, categories, actions and reference-only flags are preserved.

## 1.2.77

- Fixed ID Browser controller focus after selecting an item and returning from the 3D Viewer. Selection now focuses the newly rendered details immediately, avoiding a fallback-to-first-row race that reset scrolling. Switching from mouse browsing retains content focus. Up/Down stay within the middle ID list, including its first/last rows; focusing a row scrolls only that list as needed.
- Removed Ultra from the main settings and viewer menus. Saved Ultra choices migrate to High. Low, Medium and High now share the former Ultra lighting/shader effects: studio reflections, material roughness, tone mapping, normal maps, and movable light/brightness controls. Presets retain different texture and screen-resolution budgets and unchanged geometry.
- Restored the Akila Security Uniform's shared glove texture family for both bodies. Its BaseGlove3 material uses BaseGloves_03 DDS names, which the previous fallback did not match. The alias is scoped to the exact base-game material path.
- Verified the Mantis pack's main color, normal and roughness maps load. Its white shell is not a missing base-texture binding; some authored layered shader behavior remains approximated.

## 1.2.76

- Fixed L2/R2 zoom by adding a native trigger input path. The installed OSF raw gamepad contract forwards buttons and sticks but not triggers; the earlier simulated trigger-button tests did not cover that gap.
- While the 3D Viewer is open, CCC reads analog trigger pressure from the XInput module already loaded by the game/framework and sends preview-only events. R2 zooms in, L2 zooms out, and lighter pressure zooms more slowly.
- Trigger watching has a short renewable lease and stops on viewer close or native view hide/lease expiry. Releases and disconnection send zero; the browser clears stale trigger values after 350ms. Equal trigger pressure cancels zoom, and the quality chooser pauses zoom.

## 1.2.75

- Renamed the Full 3D button to 3D Viewer, including its accessible viewer name and inline-preview fallback message. Its controller hint is now Y.
- Y opens the visible selected asset's 3D Viewer on any page offering the preview button, including the shared ID/Mod Browser detail panel. A focused preview takes priority if several cards are visible.
- The opening Y press must be released before another Y press can open the viewer's quality chooser. Controller text entry retains Y for space, and unrelated dialogs block the page shortcut.

## 1.2.74

- Fullscreen 3D previews now use direct controller controls instead of navigating toolbar buttons: LB mannequin, RB male/female body, Y quality chooser, X textures, R3 light mode, L3 brightness mode, left stick pan, right stick rotate, L2 zoom out and R2 zoom in.
- In light mode, the left stick orbits the light; in brightness mode, left-stick up/down adjusts brightness. Click the stick again to return to object movement. Light/brightness controls require High or Ultra, with an on-screen hint on lower presets.
- The quality chooser accepts D-pad or left-stick choices, A to apply and B to cancel; applying updates the shared quality setting. B otherwise closes only the preview. Other toolbar navigation is suppressed, while mouse controls remain available.
- Movement is continuous and frame-time based, with a stick dead zone. Held input clears on close, blur, visibility changes, mouse interaction or controller disconnection. Controller hints identify the active left-stick mode.

## 1.2.73

- Dev Mode flags the exact Ecliptic backpack material as a known incomplete preview. Its base color loads, but the renderer does not reconstruct its referenced masked textile/paint layers. This is an explicit scoped diagnostic, not a general missing-texture heuristic.
- Full 3D status now reports unavailable material layers for flagged meshes, including during sharper-texture loading. Normal viewing and Textures Off retain their appearance.
- Unrelated layered materials stay textured. This update marks the known limitation; it does not restore masked-layer rendering or automatically detect every incomplete material.

## 1.2.72

- Fixed the v1.2.71 Dev Mode regression that covered correctly textured models in checks. Multiple authored material layers are no longer treated as evidence of a missing texture.
- The checker still marks unresolved surfaces and declared color textures that fail to load, including solid-color fallback cases. Successfully loaded color maps remain visible. This does not restore missing shader layers.

## 1.2.71

- Dev Mode now checks for incomplete layered materials even when a base color texture loads. This includes the Ecliptic backpack, whose additional authored material layers are not reconstructed by the preview renderer.
- Declared color textures that fail to load remain marked incomplete even if a solid-color fallback is supplied. The checker highlights the affected mesh, not individual missing layer regions. Normal viewing and Textures Off retain their existing appearance.
- This update improves diagnostics; it does not restore the missing material layers.

## 1.2.70

- Dev Mode highlights unresolved, untextured model surfaces with small bright red/blue checker cells in both inline and fullscreen previews. The procedural pattern is stable in model coordinates and needs no texture download. Mannequins, glass and authored solid-color/textured materials are excluded. Textures Off hides the checker; normal mode keeps the shaded fallback.
- Plain Working confirmations keep the persistent green status without entering the export queue. Working comments, Issues and Reference Only reports remain exportable. Existing plain confirmations migrate into local status history before being removed from the pending report queue.
- Saved outcomes include their update time so an older pending issue cannot overwrite a newer local Working confirmation after restart.
- Applied the report's Black Graviplas Helmet and Black Open Graviplas Helmet Apparel corrections and nine working confirmations. Remaining texture comments are retained as diagnostic follow-up context; the checker does not claim to restore missing assets.

## 1.2.69

- Test Report now offers Working, Issues and Reference Only for IDs. Issues includes an Issue result selector for an issue found or Not noticeable; command/quest/settings reports offer the applicable Working and Issues choices.
- Dev Mode rows show result-specific bars and icons: green/checkmark for Working, yellow/exclamation for Issues, orange/question mark for Not noticeable, and dark gray/struck-through names for Reference Only. Both themes retain clear selection outlines.
- Latest explicit outcomes are stored separately from pending exports, so exporting reports and restarting retain the colors. Comment-only reports keep the previous result. Legacy Not working and Executed (no effect) reports migrate to their matching issue/uncertain styling; unclassified tested records remain neutral.

## 1.2.68

- Fullscreen panning now shifts the projection instead of moving geometry off the perspective axis. The item retains its shape at the sides; pointer zoom and 3D light placement use the matching projection.
- Corrected origin-attachment precision handling for helmet flashlights, including Ground Crew, Mercury and Trackers Alliance. Small exporter rotation differences no longer leave lights below the helmet.
- Restored Constellation helmet color lookup, authored constant light colors and the Power Assist helmet's shared material source. Audited all reported base-game helmet families; Mercury resolves every piece's material.
- Applied all 24 helmet reports: one exact Deepseeker variant becomes Reference Only; 23 working records are marked tested; Gray/Teal Graviplas names are corrected; eight Graviplas headwear records move to Apparel. Original names remain searchable.
- Removed the forced empty Armor category from the ID Browser sidebar.

## 1.2.67

- Fixed a native crash when opening Beowulf or another modular weapon before the preview record reader had been initialized. Every record-backed geometry/material path now obtains an initialized reader through one shared accessor.
- Added native coverage for a fresh weapon cache, warm reuse, recovery after a missing weapon record and initialization after cache invalidation. Standalone Beowulf checks open fresh at Low, High and Ultra.

## 1.2.66

- Restored the missing UC Navy torso texture used by SY-920 Ensign Fatigues by resolving its authored material/TextureSet naming mismatch. All five outfit pieces now load color textures.
- Restored Ultra in Settings and the viewer. It preserves original geometry and adds up to 4K color/normal maps within a bounded budget, archived roughness maps for material highlights, analytic studio reflections and bounce light, trilinear/anisotropic filtering and higher supersampled resolution. Texture detail remains limited by the installed source assets.
- Moving the light now projects the cursor onto its 3D orbit, accounting for zoom and pan. Shift-drag selects the far side; points beyond the orbit's projected edge clamp to its rim. Arrow controls remain available.
- Low-texture-first loading and seamless quality changes continue to preserve geometry, camera and toggles.

## 1.2.65

- Included the 22:55 pack feedback revision: 15 exact Starfield pack records are Reference Only with Add to Player disabled and sort below usable items; five working records remain usable and marked tested. Ten pack names are corrected, scoped by owning plugin and local ID, with original names retained for search.

- Fixed the v1.2.64 regression reporting “Unsupported embedded model stream” for ordinary game models. External mesh paths and embedded version-2 streams are identified from their payload instead of their shared layout value.
- Added native regression checks for external and embedded streams with the same layout value, plus mismatched and truncated embedded headers.

## 1.2.64

- Reused the CCC loading ring for Mod Browser scans, record loading, inspections, settings reads, saved command files and inline previews.
- Enabled inline and Full 3D previews for supported Mod Browser assets in ordinary mode, with support for embedded version-2 mod geometry.
- Weapon previews now follow default weapon attachment records and their connection points instead of guessing model filenames. Cutter and Microgun load their production assemblies; scoped material lookup prevents same-name materials from borrowing another weapon's textures.
- Applied the October 14 feedback: ten exact base-game records are Reference Only, two tested outfits remain available, and four Shattered Space helmets have reviewed display names. Previous names remain searchable.

## 1.2.63

- Fixed the global search shortcut intercepting slash input in test comments and other text fields. Forward slash and backslash now type and save normally.
- Corrected male/female armor-addon material swap fields, restoring the Astral Lounge Charmwear coat material. Balanced mip levels across all materials so early textures/normal maps do not starve later pieces of color.
- Cap and Barrett previews use original archive textures instead of the reported loose Nike/Just Do It cap and black Barrett replacements. Installed mods are unchanged; unrelated overrides and new assets are retained.
- Replaced the flat light icon with a small illuminated sphere at the light's actual 3D orbit position, with scene depth testing. High uses the matching positional light direction across the model.
- Added a lightweight rotating split-ring loading indicator with CCC at its center, at the lower right of the preview. It clears on completion, failure or closing.
- Removed Ultra from the viewer and main Settings. Existing Ultra preferences fall back to High; Low, Medium and High retain seamless switching.

## 1.2.62

- Quality changes update the existing viewer and textures without rebuilding geometry or resetting the camera. Medium/High/Ultra begin with Low textures; failed upgrades retain the textured preview.
- Defaulted every preview to mannequin off and added a Textures On/Off toggle that retains cutout/glass shapes.
- Added a visible light marker while Move Light is enabled, and wheel zoom anchored to the surface under the pointer in both viewers.
- Reduced transfer pressure with two concurrent 32 KiB ranges and 16/8 KiB retries, draining outstanding replies before another transfer starts.
- Composed matching color and normal-only decal passes with their opacity masks, fixing Artifact PI's dark rectangles and opaque symbol overlay.
- Applied October 14 feedback: eight Reference Only records, four merged aid pairs with searchable alternate IDs, and nine corrected food/drink/note names. Fed's later Reference Only correction overrides the earlier merge request.

## 1.2.61

- Fixed normal-map details disappearing at close zoom and corrected two-sided normal facing.
- Added a biased decal depth pass to reduce flickering surface markings while rotating.
- Applied supported per-item material swaps, including cap body colors and logos.
- Added stored material colors, broader creation material lookup and a shared vehicle-material fallback for unresolved Moonjumper surfaces. Vehicle and workshop coverage improves; complex material layers remain approximate.
- High/Ultra now show an interactive basic model before loading sharper textures. Texture upgrades preserve the camera and leave the basic model available if an upgrade fails.
- Cached reusable geometry and excluded dedicated voice/sound archives from preview indexing to reduce cold-load work.

## 1.2.60

- Restored original highest-detail geometry on all presets, fixing malformed hands and other low-detail mesh artifacts. Lower presets reduce texture/rendering cost and multisampling instead.
- Added bounded concurrent 64 KiB transfers with smaller retry chunks, plus recent full-preview and compressed native caches to speed repeat loads.
- Added previews for supported workshop/outpost furniture, statics, activators, containers, doors, recipes and ship parts.
- Ship-part previews follow linked pack-in cells and assemble supported placed models with their transforms. Editor-only markers are excluded.

## 1.2.59

- Fixed zero-valued material tint turning textured caps solid black.
- Added signed/unsigned BC5 normal maps on High/Ultra and ambient-occlusion texture detail, including the Mantis pack.
- Added tinted glass handling for visor materials and removed the unsupported opaque helmet-glow overlay that covered them.
- Slightly inset the static mannequin surface to reduce clothing intersections.
- Quality presets select progressively lower authored mesh LODs where available. Ultra retains original geometry.
- Raised Low to 512-pixel textures and a 1536-pixel canvas limit. Added movable lighting to High.

## 1.2.58

- Moved mannequin, body, quality and Ultra lighting controls to the upper right above the preview, extending the canvas down to the bottom of the window.
- Removed Reset controls, scene backgrounds and scene motion. Double-click still restores the model view.
- Hats, helmets and packs now start without a mannequin in both small and full previews; full previews retain the option to enable it.
- Corrected origin-positioned wearable geometry using installed body bind transforms, including Green Neocity Formwear and the Homesteader Scout Hat.

## 1.2.57

- Replaced fullscreen rotation, tilt and zoom buttons with a quality dropdown. Quality changes apply immediately and update the main Settings preference.
- Fixed stretched proportions in Low quality on wide preview windows.
- Fixed the Mantis helmet visor appearing at the mannequin's feet.
- Added DLC material database and texture-field support for affected packs, including Armada and Luxurious backpacks.

## 1.2.56

- Fixed helmet shells and decals disappearing while rotating, including Gran-Gran's Space Helmet. Cutout textures now retain solid depth writes and two-sided drawing instead of being treated as glass.
- Glass and broadly translucent materials retain their separate blended pass; drink pouch transparency remains supported.

## 1.2.55

- Added four clean preview backgrounds: Industrial, Concourse, Lodge and Apartment, plus Plain.
- Backgrounds move gently with item rotation and blur more at close zoom while the item stays sharp. Scene motion can be disabled; both choices persist.
- Transparent model surfaces composite over the selected scene. Inline previews retain their plain low-cost background.

## 1.2.54

- Fixed rigid head attachments such as broken helmet visors and cap decals appearing at the feet, using matching bone bind transforms. Hidden blank decals remain invisible.
- Ultra now uses color-correct lighting, a warm movable key light, cool fill and filmic tone mapping.
- Added Ultra-only Move Light, brightness and Reset Light controls. Normal pan/orbit/zoom controls remain available.

## 1.2.53

- Small previews always use the male body and no longer show a body-selection button.
- Replaced that button with Full 3D inside the preview and removed the separate Preview 3D action. The expanded viewer retains its Male/Female switch.

## 1.2.52

- Reduced the info-panel preview and placed it alongside the item metadata, keeping the information above the fixed action buttons.
- Added separate opacity-map decoding and transparent rendering so outer plastic and glass no longer hide colored contents. Supports BC4 and R8 opacity textures.
- Corrected material tint ownership so color values apply to their named material instead of the following material.

## 1.2.51

- Expanded 3D previews to nearly the entire screen, with a small outer margin and a model canvas that fills the remaining space above the controls.
- Added a lightweight info-panel preview with left-drag rotation and scroll zoom. It uses Low quality, delays loading while browsing, and releases the previous renderer when the selection changes.
- Added Male/Female body switches to inline and expanded previews, selecting matching outfit models with fallback when a variant is missing.
- Expanded color loading to older mod texture archives, loose material databases and additional color-map names; unreadable candidates no longer block fallbacks. Added missing-color diagnostics.

## 1.2.50

- Added an optional Ultra preview preset: up to 4096-pixel textures for simple models, 2048 for complex models, stronger supersampling and an 8192-pixel canvas limit.
- Ultra uses trilinear filtering and up to 16x anisotropic filtering when supported. High remains the default; source model geometry is preserved.

## 1.2.49

- Left-hold drag pans, wheel-hold drag orbits, and right-hold drag up/down zooms. Wheel scrolling still zooms.
- Added persistent Low, Medium and High preview resolution choices in Settings; High is the default.
- Added material-database color texture and tint lookup for Aid, Ammo and other items.
- Expanded NIF exporter-header compatibility for Sanctum Priest Headwear.
- Compressed model transfers, reduced chunk sizes, retried failed chunks and removed reply locking to address preview transfer timeouts such as Rokov's Uniform.

## 1.2.48

- Hold the mouse wheel and drag to pan item previews; Reset restores position.
- Increased close-up zoom range, improved smooth shading, increased texture dimensions to 512–1024 pixels and increased the canvas resolution limit.
- Shared repeated texture data to keep higher-detail previews within transfer limits.
- Removed book/note model previews; a book reader is planned for a future release.

## 1.2.47

- Added supported color textures and a toggleable static mannequin for clothing and armor previews.
- Added a base-model fallback for Beowulf and similarly named modular weapons that expose dummy receivers.
- Applied 62 more item reports: 45 working records and 17 reference-only records.

## 1.2.46

- Combined the experimental v1.2.45 model viewer with 142 additional item test results: 100 reference-only records and 42 working records.
- Corrected four item names and merged the duplicate Sam Coe and Sarah Morgan outfits while preserving alternate IDs.

## 1.2.45

- Added an experimental, manual 3D model viewer under Advanced Options. Reads installed model geometry locally and supports rotation/zoom; this first pass is untextured.
- Preview work does not execute inventory commands. Existing item reports and browsing remain unchanged.

## 1.2.44

- Removed the temporary Akila item pictures and enlarged-image viewer. Item previews are now future work; all feedback changes remain.

## 1.2.43

- Added local image previews and an enlarged viewer for Akila Security Hat and Akila Security Uniform.
- Applied the accompanying item feedback batch, preserving original names and reference-only restrictions.

## 1.2.42

- Applied 144 new item reports: 90 reference-only records and 54 working records. Updated the tested markers.

## 1.2.41

- Simplified the action confirmation button label to Execute.

## 1.2.40

- Applied 81 new item reports: 28 corrected display names and 27 reference-only records. Original names remain in details/search.
- Combined the two tested Explorer Adventure Hats into one entry with both Form IDs. All reported records are marked tested in Dev Mode.

## 1.2.39

- Split Armor / Apparel into alphabetical Apparel, Armor, Helmets, Packs, and Suits categories. Armor command pickers still include all five groups.

## 1.2.38

- Keep the item list and detail scroll position after saving a test report.
- Applied 33 new item tests, renamed Freestar Ambassador Suit and Bounty Hunter Seek Pack, and combined tested duplicate Andreja/Barrett outfits while preserving alternate IDs.

## 1.2.37

- ID detail content scrolls above fixed action buttons; long titles remain fully readable.

- Dev Mode highlights tested item, quest, setting, and command rows in green. Testing history persists separately from exported reports. Earlier reviewed item findings and command test statuses are included.

## 1.2.36

- Applied 23 tested clothing and helmet names; preserved original names in ID details and search.
- Report exports now create timestamped files and clear the exported batch after successful saving. Failed exports retain reports.

## 1.2.35

- Moved reference-only items behind Advanced Options across ID lists, searches, and ID Favorites. Saved favorites are preserved; reference-only entries still sort last when advanced content is enabled.

## 1.2.34

- Applied the exported reference-only findings for 66 unique item records and corrected the working Cydonia Pack label.
- Added a Settings popup beside Help with persistent Advanced Options and Light/Dark Mode toggles.
- Basic mode hides WIP, Settings, Cells, Ship Parts, and Internal / System quests. Locations and Cells now have separate categories.
- Added light and dark palettes based on Starfield research, inventory, and skill menus. Light uses pale gray/teal/charcoal/yellow; dark uses blue-black/slate/pale text/gray selection and blue detail headers.

## 1.2.33

- Added Reference Only for item Dev Mode reports and Executed (no effect) for command reports. Exports explain the observation and requested item-action cleanup.
- Result choices use toggle buttons with controller-friendly focus and allow comment-only reports.

## 1.2.32

- Moved reference-only records to the bottom of every ID Browser category and ID Favorites list, keeping normal and reference-only groups independently alphabetical.

## 1.2.31

- Renamed the ID Browser Game Settings category to Settings and removed its sidebar counter.
- Marked 36 tested creature-skin and Akila child/crowd armor records reference-only, disabling Add to Player including in Favorites.
- Added a five-click Dev Mode dot with per-entry status/comment reports and a combined text export in the user CCC folder. Reports remain saved when Dev Mode is off.

## 1.2.30

- Removed 244 packaged Free Lanes/Terran Armada quest IDs and the Quests category from ID Browser. All removed records remain in Quest Browser with its quest tools. Scanned mod quests remain in Mod Browser.
- Updated the packaged ID Browser count to 23,319; Quest Browser remains at 2,568.

## 1.2.29

- Moved companion and reference-only ammo below normal ammunition, keeping each group alphabetical.

## 1.2.28

- Marked 39 tested companion, creature, torpedo, missile, and special-effect ammo records reference-only after inventory tests showed no visible additions. Add to Player is disabled in browser and Favorite selections.
- Labeled companion ammo variants and added Reference Only badges to the ID list.

## 1.2.27

- Ordered quest sections as Base Game, Shattered Space, Free Lanes, and Terran Armada, retaining alphabetical categories within each.
- Fixed Quest Browser category clicks for Free Lanes and Terran Armada. The handler now accepts all four packaged quest sources and rejects invalid source/category values.

## 1.2.26

- Sorted command, ID Browser, and quest categories alphabetically. WIP stays last in Commands, and Game Settings stays last in ID Browser.

## 1.2.25

- Preserved the spreadsheet categories in Game Settings. Only MAIN is split into Scanner, Ships, Combat, Camera, and Other; original category metadata remains visible in the right panel.

## 1.2.24

- Added a searchable, inspection-only Game Settings category with 8,705 reference entries, grouped by Scanner, Ships, Combat, Camera, and Other.
- Show setting names, types, available Form IDs, and labeled workbook reference values beside Inspect Current Value. No setting-edit actions are enabled.

## 1.2.23

- Expanded Free Lanes and Terran Armada ID catalogs to all named owned records in supported types, including perks, spells, and quest IDs, in their matching categories.
- Marked internal/test records reference-only and corrected master ownership for DLC override records. The ID Browser now contains 23,563 entries.

## 1.2.22

- Corrected ID Favorites to clickable name-only rows. Selecting an ID shows its details, quantity, favorite, copy, and supported actions in the right panel without leaving Favorites.

## 1.2.21

- Made ID Favorites compact rows with inline record details and matching control heights.
- Added quantity and Add to Player controls directly to supported favorite items, using the existing confirmation flow and quantity limits.

## 1.2.20

- Removed the Common Items category; credits and digipicks remain under Resources / Miscellaneous, and ship repair parts under Aid / Consumables.
- Condensed saved-batch and ID Favorites cards to two text rows and matched the star and Open/Load button heights.

## 1.2.19

- Consolidated the changes made since the published 1.2.18 build and synchronized native/UI version markers.
- Recovered sample batches and expanded ship, vehicle, workshop, and official quest catalogs onto the published baseline.
- Made sidebar rows grow with wrapped labels so two- and three-line names do not overlap adjacent entries.
- Condensed sidebar category rows and Recent/Favorites spacing so more entries fit on screen.
- Made Quest Browser game and DLC headings more prominent with larger bold text and orange section accents.
- Recorded new quest/global/help tests, corrected subtitle-hide behavior, added the required planet marker name, and refreshed engine-help descriptions from the in-game export.

## 1.2.18

- Added exact command-return capture for ActorExposedToSky Results popups to address the printed-console-log timeout. Zero remains a valid result; the new native path awaits in-game confirmation.
- Updated release documentation, catalog counts, batch instructions, and cleanup behavior.

## 1.2.17

- Restored the Custom Command text field to the full available editor height.
- Synchronized line numbers with command scrolling, including the end of long batches; the gutter widens for larger line counts.

## 1.2.16

- Scan Mods now extracts recorded quest-stage indexes, including compressed quest records.
- Mod quests show clickable stage buttons and full stage-history inspection, with current/completed stage indicators.

## 1.2.15

- Added Quest Browser inspection and confirmed Start, Stop, Complete, and Reset controls to Mod Browser quest records.
- Added manual Set Stage for mod quests using their current runtime IDs. Mod scans do not include recorded stage lists.

## 1.2.14

- Removed the headingless Ready to Test group and placed its commands into Engine Console Commands or Script Functions according to the engine catalog.

## 1.2.13

- Promoted Workshop Fly Camera to Camera after successful testing inside and outside Workshop mode.
- Disabled FXCam after testing trapped the player in free-camera mode, froze actors, and required a game restart. Its card retains the test details.

## 1.2.12

- Added Results popups and Activity Log output for ten read-only WIP queries.
- Recorded verified position, rotation, time, sky-exposure, and home-ship queries; kept five queries unconfirmed pending output testing.

## 1.2.11

- Fixed the Custom Command line-number gutter overlapping text and extending below the editor.
- Added readable official plugin names from the AFK Mods module list.
- Added the reported NPC movement side effect to Toggle Collision.
- Verified Workshop inside ships; marked KAP, TakeOffToSpace, and SetAtStart as effect unconfirmed.
- Recorded successful in-game Auto-Run testing.

## 1.2.10

- Added per-batch **On Load** selection and a master **Auto-Run** switch.
- Selected `.txt` batches run in filename order three seconds after an existing save loads, even when CCC has not been opened.
- Auto-Run is disabled by default, ignores new games, prevents duplicate runs from overlapping load events, and records results for the Activity Log.
- Stored Auto-Run settings in the user-owned CCC folder so mod updates cannot replace them.

## 1.2.9

- Constrained the Custom Command workspace to the available screen height.
- Saved batch files now scroll inside the Batch Files panel instead of extending the window.

## 1.2.8

- Removed the visible Commands label, aligned the editor with Batch Files, and disabled manual resizing.
- Compacted saved batch rows and matched the Favorite, Load, and Delete button heights.

## 1.2.7

- Condensed the Saved Commands heading into a single Batch Files label.
- Expanded the scrollable batch list to use all remaining panel height.

## 1.2.6

- Removed the remaining Raw Console Commands label.
- Extended the command editor upward and enlarged it to align with the Saved Commands panel.

## 1.2.5

- Moved Format Tips alongside the Clear and Review Commands actions.
- Enlarged the command editor and removed its redundant heading and description.

## 1.2.4

- Expanded the Custom Command example with comments, section labels, blank-line spacing, quantities, and multiple command types.
- Added compact formatting tips beneath the editor.

## 1.2.3

- Added faint, synchronized line numbers to the Custom Command editor.
- Removed the 100-command limit from active and saved batches while retaining the 1 MB file and 1,024-character per-command safeguards.

## 1.2.2

- Turned the Speech Challenge Success and Failure action pairs into command selectors.
- The highlighted action now controls the displayed command, execution confirmation, and **Add to Batch** result.
- Selecting the inactive action switches commands; selecting the highlighted action again opens execution confirmation.
- Added an on-screen double-click instruction and requires two activations before paired Speech Challenge actions execute.
- Added **Cancel Scan** to the Mod Browser progress window while preserving the previously completed catalog.

## 1.2.1

- Kept the current Custom Command draft populated while switching pages and added a nearby **Clear** action.
- Added **Add to Batch** to command cards so prepared commands can be appended to the current batch.
- Matched the Favorite, **Add to Batch**, and Execute button heights on command cards.

## 1.2.0

- Moved saved Custom Command batches into user-owned `.txt` files with refresh, `#` comments, validation, and automatic migration from browser storage.
- Removed generated dependencies, build output, old patch manifests, superseded test-build notes, and duplicate release-note files from the distributed source archive.
- Consolidated release history into this changelog and folded the Quest Browser guide into the README.
- Replaced the accumulated release checklist with a shorter checklist for the current session-based Mod Browser workflow.
- Added a development-only Mod Browser scanner to the OSF UI webview.
- The preview now discovers the active MO2 profile, resolves enabled plugin files from the MO2 mods folder and stock Data folder, and calculates full, medium, and small runtime Form IDs.
- **Scan Mods** in the webview now loads real supported records instead of the three-item fixture catalog.
- Added explicit preview configuration for the MO2 profile and stock game Data folder when automatic detection is not appropriate.

## 1.1.26

- Finalized the release packaging and source cleanup, including the OSF UI webview Mod Browser preview scanner.

## 1.1.25

- Kept wrapped Command, ID Browser, and Mod Browser sidebar titles left aligned and vertically centered.
- Kept counts vertically centered in their own column and preserved padding around multi-line names.

## 1.1.24

- Made shared sidebar rows grow to fit wrapped names and kept their counts aligned.

## 1.1.23

- Corrected Shattered Space quest localization and classification.
- Kept dialogue, scene, template, shell, tracker, and ambient-support quests under Internal / System.

## 1.1.22

- Changed Mod Browser to a deliberate, session-only **Scan Mods** workflow with no automatic persistent-catalog restore.
- Added Bethesda `SFBGS...` plugins under **Official Creations**.
- Reduced Quest Browser clutter while retaining all 2,318 Bethesda quest records.

## 1.1.21

- Added total ID progress and automatic row growth for long names.

## 1.1.20

- Added detailed Mod Browser scan reports to Activity Log.
- Widened the shared category sidebar and improved spacing between mod entries.

## 1.1.19

- Added persistent favorites for individual ID Browser and Mod Browser records.
- Added readable names for hundreds of known plugin filenames.

## 1.1.18

- Split large Mod Browser transfers into per-plugin replies so very large load orders could finish reliably.

## 1.1.17

- Removed the browser-side scan timeout and preserved the working catalog when a scan failed.
- Displayed the raw console command beneath the selected command title.

## 1.1.16

- Combined Mod Browser discovery and ID collection into one **Scan Mods** action.
- Made Search All search records across scanned mods instead of filtering the mod list.

## 1.1.15

- Added favorites for saved Custom Command batches.
- Corrected controller movement between saved-command Load and Delete controls.
- Improved category selection borders and Mod Browser ordering.

## 1.1.14

- Improved ship and ship-part classification and scan feedback.

## 1.1.13

- Added scan progress, Add to Player for books and notes, Spawn for furniture, and a compact quantity/action row.

## 1.1.12

- Added collapsible record categories for large mod catalogs and Search Mod/Search All scopes.

## 1.1.11

- Added the complete large-load-order scanning workflow, ID-count sorting, and zero-ID filtering.

## 1.1.1

- Introduced automatic loaded-plugin discovery and the separate Mod Browser.
- Added full, medium, and small plugin Form ID ownership handling.

## 1.1.0

- Added complete controller navigation and text entry through OSF UI 2.0.
- Introduced compact Commands, ID Browser, and Quest Browser layouts.

## 1.0.0–1.0.13

- Published the first Nexus-ready release with the established command library, ID Browser, Quest Browser, favorites, Recent, Activity Log, and saved command batches.
- Migrated the native and browser bridge to OSF UI 2.0 and moved the installed view to the modern `OSF/UI/views` path.
- Added the first-run guide, command-specific browser filters, paired command actions, WIP result groups, and crash guards for unsafe commands.
- Expanded controller-ready dialogs, help, result windows, browser-backed fields, and command verification records.

## 0.3.0–0.3.14 beta

- Built the original searchable command interface and native SFSE execution bridge.
- Added categorized commands, confirmation levels, favorites, Recent, Activity Log, Custom Command batches, ID data, quest data, and early inspection tools.
- Iterated through in-game command testing, packaging, native safety checks, and release validation before v1.0.
