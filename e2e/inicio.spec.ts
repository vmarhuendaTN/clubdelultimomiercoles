import { expect, test } from '@playwright/test';

test('una ruta inexistente muestra la página 404', async ({ page }) => {
  const res = await page.goto('/no-existe/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Este sillón está vacío');
});

test('se puede instalar como app: manifest con iconos', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.map((i: { purpose?: string }) => i.purpose)).toContain('maskable');
});
