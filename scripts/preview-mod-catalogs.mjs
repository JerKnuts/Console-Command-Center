import { existsSync } from 'node:fs';
import { open, readFile, readdir, stat } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';

const PLUGIN_EXTENSIONS = new Set(['.esm', '.esp', '.esl']);
const RECORD_TYPES = new Map([
  ['WEAP', 'Weapons'], ['ARMO', 'Armor'], ['AMMO', 'Ammo'], ['ALCH', 'Aid'],
  ['MISC', 'Resources & Miscellaneous'], ['BOOK', 'Books & Notes'], ['PERK', 'Perks'],
  ['SPEL', 'Powers'], ['NPC_', 'NPCs'], ['OMOD', 'Mods'], ['FACT', 'Factions'],
  ['QUST', 'Quests'], ['CELL', 'Cells'], ['LCTN', 'Locations'],
  ['GBFM', 'Ship Parts & Other Forms'], ['FURN', 'Furniture'], ['WTHR', 'Weather'],
]);
const BUILT_IN_PLUGINS = new Set([
  'starfield.esm', 'blueprintships-starfield.esm', 'oldmars.esm',
  'constellation.esm', 'shatteredspace.esm',
]);
const MAX_RECORDS = 100_000;
const textDecoder = new TextDecoder('windows-1252');

function lower(value) {
  return String(value ?? '').toLowerCase();
}

function signature(buffer, offset = 0) {
  return buffer.toString('ascii', offset, offset + 4);
}

function zString(buffer) {
  const end = buffer.indexOf(0);
  return textDecoder.decode(buffer.subarray(0, end < 0 ? buffer.length : end)).trim();
}

function cleanLine(line) {
  return line.replace(/^\uFEFF/, '').trim();
}

function pluginKind(flags) {
  if ((flags & (1 << 8)) !== 0) return 'small';
  if ((flags & (1 << 10)) !== 0) return 'medium';
  return 'full';
}

function runtimeFormId(plugin, rawFormId) {
  if (plugin.kind === 'small') return (0xFE000000 | ((plugin.index & 0xFFF) << 12) | (rawFormId & 0xFFF)) >>> 0;
  if (plugin.kind === 'medium') return (0xFD000000 | ((plugin.index & 0xFF) << 16) | (rawFormId & 0xFFFF)) >>> 0;
  return (((plugin.index & 0xFF) << 24) | (rawFormId & 0xFFFFFF)) >>> 0;
}

function localFormId(plugin, runtimeId) {
  if (plugin.kind === 'small') return runtimeId & 0xFFF;
  if (plugin.kind === 'medium') return runtimeId & 0xFFFF;
  return runtimeId & 0xFFFFFF;
}

function formId(value) {
  return (value >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

function catalogName(pluginName) {
  return basename(pluginName, extname(pluginName)).replaceAll('_', ' ');
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return {};
  }
}

async function newestProfile(profilesRoot) {
  if (!existsSync(profilesRoot)) return null;
  const candidates = [];
  for (const entry of await readdir(profilesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const profilePath = join(profilesRoot, entry.name);
    const loadOrderPath = join(profilePath, 'loadorder.txt');
    const pluginsPath = join(profilePath, 'plugins.txt');
    const listPath = existsSync(loadOrderPath) ? loadOrderPath : pluginsPath;
    if (!existsSync(listPath)) continue;
    candidates.push({ path: profilePath, modified: (await stat(listPath)).mtimeMs });
  }
  candidates.sort((left, right) => right.modified - left.modified);
  return candidates[0]?.path ?? null;
}

async function configuration(projectRoot) {
  const local = await readJson(join(projectRoot, '.osfui', 'local.json'));
  const modsRoot = resolve(process.env.CCC_MODS_ROOT || local.modsRoot || (process.platform === 'win32' ? 'C:\\GTS\\mods' : 'mods'));
  const profilesRoot = resolve(process.env.CCC_MO2_PROFILES_ROOT || local.profilesRoot || join(dirname(modsRoot), 'profiles'));
  let profilePath = process.env.CCC_MO2_PROFILE || local.profilePath;
  if (profilePath && !existsSync(profilePath)) profilePath = join(profilesRoot, profilePath);
  if (!profilePath) profilePath = await newestProfile(profilesRoot);

  const gameCandidates = [
    process.env.CCC_GAME_DATA_ROOT,
    local.gameDataRoot,
    join(dirname(modsRoot), 'Stock Game', 'Data'),
    'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Starfield\\Data',
    'C:\\XboxGames\\Starfield\\Content\\Data',
  ].filter(Boolean).map((path) => resolve(path));
  const gameDataRoot = gameCandidates.find((path) => existsSync(path)) ?? null;
  if (!existsSync(modsRoot)) throw new Error(`The configured MO2 mods folder does not exist: ${modsRoot}`);
  if (!profilePath || !existsSync(profilePath)) throw new Error(`No MO2 profile with a load order was found under ${profilesRoot}.`);
  return { modsRoot, profilesRoot, profilePath: resolve(profilePath), gameDataRoot };
}

async function readPluginList(profilePath) {
  const loadOrderPath = join(profilePath, 'loadorder.txt');
  const pluginsPath = join(profilePath, 'plugins.txt');
  const path = existsSync(loadOrderPath) ? loadOrderPath : pluginsPath;
  if (!existsSync(path)) throw new Error(`No loadorder.txt or plugins.txt exists in ${profilePath}.`);
  const starredOnly = path === pluginsPath;
  return (await readFile(path, 'utf8')).split(/\r?\n/).flatMap((rawLine) => {
    let line = cleanLine(rawLine);
    if (!line || line.startsWith('#')) return [];
    const starred = line.startsWith('*');
    if (starred) line = cleanLine(line.slice(1));
    const fileName = lower(line);
    if (!PLUGIN_EXTENSIONS.has(extname(fileName))) return [];
    const official = /^sfbgs/i.test(line);
    if (starredOnly && !starred && !BUILT_IN_PLUGINS.has(fileName) && !official) return [];
    return [line];
  });
}

async function activeModDirectories(modsRoot, profilePath) {
  const modListPath = join(profilePath, 'modlist.txt');
  if (!existsSync(modListPath)) {
    return (await readdir(modsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => join(modsRoot, entry.name));
  }
  return (await readFile(modListPath, 'utf8')).split(/\r?\n/).flatMap((rawLine) => {
    const line = cleanLine(rawLine);
    if (!line.startsWith('+')) return [];
    const path = join(modsRoot, cleanLine(line.slice(1)));
    return existsSync(path) ? [path] : [];
  });
}

async function pluginFilesUnder(root, depth = 0) {
  if (depth > 5) return [];
  const results = [];
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) results.push(...await pluginFilesUnder(path, depth + 1));
    else if (entry.isFile() && PLUGIN_EXTENSIONS.has(lower(extname(entry.name)))) results.push(path);
  }
  return results;
}

async function pluginPathIndex(config) {
  const index = new Map();
  const directories = await activeModDirectories(config.modsRoot, config.profilePath);
  const modFiles = await Promise.all(directories.map((directory) => pluginFilesUnder(directory)));
  for (const files of modFiles) {
    for (const path of files) {
      const name = lower(basename(path));
      if (!index.has(name)) index.set(name, path);
    }
  }
  if (config.gameDataRoot) {
    for (const entry of await readdir(config.gameDataRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !PLUGIN_EXTENSIONS.has(lower(extname(entry.name)))) continue;
      const name = lower(entry.name);
      if (!index.has(name)) index.set(name, join(config.gameDataRoot, entry.name));
    }
  }
  return index;
}

function parseSubrecords(data) {
  const fields = [];
  let offset = 0;
  let extendedSize = null;
  while (offset + 6 <= data.length) {
    const type = signature(data, offset);
    const smallSize = data.readUInt16LE(offset + 4);
    offset += 6;
    if (type === 'XXXX') {
      if (smallSize !== 4 || offset + 4 > data.length) break;
      extendedSize = data.readUInt32LE(offset);
      offset += 4;
      continue;
    }
    const size = extendedSize ?? smallSize;
    extendedSize = null;
    if (offset + size > data.length) break;
    fields.push({ type, data: data.subarray(offset, offset + size) });
    offset += size;
  }
  return fields;
}

async function readPluginMetadata(path, name) {
  const file = await open(path, 'r');
  try {
    const header = Buffer.alloc(24);
    await file.read(header, 0, header.length, 0);
    if (signature(header) !== 'TES4') throw new Error('Not a Bethesda plugin file.');
    const headerSize = header.readUInt32LE(4);
    const flags = header.readUInt32LE(8);
    if (headerSize > 16 * 1024 * 1024) throw new Error('Plugin header is too large.');
    const data = Buffer.alloc(headerSize);
    await file.read(data, 0, data.length, 24);
    const masters = parseSubrecords(data).filter((field) => field.type === 'MAST').map((field) => zString(field.data)).filter(Boolean);
    return { name, path, kind: pluginKind(flags), index: 0, headerSize, masters };
  } finally {
    await file.close();
  }
}

let discoveredState = null;

async function discover(projectRoot, refresh = false) {
  if (discoveredState && !refresh) return discoveredState;
  const started = performance.now();
  const config = await configuration(projectRoot);
  const loadOrder = await readPluginList(config.profilePath);
  const paths = await pluginPathIndex(config);
  const plugins = [];
  let missingFiles = 0;
  let fullIndex = 0;
  let mediumIndex = 0;
  let smallIndex = 0;
  for (const name of loadOrder) {
    const path = paths.get(lower(name));
    if (!path) {
      missingFiles += 1;
      continue;
    }
    try {
      const plugin = await readPluginMetadata(path, name);
      if (plugin.kind === 'small') plugin.index = smallIndex++;
      else if (plugin.kind === 'medium') plugin.index = mediumIndex++;
      else plugin.index = fullIndex++;
      plugins.push(plugin);
    } catch {
      missingFiles += 1;
    }
  }
  const kinds = new Map(plugins.map((plugin) => [lower(plugin.name), plugin.kind]));
  discoveredState = { config, loadOrder, plugins, kinds, missingFiles, durationMs: Math.round(performance.now() - started) };
  return discoveredState;
}

function summaryCatalog(plugin) {
  return {
    file: basename(plugin.path), loaded: true, recordsLoaded: false, cached: false,
    name: catalogName(plugin.name), plugin: plugin.name, pluginKind: plugin.kind,
    count: 0, skipped: 0, errors: [], records: [],
  };
}

async function scanPluginRecords(state, plugin) {
  const started = performance.now();
  const file = await open(plugin.path, 'r');
  const records = [];
  let skipped = 0;
  const ownPrefix = plugin.masters.reduce((count, master) => count + (state.kinds.get(lower(master)) === 'full' || !state.kinds.has(lower(master)) ? 1 : 0), 0);
  try {
    const stats = await file.stat();
    const header = Buffer.alloc(24);
    let position = 24 + plugin.headerSize;
    while (position + 24 <= stats.size && records.length < MAX_RECORDS) {
      await file.read(header, 0, header.length, position);
      const type = signature(header);
      const size = header.readUInt32LE(4);
      if (type === 'GRUP') {
        if (size < 24 || position + size > stats.size) break;
        position += 24;
        continue;
      }
      if (position + 24 + size > stats.size) break;
      const category = RECORD_TYPES.get(type);
      const flags = header.readUInt32LE(8);
      const rawFormId = header.readUInt32LE(12);
      if (category && (flags & 0x20) === 0 && (rawFormId >>> 24) === ownPrefix) {
        try {
          const stored = Buffer.alloc(size);
          await file.read(stored, 0, stored.length, position + 24);
          const data = (flags & 0x00040000) !== 0 ? inflateSync(stored.subarray(4)) : stored;
          const fields = parseSubrecords(data);
          const editorId = zString(fields.find((field) => field.type === 'EDID')?.data ?? Buffer.alloc(0));
          const full = fields.find((field) => field.type === 'FULL')?.data;
          const fullName = full && full.length !== 4 ? zString(full) : '';
          const runtimeId = runtimeFormId(plugin, rawFormId);
          const label = fullName || editorId || `${type} ${formId(runtimeId)}`;
          records.push({
            label, value: formId(runtimeId), localFormId: localFormId(plugin, runtimeId).toString(16).toUpperCase(),
            type, category, ...(editorId ? { editorId } : {}),
          });
        } catch {
          skipped += 1;
        }
      }
      position += 24 + size;
    }
  } finally {
    await file.close();
  }
  return {
    ok: true, source: 'preview-plugin-scan', directory: plugin.path, directoryExists: true,
    loadOrderEntries: state.loadOrder.length, pluginFilesOpened: state.plugins.length,
    pluginFilesMissing: state.missingFiles, scannedPlugins: 1, totalRecords: records.length,
    durationMs: Math.round(performance.now() - started),
    catalogs: [{ ...summaryCatalog(plugin), recordsLoaded: true, count: records.length, skipped, records }],
  };
}

async function scanSummaries(projectRoot) {
  const state = await discover(projectRoot, true);
  const plugins = state.plugins.filter((plugin) => !BUILT_IN_PLUGINS.has(lower(plugin.name)));
  return {
    ok: true, source: 'preview-load-order-scan', directory: state.config.profilePath, directoryExists: true,
    summaryOnly: true, loadOrderEntries: state.loadOrder.length, pluginFilesOpened: state.plugins.length,
    pluginFilesMissing: state.missingFiles, scannedPlugins: plugins.length, totalRecords: 0,
    durationMs: state.durationMs, catalogs: plugins.map(summaryCatalog),
  };
}

async function scanRecords(projectRoot, pluginName) {
  const state = await discover(projectRoot);
  const plugin = state.plugins.find((item) => lower(item.name) === lower(pluginName));
  if (!plugin || BUILT_IN_PLUGINS.has(lower(plugin.name))) {
    return { ok: false, error: 'The selected plugin is not active in the preview load order.', directory: state.config.profilePath, totalRecords: 0, catalogs: [] };
  }
  return scanPluginRecords(state, plugin);
}

function sendJson(response, status, value) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(value));
}

export function cccPreviewModCatalogPlugin(projectRoot) {
  return {
    name: 'ccc-preview-mod-catalogs',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (url.pathname !== '/__ccc/mod-catalogs' && url.pathname !== '/__ccc/mod-catalog-records') return next();
        try {
          if (url.pathname === '/__ccc/mod-catalogs') return sendJson(response, 200, await scanSummaries(projectRoot));
          return sendJson(response, 200, await scanRecords(projectRoot, url.searchParams.get('plugin') ?? ''));
        } catch (error) {
          return sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error), totalRecords: 0, catalogs: [] });
        }
      });
    },
  };
}
