import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { conSesion, simularAppsScript } from './apps-script-falso';
import { expect, test } from './fixtures';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function sinErroresAxe(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.beforeEach(async ({ page }) => simularAppsScript(page));

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`back en modo ${colorScheme === 'light' ? 'claro' : 'oscuro'}`, () => {
    test.use({ colorScheme });

    test('sin sesión pide entrar con Google', async ({ page }) => {
      await page.goto('/back/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Panel del club');
      await expect(page.getByText(/pestaña Equipo/)).toBeVisible();
      await sinErroresAxe(page);
    });

    test('con sesión: lecturas, propuestas y equipo sin errores de axe', async ({ page }) => {
      await conSesion(page);
      await page.goto('/back/');
      await expect(page.getByText('Hola, Victoria.', { exact: false })).toBeVisible();
      await expect(page.getByRole('button', { name: /Editar «Sinsonte»/ })).toBeVisible();
      await sinErroresAxe(page);
      await page.getByRole('tab', { name: 'Propuestas' }).click();
      await expect(page.getByRole('heading', { name: 'Tea Rooms' })).toBeVisible();
      await sinErroresAxe(page);
      await page.getByRole('tab', { name: 'Equipo' }).click();
      await expect(page.getByText('ines@example.com')).toBeVisible();
      await sinErroresAxe(page);
    });
  });
}

test('back: añadir una lectura con el buscador de Google Libros', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await page.getByRole('button', { name: 'Añadir lectura' }).click();
  const hoja = page.getByRole('dialog', { name: 'Nueva lectura' });
  await hoja.getByLabel('Buscar en Google Libros').fill('pedro paramo');
  await hoja.getByRole('button', { name: /Pedro Páramo/ }).click();
  await expect(hoja.getByLabel(/^Título/)).toHaveValue('Pedro Páramo');
  await expect(hoja.getByLabel(/^Autor/)).toHaveValue('Juan Rulfo');
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await hoja.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText(/Guardado en la hoja/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Editar «Pedro Páramo»/ })).toBeVisible();
});

test('back: publicar ahora', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await expect(page.getByText(/Última publicación/)).toBeVisible();
  await page.getByRole('button', { name: 'Publicar ahora' }).click();
  await expect(page.getByText(/se actualizará en unos 3 minutos/)).toBeVisible();
});

test('propuestas: con el código recordado se envía desde la propia web', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('club:codigo-propuestas', 'e2e'));
  await page.goto('/lecturas/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await page.getByLabel('Busca el libro').fill('pedro paramo');
  await page.getByRole('button', { name: /Pedro Páramo/ }).click();
  await page.getByLabel(/Tu nombre/).fill('Ana');
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.getByRole('button', { name: 'Enviar propuesta' }).click();
  await expect(page.getByText(/¡Gracias, Ana!/)).toBeVisible();
});
