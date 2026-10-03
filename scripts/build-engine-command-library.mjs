import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const inputPath = resolve(process.argv[2] || 'StarfieldSFSECompleteConsoleCommands.md');
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

const output = `import type { CommandDefinition } from './commands';

type EngineCommandRecord = {
  name: string;
  description: string;
  group: 'Console Commands' | 'Script Functions';
};

const ENGINE_COMMAND_RECORDS = JSON.parse(String.raw\`${json}\`) as EngineCommandRecord[];
const severeCommand = /(?:crash|delete|destroy|kill|remove|reset|forceclose|hotload|quit|exit|unrevert|upload|hang|assert|completeall|startall|damage|setqueststage|markfordelete)/i;

function commandName(label: string): string {
  return label.replace(/\\s*\\([^)]*\\)\\s*$/, '').replace(/\\s*\\(\\)\\s*$/, '').trim().split(/\\s+/)[0];
}

function commandId(label: string, index: number): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 54) || 'command';
  return \`engine-\${slug}-\${index + 1}\`;
}

const PROMOTED_ENGINE_COMMANDS = new Set([
  'picknextactor',
  'picknextref',
  'pickrefbyid',
  'show1stperson',
  'toggleanimations',
  'togglegamepause',
  'togglehandsculled',
  'usenearestteleportdoor',
]);

export const ENGINE_COMMAND_LIBRARY_TOTAL = ENGINE_COMMAND_RECORDS.filter((record) => !PROMOTED_ENGINE_COMMANDS.has(commandName(record.name).toLowerCase())).length;

export const ENGINE_COMMAND_LIBRARY: CommandDefinition[] = ENGINE_COMMAND_RECORDS
  .filter((record) => !PROMOTED_ENGINE_COMMANDS.has(commandName(record.name).toLowerCase()))
  .map((record, index) => {
  const name = commandName(record.name);
  const scriptFunction = record.group === 'Script Functions';
  const danger = severeCommand.test(\`\${record.name} \${record.description}\`);
  const requiresCredentials = /^LinkFullAccount$/i.test(name);
  const knownCrashReasons: Record<string, string> = {
    reloadcurrentclimate: 'In-game v1.0 testing on Starfield 1.16.244 caused an access violation in sky and weather processing.',
    toggledecalrendering: 'In-game v1.0.6 testing on Starfield 1.16.244 caused an access violation in the DX12 render graph and sky-occlusion render passes.',
  };
  const knownCrashReason = knownCrashReasons[name.toLowerCase()];
  const failedInGameReasons: Record<string, string> = {
    togglewireframe: 'In-game v0.3.11 testing produced no visible wireframe effect.',
    togglecollisiongeometry: 'In-game v0.3.11 testing produced no visible collision-geometry overlay.',
    setcamerafov: 'In-game v0.3.11 testing at 90 and 75 degrees produced no visible field-of-view change.',
    showsubtitle: 'In-game v0.3.11 testing produced no visible subtitle override.',
  };
  const failedInGameReason = failedInGameReasons[name.toLowerCase()];
  const effectUnconfirmedReasons: Record<string, string> = {
    printmessage: 'In-game v1.0.7 testing with visible-message arguments executed without an error but displayed no message.',
    showlightbounds: 'In-game v1.0.6 testing executed without an error but showed no visible light-bound overlay.',
    toggleboundvisgeom: 'In-game v1.0.7 testing executed without an error but showed no visible bound-geometry overlay.',
    toggleborders: 'In-game v1.0.5 testing executed without an error but showed no visible cell borders.',
    toggledebugtext: 'In-game v1.0.6 testing executed without an error but showed no visible debug text.',
    toggledetectionstats: 'In-game v1.0.7 testing executed without an error but showed no visible detection statistics.',
    togglefullscreenmotionblur: 'In-game v1.0.7 testing executed without an error but produced no confirmed visible change.',
    togglelitebrite: 'In-game v1.0.6 testing executed without an error but showed no visible lighting change.',
    togglematerialgeometry: 'In-game v1.0.5 testing executed without an error but showed no visible material-geometry overlay.',
    togglemovement: 'In-game v1.0.7 testing executed without an error, but nearby NPCs continued walking normally.',
    togglenavmesh: 'In-game v1.0.6 testing executed without an error but showed no visible navigation mesh.',
    togglenavmeshinfo: 'In-game v1.0.6 testing executed without an error but showed no visible navigation information.',
    togglepathline: 'In-game v1.0.6 testing executed without an error but showed no visible path line.',
    toggleprimitives: 'In-game v1.0.6 testing executed without an error but showed no visible primitive overlay.',
    togglevolumegeometry: 'In-game v1.0.5 testing executed without an error but showed no visible volume-geometry overlay.',
  };
  const effectUnconfirmedReason = effectUnconfirmedReasons[name.toLowerCase()];
  return {
    id: commandId(record.name, index),
    title: record.name,
    category: 'Untested',
    intakeGroup: effectUnconfirmedReason
      ? 'Executed — Effect Unconfirmed'
      : record.group === 'Console Commands' ? 'Engine Console Commands' : 'Script Functions',
    description: effectUnconfirmedReason
      ? \`\${record.description || 'No description was included in the engine command reference.'} \${effectUnconfirmedReason}\`
      : record.description || 'No description was included in the engine command reference.',
    command: scriptFunction ? \`{target}\${name} {arguments}\` : \`\${name} {arguments}\`,
    inputs: [
      ...(scriptFunction ? [{
        key: 'target',
        label: 'Optional Target / Prefix',
        type: 'text' as const,
        optional: true,
        placeholder: 'player. or 00000014.',
        pattern: '^[A-Za-z0-9_.]{0,32}$',
        hint: 'Leave empty to use the current/default target.',
      }] : []),
      {
        key: 'arguments',
        label: 'Optional Arguments',
        type: 'text' as const,
        optional: true,
        placeholder: 'Enter arguments only when required',
        pattern: '^[^\\r\\n]{0,512}$',
        hint: 'The engine reference does not fully define every parameter. Review the command before running it.',
      },
    ],
    tags: [name, record.name, record.group, 'engine command', 'developer'],
    warning: knownCrashReason
      ? knownCrashReason
      : failedInGameReason
      ? \`\${failedInGameReason} This raw duplicate remains available for advanced testing. Run it only on a disposable save.\`
      : danger
      ? 'This unverified engine function may destroy state, terminate or stall the game, alter files, or make irreversible changes. Use only on a disposable save and review the final command carefully.'
      : 'This engine function has not been verified through CCC and may require undocumented arguments or developer context. Use a disposable save.',
    risk: danger || knownCrashReason ? 'danger' : 'caution',
    testStatus: knownCrashReason ? 'failed' : effectUnconfirmedReason ? 'inconclusive' : 'untested',
    unavailableReason: knownCrashReason
      ? \`Disabled after testing crashed Starfield 1.16.244. \${knownCrashReason}\`
      : requiresCredentials
      ? 'Reference only. CCC does not run this command because account credentials would be saved in command history and the Activity Log.'
      : undefined,
  };
});
`;

await writeFile(outputPath, output, 'utf8');
console.log(JSON.stringify({ input: inputPath, output: outputPath, records: records.length, consoleCommands: records.filter((r) => r.group === 'Console Commands').length, scriptFunctions: records.filter((r) => r.group === 'Script Functions').length }, null, 2));
