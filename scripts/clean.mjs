import { rm } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generatedPaths = ['build', '.xmake', 'release'];

for (const name of generatedPaths) {
  const target = resolve(projectRoot, name);
  const pathFromRoot = relative(projectRoot, target);
  if (!pathFromRoot || pathFromRoot.startsWith('..') || resolve(target) === projectRoot) {
    throw new Error(`Refusing to clean path outside the project: ${target}`);
  }
  await rm(target, { recursive: true, force: true });
  console.log(`Removed generated path: ${name}`);
}

console.log('Cleanup complete. Compiled output, artifacts, .osfui/local.json, dependencies, source, tests, and Git history were preserved.');
