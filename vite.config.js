import { resolve } from 'path';
import { defineConfig } from 'vite';

const root = resolve(__dirname, 'src');
const pubDir = resolve(__dirname, 'public');
const outDir = resolve(__dirname, 'dist');

export default defineConfig({
  root,
  base: '/_webgl-school/',
  publicDir: pubDir,
  build: {
    outDir,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        prac001: resolve(root, '001/prac001.html'),
        prac002: resolve(root, '002/prac002.html'),
      },
    },
    emptyOutDir: true,
    sourcemap: true,
  },
});
