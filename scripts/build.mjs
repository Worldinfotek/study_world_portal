import * as esbuild from 'esbuild';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build as viteBuild } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const startupFile = path.join(root, 'dist', 'server.cjs');
if (/[\\/]Inetpub[\\/]vhosts[\\/]/i.test(root) && existsSync(startupFile)) {
  console.log('Plesk cannot run Vite/esbuild (parent folder access is denied). Using committed dist/server.cjs.');
  process.exit(0);
}

await viteBuild({
  configFile: false,
  root,
  envDir: root,
  cacheDir: path.join(root, 'node_modules', '.vite'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': root },
  },
  build: {
    outDir: path.join(root, 'dist', 'public'),
    emptyOutDir: true,
    minify: false,
  },
});

await esbuild.build({
  absWorkingDir: root,
  entryPoints: [path.join(root, 'server.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: path.join(root, 'dist', 'server.cjs'),
  logLevel: 'info',
});
