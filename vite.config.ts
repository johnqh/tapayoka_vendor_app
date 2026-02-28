import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: { port: 5210 },
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'firebase/auth': path.resolve(__dirname, 'src/stubs/firebase-auth.ts'),
      '@sudobility/subscription-components': path.resolve(__dirname, 'src/stubs/subscription-components.ts'),
      '@sudobility/devops-components': path.resolve(__dirname, 'src/stubs/devops-components.ts'),
      '@sudobility/di_web': path.resolve(__dirname, 'src/stubs/di_web.ts'),
      '@sudobility/auth_lib': path.resolve(__dirname, 'src/stubs/auth_lib.ts'),
    },
  },
  build: { target: 'es2020', sourcemap: false },
});
