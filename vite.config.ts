import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // `same-origin-allow-popups` lets the Firebase Google sign-in popup be closed
  // by its opener, avoiding the COOP "would block the window.close call" warning.
  server: {
    port: 5131,
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' },
  },
  // @sudobility/components is a local file: link under active development.
  // Excluding it from dep pre-bundling means edits/rebuilds are picked up on
  // reload (no stale optimized cache) — it's a single ESM dist bundle.
  optimizeDeps: {
    exclude: ['@sudobility/components'],
  },
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@sudobility/subscription-components': path.resolve(__dirname, 'src/stubs/subscription-components.ts'),
    },
  },
  build: { target: 'es2020', sourcemap: false, chunkSizeWarningLimit: 1000 },
});
