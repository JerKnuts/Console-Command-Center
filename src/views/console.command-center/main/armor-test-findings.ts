type ArmorRecord = { type: string; value: string; plugin?: string; localFormId?: string };
const TESTED_ARMOR = new Set(["203C2C","1676D9","1676D2","1676D7","0A6FE0","0A6FFC","17C68D","362EF5","362EF6","362EF7","0A6FDE","0A6FFE","182A6A","362F0A","362F0B","362F0C","0A6FD7","0A6FFF","165714","0A7007","0A7010","227721","3E957F","3E9580","3E9581","0A6FDF","0A6FFB","227722","362F07","362F08","362F09","1EB731","20A09F","208D95","04B5A0","1676D3"]);
export function armorReferenceNote(entry: ArmorRecord): string | null {
  if (entry.type.toUpperCase() !== 'ARMO' || (entry.plugin && entry.plugin.toLowerCase() !== 'starfield.esm')) return null;
  return TESTED_ARMOR.has((entry.localFormId ?? entry.value).toUpperCase().slice(-6)) ? 'In-game testing did not add a usable player item. Creature skin/child/crowd record; reference only. Add to Player is disabled.' : null;
}
export function applyArmorFindings<T extends ArmorRecord & { detail?: string; referenceOnly?: boolean }>(entry: T): T {
  const note = armorReferenceNote(entry);
  if (!note) return entry;
  const detail = entry.detail?.includes(note) ? entry.detail : [entry.detail, note].filter(Boolean).join(' ');
  return { ...entry, detail, referenceOnly: true };
}
