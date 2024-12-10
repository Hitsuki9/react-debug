import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// or use @rollup/plugin-babel's `inputSourceMap` option
// https://babeljs.io/docs/options#inputsourcemap
import sourcemaps from 'rollup-plugin-sourcemaps2';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
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
    plugins: [
      react(),
      isProd &&
        sourcemaps({
          include: ['src/packages/**']
        })
    ].filter(Boolean),
    server: {
      open: true
    },
    build: {
      sourcemap: true,
      commonjsOptions: {
        include: ['src/packages/**']
      }
    },
    preview: {
      open: true
    }
  };
});
