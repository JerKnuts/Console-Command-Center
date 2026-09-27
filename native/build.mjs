import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const env = { ...process.env };
delete env.XSE_SF_MODS_PATH;
delete env.XSE_SF_GAME_PATH;

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { env, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolveRun();
      else reject(new Error(`${command} exited with code ${code ?? 'unknown'}.`));
    });
  });
}

try {
  await run(process.execPath, [resolve(projectRoot, 'native', 'setup-deps.mjs')]);
  await run('xmake', ['build', '-P', projectRoot]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
