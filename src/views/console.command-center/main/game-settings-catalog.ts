export type GameSettingEntry = {
  name: string;
  category: string;
  type: string;
  referenceValue: string | number | boolean | null;
  masterValue: string | number | boolean | null;
  engineValue: string | number | boolean | null;
  formId: string | null;
};

export function gameSettingGroup(entry: GameSettingEntry): string {
  if (entry.category.toUpperCase() !== 'MAIN') return entry.category;
  const name = entry.name.toLowerCase();
  if (/handscanner|scanner/.test(name)) return 'MAIN / Scanner';
  if (/spaceship|shipbuilder|shiptransfer|shipcargo/.test(name)) return 'MAIN / Ships';
  if (/combat|aimmodel|damage|weapon|recoil|vats|critical/.test(name)) return 'MAIN / Combat';
  if (/camera|fov/.test(name)) return 'MAIN / Camera';
  return 'MAIN / Other';
}

export function gameSettingMatches(entry: GameSettingEntry, query: string): boolean {
  const text = [entry.name, entry.category, entry.type, entry.formId ?? '', gameSettingGroup(entry)].join(' ').toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean).every(term => text.includes(term));
}

export function gameSettingInspectCommand(entry: GameSettingEntry): string {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(entry.name)) throw new Error('Invalid game setting name.');
  return `getgs ${entry.name}`;
}
