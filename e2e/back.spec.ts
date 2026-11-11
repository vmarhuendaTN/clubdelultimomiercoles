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
      await expect(page.getByRole('heading', { name: 'Los más propuestos' })).toBeVisible();
      await sinErroresAxe(page);
      await page.getByRole('tab', { name: 'Personas' }).click();
      await expect(page.getByRole('heading', { name: 'Ana García' })).toBeVisible();
      await sinErroresAxe(page);
      await page.getByRole('tab', { name: 'Tintero' }).click();
      await expect(page.getByRole('heading', { name: 'Tintero', exact: true })).toBeVisible();
      await sinErroresAxe(page);
      await page.getByRole('tab', { name: 'Inscritas' }).click();
      await expect(page.getByText('marta@example.com')).toBeVisible();
      await sinErroresAxe(page);
      await page.getByRole('button', { name: /Sin inscribir/ }).click();
      await page.getByRole('button', { name: 'Inscribir a Ana García' }).click();
      const ficha = page.getByRole('dialog', { name: 'Nueva inscrita' });
      await expect(ficha.getByRole('textbox', { name: 'Nombre', exact: true })).toHaveValue('Ana');
      // La ficha entra con un fundido: axe mide el contraste cuando ha terminado.
      await page.evaluate(() =>
        Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
      );
      await sinErroresAxe(page);
      await ficha.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.getByText('Ana García ya está inscrita.')).toBeVisible();
      await page.getByRole('tab', { name: 'Valoraciones' }).click();
      await expect(page.getByRole('textbox', { name: 'Marta Ruiz' })).toHaveValue('8');
      await sinErroresAxe(page);
      await page.getByRole('tab', { name: 'Por libro' }).click();
      await expect(page.getByRole('heading', { name: 'Sinsonte' })).toBeVisible();
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

test('propuestas: código, recomendadas y tintero, y se envía desde la propia web', async ({
  page,
}) => {
  await page.goto('/lecturas/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await page.getByLabel('Código de acceso').fill('codigo-del-club');
  await page.getByRole('button', { name: 'Abrir el formulario' }).click();

  await page.getByLabel(/^Nombre/).fill('Ana');
  await page.getByLabel(/^Apellidos/).fill('García');
  await page.getByLabel(/De qué grupo eres/).fill('Miércoles');
  await page.getByLabel(/^Mes/).selectOption('enero');
  await page.getByLabel(/^Año/).selectOption({ index: 2 });
  await page.getByRole('button', { name: 'Proponer Circe, Madeline Miller' }).click();
  await expect(page.getByLabel(/^Lectura 1/)).toHaveValue('Circe, Madeline Miller');
  await page.getByLabel(/^Lectura 2/).fill('Sinsonte, Walter Tevis');
  await page.getByLabel(/^Lectura 3/).fill('Piranesi, Susanna Clarke');

  const tintero = page.getByLabel(/Lecturas en el tintero/);
  await tintero.selectOption('t2');
  await expect(tintero.locator('option', { hasText: 'Maniac' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Quitar Maniac, Benjamín Labatut' })).toBeVisible();

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.getByRole('button', { name: 'Enviar propuesta' }).click();
  await expect(page.getByText(/¡Gracias, Ana!/)).toBeVisible();
});

test('back: el tablero de propuestas resume la sesión y una admin recomienda', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await expect(page.getByLabel('Sesión')).toHaveValue('2027-01');
  const ranking = page.locator('section', {
    has: page.getByRole('heading', { name: 'Los más propuestos' }),
  });
  await expect(ranking.getByRole('listitem').first()).toContainText('2 personas');
  await expect(page.getByText('También en Noviembre de 2026').first()).toBeVisible();

  await page.getByRole('tab', { name: 'Tintero' }).click();
  await page.getByLabel('Recomendar una lectura del tintero').selectOption('t1');
  await page.getByRole('button', { name: 'Recomendar', exact: true }).click();
  await expect(page.getByText(/«Betty» aparece ahora/)).toBeVisible();
});

test('back: la vista Votación muestra resultados y deja elegir la ganadora', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await page.getByRole('tab', { name: 'Votación' }).click();
  await expect(page.getByRole('heading', { name: 'Votación final · Enero de 2027' })).toBeVisible();
  await expect(page.getByText('Abierta', { exact: true })).toBeVisible();
  await expect(page.getByText('4,5 · 2 votos · 9 puntos')).toBeVisible();
  await sinErroresAxe(page);
  await page.getByRole('button', { name: 'Elegir «Circe» como próxima lectura' }).click();
  const hoja = page.getByRole('dialog', { name: 'Nueva lectura' });
  await expect(hoja.getByLabel(/^Título/)).toHaveValue('Circe');
  await expect(hoja.getByLabel('Estado')).toHaveValue('proximo');
});

test('propuestas: con la votación abierta, el club puntúa las candidatas', async ({ page }) => {
  // Las rutas añadidas después ganan a las de fixtures.ts.
  await simularAppsScript(page, { votacionAbierta: true });
  await page.addInitScript(() => window.localStorage.setItem('club:codigo-propuestas', 'e2e'));
  await page.goto('/lecturas/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await expect(page.getByRole('heading', { name: 'Vota la próxima lectura' })).toBeVisible();
  await page.getByLabel(/^Nombre/).fill('Ana');
  await page.getByLabel(/^Apellidos/).fill('García');
  await page
    .getByRole('group', { name: 'Circe, Madeline Miller' })
    .getByRole('radio', { name: '5 estrellas' })
    .check({ force: true });
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.getByRole('button', { name: 'Enviar mi voto' }).click();
  await expect(page.getByText(/Tu voto para enero de 2027 está guardado/)).toBeVisible();
});

test('back: el resumen filtra al pulsar las cifras y los nombres', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await page.getByRole('button', { name: /Coincidencias/ }).click();
  await expect(page.getByRole('button', { name: /Coincidencias/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Ver lo que propuso Luis Pérez' }).first().click();
  await expect(page.getByRole('heading', { name: 'Luis Pérez', level: 4 })).toBeVisible();
  await sinErroresAxe(page);
});

test('/votar/ y /proponer/: páginas propias para compartir por WhatsApp', async ({ page }) => {
  await simularAppsScript(page, { votacionAbierta: true });
  await page.addInitScript(() => window.localStorage.setItem('club:codigo-propuestas', 'e2e'));
  await page.goto('/votar/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Votación');
  await expect(page.getByRole('button', { name: 'Enviar mi voto' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Proponer' })).toHaveCount(0);
  await sinErroresAxe(page);
  await page.goto('/proponer/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Propuestas');
  await expect(page.getByLabel(/^Lectura 1/)).toBeVisible();
  await sinErroresAxe(page);
});

test('back: archivo de sesiones agrupado por años', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await page.getByRole('tab', { name: 'Archivo' }).click();
  await expect(page.getByRole('region', { name: 'En curso' })).toContainText('Enero de 2027');
  const anio = page.getByRole('region', { name: /^2026/ });
  await expect(anio.getByRole('heading', { name: 'Noviembre', level: 5 })).toBeVisible();
  await sinErroresAxe(page);
  await anio.getByRole('button', { name: 'Ver Noviembre de 2026' }).click();
  await expect(page.getByRole('note')).toContainText('está archivada');
  await page.getByRole('button', { name: 'Desarchivar' }).click();
  await expect(page.getByText(/vuelve a estar en curso/)).toBeVisible();
});

test('back: eliminar una propuesta y un voto enviados por error', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await page.getByRole('tab', { name: 'Personas' }).click();
  await page.getByRole('button', { name: 'Eliminar la propuesta de Ana García' }).click();
  const confirmar = page.getByRole('dialog', { name: 'Eliminar propuesta' });
  await confirmar.getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText('Propuesta de Ana García eliminada.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ana García' })).toHaveCount(0);

  await page.getByRole('tab', { name: 'Votación' }).click();
  await page
    .getByRole('button', { name: /^Eliminar el voto de / })
    .first()
    .click();
  await page
    .getByRole('dialog', { name: 'Eliminar voto' })
    .getByRole('button', { name: 'Eliminar' })
    .click();
  await expect(page.getByText(/^Voto de .+ eliminado\.$/)).toBeVisible();
});

test('back: apuntar las valoraciones de una lectura y ver las medias', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await page.getByRole('tab', { name: 'Inscritas' }).click();
  await page.getByRole('tab', { name: 'Valoraciones' }).click();
  await expect(page.getByRole('textbox', { name: 'Marta Ruiz' })).toHaveValue('8');
  await page.getByRole('textbox', { name: 'Luis Pérez' }).fill('7');
  await page.getByRole('button', { name: 'Guardar notas' }).click();
  await expect(page.getByText(/Notas guardadas: media 7,5/)).toBeVisible();
  await page.getByRole('tab', { name: 'Por libro' }).click();
  await expect(page.getByRole('heading', { name: 'Sinsonte' })).toBeVisible();
});
