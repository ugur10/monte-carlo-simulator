import { fileURLToPath } from 'node:url';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const libPath = fileURLToPath(new URL('./src/lib', import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    alias: {
      $lib: libPath,
    },
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.{ts,js}'],
      exclude: ['src/lib/**/*.{test,spec}.{ts,js}', 'src/setupTests.ts'],
      enabled: true,
    },
  },
});
