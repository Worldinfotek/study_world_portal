import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  envDir: root,
  cacheDir: path.join(root, 'node_modules', '.vite'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': root,
    },
  },
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
    minify: false,
  },
  server: {
    fs: {
      strict: true,
      allow: [root],
    },
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
