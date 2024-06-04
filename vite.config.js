import { defineConfig } from 'vite';

export default defineConfig({
  root: './src/',
  base: '/_webgl-school/',
  publicDir: './public',
  build: {
    outDir: '../dist/',
    emptyOutDir: true,
    sourcemap: true,
  },
});
