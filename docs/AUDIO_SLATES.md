# Books and slates

The ID Browser combines books, notes, text slates and image slates under Books / Notes. Audio Slates remain separate. Classification uses BOOK slate type and authored inventory/world model data rather than item names. Inventory art takes priority over the placed-world model for previews. Books and all slate types have a small still preview only, without a full Model Viewer button. Flat reading models stand upright and the preview uses a slight viewing angle.

Select an Audio Slate and choose Listen. The play triangle starts its recorded dialogue inside CCC. The square, themed controls provide pause/resume, seeking within the current line, volume/mute and a direct 0.5×–2× speed selector. Speed remains selected when playback advances to another line. There is no separate Play Recording button, native media menu or download control.

The transcript scrolls as each recorded dialogue line starts. The current line is highlighted, the preceding line is faint, and upcoming lines fade below it. Select a transcript line to jump directly to it. Timing follows the actual per-line audio files; no word-level timestamps are inferred. Closing the reading dialog stops playback. The game can stay paused and CCC stays open. Playback does not add the item, start quest scenes, or grant rewards.

Recordings are read from the installed game/mod assets, converted to Ogg in memory, and discarded when the player closes. No game audio is bundled or cached to disk. Chunked replies bind every range to the selected record and line. Transfers are limited to 8 MiB per WEM; individual lines are limited to five minutes and bounded decoded size. Unknown encodings, absent voice files and ambiguous speaker variants report unavailable rather than playing a different asset.

The official catalog contains 187 audio slates. An installed-assets audit resolved every referenced voice file for 185; one Shattered Space recording references absent voice files, and one Terran Armada recording has an absent sound-effects line among otherwise available speech. Missing lines report unavailable; another line can be selected. Scene branches and quest conditions are not executed; the player presents the authored recorded lines. Image slate category support does not yet decode embedded image layouts. Videos are excluded.

Developer metadata refresh: run `scripts/extract-book-media.py` against the installed game Data directory and write `src/views/console.command-center/main/book-records.json`. This extracts record identities and model paths only, not audio or model binaries.

## Controller playback

The listening window starts on Play. Press A to play/pause, Left from Play to focus Volume, and Up/Down while on an audio slider to adjust it. Right from Volume returns to Play. The right stick scrolls the transcript regardless of which playback control is focused. B closes the listening window only, including a held B press; Escape does the same. The existing hold-B shortcut outside this dialog is unchanged.
