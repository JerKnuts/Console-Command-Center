# Default material variant audit — v1.2.82

The Syndicate Boss Suit (Starfield.esm:11F3AD) has three generic ARMA meshes. Its first OBTS template sets a typed FormID material-swap property referencing LMSW 00F7CA. That swap replaces all three materials with the authored Seokguh Syndicate Leader variants. Skipping this property loaded valid generic white/black textures instead of the blue suit and patterned light shirt. Both body types were checked with real assets and the browser renderer after the fix.

## Scope and findings

The audit reads original installed source plugins for every generated ARMO/WEAP catalog entry. It does not modify them, render every item, test player inventory variants, or inspect the user's mod overrides. Counts include non-playable/reference records. Other shader approximations and missing assets are separate issues.

| Source | Entries using default material variants |
| --- | ---: |
| Starfield.esm | 284 |
| ShatteredSpace.esm | 76 |
| SFBGS050.esm | 23 |
| SFBGS00D.esm | 5 |
| Total | 388 |

977 ARMO and 93 WEAP catalog entries were scanned, with no missing source plugins or malformed templates in this run. Of the 388 affected entries, 386 are ARMO and two are WEAP. There are 1,606 distinct per-item source-material rules; all now produce the expected replacement through the native reader. These counts identify the skipped appearance route, not a count of proven visible mismatches. A source material not present on an item's selected model can make a swap inactive.

The audit also exposed addon defaults replacing a source before the item-level variant ran. Each later swap can now address the original source or current material; entries within one swap are applied as a map, rather than accidentally cascading. Absolute developer export prefixes embedded in shipped swap metadata are normalized to a relative materials path. No file is read from those absolute locations.

## Repeatable checks

With Python 3 and the native PreviewGeometryTests target built:

```text
python scripts/audit-preview-variants.py "GAME_DATA_DIRECTORY" "AUDIT_OUTPUT_DIRECTORY"
PreviewGeometryTests.exe "GAME_DATA_DIRECTORY" --audit-variants "AUDIT_OUTPUT_DIRECTORY/variant-rules.txt" Starfield.esm ShatteredSpace.esm SFBGS050.esm SFBGS00D.esm
```

The tool writes template-audit.json and variant-rules.txt. The checked 1,606-rule baseline is included in tests/fixtures/preview-default-variants.tsv. Native fixtures additionally cover first/default template selection, included OMODs, parent templates, cycles, truncated/untyped properties, unsupported operations and item-over-addon precedence. Existing sex-specific material swaps remain covered.

Lighting, translucency, layered material composition and installed mod changes can still differ from the game. Passing these rules proves material selection for this failure path; it does not certify every preview's complete appearance.
