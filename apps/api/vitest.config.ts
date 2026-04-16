import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: false,
  test: {
    globals: true,
    root: './test',
    coverage: {
      provider: 'v8', // or 'istanbul'
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      src: resolve(__dirname, './src'),
    },
  },
});
