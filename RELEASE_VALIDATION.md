# Release validation

## 1.4.0 release scope

This release consolidates 1.3.37–1.3.69. The detailed checks below distinguish native fixtures, installed-asset/browser comparisons and player reports. Successful automated checks do not certify every command, item, material, or inventory result in game. No new Working designations are added for release preparation.

The two-press shortcut and intermittent OSF Loading hang remain unresolved. Complex Ultra loads, cloth poses, advanced material layers and complete ship assembly retain the documented limits. The native inventory-renderer experiment and retired shop backdrops are not shipped.

### Current release checks

- All 332 JavaScript regressions, UI TypeScript/OSF compatibility and release version/documentation-link checks pass.
- All nine native suites pass: MenuHotkey, PreviewGeometry, PreviewTrigger, QuestStages, ScalarResult, SampleBatch, DevFeedback, RecordDetails and RecordDetailsInput. File-writing suites use an isolated writable temporary directory; the initial SampleBatch run could not write its normal sandboxed temp location and passes with that configured test directory.
- Browser integration with the real controller/book/audio modules verifies listening focus and volume, transcript scrolling, modal-only short/held B and Escape, item-detail routes, center editor/Review access from both Batch Commander side panels, saved-file controls and inset outlines, with no browser errors.
- Release source excludes dependencies, compiled binaries, local settings and raw game/mod assets. Bundled thumbnail mappings and files are covered by the automated manifest checks. The full native/UI build and final archive audit are recorded with the release artifacts.

## 1.3.69

- Installed Melee Madness Crimson Gutter and Crimson Shiv native exports reproduce the gray blade shell. Separately rendering all layers, omitting HeatDistortion, and omitting the visor confirms the distortion layer is responsible. Rebuilt native exports retain four textured pieces per weapon and visually remove the covering in the real renderer.
- Native tests verify exact canonical distortion matching and retention of the physical blade, visor, lava and similarly named materials. Native geometry suite, UI checks, all 332 JavaScript tests and release metadata checks pass. No installed mod assets are changed or packaged. In-game verification requires the new DLL after Starfield closes.

## 1.3.68

- Real-controller-module browser integration verifies center Review Commands focus from both side panels, A submitting the review form, Up/Down between the editor and Review, Right to saved files, and saved Load returning to the editor. Existing listening-modal, item-detail, empty-list Save, saved-row, header and sidebar checks still pass without browser errors.
- UI type/compatibility checks and all 332 JavaScript regression tests pass. Command execution and confirmation behavior are unchanged; this update changes focus routes only.

## 1.3.67

- Browser integration uses the real controller, book-reader and audio-player modules with bridged gamepad events. Verified Play initial focus with nonempty book text, Left to Volume, Up/Down range adjustment without opening the keyboard, A requesting the selected recording, right-stick transcript scrolling, short/held B and Escape closing only the modal, and closing the modal while B remains held without closing CCC.
- Item-detail navigation verifies Favorite→Copy ID, Copy ID↑Model Viewer, preview↓Copy ID, and quantity/action connections.
- Batch navigation verifies first saved Load focus, movement between saved rows, first row↑Save↑Refresh, header Left/Right, entry-name access, Included sidebar reachability/activation, and empty-list Save focus. The shared focus ring is inset at -2px; screenshots inspected.
- All 332 JavaScript regression tests and UI type/compatibility checks pass. Tightened the existing dev-report Escape fixture so its dialog lookup distinguishes modal types. No audio decoding, native command execution, or batch-file contents changed.

## 1.3.66

- Browser layout checks verify Read/Listen buttons are narrower than their preview columns and horizontally centered in both themes for base-game and mod records. Preview placement, missing-preview behavior and border removal checks still pass.
- UI type/compatibility checks pass. This is a CSS sizing follow-up to the 1.3.65 change, whose 332 regression tests passed.

## 1.3.65

- Browser layout checks use the actual shared item-details render function and preview mounting in both themes, for base-game and mod records. Read/Listen appear inside the preview column after its image/status and are absent from the lower action footer. Normal weapon previews retain their Model Viewer action; all small preview frames have zero border width. Unavailable audio slates retain a disabled Listen button below their placeholder.
- UI type/compatibility checks and all 332 existing JavaScript tests pass. Existing delegated book/audio actions and record IDs are unchanged.

## 1.3.64

- All 332 remaining JavaScript tests and UI type/compatibility checks pass. Removed the three shop-only fixtures with the retired implementation.
- Verified every retired shop preference falls back to Graphite in dark theme and Pearl in light theme. Remaining background presets have no image URLs. Basic-mode controls remain available.
- Removed the six shop WebP files from maintained and Desktop source and deployed UI assets. Historical artwork/reference material stays in the authoring workspace, outside the mod package.

## 1.3.63

- Reproduced the missing shop scene by decoding the URL from the stage's computed background style. The previous check loaded the image directly and missed the stylesheet-relative resolution failure.
- Browser verification now decodes all six actual CSS-resolved background URLs, confirms Basic-mode mouse selection and D-pad cycling, and checks light default and remembered shop selection without browser errors.
- All 335 JavaScript tests and UI type/compatibility checks pass. A regression fixture covers document-relative asset resolution for nested game-view paths and the local preview root. Selected images and Graphite/Pearl defaults are unchanged.

- Official thumbnail coverage: 4,818 mappings / 3,457 transparent 384x256 WebP files / 14,683,146 bytes. Added 476 of 593 update/DLC attempts; all images decoded and checked for visible pixels. All five reported Va'ruun/caped outfits have mappings. Coverage accounts for 6,068 attempts and 1,250 unsupported records. No fabricated substitutes.
- Browser checks confirm official static images make no native model calls, mod PNG capture disposes its canvas/GPU resources, and reopening uses bounded memory. Actual Armat FZ44A before/after renders restore green/black materials and decals; 33 of 39 pieces textured versus 11 before. Standalone JSON fixtures cover inheritance, exact slots, bounds and unsafe paths. Complex imported layers remain incomplete.
- Favorite action fixtures refresh load order per click and retain quantity across full/medium/small runtime ID changes. Legacy recovery requires a known owner and compatible ID format; missing plugins/ownerless mod favorites cannot execute. The reporter's inventory still needs in-game retesting.
- Both installed mannequin bodies render with four added pieces and no WebGL errors. Explicit mannequin selection is independent from outfit sex; automatic selection ignores shared male accessories. Body normal insets and winding-independent radial forearm fitting reduce overlap but do not implement outfit-specific body masking. Tight outfits need user review.
- Theme browser checks verify Graphite/Pearl defaults, all five light gradients and independent remembered choices without new model requests. Complete ship viewers hidden; supported individual ship parts remain available.
- Higher-resolution shadow maps and continuous tent PCF preserve receiver-plane correction. Synthetic receiver: 6,640 darker / 6,472 strong shadow pixels of 97,032; no GL errors or broad acne; transparent cutout/glass cases clear all 6,472 strong pixels. Ground checks on dark/light backgrounds add 6,014 soft-alpha pixels, zero opaque-floor pixels; moving light changes 5,122 pixels. Can screenshots inspected. Ground does not write depth or cast shadows.
- All 322 JavaScript tests, UI type checks, native preview fixtures and release metadata checks pass. Full native/UI Desktop compilation and deployment follow the established workflow. No OSF source changes, new Working markings or Git/Nexus publishing.

## 1.3.61

- UI type/compatibility checks and existing regression tests cover the renamed navigation and references. Storage identifiers, batch filenames and log data retain their existing formats.

## 1.3.60

- The existing 329 automated checks and UI type/compatibility check pass.
- Browser integration used all 17 actual installed Kryx Interview voice files and transcripts. Both themes passed play, pause/resume without refetching, keyboard activation, seeking, volume/mute, speed changes retained across lines, automatic advancement from the actual audio end event, transcript highlighting/scroll, line jumping, pausing during a pending transfer and dialog-close cleanup. Only inspection requests were made.
- Screenshots in both themes confirmed square controls and matching palette, highlighted current line, faint prior line and fading upcoming lines. Computed control corner radius was zero, with no native controls, separate Play Recording button, download control or three-dot menu. The empty audio-only book body stays hidden.
- Transcript timing follows each recorded line's real audio boundary. Word-level timing is not fabricated. The previously documented two absent official voice references remain unchanged.

## 1.3.59

- All 329 automated checks and UI compatibility/type checks passed. Browser validation loaded actual installed book and audio-slate packets into the small preview, checked upright orientation, and confirmed no Model Viewer buttons, viewer instructions or retained rendering canvases.
- Catalog regression checks cover all 1,365 authored BOOK records: 1,178 group under Books / Notes and 187 remain Audio Slates. Existing voice transport and player checks remain unchanged.

## 1.3.58

- JavaScript/TypeScript suite: 327 tests passed; UI compatibility/type check passed before packaging.
- Real installed Kryx Interview Slate 01: 17 voice lines and localized transcripts resolved. First voice line played in the open CCC dialog through the browser audio controls, with no scene, execute or close calls; closing the dialog disposed playback.
- Installed official audio slate audit: 187 catalog records examined. Voice filename resolution uses local response IDs; 185 recordings have all referenced files (1,578 voice lines read before failures); one Shattered Space recording has absent voice files and a Terran Armada recording has an absent sound-effects line. Missing lines report unavailable. In-game bridge playback and modded/localized recordings still require user testing.
- New decoder dependencies pinned to ww2ogg-ts 0.2.0 and buffer 6.0.3. Dependency audit found no advisory against the new audio dependencies; pre-existing OSF/Vite/source-map-js advisories remain outside this focused update.
- Native preview fixtures and installed rifle assembly export passed. Browser checks confirmed scanner height stays 50.39 px for one/two-line names, rifle assembly renders, spacesuit mannequins add only two head/neck parts versus four for standard accessories, and real inventory slate/book models render. Ground-shadow checks passed for Graphite/Pearl, moving light, transparent ground, and zero WebGL errors. Actual game screenshots remain necessary for final outfit/mannequin fit and shadows.

## Previous 1.3.56 validation


- Audit all 5,475 distinct base-game catalog records that expose the Model Viewer. Export 4,342 thumbnail mappings using 3,068 deduplicated transparent WebP images, 384x256, totaling 12,907,406 bytes (about 12.3 MiB). Every image was decoded and checked for dimensions and visible pixels; none were blank. Representative aid, weapon, worn suit, helmet, apparel, ammo, miscellaneous, ship and furniture pictures were visually inspected.
- 1,133 records have no thumbnail: 1,081 expose no supported model/assembly; 24 have unresolved modular attachment points; 10 exceed assembly-reference bounds; 9 reference unavailable assets; 4 have no decoded geometry; 3 exceed model-part bounds; 2 weapons have no supported default model. Retain the full Model Viewer button and do not substitute fabricated imagery. Exact record IDs, labels, errors and category coverage are in docs/THUMBNAIL_COVERAGE.json. DLC/mod thumbnail generation is outside this base-game pass; those records keep their live viewer.
- Images are authored offline with the existing CCC renderer and small base-color maps. The offline native diagnostic reads worn armor addons, with preferred male/female fallback and existing Helmets/Apparel/Spacesuits initial yaw. Packs retain their existing orientation. No game assets or preview packets are packaged; only rendered image output. The portable render-preview-thumbnails script and PACKAGED_THUMBNAILS guide document reproduction.
- Replace the inline live canvas and input handlers with an accessible, non-draggable img. Lookup uses owning plugin/local Form ID. No native calls, renderer context or persistent thumbnail-cache writes occur on opening the small preview. The shared background CSS still applies. Unsupported/unpictured entries do not attempt an on-device fallback. Browser validation confirms image display, reopening/reload, zero native requests/WebGL/IndexedDB writes, and an interactive full viewer. Unlisted mod fallback and no browser errors are checked.
- Diagnose the user's Ultra timeout using actual host logs: OSF UI.webview2-host.log and OSF UI.log record the 128 page-messages/second rate exceeded warning at 22:22:44 on October 24. Keep four 64 KiB chunks but space batches by at least 70ms (roughly 57 requests/second), leaving room for ordinary UI traffic. A meaningful transfer test checks timing while existing integrity, retries, cancellation and decompression tests remain in place. No host limits or OSF source files are changed.
- All 314 JavaScript tests, UI type checks, native preview fixtures and release metadata checks pass. Source packaging, full native/UI compilation and Desktop/game deployment follow the established workflow. No new Working markings.

## Previous 1.3.55 validation

- Trace found three concrete bottlenecks: Low processed full material channels, a 60 MiB whole-cache clear discarded 64 MiB 4K maps, and transfers used two 32 KiB requests. New color stage uses 128px base color/opacity/tint without detail channels. Geometry requests no longer construct the material database. Native stage timing and compressed/decoded byte counts are logged for follow-up in-game measurements.
- Decoded source texture cache evicts least-recently-used entries at 64 MiB ordinary / 256 MiB Ultra, maximum 128 entries. Completed compressed native cache is 96 MiB / four packets; browser decoded cache is 256 MiB / four packets. These are bounded totals, not per-entry quotas; navigating several large models can evict older previews. Existing geometry cache remains bounded at 24 MiB / three entries.
- Transfer uses four 64 KiB ranges with 32/16 KiB retries; malformed data, offsets, decompressed bounds and cancellation remain checked. Outstanding calls are drained on failure. Quick-stage packets use compression level 1; full packets level 6. A simulated 20ms-per-reply Med Pack transfer used 81 requests / 21 rounds versus the old minimum 220 requests / 110 rounds. This is a transport fixture, not an in-game speed guarantee.
- Native fixtures verify LRU retention/eviction/budget shrink and color-only output without detail maps. Native preview tests pass. Real installed assets checked: Constellation Spacesuit (worn/mannequin), Beowulf, Med Pack, Constellation Space Helmet and Leather Streetwear (worn/mannequin). Final Ultra packets are byte-identical to prior output for all five. Compressed color packets are 15–46 times smaller than their full packets. Cold-process native color generation takes 7.7–8.4 seconds here, including asset/material initialization; full Ultra generation takes 8.9–18.7 seconds. Live game bridge and GPU timings still require user verification.

- Isolated browser validation uses actual Med Pack geometry/color/Ultra packets, deliberately delays the final response, verifies the color stage stays movable, checks exact camera retention across material replacement, and confirms cached Ultra reopening sends no new native requests. No browser errors; quick-stage screenshot visually inspected. All 311 JavaScript tests, UI type checks, release metadata checks and native preview fixtures pass. Native plugin compilation passes. Full Desktop source/build/watch deployment follows the existing workflow. No OSF modifications or new Working markings.

## Previous 1.3.54 validation

- Restore the background control inside the full Model Viewer toolbar. Seven fixed, validated presets provide five muted radial gradients and Charcoal/Black solids. Graphite gradient is the fallback for old or unsupported saved values. Store previewBackground alongside existing UI preferences; apply one shared CSS custom property to full stages and inline canvases. Background changes never alter shader inputs, model data or camera state.
- Pass the preference through the existing Model Viewer options interface. A select with an accessible name supports keyboard/mouse; D-pad left/right cycles presets when the controller Quality menu is closed. Existing Quality-menu D-pad behavior is unchanged.
- Apply the existing 180-degree initial yaw offset to Apparel and Spacesuits as well as Helmets at all three renderer creation sites: full viewer, inline geometry stage and inline textured stage. The renderer's reset uses the same initial offset; material refresh continues to preserve camera state.
- Isolated browser UI validation checks all seven distinct backgrounds, full/inline synchronization, saved selection after closing/reopening and page reload, no additional model requests and identical canvas pixels while changing only the backdrop, controller cycling/Quality-menu isolation, and a usable 800px-wide layout. Visual inspection confirms muted gradients and responsive control placement.
- 310 JavaScript tests and UI type checks pass. Updated existing preference fixtures account for the new persisted field. Release metadata checks and full native/UI build/deployment are run before delivery. No new Working designations or OSF changes.
- Separately produced five 1920x1080 Nexus release comparison shots (suit, weapon, aid, helmet, apparel), in PNG/JPEG. They compare the 1.3.52 and 1.3.53 browser renderers with matching source models, camera, light and background; these are not native inventory-renderer screenshots. Files are kept outside the source package under downloads/CCC-1.3.53-Nexus-Comparisons and copied into the user's Gallery/1.3.53-renderer-comparisons folder.

## Previous 1.3.53 validation

- User reference: Dark Erdebrau Can, game inventory versus CCC screenshots. The browser renderer previously had no shadow-map pass and added a bright gray environment plus diffuse glass shading, producing a pale overlay over the beer. This release changes only shared browser lighting/material shading and adds shadow resources; source item textures and native material data are unchanged.
- preview-lighting.ts constructs a stable light-space orthographic volume around the normalized model. Depth-only WebGL2 targets use 512/1024/2048 resolution for Low, Medium/High and Ultra. Failure to allocate a complete target preserves the preview without shadows. The renderer releases targets on quality change/disposal, redraws shadows with light/model changes, excludes transparent/effect casters, and retains cutout alpha silhouettes.
- Filter nine nearest shadow texels using receiver-plane depth derivatives and actual texel-centre coordinates. An initial constant-bias implementation incorrectly darkened most of a sloping test receiver; it was replaced before release. Final isolated test shows 6,815 darkened receiver pixels, 6,454 strongly shadowed pixels, out of 97,032 solid pixels (roughly seven percent), with no WebGL error. This verifies an actual occluder shadow rather than global darkening.
- Neutral studio cards and lowered ambient fill retain dark albedo. Glass uses transmission/absorption coverage plus Fresnel reflections instead of opaque diffuse haze; opaque/cutout parts still write depth. Normal-only overlays, caustics and emissive liquids keep their own existing passes. Reflection cards are an approximation, not the game's reflection captures or full refractive renderer.
- Side-by-side isolated WebGL comparisons cover Dark/Lager Erdebrau cans, Groat, Butter, Cheddar, Armada/Constellation helmets and an animated Boudicca inhaler. All eight render without WebGL errors. Visual inspection shows clearer/darker beer, preserved labels and more pronounced helmet recesses. A High-quality Dark comparison and transparent cutout/glass caster checks are also run before deployment. The source packets are the same in each before/after pair.
- 310 JavaScript tests pass, including shadow volume coverage for side/overhead/orbiting lights, correct near/far ordering, invalid light rejection and unavailable framebuffer cleanup/state restoration. UI type checks, release metadata and full native/UI build are required before deployment. Exact in-game lighting parity still needs the user's review; nothing is marked Working.

## Previous 1.3.52 validation

- New feedback: docs/feedback/2026-10-24-preview-transfer.txt reports a transfer-limit error for Emergency Kit, four Erdebrau cans and Groat Meat. The final packet previously enforced its limit only after appending all output maps; source-budget accounting can miss distinct post-composition images and oversized source maps. Fit the actual deduplicated output texture table before appending it. Repeatedly box-filter the largest reducible map until the packet fits the existing budget. Retain geometry, texture IDs, material flags, transparency and cached originals; ordinary packets keep their exact bytes. Reject impossible geometry-only budgets.
- Native fixtures check bounded output, all three map types retained, unchanged geometry/source maps, alpha preservation, shared-map deduplication and an impossible budget. Vanilla-file reproduction of Emergency Kit, Dark Can and Groat Meat at Ultra did not hit the user’s error, so exact live/mod-setup reproduction remains unavailable. This is a general bound-handling repair, not a claim that a specific texture mod caused the reports.
- The existing callback is declared in MainGameplay with OSF Settings' Movement control mask; menus can disable that action. OSF Settings offers no public hotkey-value reader for declarations (GetKey reads ordinary setting keys). Add a CCC-only read-only saved-binding fallback, not a global input-enablement change or OSF patch.
- Parse the keyboard device block in ControlMap_Custom.txt: format 3, big-endian block length, null-terminated context/action and little-endian key count/values. Only MainGameplay + console.command-center/openCCC with one valid keyboard VK is accepted. Later device blocks and unrelated/prefix actions are ignored. A bounded file read refreshes every 500 ms; no file is written.
- A menu-event sink on the engine thread maintains an explicit ordinary-menu allowlist and blocked-dialog list. A 16 ms process-lifetime keyboard worker reads only Win32 input and atomic state; it never calls game objects or modifies input layers. Only a focused game and fresh press can enqueue the normal thread-safe OSF RequestMenu API. CCC lifecycle events prevent opening over itself, and both opening paths share a short duplicate-request guard. Pause/Controls is excluded because vanilla key capture occurs inside PauseMenu. Controller menu support is not implemented by this keyboard fallback.
- Native binding/latch tests cover F10, every truncated save prefix, unbound/zero values, unrelated and prefix actions, later device blocks, unknown versions, oversized counts, held-key suppression, blocked-to-allowed transitions and rebinding. The actual current saved Controls file resolves to F10. Native DLL, existing JavaScript tests and release checks are run before deployment.
- Inventory/container/shop/map/crafting opening, returning to the underlying menu after closing CCC, and live rebind/focus behavior still require in-game verification after restarting Starfield. No live success or Working designation is claimed. The two-press issue remains open. OSF UI and OSF Settings are unchanged.

## Previous 1.3.51 validation

- Evidence: docs/feedback/2026-10-23-food-materials.txt (22 item reports from 1.3.50). The user explicitly requested that fixes apply across the board. All new behavior is based on shared material metadata or render passes; no reported item ID list controls it.
- Inspect the installed material database schemas: AlphaSettings property 0 is HasOpacity, 1 is AlphaTestThreshold, and 4 is UseDitheredTransparency. Butter and Carrot inherited unrelated opacity textures while their standard shader has no opacity enabled. Read leading per-property DIFF values independently across parents and default opacity off for known non-effect/non-glass shaders. Preserve effect/glass behavior and unsupported metadata fallbacks.
- Read TextureReplacement scalars at roughness slot 3, metalness slot 4 and AO slot 5. Snack tins author metalness 1; Chandra red wine bottles author metalness approximately .855 and roughness approximately .137. Previously both scalar values were ignored. BeerBottleGlassDark authors its only visible color in layer 1, with an empty layer 0; resolve that sole usable surface generically.
- Native fixtures cover inherited scalar replacements, partial alpha DIFFs, opaque and thresholded cutout alpha, unknown/effect opacity preservation, zero-weight and weighted tints, and a sole surface behind an empty first layer. Existing geometry/material/packet fixtures pass.
- All 22 real reported-item packets load and decode. Isolated WebGL comparisons of Butter, food plates, Carrot, Chandra Cabernet, snack tins, Chunks Cola, Dark Lager, cereal and Shipwreck show no GL errors. Visual inspection confirms the opaque Butter, darker wine bottle, metallic tin and gold lager improvements. The Chunks normal-only pass no longer paints an opaque gray card over the base. A front/back solid-decal test returned front green [23,255,22,255] rather than showing the back red face.
- Regression packets include the three helmet variants plus seven prior preview cases. Armada/armored Armada color texture bytes are unchanged; Constellation shell texture bytes are unchanged. Checkerboard remains disabled. Groat's loaded authored model has one piece and no separate bottom-logo decal; no logo is fabricated.
- 307 JavaScript tests and native preview fixtures pass. Full native/UI build and deployment are run through the user's Desktop workflow. Browser/native fixture results do not establish exact game-lighting parity or live-game Working status; visual game review is pending.

## Previous 1.3.50 validation

- 307 JavaScript tests and UI/TypeScript/release checks pass. An isolated real WebGL test enabled missing-texture requests on an incomplete textured surface: 81,178 visible pixels, zero checker-color pixels, and no GL errors. Helmet reset preserved the pi yaw offset. A rendered Armada helmet screenshot was visually inspected with textures visible; this does not establish how every material renders in game.

- Evidence is preserved in docs/feedback/2026-10-23-preview-review.txt. The user clarified that helmets showed the diagnostic checkerboard and requested disabling it for the next game review. Do not change native material resolution or claim a texture fix in this build.
- A renderer-level gate disables checkerboard output even when existing Dev Mode handlers request it. Existing texture and incomplete-material metadata are retained. Helmet category context supplies an initial yaw offset of pi to full and inline previews, including reset; quality changes preserve the user's view.
- Reorder MISC immediately above Advanced Settings; prefix favorited command and ID rows with a gold star. Apply both exact Boudicca names without changing record identities.
- Boom Pop model choice, Boudicca darkness, Butter/food transparency, Cabernet printing and helmet materials remain pending visual review with diagnostics disabled.

## Previous 1.3.49 validation

- Apply docs/feedback/2026-10-23-command-categories.txt in report order. The later Get Credit Count note cancels the earlier move to MISC; it stays Inventory. Seventeen requested commands move to MISC, including Toggle All Menus; Rain and Snow move to WIP Issues.
- Add MISC to the category type, sidebar order and feedback category validation. Current authored categories survive older local report categories; explicit WIP issue placement continues to override older report metadata.
- Preserve command IDs, selectors, query routes, Working state under user control, and existing execution behavior. This build changes categorization only, plus the version.

## Previous 1.3.48 validation

- Input evidence: docs/feedback/2026-10-23-readouts.txt. Reports are from 1.3.47. Apply the final IsRunning report (console works, readout needed), not the superseded failure. Current Cell and Starting Position are explicitly placed in WIP Issues. The ten other definitions remain untested for popup review.
- Read-only analysis of Starfield 1.16.244 identifies no-argument execute adapters: IsWeaponOut 66576 / 00C55E60; IsWeaponMagicOut 66119 / 00C35BC0; IsSneaking 66238 / 00C3E040; IsRunning 66239 / 00C3E0F0; GetCombatState 66554 / 00C53E70; IsEssential 66277 / 00C40570; GetLocked 65976 / 00C29490; GetLockLevel 65977 / 00C29530. Inspect adapter bodies for reference/result arguments and absence of compiled argument parsing. Runtime checks require exact Address Library function, prefix and zero parameters; unwritten, nonfinite and invalid-domain outputs are rejected.
- IsInCombat execute adapter 66244 / 00C3E360 invokes a compiled optional-argument parser. Do not call it with empty fabricated script data. Its body at 00BECC90 uses actor vtable+0xB58 and no other input for default mode zero. Use that exact typed bool virtual after actor RTTI and supported execute-address/prefix validation. The CommonLib virtual index differs and is not used.
- GetDistance execute adapter parses a compiled reference argument and uses transformed position data. The new direct distance path is intentionally limited to finite coordinates for two enabled, non-deleted references in the same cell, excluding the parent-relative flag handled by the native transform path. Other pairs display an explicit limitation. No unresolved GetDistance adapter is called, and the result is labeled game units, not meters.
- Production form-builder tests cover target/destination options and required object references. Production response-handler tests exercise all ten requested labels, query routing, zero/fractional results and Activity Log persistence. Category regression tests ensure exported WIP placement survives older local category metadata.
- 307 JavaScript tests, UI/TypeScript and release checks pass; native DLL compiles. These are not live-game confirmation. Rebuild/install the native DLL and UI and restart Starfield before reviewing the new readouts. Working remains controlled by the user.

## Previous 1.3.47 validation

- Feedback CCC-Dev-Feedback-2026-10-23_21-22-02-876_37572-6613515-0.txt is from 1.3.45, not 1.3.46. It does not retest the fractional Random Percent fix.
- Read-only examination of the supported executable and Address Library resolves GetLevel to ID 66068 / RVA 00C32620 and GetSleeping to ID 66010 / RVA 00C2DB60. Both adapters use the reference in r8 and the seventh float output argument, creating the context internally without compiled arguments. Runtime checks reject changed/replaced adapters.
- GetScale's engine body at RVA 00BE4440 reads uint16 reference+D0 and multiplies by the float at RVA 04F03EEC (0.01f). Use the typed scale member with an offset assertion. The unresolved GetScale and condition-function adapters remain unused; the historical unsafe card remains blocked.
- IsRaining at RVA 00C2F750 and IsSnowing at RVA 00C2F7C0 write zero without consulting weather state. Show an explicit limitation message instead of treating zero as a weather measurement.
- Get Starting Position parses compiled axis arguments and calls a virtual getter; Get Current Cell traverses camera/world data and prints text. Neither is safely replaced by guessing values or substituting the player's current position/cell. Both remain unresolved in this build.
- Automated tests and builds do not establish live-game success. The user must rebuild the DLL, restart the game, and review the new paths; no shipped Working designation is added.

## Previous 1.3.46 validation

- Player screenshots show GetRandomPercent >> 12.26 in the native console while CCC times out. The 1.3.45 log still shows arming and timeout without queued-callback match diagnostics. Fractional validation was incorrect but was not the only failure.
- The supported 1.16.244 no-argument execute adapter resolves through Address Library ID 66067 to RVA 00C325F0. Its verified stub accesses only the seventh float-output argument and delegates to the game’s RNG handler. A runtime opcode/parameter/address/byte guard rejects changed adapters. The popup now reads this engine result directly; no random result is synthesized and no condition adapter is called manually.
- Native fixtures check fractional/zero/boundary returns, one invocation per request, failed calls, unwritten output, out-of-range and nonfinite results. In-game confirmation of this direct path remains pending. The command is still untested by default.

- All 304 automated tests, UI/TypeScript checks, release checks and both production builds pass. Native fixtures verify fractional returns, and the production popup-handler test preserves 12.260000 in both the Results dialog and Activity Log. These tests do not establish live game success.

## Previous 1.3.45 validation

- Referenced the working direct actor-value/companion-affinity and Show Player Inventory paths. Get Item Count and Get Credits now use locked inventory data; Get Dead and Get Disabled use typed runtime flags. Missing inventory is an error, not a fabricated zero.
- Static, read-only analysis of the installed 1.16.244 executable shows command dispatch queues work. The prior thread-local capture only lived around enqueueing. The new bounded pending capture survives that return and verifies the actual compiled source, operation, target and arguments. Read-only analysis also verifies Script source at +0x50; checked memory copies avoid dereferencing the dependency’s different Script::text layout.
- Native fixtures exercise source matching/mismatching, target/axis/operation checks, unreadable and overlong source, stack aggregation, missing-item zero, and existing numeric result validation. The existing unsafe direct GetScale/GetOpenState adapters remain disabled.
- In-game popup validation remains pending. No game/OSF files or saved test designations were changed. All 15 revised commands remain untested by default.

- All 303 automated tests, UI/TypeScript checks, release metadata checks and production UI/native builds pass. Native fixtures additionally verify that a pending request survives return from its enqueueing frame, and reject completed, expired or canceled requests. The source package includes the new inventory and queued-source helpers and fixtures.

## Previous 1.3.44 validation

- Command rows use the ID Browser Working/Issues sibling controls in Dev Mode. Reports update status without moving established commands to WIP. Outcome storage retains the displayed category for promoted WIP commands; unreviewed overrides and prior notes remain persistent.
- Command lists/details no longer render Caution/Danger tags. Confirmation headings are neutral; instructions and known-crash execution blocks remain.
- The supplied October 23 1.3.43 feedback confirms Get Item Count, Get Credits and Get Random Percent still time out. Read-only native log inspection shows capture arming followed by timeout, without matching callback-result diagnostics. No claim is made that the popup issue is fixed by this UI revision.

- All 303 automated tests, UI/TypeScript checks, release checks and both builds pass. An isolated Edge test exercised the built production UI with a mock bridge: row Working/Issues controls, issue dialog/save, selection/category retention, Working reset, reload persistence, and absence of risk badges all passed with no page errors. This does not test game popup readouts.

## Previous 1.3.43 validation

- Player screenshots showed nine scalar-query capture timeouts; both weather checks were also reported failing. This revision observes the original engine execute callbacks for these 11 commands while a matching CCC invocation is executing. It does not call engine callbacks manually, evaluate conditions, synthesize results or change OSF. Existing direct GetScale/GetOpenState adapters remain disabled.
- Scalar fixtures cover actual zero, positive, negative and fractional returns, untouched output, callback failure, nonfinite values, unrelated calls, null outputs, exceptions, all 11 command plans, target IDs, argument validation and result domains. No game-session success is claimed by these fixtures.

- All 302 automated tests, UI/TypeScript and release checks pass. The native scalar/query fixtures and production UI/native builds pass. Numeric capture logs report whether the expected callback ran and wrote a result to help diagnose any remaining live failure. Live popup verification remains pending; the game installation and OSF files were not changed.

- All 15 revised cards now default to untested. The command-detail Working button toggles off to an explicit unreviewed override, including shipped green defaults. Tests cover second-click clearing, reload/export persistence, removal from the tested set, remarking Working, and preserving historical comments.

## Previous 1.3.42 validation

- All 15 query cards use readable titles and descriptions of their purpose and required inputs. Targets use explicit Player/companion choices or a manually entered placed Reference ID. Required item, actor-value, axis and global arguments have pickers; commands without parameters no longer offer generic fields.
- The Get Random Percent popup timed out in player testing. Its output-capture issue remains open; no synthetic random value or unsafe direct adapter has been substituted.

- All 299 automated tests, UI/TypeScript checks, release metadata checks and both builds pass. Input tests exercise the production command builder for every picker option, explicit target prefixes, required arguments and invalid input rejection. No game or OSF installation was changed.

## Previous 1.3.41 validation

The 14 confirmed console readouts now load at startup in existing categories. Their IDs are preserved and they have no WIP duplicates. GetGlobalValue also moves into World with six tested global IDs and a selector. Its previous console-output capture timed out in game; the replacement reads the live loaded TESGlobal value. In-game verification of this replacement remains pending. All 296 automated tests, UI/TypeScript checks, release metadata checks, production UI build and native DLL build pass. OSF files and the game installation were not changed.

## Previous 1.3.40 validation

- Player reported 14 read queries working in the native console and requested popups. They now request the existing Results dialog, preserve returned text (including zero), and save it in Activity Log. GetGlobalValue remains unverified after its GameHour name argument failed.
- Handler tests exercise all 14 actual command definitions through the query route, open dialog and saved result. Empty capture and timeout tests retain errors instead of fabricating zero. Live game-to-popup output capture is not yet confirmed.
- GetScale bypasses unsafe direct adapters and uses ordinary console-output capture. Both adapter implementations remain absent; the older blocked prepared card remains blocked. No new engine hooks, condition evaluators or OSF changes are introduced. GetValue reuses the existing GetAV path.
- Verified six global IDs against actual base-game GLOB records. The [separate global-value tests](docs/GLOBAL_VALUE_TESTS.md) are read-only test candidates, not confirmed command results.
- All 295 automated tests, UI/TypeScript checks, release metadata checks, production UI build and native DLL build pass. No game installation, feedback file, saved binding, inventory or GitHub release was changed.

## Previous 1.3.39 validation

- Generalized the material-ownership/inheritance fix to supported materials throughout the catalog, retaining the legacy reader when a graph cannot be resolved. Shared handling now distinguishes opacity and emissive maps, mask-only decal color weights, inherited glass colors and supported masked layers. Synthetic fixtures use a generic material unrelated to the reported item names.
- All 292 JavaScript tests and UI/TypeScript checks pass. Native preview fixtures cover generic inherited layers and tiling, disabled layer masks, channel switches, unchanged opacity/unmasked pixels, label masks, ownership, cache isolation and transport versions 10/11.
- Eight reported items and 20 additional cases loaded offline from original game assets. The additional models rendered at four angles with no blank previews or GL errors. The 20-case contact sheet was visually inspected; it includes weapons, clothing, a helmet, consumables, ammunition and miscellaneous objects.
- Amp browser animation changed 29,940 RGB pixels between frames, with unchanged alpha and zero GL errors. Texture toggle, canvas hide/show, static/animated material updates and disposal stopped/resumed animation correctly. Flow remains an approximate viewer effect rather than the game's shader/binding playback.
- The two requested pack reference flags and Fang's tested pack name are covered by owner/local-ID tests, including load-order remapping and other-plugin collisions.
- The .27 Caliber wear report remains open. The player confirms the comparison is against inventory/Inspect. Authored inactive masks stay inactive; additional unsupported vertex/detail-mask inputs are not replaced with artificial dirt.
- No game installation, OSF files, saved keybinds, feedback files or inventory were changed. The source is unpublished, with GitHub main/public release still 1.3.36. Actual in-game confirmation remains pending; see [the report-by-report notes](docs/MATERIAL_FEEDBACK_1339.md).

## Previous 1.3.38 source checks

- This 1.3.38 source retains the saved-Favorites ID resolution fix. It excludes the earlier withdrawn native-menu hotkey experiment; the original callback-only openCCC binding is retained.
- Six base-game items and five DLC/mod ownership/load-order cases pass isolated browser testing, including reloads, switching selections and favorited Add Item commands. Replies/inventory were simulated; real in-game inventory verification is pending.
- All 290 automated JavaScript tests, UI/TypeScript checks, native preview fixtures, native DLL compilation and production UI build pass. The new native fixtures cover masked tint-only labels, cache isolation for meat/wrapper opacity, scoped inhaler graph tint correction and the effect packet.
- Verified all nine clothing category corrections against installed ARMO records; UC AntiXeno remains Helmets at the player's request and matches its spacesuit record.
- Offline original-asset previews reproduced all four reported material problems. Corrected Addichrone label masks, AddiJack's borrowed red tint and Alien Jerky's meat transparency without changing its wrapper. Rotated views were inspected.
- Alien Genetic Material now uses a scoped animated caustic profile with the original gobo, opacity and reviewed green emissive tint. Its NIF contains no controller/keyframe blocks; movement is an approximate idle effect, not exact game playback. Distortion and the full game binding graph remain unsupported.
- Isolated WebGL verification recorded 125,733 changing RGB pixels between animation frames, unchanged alpha and zero GL errors. Texture toggle, canvas hide/show, static/animated material updates and disposal stopped/resumed the loop correctly, with no pending animation callback after disposal.
- This local source package is unpublished. GitHub main and the public release remain 1.3.36. The DLL was built into workspace staging only; the installed game mod, OSF files, keybinds and game data were not changed. Actual in-game visual and Favorites inventory confirmation remain pending.

## Previous 1.3.36 validation

- The player confirmed the restored full 1.3.36 source works. The two-press keybind remains reproducible; the intermittent Loading hang remains unresolved. Both are documented in [Known bugs](README.md#known-bugs).
- Waiting 10–15 minutes and trying again is a reported workaround for the Loading hang, not a guaranteed recovery. A captured session recovered after about 12 minutes without a game restart.
- Retained the original OSF Settings RegisterHotkey callback and callback-only openCCC schema. No native-menu launcher code or menu target is included. The withdrawn 1.3.37 experiment is excluded from this release.
- A live F10 trace showed three first presses without corresponding menu-open requests and successful requests on each second press. Starfield retained foreground and keyboard focus during those examples. Both Escape and the Close button can precede the issue; changing application focus may temporarily restore one-press behavior.
- No OSF framework files, shared browser processes, player reports or saved bindings are modified by this release.

## 1.3.36 checks and evidence


- Added red reference crosses while retaining the existing reference classification, selected-row distinction and Working override.
- All 283 JavaScript tests and UI/TypeScript checks passed. Isolated browser testing reproduced a failed startup handshake followed by automatic reconnect: current selection details loaded, search was preserved and no command was replayed.
- Live capture with original OSF helper: CCC hidden at 21:29:46.104, CDP input timeout at 21:29:51.651, then automatic view reload remained unready until the page showed again at 21:41:53.731. OSF Settings continued requesting the same view and timing out. This identifies the failure sequence, not its cause.
- Saved host/renderer/GPU stack snapshots and logs before recovery. The returned player checklist has 45 passes, one failure and 121 untested entries; it also reports the keybind sometimes needs two presses.
- No OSF binaries or player browser storage are changed by this build. The freeze remains unresolved; the translation-disabled comparison is a separate diagnostic.

- The recovered page showed NATIVE NOT CONNECTED. CCC previously attempted its native handshake only once; this build retries that handshake. The original browser hang is not resolved by this change.

## Previous 1.3.35 validation

- All 280 JavaScript tests and UI/TypeScript checks passed.
- Isolated browser checks verified normal and selected Reference Only rows in dark/light themes, without Dev Mode; text contrast exceeded 4.5:1 in those tested states. Favorites retains the reference treatment and badge; Working removes both.
- This changes presentation only. No attached report comments were applied as catalog corrections. The loading-freeze investigation remains separate.

## Previous 1.3.34 validation

- Reproduced Favorites information collapsing to zero height in the actual browser layout. The wrapper inherited the two-row command layout although it contains a single item panel.
- One-row layout restores the description/preview scroll area to 381, 377 and 281 pixels at 1500×820, 2048×816 and 1280×720 respectively. Information and preview containers remained visible. Browser replies were mocked; the in-game Armada helmet needs retesting.
- No change to translation processing, teleport behavior or OSF framework files. The loading freeze remains unresolved.

## Previous 1.3.33 validation

- All 280 JavaScript tests pass, including Working clearing a shipped reference restriction across actions, visibility, sorting, report export, restart and plugin/load-order identity.
- Updated the earlier suit regression to reflect the player's new successful test of Starfield.esm 0016D2C4. Other Deepseeker classifications remain unchanged.
- Isolated browser verification passed: the confirmed suit has Add to Player; marking a reference pack Working clears its tag, restores Add to Player, turns its row green, saves an exportable correction and survives reload outside Advanced Options. No inventory commands were run.
- Native behavior is unchanged from 1.3.32; the DLL version is rebuilt to match the view. No OSF UI or OSF Settings files are modified.

## Previous 1.3.32 validation

## New checks

- All 279 JavaScript tests and UI/TypeScript compatibility checks passed.
- Isolated browser reproduction confirmed Add to Player stopped responding after Favorites → ID Browser. With scoped bindings, both panels sent the correct item and quantity exactly once. Browser replies were mocked; no inventory was changed.
- Read-only Starfield.esm audit verified ARMO Non-Playable flag 0x4 on 000FBA03, 0019228E, 00192290 and 00255521. 0016D15B and 0016D15C remain available. 0016D2C4 lacks that flag but retains its earlier failed-inventory report and reference-only classification.
- Offline preview tests decoded textured Deepseeker pack, helmet and female upper-body/lower-body/sleeve models. No preview-specific fix is claimed from those checks.
- Native DLL rebuilt successfully and all eight native test executables passed.
- Hotkey schema omits a default binding and registers openCCC with the OSF Settings native API. Live key assignment and game opening still need verification after restart.

## Previous 1.3.31 validation

## Included changes

This release includes translation packs, descriptions/effects/base stats, book reading, reviewed cell names and classifications, report export fixes and the split item-details/model-preview layout. Technical metadata follows Advanced Options; Copy ID and supported previews remain available in ordinary browsing.

## Completed checks

- All 277 JavaScript regression tests and UI/TypeScript compatibility checks passed, including in the clean publishing checkout. Included-batch tests create their own temporary build parent when run before any build.
- All eight native test executables passed. Source line endings are normalized to LF and declared in .gitattributes.
- Native request tests use the actual OSF reject callback: omitted/default, explicit inspect and read-book operations retain a usable reply token; malformed operations are refused. This covers the 1.3.29 inspection rejection fixed in 1.3.30.
- Native description tests cover bounds, long book text, English fallback, namespace separation, inline descriptions, perk-rank text and remapped identities. Installed-file checks loaded Addichrone, Ballistics and A Christmas Carol. Model geometry/attachment, controller trigger, quest-stage, scalar-result, batch and feedback checks are included in the native test suite.
- Browser checks with simulated native replies verified the Read popup, scrolling, basic formatting, hostile-markup removal, close/Escape, cached reopening and no inventory/console mutation. They also verified normal/advanced metadata toggling and retained copy/action buttons.
- Layout checks measured equal description/preview columns with a 14 px gap. The preview stayed at the same vertical position during a 120 px scroll. Items without previews use the full text width.
- Matching native/UI builds, translation export, release metadata/documentation links and source/runtime archive contents checked before packaging. No game assets, reports, profiles, local caches or experimental OSF helper are part of the CCC release.

## Remaining limits

- Browser tests simulate native replies; they do not replace in-game checks across every record, language or mod. Base stats can differ from inventory instances with upgrades, legendary effects, curves or player bonuses.
- Audio/image-only slates may not supply readable text. Reading in CCC does not add items, mark the original book read or grant rewards.
- The static viewer does not simulate cloth. The Caped House Veth'aal Suit's separate banner can appear detached in its authored rest pose; no guessed offsets or deleted pieces are applied.
- The intermittent OSF loading freeze is not claimed fixed. The experimental OSF visibility-helper replacement remains a separate test project; it is not included here.

Install the matching DLL and view together, then restart Starfield for live verification.

## 1.3.62

- All 334 JavaScript tests pass, including the six shop category mappings, bundled-image presence, negotiated transfer validation and exact-byte reconstruction. UI type/compatibility and release metadata checks pass.
- Browser integration loads all six chosen WebP backgrounds in the actual viewer, checks automatic category selection, Basic hiding, light default and remembered shop selection, with no browser errors. Artwork selection was made by the user from twelve generated/adapted candidates. Geometry/background contact and lighting still need in-game review.
- Native preview fixtures pass including chunk bounds. Four 256 KiB chunks replace sixteen 64 KiB chunks for the same bulk bytes; request pacing and texture data are unchanged. No claim of measured in-game end-to-end speedup; asset extraction, decompression and GPU upload remain separate costs.
- Actual installed REV-8/Moonjumper models were rendered into bundled transparent thumbnails. Physical and module records map to their corresponding stills. Full vehicle render and thumbnail yaw include the requested half-turn.
- The KZ Mantis pack’s body-facing mesh artifact remains unchanged after user review; vanilla pack geometry rendered normally.
