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

export function gameSettingWriteCommand(entry: GameSettingEntry, raw: string | number): string {
  gameSettingInspectCommand(entry);
  const text = String(raw).trim();
  if (entry.type === 'String' || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) throw new Error('Enter a numeric value for this setting.');
  const value = Number(text);
  if (!Number.isFinite(value)) throw new Error('Enter a finite numeric value.');
  if (entry.type === 'Boolean' && value !== 0 && value !== 1) throw new Error('Boolean settings use 0 (Off) or 1 (On).');
  if (entry.type.includes('Integer') && (!Number.isInteger(value) || value < (entry.type === 'Unsigned Integer' ? 0 : -2147483648) || value > (entry.type === 'Unsigned Integer' ? 4294967295 : 2147483647))) throw new Error('Enter a whole number within this setting’s range.');
  return `setgs ${entry.name} ${value}`;
}

// These shipped values are references, never snapshots of the live/modded game.
export function gameSettingResetValue(entry: GameSettingEntry): number | null {
  if (entry.type === 'String') return null;
  const raw = entry.masterValue ?? entry.engineValue ?? entry.referenceValue;
  if (raw === null || String(raw).trim() === '') return null;
  const value = Number(raw);
  try { gameSettingWriteCommand(entry, value); return value; } catch { return null; }
}
