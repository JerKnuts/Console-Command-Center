import { access, readFile, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, 'src/views/console.command-center/main');
const textExtensions = new Set(['.css', '.html', '.js', '.mjs', '.ts']);
const forbidden = [
  [/\bhttps?:\/\//i, 'remote HTTP URL'],
  [/\b(?:WebSocket|WebTransport|RTCPeerConnection|SharedWorker|Worker)\b/, 'unsupported network or worker API'],
];

async function sourceFiles(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) result.push(...await sourceFiles(path));
    else if (textExtensions.has(extname(path))) result.push(path);
  }
  return result;
}

const problems = [];
for (const path of await sourceFiles(sourceRoot)) {
  const source = await readFile(path, 'utf8');
  for (const [pattern, label] of forbidden) {
    if (pattern.test(source)) problems.push(`${path}: ${label}`);
  }
}

const mainSource = await readFile(resolve(sourceRoot, 'main.ts'), 'utf8');
if (!mainSource.includes('window.osfui.request')) problems.push('main.ts: OSF UI 2.0 request API is not used');
if (mainSource.includes('window.osfui.call') || mainSource.includes('window.osfui?.ready')) {
  problems.push('main.ts: legacy OSF UI browser APIs remain');
}
if (problems.length) throw new Error(`OSF UI 2.0 compatibility check failed:\n${problems.join('\n')}`);

await access(resolve(projectRoot, 'src/osfui.d.ts'));
await new Promise((fulfill, reject) => {
  const executable = resolve(projectRoot, 'node_modules/typescript/lib/tsc.js');
  const child = spawn(process.execPath, [executable, '--noEmit', '-p', resolve(projectRoot, 'tsconfig.json')], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  child.once('error', reject);
  child.once('exit', (code) => code === 0 ? fulfill() : reject(new Error(`TypeScript exited with code ${code}`)));
});

console.log('OSF UI 2.0 compatibility and TypeScript checks passed.');
