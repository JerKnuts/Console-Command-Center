import type { IdCatalogEntry, PluginLoadOrderReply } from './id-catalog';
import { resolveFavoriteIds } from './favorite-id-resolution';

// Store an explicit record identity with the action, never infer one from raw
// command text or the selection that happens to be active when it completes.
export type ActivityItem = Pick<IdCatalogEntry,
  'label' | 'value' | 'type' | 'category' | 'plugin' | 'localFormId' |
  'source' | 'sourceName' | 'detail' | 'editorId' | 'action' | 'referenceOnly'>;

export function readActivityItem(value: unknown): ActivityItem | undefined {
  if (!value || typeof value !== 'object') return;
  const item = value as Record<string, unknown>;
  if (typeof item.label !== 'string' || !item.label.trim() || item.label.length > 512
    || typeof item.value !== 'string' || !/^[\dA-F]{8}$/i.test(item.value)
    || typeof item.type !== 'string' || !/^[A-Z_]{4}$/i.test(item.type)
    || typeof item.category !== 'string' || item.category.length > 128
    || typeof item.plugin !== 'string' || !/^[^\\/:<>"\x00-\x1f]{1,240}\.(esm|esp|esl)$/i.test(item.plugin)
    || typeof item.localFormId !== 'string' || !/^[\dA-F]{1,6}$/i.test(item.localFormId)) return;
  const result: ActivityItem = {
    label: item.label, value: item.value.toUpperCase(), type: item.type.toUpperCase(),
    category: item.category, plugin: item.plugin, localFormId: item.localFormId.toUpperCase(),
  };
  if (['built-in', 'Base Game', 'Shattered Space', 'Free Lanes', 'Terran Armada', 'mod'].includes(String(item.source))) result.source = item.source as IdCatalogEntry['source'];
  for (const field of ['sourceName', 'detail', 'editorId'] as const) {
    if (typeof item[field] === 'string' && item[field].length <= 4096) result[field] = item[field];
  }
  if (['additem', 'addperk', 'addspell', 'spawn', 'forceweather', 'teleport'].includes(String(item.action))) result.action = item.action as IdCatalogEntry['action'];
  if (typeof item.referenceOnly === 'boolean') result.referenceOnly = item.referenceOnly;
  return result;
}

export function activityItemFromRecord(entry: IdCatalogEntry): ActivityItem | undefined {
  const plugin = entry.plugin ?? (entry.source === 'mod' ? undefined : 'Starfield.esm');
  const localFormId = entry.localFormId ?? (plugin?.toLowerCase() === 'starfield.esm' && /^00[\dA-F]{6}$/i.test(entry.value) ? entry.value.slice(2) : undefined);
  return readActivityItem({ ...entry, plugin, localFormId, editorId: entry.editorId ?? (entry.type === 'CELL' ? entry.keywords?.[0] : undefined) });
}

export function activityItemIsTeleport(item: ActivityItem | undefined): boolean {
  return item?.type === 'CELL' && typeof item.editorId === 'string' && /^[A-Za-z0-9_]+$/.test(item.editorId);
}

export function sameActivityItem(left: IdCatalogEntry | null, right: IdCatalogEntry): boolean {
  const a = left && activityItemFromRecord(left), b = activityItemFromRecord(right);
  return Boolean(a && b && a.plugin!.toLowerCase() === b.plugin!.toLowerCase()
    && a.type === b.type && parseInt(a.localFormId!, 16) === parseInt(b.localFormId!, 16));
}

export function resolveActivityItem(item: ActivityItem, catalog: IdCatalogEntry[], reply: PluginLoadOrderReply | null): IdCatalogEntry {
  const current = catalog.find(entry => sameActivityItem(entry, item));
  // Prefer current catalog restrictions/details. A missing owner still opens
  // its saved information, but cannot request models or perform ID actions.
  return resolveFavoriteIds([current ?? item], catalog, reply)[0];
}
