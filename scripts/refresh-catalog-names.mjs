import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Update labels only: preserve reviewed categories, actions, IDs and omissions.
export function refreshCatalogNames(entries, dataset, plugin) {
  if (dataset.localizationPlugin?.toLowerCase() !== plugin.toLowerCase()) throw new Error('Names must come from this plugin’s own STRINGS table.');
  const names = new Map(dataset.records.filter(record => record.ownerPlugin?.toLowerCase() === plugin.toLowerCase() && record.name?.trim())
    .map(record => [`${record.formID.slice(-6).toUpperCase()}:${record.type}`, record.name.trim()]));
  const changes = [];
  const updated = entries.map(entry => {
    if (entry.plugin?.toLowerCase() !== plugin.toLowerCase()) return entry;
    const name = names.get(`${entry.localFormId.toUpperCase()}:${entry.type}`);
    if (!name || name === entry.label) return entry;
    changes.push({ plugin, localFormId: entry.localFormId, type: entry.type, before: entry.label, after: name });
    return { ...entry, label: name };
  });
  return { entries: updated, changes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [catalogPath, datasetPath, plugin, auditPath] = process.argv.slice(2);
  if (!catalogPath || !datasetPath || !plugin || !auditPath) throw new Error('Pass catalog, extracted records, plugin and audit JSON paths.');
  const source = await readFile(catalogPath, 'utf8');
  const pattern = /JSON\.parse\(String\.raw`([\s\S]*?)`\)/;
  const match = source.match(pattern);
  if (!match) throw new Error('Catalog JSON not found.');
  const result = refreshCatalogNames(JSON.parse(match[1]), JSON.parse(await readFile(datasetPath, 'utf8')), plugin);
  const payload = JSON.stringify(result.entries).replaceAll('`', '\\u0060').replaceAll('${', '\\u0024{').replaceAll('Worker', '\\u0057orker');
  await writeFile(catalogPath, source.replace(pattern, () => 'JSON.parse(String.raw`' + payload + '`)'), 'utf8');
  await writeFile(auditPath, JSON.stringify(result.changes, null, 2), 'utf8');
  console.log(`${plugin}: corrected ${result.changes.length} names; preserved ${result.entries.length} records and all non-label fields.`);
}
