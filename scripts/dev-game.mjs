import { watch } from 'node:fs';
import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { basename, dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, 'src/views/console.command-center/main');
const distView = resolve(projectRoot, 'dist/SFSE/Plugins/OSF/UI/views/console.command-center/main');
const modView = resolve(projectRoot, 'mod/SFSE/Plugins/OSF/UI/views/console.command-center/main');
const cli = resolve(projectRoot, 'node_modules/@osfui/cli/src/cli.mjs');
const gameTools = resolve(projectRoot, 'node_modules/@osfui/cli/src/game.mjs');
const localConfigPath = resolve(projectRoot, '.osfui/local.json');

try {
  await access(cli);
} catch {
  console.error('[ccc] The browser preview dependency is missing. Run "npm install", then run "npm run dev:game" again.');
  process.exit(1);
}
const { mirrorTree } = await import(pathToFileURL(gameTools).href);

function run(command, args) {
  return new Promise((fulfill, reject) => {
    const child = spawn(command, args, { cwd: projectRoot, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? fulfill() : reject(new Error(`${command} exited with code ${code ?? 'unknown'}`)));
  });
}

function explicitModsRoot() {
  const deployIndex = process.argv.indexOf('--deploy');
  if (deployIndex >= 0 && process.argv[deployIndex + 1]) return resolve(process.argv[deployIndex + 1]);
  if (process.env.CCC_MODS_ROOT) return resolve(process.env.CCC_MODS_ROOT);
  return undefined;
}

async function configuredDeployRoot() {
  const explicit = explicitModsRoot();
  if (explicit) return resolve(explicit, basename(projectRoot));

  try {
    const local = JSON.parse(await readFile(localConfigPath, 'utf8'));
    if (typeof local.modsRoot === 'string' && local.modsRoot) {
      return resolve(local.modsRoot, basename(projectRoot));
    }
    // Keep the deployment location saved by older OSF UI tooling working.
    if (typeof local.deployRoot === 'string' && local.deployRoot) return resolve(local.deployRoot);
  } catch {}

  if (!stdin.isTTY) {
    throw new Error('Mod deployment is not configured. Run dev:game in a terminal and enter your MO2 mods folder.');
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const suggestedRoot = process.platform === 'win32' ? 'C:\\GTS\\mods' : '';
    const suffix = suggestedRoot ? ` [${suggestedRoot}]` : '';
    const answer = (await prompt.question(`MO2 mods directory to sync into${suffix}: `)).trim();
    if (!answer && !suggestedRoot) throw new Error('A mods directory is required.');
    const modsRoot = resolve(answer || suggestedRoot);
    await mkdir(dirname(localConfigPath), { recursive: true });
    await writeFile(localConfigPath, `${JSON.stringify({ modsRoot }, null, 2)}\n`);
    console.log(`[ccc] Saved the local deployment path in .osfui/local.json.`);
    return resolve(modsRoot, basename(projectRoot));
  } finally {
    prompt.close();
  }
}

const externalModRoot = await configuredDeployRoot();
const externalView = resolve(externalModRoot, 'SFSE/Plugins/OSF/UI/views/console.command-center/main');
let fullDeploy = true;

function isLocked(error) {
  return error?.code === 'EBUSY' || error?.code === 'EPERM' || error?.code === 'EACCES';
}

async function buildAndDeploy() {
  await run(process.execPath, [resolve(projectRoot, 'scripts/build-ui.mjs')]);
  await rm(modView, { recursive: true, force: true });
  await mkdir(dirname(modView), { recursive: true });
  await cp(distView, modView, { recursive: true });
  console.log(`[ccc] Browser-ready UI deployed to ${modView}`);
  if (fullDeploy) {
    try {
      await mirrorTree(resolve(projectRoot, 'dist'), externalModRoot);
      console.log(`[ccc] Compiled mod deployed to ${externalModRoot}`);
    } catch (error) {
      if (!isLocked(error)) throw error;
      await mirrorTree(distView, externalView);
      console.warn(`[ccc] Starfield has the DLL locked; updated the UI in ${externalModRoot}. Restart dev:game after closing Starfield to replace the DLL.`);
    }
    fullDeploy = false;
  } else {
    await mirrorTree(distView, externalView);
    console.log(`[ccc] Updated browser-ready UI in ${externalModRoot}`);
  }
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

const watcher = watch(sourceRoot, { recursive: true }, (_eventType, filename) => {
  if (!filename || !/\.(?:css|html|ts)$/.test(filename)) return;
  clearTimeout(timer);
  timer = setTimeout(() => void rebuild(), 300);
});
watcher.on('error', (error) => console.error(`[ccc] File watcher stopped: ${error.message}`));

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
