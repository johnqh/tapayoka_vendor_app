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
