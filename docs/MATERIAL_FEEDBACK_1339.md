# October 22 late feedback — 1.3.39

The changes are in unpublished source. No game installation, OSF file, saved binding or inventory has been changed. In-game confirmation remains pending.

## Shared fixes

Material ownership and inheritance now apply throughout the catalog, not only reported IDs. A disabled replacement/map is not replaced with a nearby texture having the same suffix. Emissive slot 7 is distinct from opacity slot 2. Supported CharacterCombine, PositionContrast and Linear layers read their own masks, maps, tiling, intensity and enabled channels. Detail inputs are filtered according to tiling before baking, so a highly repeated cloth normal does not become aliasing noise.

Mask-only decals retain their color weight, distinguishing dark printing from light printing. Glass templates retain constant replacement colors and authored constant opacity. Emissive-only surfaces in the shared inhaler family use an approximate flowing preview with opaque depth, rather than treating their emissive pattern as holes.

The blend subset is bounded to three overlays. Layers requiring vertex-color or detail-mask inputs that are not available to this pipeline remain incomplete; they are not approximated by drawing a full-strength dirt texture. The full game shader, procedural/runtime wear, particles, distortion and arbitrary animation graphs are not reproduced.

Blender parameter semantics were checked against the public [NifSkope material defaults](https://github.com/fo76utils/nifskope/blob/develop/lib/libfo76utils/src/material.cpp) and [Starfield shader implementation](https://github.com/fo76utils/nifskope/blob/develop/res/shaders/stf_default.frag). CCC retains its existing color/shading convention while implementing the supported material inputs.

## Reports

| Entry | Source change / remaining check |
|---|---|
| Alien Kebabs 0029B061 | Follow the authored TextureSet; remove the unrelated Alien Stir Fry opacity map. Verify the reported missing piece in game. |
| Amp 0029A856 | Load its solar-lines emissive texture and approximate flowing liquid. |
| Battlestim 002A5024 | Preserve the dark mask-only label color weight and separate pale-label variant. |
| BattleUp 001F3E87 | Keep emissive patterns separate from opacity; render its liquid with opaque depth and approximate motion. |
| Neon Dancer Headwear 000C900A | Read supported masked material detail and authored tiling. Recheck the specific missing-texture area in game. |
| Ecliptic pack 00166407 | Read its three detail layers. Clear the old incomplete warning only after required inputs load successfully. |
| Fang's 0111BB99 | Use the player's tested name, Sturdy Fang's Balanced Pack, scoped to ShatteredSpace.esm:11BB99. |
| Miner Survey Pack 0006AC01 | Reference Only, scoped to Starfield.esm. |
| Pirate Survival Pack 00079206 | Reference Only, scoped to Starfield.esm. |
| Aceles Gene Sample (Gamma) 00085FCF | Restore inherited colored glass/liquid material inputs; the rule also applies to other matching samples. |
| .27 Caliber 002B559C | Still open: player confirms the comparison was in inventory/Inspect. Respect the authored inactive masks and flag active layers needing additional inputs; do not add arbitrary dirt. |

Source changes are not evidence that every report has been confirmed fixed in Starfield. The checklist above distinguishes the implemented material correction from the visual confirmation still needed.
