import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts', 'src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@poco/api': path.resolve(__dirname, './src'),
    },
  },
});
