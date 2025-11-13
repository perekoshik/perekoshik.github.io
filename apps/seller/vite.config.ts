import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const appRoot = path.resolve(__dirname);
const sharedRoot = path.resolve(__dirname, '../../packages/shared/src');

export default defineConfig({
  root: appRoot,
  publicDir: path.resolve(appRoot, 'public'),
  envDir: path.resolve(__dirname, '../../'),
  plugins: [react()],
  base: '/seller/',
  resolve: {
    alias: {
      '@': sharedRoot,
      '@seller': path.resolve(appRoot, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/seller'),
    emptyOutDir: true,
    sourcemap: true,
  },
  esbuild: {
    sourcemap: true,
  },
});
