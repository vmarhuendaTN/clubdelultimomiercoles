import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PAGINAS = [
  '/',
  '/lecturas/',
  '/lecturas/el-secreto/',
  '/galeria/',
  '/el-club/',
  '/documentos/',
];

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`modo ${colorScheme === 'light' ? 'claro' : 'oscuro'}`, () => {
    test.use({ colorScheme });

    for (const ruta of PAGINAS) {
      test(`${ruta}: sin errores de axe ni scroll horizontal`, async ({ page }) => {
        await page.goto(ruta);
        await page.evaluate(() => document.fonts.ready);
        const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
        expect(
          violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
        ).toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      });
    }
  });
}

test('lecturas: filtra por estado y busca por autor', async ({ page }) => {
  await page.goto('/lecturas/');
  await expect(page.getByText('25 libros')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar por título o autor' }).fill('ishiguro');
  await expect(page.getByText('1 libro', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nunca me abandones' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar por título o autor' }).fill('');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await expect(page.getByRole('link', { name: 'Proponer una lectura' })).toBeVisible();
});

test('lecturas: la tarjeta lleva a la ficha y se puede volver', async ({ page }) => {
  await page.goto('/lecturas/');
  await page.getByRole('link', { name: 'Leviatán' }).click();
  await expect(page).toHaveURL(/\/lecturas\/leviatan\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Leviatán');
  await page.getByRole('link', { name: 'Lecturas', exact: true }).first().click();
  await expect(page).toHaveURL(/\/lecturas\/$/);
});

test('la galería es una pestaña y contiene Instagram', async ({ page }, testInfo) => {
  await page.goto('/');
  const nav =
    testInfo.project.name === 'escritorio-1440'
      ? page.getByRole('navigation', { name: 'Principal' })
      : page.getByRole('navigation', { name: 'Pestañas' });
  await nav.getByRole('link', { name: 'Galería' }).click();
  await expect(page).toHaveURL(/\/galeria\/$/);
  await expect(nav.getByRole('link', { name: 'Galería' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: 'En Instagram' })).toBeVisible();
});

test('compartir: metadatos Open Graph con imagen', async ({ page }) => {
  await page.goto('/');
  const og = page.locator('meta[property="og:image"]');
  await expect(og).toHaveAttribute('content', /\/brand\/og\/og-default\.jpg$/);
});

test('valoraciones: la ficha muestra la media, las opiniones y el acceso con Google', async ({
  page,
}) => {
  await page.goto('/lecturas/leviatan/');
  const seccion = page.getByRole('region', { name: 'Valoraciones' });
  await expect(seccion.getByText('4,5 · 2 valoraciones')).toBeVisible();
  await expect(seccion.getByRole('img', { name: '4,5 de 5 estrellas' })).toBeVisible();
  await expect(seccion.getByRole('heading', { name: 'Ana G.' })).toBeVisible();
  await expect(seccion.getByText('De lo mejor que hemos leído.')).toBeVisible();
  await expect(
    seccion.getByRole('button', { name: 'Entrar con Google para valorar' }),
  ).toBeVisible();
});

test('valoraciones: libro sin valoraciones invita a ser la primera', async ({ page }) => {
  await page.goto('/lecturas/el-secreto/');
  await expect(page.getByText('Aún no hay valoraciones. ¡Sé la primera persona!')).toBeVisible();
});

test('valoraciones: las tarjetas de lecturas muestran la media', async ({ page }) => {
  await page.goto('/lecturas/');
  const tarjeta = page
    .getByRole('article')
    .filter({ has: page.getByRole('link', { name: 'Leviatán' }) });
  await expect(tarjeta.getByRole('img', { name: '4,5 de 5 estrellas' })).toBeVisible();
});
