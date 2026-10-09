import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
// En entornos con Chromium preinstalado (p. ej. sandbox) se puede indicar su ruta.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    locale: 'es-ES',
    launchOptions: { executablePath },
  },
  projects: [
    {
      name: 'movil-360',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 780 } },
    },
    {
      name: 'tableta-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'escritorio-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  // Exportación estática servida como en GitHub Pages (sin basePath en los tests).
  webServer: {
    command: `pnpm build && pnpm serve:out ${PORT}`,
    url: `http://localhost:${PORT}/estilo/`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { NEXT_PUBLIC_BASE_PATH: '' },
  },
});
