import { defineConfig } from '@osfui/cli';

export default defineConfig({
  modId: 'console.command-center',
  views: [{
    id: 'main',
    title: 'Console Command Center',
    kind: 'menu',
    width: 1200,
    height: 720,
    transparent: true,

    permissions: { nativeBridge: true },
  }],
});
