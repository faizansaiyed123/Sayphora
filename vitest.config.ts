import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@shared': path.resolve(__dirname, 'shared') }
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // API tests share one PostgreSQL database, so run files serially.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      PASSWORD_HASH_COST: '10',
      JWT_SECRET: 'test-secret-test-secret-test-secret-0123456789'
    }
  }
});
