import { cp, mkdir, rm, watch } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, 'src/views/console.command-center/main');
const distView = resolve(projectRoot, 'dist/SFSE/Plugins/OSF/UI/views/console.command-center/main');
const modView = resolve(projectRoot, 'mod/SFSE/Plugins/OSF/UI/views/console.command-center/main');
const cli = resolve(projectRoot, 'node_modules/@osfui/cli/src/cli.mjs');

function run(command, args) {
  return new Promise((fulfill, reject) => {
    const child = spawn(command, args, { cwd: projectRoot, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? fulfill() : reject(new Error(`${command} exited with code ${code ?? 'unknown'}`)));
  });
}

async function buildAndDeploy() {
  await run(process.execPath, [resolve(projectRoot, 'scripts/build-ui.mjs')]);
  await rm(modView, { recursive: true, force: true });
  await mkdir(dirname(modView), { recursive: true });
  await cp(distView, modView, { recursive: true });
  console.log(`[ccc] Browser-ready UI deployed to ${modView}`);
}

await buildAndDeploy();

const previewArgs = [cli, 'dev'];
if (process.env.CCC_DEV_NO_OPEN === '1') previewArgs.push('--open', 'false');
const preview = spawn(process.execPath, previewArgs, { cwd: projectRoot, stdio: 'inherit' });
preview.once('error', (error) => {
  console.error(`[ccc] Could not start browser preview: ${error.message}`);
  process.exitCode = 1;
});

let building = false;
let pending = false;
let timer;
async function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    await buildAndDeploy();
  } catch (error) {
    console.error(`[ccc] Preview deployment failed: ${error instanceof Error ? error.message : error}`);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      void rebuild();
    }
  }
}

const watcher = watch(sourceRoot, { recursive: true });
(async () => {
  for await (const event of watcher) {
    if (!event.filename || !/\.(?:css|html|ts)$/.test(event.filename)) continue;
    clearTimeout(timer);
    timer = setTimeout(() => void rebuild(), 300);
  }
})().catch((error) => console.error(`[ccc] File watcher stopped: ${error.message}`));

function shutdown(signal) {
  clearTimeout(timer);
  watcher.close();
  if (!preview.killed) preview.kill(signal);
}

process.once('SIGINT', () => {
  shutdown('SIGINT');
  process.exit(130);
});
process.once('SIGTERM', () => {
  shutdown('SIGTERM');
  process.exit(143);
});
preview.once('exit', (code) => {
  watcher.close();
  process.exit(code ?? 0);
});
