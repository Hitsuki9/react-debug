import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      react: resolve('src/packages/react'),
      'react-dom': resolve('src/packages/react-dom'),
      scheduler: resolve('src/packages/scheduler')
    }
  },
  optimizeDeps: {
    include: ['react-dom/client'],
    force: true
  },
  plugins: [react()]
});
