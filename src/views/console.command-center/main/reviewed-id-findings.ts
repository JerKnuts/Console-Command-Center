type ReviewedRecord = { value: string; plugin?: string; localFormId?: string };
const REVIEWED_NAMES: Record<string, { label: string; original: string }> = {
  "sfbgs050.esm:0AAE82": {
    "label": "Robotics Research Outfit",
    "original": "Clothes Doctor Roboticist"
  },
  "sfbgs00d.esm:0872D8": {
    "label": "Dark Fashionable Suit",
    "original": "Clothes Fashionable Suit Rishi Saint"
  },
  "sfbgs00d.esm:0897D1": {
    "label": "Party Fashionable Suit",
    "original": "Clothes Fashionable Suit Sawyer Brooks"
  },
  "shatteredspace.esm:0847CA": {
    "label": "House Dul'kehf Shielded Lab Outfit",
    "original": "Clothes House Dulkehf Lab"
  },
  "shatteredspace.esm:0847CB": {
    "label": "House Dul'kehf Lab Outfit",
    "original": "Clothes House Dulkehf Lab No Shield"
  },
  "shatteredspace.esm:0847D0": {
    "label": "House Ka'dic Shielded Lab Outfit",
    "original": "Clothes House Kadic Lab"
  },
  "shatteredspace.esm:0847D1": {
    "label": "House Ka'dic Lab Outfit",
    "original": "Clothes House Kadic Lab No Shield"
  },
  "shatteredspace.esm:0847CD": {
    "label": "House Veth'aal Shielded Lab Outfit",
    "original": "Clothes House Vethaal Lab"
  },
  "shatteredspace.esm:0847CE": {
    "label": "House Veth'aal Lab Outfit",
    "original": "Clothes House Vethaal Lab No Shield"
  },
  "shatteredspace.esm:044D9C": {
    "label": "Va'ruun Maskwear",
    "original": "Clothes Neon Gang Strikers 01 Varuun"
  },
  "shatteredspace.esm:08295F": {
    "label": "Va'ruun Streetwear",
    "original": "Clothes Neon Gang Strikers No Headgear 01 Varuun"
  },
  "sfbgs00d.esm:088B6E": {
    "label": "UC Security Uniform",
    "original": "Clothes New Babylon Police"
  },
  "shatteredspace.esm:0EE4C5": {
    "label": "Va'ruun Shielded Lab Outfit",
    "original": "Clothes Science Lab Tec"
  },
  "shatteredspace.esm:0EE4C3": {
    "label": "Va'ruun Lab Outfit",
    "original": "Clothes Science Lab Tec No Shield"
  },
  "shatteredspace.esm:07ED77": {
    "label": "Va'ruun Scrubs",
    "original": "Clothes Scrubs Varuun"
  },
  "shatteredspace.esm:0C94CC": {
    "label": "Va'ruun Guard Uniform",
    "original": "Clothes Security Guard 01 Varuun"
  },
  "shatteredspace.esm:0C94CB": {
    "label": "Va'ruun Guard Helmet",
    "original": "Clothes Security Guard Helmet 01 Varuun"
  },
  "shatteredspace.esm:0C94CA": {
    "label": "Va'ruun Guard Elite Helmet",
    "original": "Clothes Security Guard Helmet 01 Varuun Elite"
  },
  "sfbgs050.esm:0A9355": {
    "label": "Crew Admiral Outfit",
    "original": "Clothes Ship Crew Admiral"
  },
  "sfbgs050.esm:093518": {
    "label": "Crew Marine Outfit",
    "original": "Clothes Ship Crew Marine"
  },
  "sfbgs050.esm:093519": {
    "label": "Crew Marine Helmet",
    "original": "Clothes Ship Crew Marine Helmet"
  },
  "sfbgs050.esm:07C09E": {
    "label": "Crew Officer Outfit",
    "original": "Clothes Ship Crew Officer"
  },
  "sfbgs050.esm:07E666": {
    "label": "Crewman Outfit",
    "original": "Clothes Ship Crewman"
  },
  "starfield.esm:3E3D51": {
    "label": "Freestar Ambassador Suit",
    "original": "Ambassador Suit"
  },
  "starfield.esm:1C0F34": {
    "label": "Bounty Hunter Seek Pack",
    "original": "Bounty Hunter Seek"
  }
};
const RECENT_TESTED = new Set(["starfield.esm:12B4B3","starfield.esm:227720","starfield.esm:1E426E","starfield.esm:227669","starfield.esm:3E3D51","starfield.esm:22766A","starfield.esm:1341E4","starfield.esm:1C8E09","starfield.esm:24529E","starfield.esm:21BBEC","starfield.esm:1C84DB","starfield.esm:3D66F8","starfield.esm:3D66F9","starfield.esm:3FDBF7","starfield.esm:01D1DB","starfield.esm:1C8E07","starfield.esm:24529F","starfield.esm:19219C","starfield.esm:3E8E7F","starfield.esm:1466EE","starfield.esm:1466F2","starfield.esm:1466F6","starfield.esm:1466EA","starfield.esm:1466FA","starfield.esm:246B32","starfield.esm:246B30","starfield.esm:077814","starfield.esm:3A264E","starfield.esm:29E174","starfield.esm:1B52FF","starfield.esm:2619F1","starfield.esm:077810","starfield.esm:1C0F34"]);
const OUTFIT_ALIASES: Record<string, string[]> = { "1341E4": ["1C8E09"], "01D1DB": ["1C8E07"] };
export function reviewedDuplicate(record: ReviewedRecord): boolean {
  return (record.plugin ?? 'Starfield.esm').toLowerCase() === 'starfield.esm' && Object.values(OUTFIT_ALIASES).some(ids => ids.includes((record.localFormId ?? record.value).toUpperCase().slice(-6)));
}
const REFERENCE_ONLY = new Set([
  "starfield.esm:25021C",
  "starfield.esm:30875A",
  "starfield.esm:102F72",
  "starfield.esm:102F47",
  "starfield.esm:102F71",
  "starfield.esm:1F3A3B",
  "starfield.esm:1EEEBE",
  "starfield.esm:20AE0C",
  "starfield.esm:21E37D",
  "starfield.esm:1466EB",
  "starfield.esm:235C29",
  "starfield.esm:0A6FDD",
  "starfield.esm:0A7013",
  "starfield.esm:227723",
  "starfield.esm:1F36C9",
  "starfield.esm:1345CF",
  "starfield.esm:16D3CA",
  "starfield.esm:1676DD",
  "starfield.esm:1676D5",
  "starfield.esm:1676D1",
  "starfield.esm:299835",
  "starfield.esm:1E0540",
  "starfield.esm:299836",
  "starfield.esm:0D4893",
  "starfield.esm:1F0878",
  "shatteredspace.esm:0CD168",
  "shatteredspace.esm:0CD167",
  "shatteredspace.esm:0CD169",
  "starfield.esm:206670",
  "starfield.esm:0A6FF8",
  "starfield.esm:0A700F",
  "starfield.esm:26F2A1",
  "starfield.esm:104631",
  "starfield.esm:104632",
  "starfield.esm:22669F",
  "starfield.esm:1D3B9C",
  "starfield.esm:2062C5",
  "starfield.esm:1F3A38",
  "starfield.esm:1FC86F",
  "starfield.esm:025F67",
  "starfield.esm:04A986",
  "starfield.esm:04A987",
  "starfield.esm:1FBDED",
  "starfield.esm:261644",
  "starfield.esm:31133D",
  "starfield.esm:31133E",
  "starfield.esm:311340",
  "starfield.esm:31133F",
  "starfield.esm:311342",
  "starfield.esm:311343",
  "starfield.esm:31135B",
  "starfield.esm:311370",
  "starfield.esm:311378",
  "starfield.esm:31138A",
  "starfield.esm:31138B",
  "starfield.esm:31138C",
  "starfield.esm:31144C",
  "starfield.esm:31144D",
  "starfield.esm:31144E",
  "starfield.esm:31144F",
  "starfield.esm:311454",
  "starfield.esm:3115D9",
  "starfield.esm:0F51BA",
  "starfield.esm:102E2E",
  "starfield.esm:102E39",
  "starfield.esm:102E15"
]);
function key(record: ReviewedRecord): string { return (record.plugin ?? 'Starfield.esm').toLowerCase() + ':' + (record.localFormId ?? record.value).toUpperCase().slice(-6); }
export function reviewedWasTested(record: ReviewedRecord): boolean {
  return RECENT_TESTED.has(key(record)) || REFERENCE_ONLY.has(key(record)) || Boolean(REVIEWED_NAMES[key(record)]) || key(record) === 'starfield.esm:03B423';
}
export function reviewedReferenceNote(record: ReviewedRecord): string | null {
  return REFERENCE_ONLY.has(key(record)) ? 'Player testing found no visible inventory item. Reference only; Add to Player is disabled.' : null;
}
export function applyReviewedFindings<T extends ReviewedRecord & { label: string; detail?: string; referenceOnly?: boolean; originalName?: string; keywords?: string[]; alternateFormIds?: string[] }>(record: T): T {
  if ((record.plugin ?? 'Starfield.esm').toLowerCase() === 'starfield.esm') {
    const local = (record.localFormId ?? record.value).toUpperCase().slice(-6);
    const aliases = OUTFIT_ALIASES[local];
    if (aliases) record = { ...record, alternateFormIds: aliases.map(id => '00' + id), keywords: [...new Set([...(record.keywords ?? []), ...aliases, ...aliases.map(id => '00' + id)])] };
  }
  const name = REVIEWED_NAMES[key(record)];
  if (name) record = { ...record, label: name.label, originalName: name.original, keywords: [...new Set([...(record.keywords ?? []), name.original])] };
  const note = reviewedReferenceNote(record);
  if (note) return { ...record, referenceOnly: true, detail: record.detail?.includes(note) ? record.detail : [record.detail, note].filter(Boolean).join(' ') };
  if (key(record) === 'starfield.esm:03B423') return { ...record, label: 'Cydonia Pack', detail: 'Player testing confirmed this is a Cydonia pack and adds to inventory.' };
  return record;
}
