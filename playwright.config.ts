import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 4010);
const DB = process.env.E2E_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sayphora_e2e';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/playwright-report.json' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome']
  },
  webServer: {
    // Exercises the real production build: compiled server + built client.
    command: 'npm run build && npx tsx e2e/prepare-db.ts && npm run db:seed && npm start',
    url: `http://127.0.0.1:${PORT}/health`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NODE_ENV: 'production',
      PORT: String(PORT),
      APP_URL: `http://127.0.0.1:${PORT}`,
      DATABASE_URL: DB,
      JWT_SECRET: 'e2e-secret-e2e-secret-e2e-secret-0123456789',
      COOKIE_SECURE: 'false',
      PASSWORD_HASH_COST: '10',
      ADMIN_EMAIL: 'admin@sayphora.test',
      ADMIN_PASSWORD: 'AdminPassw0rd!2026',
      LOG_LEVEL: 'warn',
      RATE_LIMIT_DISABLED: 'true',
      SEED_DEMO: 'true'
    }
  }
});
