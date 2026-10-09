# Mod display names

Starfield exposes loaded plugins by filename, such as `darkstar.esm`. A plugin file does not reliably contain the public title used on Nexus Mods or Creations, and the installation folder name belongs to the local mod manager rather than the running game.

Console Command Center therefore uses a case-insensitive filename lookup in `src/views/console.command-center/main/mod-display-names.ts`. Version 1.1.19 includes 828 aliases generated from a broad real-world Starfield load order, with ambiguous high-profile entries reviewed by hand. Examples include:

- `darkstar.esm` → `DarkStar - Total Gameplay Overhaul`
- `Cross Heavy Industries M3.esm` → `Cross Heavy Industries - Model 3 Ship Modules`
- `du_retrograde.esm` → `Dark Universe - Retrograde`
- `kinggathcreations_spaceship.esm` → `Watchtower`

An alias changes only the title shown in the Mod Browser. CCC still displays the raw plugin filename in Selected ID details and includes it in search keywords. If a plugin has no alias, CCC keeps the scanner's cleaned filename-derived name.

## Adding or correcting a name

Add one entry to `MOD_DISPLAY_NAMES` using the complete lowercase plugin filename as the key:

```ts
'exampleplugin.esm': 'Example Mod Title',
```

Keep `.esm`, `.esp`, or `.esl` in the key. Prefer the title published by the mod author. Do not include a version number unless it is part of the permanent mod title. The fallback means missing entries never prevent scanning or browsing.
