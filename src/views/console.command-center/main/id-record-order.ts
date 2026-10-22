import { devFeedbackIdReference } from './dev-feedback.ts';
import { reviewedReferenceNote } from './reviewed-id-findings.ts';
import { ammoReferenceNote } from './ammo-test-findings.ts';
import { armorReferenceNote } from './armor-test-findings.ts';

type OrderedIdRecord = { label: string; type: string; value: string; plugin?: string; localFormId?: string; referenceOnly?: boolean };

export function orderIdEntries<T extends OrderedIdRecord>(entries: T[]): T[] {
  const reference = (entry: T) => devFeedbackIdReference(entry) ?? Boolean(entry.referenceOnly || reviewedReferenceNote(entry) || ammoReferenceNote(entry) || armorReferenceNote(entry));
  return [...entries].sort((a, b) => Number(reference(a)) - Number(reference(b))
    || a.label.localeCompare(b.label) || a.value.localeCompare(b.value)
    || (a.plugin ?? '').localeCompare(b.plugin ?? ''));
}
