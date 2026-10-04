import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, 'src/views/console.command-center/main');
const outRoot = resolve(projectRoot, 'dist');
const viewRoot = resolve(outRoot, 'SFSE/Plugins/OSF/UI/views/console.command-center/main');

await rm(outRoot, { recursive: true, force: true });
await mkdir(outRoot, { recursive: true });
await cp(resolve(projectRoot, 'mod'), outRoot, { recursive: true });

await build({
  root: sourceRoot,
  base: './',
  build: {
    outDir: viewRoot,
    assetsDir: 'assets',
    // CCC intentionally ships large lazy-loaded ID and quest catalogs. They
    // stay out of the initial bundle and are expected to exceed Vite's web-app default.
    chunkSizeWarningLimit: 3200,
    emptyOutDir: true,
    rollupOptions: { input: resolve(sourceRoot, 'index.html') },
  },
});

const builtIndexPath = resolve(viewRoot, 'index.html');
const builtIndex = await readFile(builtIndexPath, 'utf8');
await writeFile(
  builtIndexPath,
  builtIndex.replace(
    '</head>',
    '  <link rel="stylesheet" href="/shared/osfui.css">\n  <script src="/shared/osfui.js"></script>\n</head>',
  ),
);

const manifest = {
  manifestVersion: 1,
  title: 'Console Command Center',
  description: 'Search, inspect, and run Starfield console commands.',
  entry: 'index.html',
  kind: 'menu',
  launcher: true,
  width: 1200,
  height: 720,
  transparent: true,
  capturesInput: true,
  pausesGame: true,
};

await writeFile(resolve(viewRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Built OSF UI 2.0 view in ${viewRoot}`);
