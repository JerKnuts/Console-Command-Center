import type { IdCatalogEntry } from './id-catalog';
import { modDisplayName } from './mod-display-names.ts';

export type ModCatalogSummary = {
  key: string;
  name: string;
  plugin: string;
  pluginKind: 'full' | 'medium' | 'small';
  file: string;
  entries: IdCatalogEntry[];
  recordsLoaded: boolean;
  reportedCount: number;
  cached: boolean;
  skipped: number;
  errors: string[];
  officialCreation: boolean;
};

export type ModCatalogReply = {
  ok: boolean;
  error?: string;
  directory: string;
  directoryExists?: boolean;
  source?: string;
  summaryOnly?: boolean;
  fromCache?: boolean;
  loadedFilesSeen?: number;
  loadOrderEntries?: number;
  pluginFilesOpened?: number;
  pluginFilesMissing?: number;
  scannedPlugins?: number;
  durationMs?: number;
  totalRecords: number;
  catalogs: Array<{
    file: string;
    loaded: boolean;
    recordsLoaded?: boolean;
    cached?: boolean;
    name?: string;
    plugin?: string;
    pluginKind?: string;
    count?: number;
    skipped?: number;
    errors?: string[];
    records?: Array<{
      label: string;
      value: string;
      localFormId: string;
      type: string;
      category: string;
      detail?: string;
      editorId?: string;
    }>;
  }>;
};

export function modRecordCategory(record: { type: string; category: string; label: string; editorId?: string }): string {
  if (record.type.toUpperCase() !== 'GBFM') return record.category;
  const editorId = (record.editorId ?? '').toLowerCase();
  const partTokens = ['engine', 'gravdrive', 'grav_drive', 'reactor', 'shield', 'fueltank', 'fuel_tank', 'lander',
    'weapon', 'cockpit', 'docker', 'cargo', 'hab', 'landingbay', 'landing_bay', 'landinggear', 'landing_gear',
    'structural', 'ship_part', 'shipmodule'];
  const isSupportingRecord = editorId.includes('shiptemplate') || editorId.includes('ship_template') ||
    editorId.includes('shipblueprint') || editorId.includes('ship_blueprint') ||
    partTokens.some((token) => editorId.includes(token));
  const isCompleteShip = !isSupportingRecord && (editorId.includes('spaceship') || /(^|_)ship_/.test(editorId));
  return isCompleteShip ? 'Ships' : 'Ship Parts & Other Forms';
}

export function normalizeModCatalogs(reply: ModCatalogReply): ModCatalogSummary[] {
  if (!reply?.ok || !Array.isArray(reply.catalogs)) return [];
  return reply.catalogs.flatMap((catalog) => {
    if (!catalog.loaded || !catalog.plugin || !catalog.name || !Array.isArray(catalog.records)) return [];
    const pluginKind = catalog.pluginKind === 'medium' || catalog.pluginKind === 'small' ? catalog.pluginKind : 'full';
    const key = `mod:${catalog.plugin.toLowerCase()}`;
    const displayName = modDisplayName(catalog.plugin, catalog.name);
    const officialCreation = /^sfbgs[0-9a-f]+(?:[._-]|$)/i.test(catalog.plugin);
    const entries = catalog.records.map((record): IdCatalogEntry => ({
      label: record.label,
      value: record.value,
      type: record.type.toUpperCase(),
      category: modRecordCategory(record),
      detail: record.detail,
      editorId: record.editorId,
      keywords: [...new Set([displayName, catalog.name!, catalog.plugin!, record.localFormId, record.editorId ?? ''].filter(Boolean))],
      source: 'mod',
      sourceName: displayName,
      plugin: catalog.plugin,
      localFormId: record.localFormId,
    }));
    return [{
      key,
      name: displayName,
      plugin: catalog.plugin,
      pluginKind,
      file: catalog.file,
      entries,
      recordsLoaded: catalog.recordsLoaded !== false,
      reportedCount: Number(catalog.count) || entries.length,
      cached: catalog.cached === true,
      skipped: Number(catalog.skipped) || 0,
      errors: Array.isArray(catalog.errors) ? catalog.errors.filter((item): item is string => typeof item === 'string') : [],
      officialCreation,
    }];
  });
}
