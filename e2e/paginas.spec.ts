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
  '/privacidad/',
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
  const pestanas = page.getByRole('tab');
  await expect(pestanas).toHaveText(['Próximo', 'Leídos', 'Propuestas']);
  await expect(page.getByRole('tab', { name: 'Próximo' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Datos de libros: Google Libros.')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Leídos' }).click();
  await expect(page.getByText('26 libros')).toBeVisible();
  await expect(page.getByText('Datos de libros: Google Libros.')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar por título o autor' }).fill('ishiguro');
  await expect(page.getByText('1 libro', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nunca me abandones' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar por título o autor' }).fill('');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await expect(page.getByRole('heading', { name: 'Propón la próxima lectura' })).toBeVisible();
});

test('lecturas: la próxima sesión dice hora y lugar y se añade al calendario', async ({
  page,
  request,
}) => {
  await page.goto('/lecturas/');
  await expect(page.getByText(/A las 19:30 en/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Añadir a mi calendario' })).toHaveAttribute(
    'href',
    /^webcal:\/\/.+\/calendario\.ics$/,
  );
  const ics = await request.get('/calendario.ics');
  expect(ics.ok()).toBe(true);
  const texto = await ics.text();
  expect(texto).toContain('BEGIN:VCALENDAR');
  expect(texto).toMatch(/DTSTART;TZID=Europe\/Madrid:\d{8}T193000/);
});

test('lecturas: la próxima lectura se destaca con enlace a su ficha', async ({ page }) => {
  await page.goto('/lecturas/');
  await expect(page.getByText('Próxima lectura')).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  await page.getByRole('link', { name: /^Ver la ficha de / }).click();
  await expect(page).toHaveURL(/\/lecturas\/[a-z0-9-]+\/$/);
});

test('propuestas: el formulario pide código y rechaza uno incorrecto', async ({ page }) => {
  await page.goto('/lecturas/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.getByLabel('Código de acceso').fill('no-es-el-codigo');
  await page.getByRole('button', { name: 'Abrir el formulario' }).click();
  await expect(page.getByText(/El código no es correcto/)).toBeVisible();
  await expect(page.getByLabel(/^Lectura 1/)).toHaveCount(0);
});

test('lecturas: la tarjeta lleva a la ficha y se puede volver', async ({ page }) => {
  await page.goto('/lecturas/');
  await page.getByRole('tab', { name: 'Leídos' }).click();
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

test('valoraciones apagadas: ni sección en la ficha ni medias en las tarjetas', async ({
  page,
}) => {
  await page.goto('/lecturas/leviatan/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Leviatán');
  await expect(page.getByRole('region', { name: 'Valoraciones' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Entrar con Google/ })).toHaveCount(0);
  await page.goto('/lecturas/');
  await page.getByRole('tab', { name: 'Leídos' }).click();
  await expect(page.getByRole('img', { name: /de 5 estrellas/ })).toHaveCount(0);
});

test('pie: discreto, sin dirección y con enlace a privacidad', async ({ page }) => {
  await page.goto('/');
  const pie = page.getByRole('contentinfo');
  await expect(pie).not.toContainText('Don Ramón de la Cruz');
  await pie.getByRole('link', { name: 'Privacidad' }).click();
  await expect(page).toHaveURL(/\/privacidad\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacidad');
});

test('pie: el nombre del club vuelve arriba', async ({ page }) => {
  await page.goto('/lecturas/');
  await page.getByRole('tab', { name: 'Leídos' }).click();
  await page.getByRole('button', { name: 'Club del Último Miércoles: volver arriba' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('main')).toBeFocused();
});

test('galería: muestra el perfil de Instagram incrustado', async ({ page }) => {
  await page.goto('/galeria/');
  await expect(page.getByTitle('Publicaciones de @elultimomiercoles en Instagram')).toBeAttached();
});

test('el club: Substack y «Quiero ser del club» con campos obligatorios', async ({ page }) => {
  await page.goto('/el-club/');
  await expect(page.getByRole('link', { name: /Leer en Substack/ })).toHaveAttribute(
    'href',
    'https://idecuba.substack.com/',
  );
  await page.getByRole('button', { name: 'Preparar el email' }).click();
  await expect(page.getByText('Escribe tu nombre.')).toBeVisible();
  await expect(page.getByLabel(/^Nombre/)).toBeFocused();
});
