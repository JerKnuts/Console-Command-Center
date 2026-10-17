import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFile(resolve(root, name), 'utf8');
const pkg = JSON.parse(await read('package.json'));
const lock = JSON.parse(await read('package-lock.json'));
const version = pkg.version;
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid release version.');
if (lock.version !== version || lock.packages[''].version !== version) throw new Error('Package lock version differs from package.json.');
for (const [name, pattern] of [
  ['xmake.lua', /set_version\("([^"\n]+)"\)/],
  ['native/src/main.cpp', /kBuildId\s*=\s*"([^"\n]+)"/],
  ['src/views/console.command-center/main/main.ts', /CONSOLE_COMMAND_CENTER_VERSION\s*=\s*'([^'\n]+)'/],
]) {
  const value = (await read(name)).match(pattern)?.[1];
  if (value !== version) throw new Error(`${name} version ${value} differs from ${version}.`);
}
if (!(await read('README.md')).includes(`Current release: v${version}`)) throw new Error('README release version differs.');
// Local Markdown links must survive documentation consolidation and packaging.
const markdown = ['README.md', 'CHANGELOG.md', 'COMMAND_CATALOG.md', 'RELEASE_VALIDATION.md', 'THIRD_PARTY_NOTICES.md',
  ...(await readdir(resolve(root, 'docs'))).filter(name => name.endsWith('.md')).map(name => `docs/${name}`)];
let links = 0;
for (const name of markdown) {
  for (const match of (await read(name)).matchAll(/!?\[[^\]\n]*\]\(([^)\s]+)(?:\s+"[^"\n]*")?\)/g)) {
    const target = match[1];
    if (/^(?:[a-z]+:|#)/i.test(target)) continue;
    const path = resolve(root, dirname(name), decodeURIComponent(target.split('#')[0]));
    const rel = relative(root, path);
    if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Documentation link leaves source: ${name}: ${target}`);
    try { await access(path); } catch { throw new Error(`Broken documentation link: ${name}: ${target}`); }
    links++;
  }
}
console.log(`Release ${version}: metadata agrees; ${links} local documentation links resolve.`);
