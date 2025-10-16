import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'NextCTLChatWidget',
      fileName: 'nextctl-widget',
      formats: ['iife'],
    },
  },
});
