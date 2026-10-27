# Animated preview effects

The unpublished 1.3.38 source adds a first supported effect profile for `materials/setdressing/animated/watercaustic01_idleanimloop.mat`, used by Alien Genetic Material (`000C1F57`). It uses the original caustic gobo, opacity map and reviewed green emissive color. Soft additive blending preserves background alpha, respects opaque depth and does not write solid depth. Other materials remain static.

The original jar NIF has no controller/interpolator/keyframe blocks. Its material exposes bind controls, emissivity, soft additive blending, distortion and edge falloff. CCC does not execute the game material binding system: the two scrolling UV samples and edge attenuation are an explicitly approximate idle preview, not exact game playback. Distortion, arbitrary binding graphs, particles, skeletal animation and other unreviewed effects are not supported.

Transport version 10 adds an effect flag and retains the version 9 metal-reference layout, including zero metal references when none are present. Older packet versions retain their previous validation rules. The original native DLL and updated UI must be rebuilt together to display this effect. No OSF changes are involved.

Static models stay event driven. Effect models redraw at most 30 fps. Texture-off, hidden documents, off-screen canvases, removal and viewer disposal stop animation. Quality/material updates can start or stop the same loop without accumulating callbacks.

Verification uses original local game assets only for offline diagnostics; no game assets belong in source packages. Check the jar rotating at several angles, confirm its internal light pattern moves, then close/reopen, toggle textures and switch quality. Actual in-game visual confirmation remains pending.

Format reference: [NifTools NIF object hierarchy](https://www.niftools.org/nifxml/index.html). The controller absence above was verified against the locally installed jar NIF, not inferred from this reference.

## 1.3.39: shared material rules

The material graph is now consulted for every supported database material, including explicit texture records. This removes misplaced maps and neighboring tints by following component ownership rather than a list of item IDs. The flattened reader is retained when a graph cannot be resolved.

The emissive-only inhaler family now uses its authored emissive map for approximate opaque flowing-liquid previews. Amp and BattleUp are examples; other matching inhaler materials use the same rule. Transport version 11 adds a separate liquid flag and retains the version 9 metal-reference layout. Versions 1–10 remain readable and keep their previous flag limits. Native and UI source must be rebuilt together.

Static materials are not automatically animated. The existing texture-off, hidden-document, off-screen and disposal behavior also applies to liquids. This remains a preview approximation, with no claim to execute game binding graphs, particles or refraction.
