import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const appRoot = path.resolve(__dirname);
const sharedRoot = path.resolve(__dirname, '../../packages/shared/src');

export default defineConfig({
  root: appRoot,
  publicDir: path.resolve(appRoot, 'public'),
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': sharedRoot,
      '@market': path.resolve(appRoot, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/market'),
    emptyOutDir: true,
    sourcemap: true,
  },
  esbuild: {
    sourcemap: true,
  },
});
