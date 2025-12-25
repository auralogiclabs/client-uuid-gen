import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
  },
});
