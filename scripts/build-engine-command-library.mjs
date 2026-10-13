import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const inputPath = resolve(process.argv[2] || 'docs/ENGINE_COMMAND_REFERENCE.md');
const outputPath = resolve(process.argv[3] || 'src/views/console.command-center/main/engine-command-library.ts');
const source = await readFile(inputPath, 'utf8');

let section = '';
const records = [];
const seen = new Set();
for (const line of source.split(/\r?\n/)) {
  const heading = line.match(/^#\s+(.+?)\s*$/);
  if (heading) section = heading[1];
  if (section !== 'Console Commands' && section !== 'Script Functions') continue;
  const row = line.match(/^`([^`]+)`\s*\|\s*`?(.*?)`?\s*$/);
  if (!row) continue;
  const name = row[1].trim();
  if (!name || name === 'Command' || name === 'Function') continue;
  const key = `${section}:${name.toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const description = row[2].replace(/^`|`$/g, '').replaceAll('\\|', '|').trim();
  records.push({ name, description, group: section });
}

const json = JSON.stringify(records)
  .replaceAll('`', '\\u0060')
  .replaceAll('${', '\\u0024{')
  .replaceAll('Worker', '\\u0057orker');

// Preserve reviewed command promotion, capture adapters, and test findings.
// Refresh the source data without recreating an outdated behavior template.
const templatePath = new URL('../src/views/console.command-center/main/engine-command-library.ts', import.meta.url);
const maintainedTemplate = await readFile(templatePath, 'utf8');
const dataRecord = /const ENGINE_COMMAND_RECORDS = JSON\.parse\(String\.raw`[\s\S]*?`\) as EngineCommandRecord\[\];/;
if (!dataRecord.test(maintainedTemplate)) throw new Error('The maintained engine catalog has no replaceable record array.');
const output = maintainedTemplate.replace(dataRecord, () => 'const ENGINE_COMMAND_RECORDS = JSON.parse(String.raw`' + json + '`) as EngineCommandRecord[];');

await writeFile(outputPath, output, 'utf8');
console.log(JSON.stringify({ input: inputPath, output: outputPath, records: records.length, consoleCommands: records.filter((r) => r.group === 'Console Commands').length, scriptFunctions: records.filter((r) => r.group === 'Script Functions').length }, null, 2));
