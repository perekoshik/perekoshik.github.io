import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // CHANGE: Enable source maps to see TypeScript code in browser dev tools
  // WHY: Allows debugging TypeScript source instead of compiled JavaScript
  build: {
    sourcemap: true,
  },
  esbuild: {
    sourcemap: true,
  },
})

// test s
