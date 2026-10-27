# Query capture investigation — 1.3.45

The working companion-affinity popup calls `ReadDirectQuery`, resolves the placed actor, and reads its actor value. It does not wait for ConsoleLog. The working Show Player Inventory popup similarly reads a locked live inventory list.

The 1.3.43 logs showed Get Item Count, Get Gold and Get Random Percent capture arming, followed by timeout without a matching callback-result diagnostic. This proved neither a zero nor a successful popup.

Read-only analysis of the installed Starfield 1.16.244 executable and matching Address Library identified a concrete lifetime error. Address Library ID 113576 resolves to RVA 01EA1E10. That dispatcher builds queued command records through RVA 01EA1870; it does not keep the command callback inside the caller's stack scope. The old thread-local capture was restored immediately after enqueueing, so a later callback had no active request to receive its result.

The runtime command-record initializer and execute wrappers were also inspected without changing game memory. The execute slot at +0x30 is used as expected. However, the runtime Script object differs from the dependency declaration: Script::SetText at RVA 00C122A0 stores the owned text pointer at +0x50. The new matcher uses this verified runtime offset only on the supported 1.16.244 runtime, with checked, bounded memory reads. It does not dereference the dependency's Script::text field or invoke a condition callback.

Changes:

- Get Item Count/Get Credits share the working inventory stack-count path, using the requested item or base-game Credits Form ID 0000000F. An unavailable inventory raises an error; a readable inventory with no matching item returns an actual zero.
- Get Dead/Get Disabled read the typed actor/reference flags directly.
- Remaining numeric callbacks consult a pending request that survives enqueueing. A result is accepted only inside the request window, before completion, with the expected operation, actual target, arguments and compiled source. Unreadable or unrelated source is rejected. Reentrant calls are forwarded without capture.
- The previous GetScale and condition-evaluator adapters remain disabled. No random number is synthesized as a replacement for an engine result.

Builds and synthetic fixtures cannot confirm the running-game callbacks. Retest with the updated CCC DLL after restarting Starfield, beginning with Get Item Count for Credits, Get Credits and Get Random Percent. The numeric diagnostics now identify whether a queued source was readable and matched. Keep the cards unmarked until their titles, inputs and live results have been reviewed.

## Follow-up in 1.3.46

The player subsequently supplied a native-console result of 12.26 for Get Random Percent with another CCC timeout. That disproves the original integer-only description and validator. The current log still contains no queued callback diagnostics, so simply allowing decimals is insufficient.

Read-only inspection identifies the exact no-argument execute adapter at RVA 00C325F0 / Address Library ID 66067. It loads only the seventh float-output pointer and delegates to the RNG implementation. The latter multiplies by 100 and returns a float; console printing is conditional on a console-context flag. Version 1.3.46 checks the zero-argument signature, opcode 104D, expected address and adapter prefix, then calls this specific execute adapter once with a valid output pointer. It does not manually call a condition function or build a condition context. Other command adapters are not generalized from this exception. The live popup still requires retesting with a rebuilt DLL and a fresh game process.
