import type { QuestBrowserEntry } from './quest-browser';
import { runtimeFormId, type PluginLoadOrderReply } from './id-catalog';

export function resolvePackagedQuestCatalog(entries: QuestBrowserEntry[], reply: PluginLoadOrderReply | null): QuestBrowserEntry[] {
  const plugins = new Map((reply?.ok ? reply.plugins ?? [] : []).map((plugin) => [plugin.plugin.toLowerCase(), plugin]));
  return entries.map((entry) => {
    const plugin = plugins.get(entry.plugin.toLowerCase());
    if (!plugin) return { ...entry, available: entry.plugin.toLowerCase() === 'starfield.esm' };
    const value = runtimeFormId(entry.localFormId, plugin.pluginKind, plugin.index);
    return { ...entry, questId: value ?? entry.questId, pluginKind: plugin.pluginKind, available: Boolean(value) };
  });
}
