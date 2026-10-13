// Player-reported in-game inventory tests, 2026-10-12. Match owning master,
// not display names or the mere presence of a Local ID.
const TESTED_AMMO: Readonly<Record<string, string>> = {
  "230558": "Companion-specific ammo.",
  "230559": "Companion-specific ammo.",
  "230679": "Companion-specific ammo.",
  "230680": "Companion-specific ammo.",
  "230687": "Companion-specific ammo.",
  "231408": "Companion-specific ammo.",
  "231568": "Companion-specific ammo.",
  "23155F": "Companion-specific ammo.",
  "231B1B": "Companion-specific ammo.",
  "23055B": "Companion-specific ammo.",
  "23155C": "Companion-specific ammo.",
  "231D31": "Companion-specific ammo.",
  "06497E": "Creature/weapon-effect ammo.",
  "0B0ACE": "Creature/weapon-effect ammo.",
  "0AF713": "Creature/weapon-effect ammo.",
  "0297F4": "Creature/weapon-effect ammo.",
  "0297F5": "Creature/weapon-effect ammo.",
  "0AF714": "Creature/weapon-effect ammo.",
  "0AF715": "Creature/weapon-effect ammo.",
  "06497F": "Creature/weapon-effect ammo.",
  "064980": "Creature/weapon-effect ammo.",
  "0AF70F": "Creature/weapon-effect ammo.",
  "0AF711": "Creature/weapon-effect ammo.",
  "0B0ACF": "Creature/weapon-effect ammo.",
  "18DEC2": "Creature/weapon-effect ammo.",
  "0AF710": "Creature/weapon-effect ammo.",
  "0AF712": "Creature/weapon-effect ammo.",
  "087588": "Creature/weapon-effect ammo.",
  "2F3F22": "Creature/weapon-effect ammo.",
  "2F3F23": "Creature/weapon-effect ammo.",
  "1AD730": "Creature/weapon-effect ammo.",
  "23055A": "Companion-specific ammo.",
  "076EDC": "Creature/weapon-effect ammo.",
  "249FE8": "Creature/weapon-effect ammo.",
  "030B2F": "Creature/weapon-effect ammo.",
  "0B2CCD": "Creature/weapon-effect ammo.",
  "091157": "Creature/weapon-effect ammo.",
  "19B892": "Creature/weapon-effect ammo.",
  "2197C1": "Creature/weapon-effect ammo."
};
type AmmoRecord = { type: string; value: string; plugin?: string; localFormId?: string };
export function ammoReferenceNote(entry: AmmoRecord): string | null {
  if (entry.type.toUpperCase() !== 'AMMO') return null;
  if (entry.plugin && entry.plugin.toLowerCase() !== 'starfield.esm') return null;
  const id = (entry.localFormId ?? entry.value).toUpperCase().slice(-6);
  const reason = TESTED_AMMO[id];
  return reason ? reason + ' In-game testing did not add a visible inventory item. Reference only; Add to Player is disabled.' : null;
}
export function applyAmmoFindings<T extends AmmoRecord & { label: string; detail?: string; referenceOnly?: boolean }>(entry: T): T {
  const note = ammoReferenceNote(entry);
  if (!note) return entry;
  const label = note.startsWith('Companion-specific') && !entry.label.endsWith(' (Companion)') ? entry.label + ' (Companion)' : entry.label;
  const detail = entry.detail?.includes(note) ? entry.detail : [entry.detail, note].filter(Boolean).join(' ');
  return { ...entry, label, detail, referenceOnly: true };
}

export function orderAmmoEntries<T extends AmmoRecord & { label: string; referenceOnly?: boolean }>(entries: T[]): T[] {
  if (!entries.every(entry => entry.type.toUpperCase() === 'AMMO')) return entries;
  const reference = (entry: T) => Boolean(entry.referenceOnly || ammoReferenceNote(entry));
  return [...entries].sort((a, b) => Number(reference(a)) - Number(reference(b))
    || a.label.localeCompare(b.label) || a.value.localeCompare(b.value));
}
