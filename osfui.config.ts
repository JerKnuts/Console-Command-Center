import { defineConfig } from '@osfui/cli';

export default defineConfig({
  modId: 'console.command-center',
  modRoot: 'mod',
  outDir: 'dist',
  mock: 'osfui.mock.ts',
  views: [{
    id: 'main',
    title: 'Console Command Center',
    description: 'Browser preview with simulated CCC native responses.',
    kind: 'menu',
    width: 1200,
    height: 720,
    transparent: true,
    capturesInput: true,
    pausesGame: true,
    permissions: { nativeBridge: true },
  }],
  vite: {
    plugins: [{
      name: 'ccc-preview-shared-styles',
      transformIndexHtml(html: string) {
        return html.replace('</head>', '  <link rel="stylesheet" href="/shared/osfui.css">\n  <script>window.__CCC_PREVIEW_READY__ = new Promise((resolve) => { window.__CCC_RESOLVE_PREVIEW_READY__ = resolve; });</script>\n</head>');
      },
    }],
  },
});
