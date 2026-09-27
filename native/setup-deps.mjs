import { access, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencyRoot = resolve(projectRoot, 'native', 'lib');
const commonLibDir = resolve(dependencyRoot, 'commonlibsf');
const commonLibMarker = resolve(commonLibDir, 'xmake.lua');

const COMMONLIBSF_URL = 'https://github.com/libxse/commonlibsf.git';
const COMMONLIBSF_COMMIT = 'e1096784d5cb3263953f6e2ceeed1f12c2a14ebc';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function run(command, args, cwd = projectRoot) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.once('error', (error) => {
      if (error?.code === 'ENOENT') {
        reject(new Error(`Could not run '${command}'. Make sure Git is installed and available in PATH.`));
        return;
      }
      reject(error);
    });
    child.once('exit', (code) => {
      if (code === 0) resolveRun();
      else reject(new Error(`${command} exited with code ${code ?? 'unknown'}.`));
    });
  });
}

if (await exists(commonLibMarker)) {
  process.exit(0);
}

await mkdir(dependencyRoot, { recursive: true });

if (await exists(commonLibDir)) {
  const contents = await readdir(commonLibDir);
  if (contents.length > 0) {
    throw new Error(
      `CommonLibSF is incomplete at ${commonLibDir}. Remove that folder and run 'npm run setup:deps' again.`
    );
  }
}

console.log('[deps] CommonLibSF is missing. Restoring the pinned build dependency...');
await run('git', ['clone', '--no-checkout', COMMONLIBSF_URL, commonLibDir]);
await run('git', ['-C', commonLibDir, 'checkout', '--detach', COMMONLIBSF_COMMIT]);
await run('git', ['-C', commonLibDir, 'submodule', 'update', '--init', '--recursive']);
console.log(`[deps] CommonLibSF ready at ${COMMONLIBSF_COMMIT.slice(0, 12)}.`);
