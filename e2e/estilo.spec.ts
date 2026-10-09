import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`/estilo en modo ${colorScheme === 'light' ? 'claro' : 'oscuro'}`, () => {
    test.use({ colorScheme });

    test('sin errores de axe (WCAG 2.2 AA)', async ({ page }) => {
      await page.goto('/estilo/');
      await page.evaluate(() => document.fonts.ready);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual(
        [],
      );
    });

    test('sin scroll horizontal', async ({ page }) => {
      await page.goto('/estilo/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test('el primer Tab enfoca "Saltar al contenido" y lleva al contenido', async ({ page }) => {
  await page.goto('/estilo/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('el control segmentado se maneja con flechas', async ({ page }) => {
  await page.goto('/estilo/');
  const leidos = page.getByRole('tab', { name: 'Leídos' });
  await leidos.focus();
  await page.keyboard.press('ArrowRight');
  const proximo = page.getByRole('tab', { name: 'Próximo' });
  await expect(proximo).toBeFocused();
  await expect(proximo).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Próxima sesión');
});

test('la hoja modal atrapa el foco, se cierra con Esc y devuelve el foco', async ({ page }) => {
  await page.goto('/estilo/');
  const abrir = page.getByRole('button', { name: 'Abrir hoja' });
  await abrir.click();
  const dialog = page.getByRole('dialog', { name: 'Filtrar por año' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(abrir).toBeFocused();
});

test('los avisos se anuncian en una región viva', async ({ page }) => {
  await page.goto('/estilo/');
  await page.getByRole('button', { name: 'Aviso de éxito' }).click();
  await expect(page.getByRole('status')).toContainText('Cambios publicados');
});

test('navegación según el ancho: TabBar en móvil, barra superior en escritorio', async ({
  page,
}, testInfo) => {
  await page.goto('/estilo/');
  const tabbar = page.getByRole('navigation', { name: 'Pestañas' });
  const principal = page.getByRole('navigation', { name: 'Principal' });
  if (testInfo.project.name === 'escritorio-1440') {
    await expect(principal).toBeVisible();
    await expect(tabbar).toBeHidden();
  } else {
    await expect(tabbar).toBeVisible();
    await expect(principal).toBeHidden();
  }
});
