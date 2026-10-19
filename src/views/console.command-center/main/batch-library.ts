export type SampleBatch = { id: string; name: string; previousName?: string; description: string; commands: string; plugin?: string; sourcePrefix?: string };
export type SamplePlugin = { plugin: string; pluginKind: 'full' | 'medium' | 'small'; index: number };

export function prepareSampleCommands(sample: SampleBatch, plugins: SamplePlugin[] = [], content = sample.commands): string {
  if (!sample.plugin || !sample.sourcePrefix) return content;
  const command = /^(\s*player\.(?:additem|placeatme)\s+)([\da-f]{8})(?=\s|$)/gim;
  const supplied = new Set(Array.from(sample.commands.matchAll(command), match => match[2].toUpperCase())
    .filter(id => id.startsWith(sample.sourcePrefix!)));
  const localIds = new Set(Array.from(supplied, id => id.slice(-6)));
  const marked = content.includes('# CCC plugin: ' + sample.plugin) || content.includes('; CCC plugin: ' + sample.plugin);
  const owns = (id: string) => supplied.has(id.toUpperCase()) || (marked && localIds.has(id.toUpperCase().slice(-6)));
  if (!Array.from(content.matchAll(command)).some(match => owns(match[2]))) return content;
  const source = plugins.find(plugin => plugin.plugin.toLowerCase() === sample.plugin!.toLowerCase());
  if (!source || source.pluginKind !== 'full' || !Number.isInteger(source.index) || source.index < 0 || source.index > 0xFC) {
    throw new Error(`Load ${sample.plugin} and reconnect CCC before loading this batch.`);
  }
  return content.replace(command, (match, prefix: string, raw: string) => owns(raw)
    ? prefix + (source.index * 0x1000000 + (parseInt(raw, 16) & 0xFFFFFF)).toString(16).toUpperCase().padStart(8, '0') : match);
}
