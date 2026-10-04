import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args) {
  return new Promise((fulfill, reject) => {
    const child = spawn(command, args, { cwd: projectRoot, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? fulfill() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

const tests = (await readdir(resolve(projectRoot, 'tests')))
  .filter((name) => name.endsWith('.test.mjs'))
  .map((name) => resolve(projectRoot, 'tests', name));

await run(process.execPath, [resolve(projectRoot, 'scripts/check-ui.mjs')]);
await run(process.execPath, ['--test', ...tests]);
await run(process.execPath, [resolve(projectRoot, 'native/build.mjs')]);
await run(process.execPath, [resolve(projectRoot, 'scripts/build-ui.mjs')]);
await run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', resolve(projectRoot, 'scripts/package-mod.ps1')]);
await run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', resolve(projectRoot, 'scripts/package-release.ps1')]);
