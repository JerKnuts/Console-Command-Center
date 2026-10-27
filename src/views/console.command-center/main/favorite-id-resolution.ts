import { runtimeFormId, type IdCatalogEntry, type PluginLoadOrderReply } from './id-catalog';

// A saved runtime ID is only a snapshot. Resolve its owner/local ID again
// before exposing actions, including for entries saved from the Mod Browser.
export function resolveFavoriteIds<T extends IdCatalogEntry>(favorites: T[], catalog: IdCatalogEntry[], reply: PluginLoadOrderReply | null): T[] {
  const identity = (entry: IdCatalogEntry, local: string) => `${(entry.plugin ?? 'Starfield.esm').toLowerCase()}:${entry.type.toUpperCase()}:${local.toUpperCase().replace(/^0+/, '') || '0'}`;
  const records = new Map<string, IdCatalogEntry>();
  for (const entry of catalog) {
    const key = identity(entry, entry.localFormId ?? entry.value.slice(-6));
    if (!records.has(key)) records.set(key, entry);
    for (const id of entry.alternateFormIds ?? []) {
      const alias = identity(entry, id.slice(-6));
      if (!records.has(alias)) records.set(alias, entry);
    }
  }
  const plugins = new Map((reply?.ok ? reply.plugins ?? [] : []).map(plugin => [plugin.plugin.toLowerCase(), plugin]));
  return favorites.map(favorite => {
    const owner=plugins.get((favorite.plugin??'').toLowerCase());
    const savedKind=/^FE/i.test(favorite.value)?'small':/^FD/i.test(favorite.value)?'medium':'full';
    const recoveredLocal=!favorite.localFormId&&owner&&owner.pluginKind===savedKind&&/^[0-9A-F]{8}$/i.test(favorite.value)?favorite.value.slice(-(savedKind==='small'?3:savedKind==='medium'?4:6)):undefined;
    const local=favorite.localFormId??recoveredLocal??favorite.value.slice(-6);
    const isMod=favorite.source==='mod'||('savedFrom' in favorite&&favorite.savedFrom==='mod-browser');
    const metadata = isMod ? undefined : records.get(identity(favorite, local));
    const entry = metadata ? { ...favorite, ...metadata } : { ...favorite,...(isMod?{source:'mod' as const}:{}),...(recoveredLocal?{localFormId:recoveredLocal}:{}) };
    if (!entry.plugin) return isMod?{...entry,available:false}:entry;
    const plugin = plugins.get(entry.plugin.toLowerCase());
    if (!plugin || !entry.localFormId) return { ...entry, available: false };
    const value = runtimeFormId(entry.localFormId, plugin.pluginKind, plugin.index);
    return { ...entry, value: value ?? entry.value, pluginKind: plugin.pluginKind, available: value !== null };
  });
}
