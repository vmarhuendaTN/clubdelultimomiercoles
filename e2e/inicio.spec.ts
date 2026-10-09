import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('inicio sin errores de axe', async ({ page }) => {
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});

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
