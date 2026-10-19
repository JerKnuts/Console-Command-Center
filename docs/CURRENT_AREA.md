# Identify Current Area

In Dev Mode, cell rows have **Identify Current Area** immediately after Working. This includes ID Browser, Mod Browser and Favorites.

1. Travel to the cell you want to identify, then select that same cell in CCC.
2. Select Identify Current Area. CCC reads the player's current cell, current location, up to eight parent locations, and worldspace from the game thread.
3. Review the evidence and proposed name. Accept Name Change saves the name locally and queues a **Name Change Accepted** feedback entry. Decline, Escape, or closing without acceptance makes no change.
4. Use **Export Reports** to write queued accepted changes into the existing feedback report file workflow. The report includes the old and accepted names, plugin/local identity, name source, and sampled area IDs/names.

The selected runtime cell ID must equal the player's current cell ID. If it differs, no acceptance is allowed. Teleporting or walking can move the player into another exterior grid cell, so check the evidence. No loaded save, a missing native plugin or a missing display name produces an explanation rather than a guessed name.

A named current location is preferred; a named parent is identified as such. A current cell display name is the next fallback. If only the worldspace is named, the proposed label retains the cell Editor ID (for example Dazra — AHPOI01Ext). Locations may describe a wider area, not an exact map landmark; acceptance is the user's review.

Accepted names are local CCC aliases under plugin/local-ID identity. They survive export and reload, keep the original name searchable, and apply to Favorites. They do not rename game records, change saves, change teleport Editor IDs, alter Reference Only classifications, or mark the item Working. A different alias can be accepted after identifying the cell again. No automatic rename occurs.
