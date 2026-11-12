import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { conSesion, simularAppsScript } from './apps-script-falso';
import { expect, test } from './fixtures';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function sinErroresAxe(page: Page) {
  // Las transiciones (fundidos, barra compacta al hacer scroll) se miden cuando han terminado.
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
  );
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

/** Va a una sección del panel: con el menú lateral (escritorio) o con el selector (móvil). */
async function irA(page: Page, seccion: string) {
  // Espera a que el panel esté dentro (tras comprobar la sesión) antes de mirar qué menú hay.
  await page.locator('#seccion-titulo').waitFor();
  const lateral = page.getByRole('navigation', { name: 'Secciones del panel', exact: true });
  if (await lateral.isVisible()) {
    await lateral.getByRole('button', { name: seccion, exact: true }).click();
  } else {
    await page.getByRole('button', { name: /Cambiar de sección/ }).click();
    await page
      .getByRole('navigation', { name: 'Secciones del panel (móvil)' })
      .getByRole('button', { name: seccion, exact: true })
      .click();
  }
  await expect(page.getByRole('heading', { level: 2, name: seccion, exact: true })).toBeVisible();
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
      await irA(page, 'Propuestas');
      await expect(page.getByRole('heading', { name: 'Los más propuestos' })).toBeVisible();
      await sinErroresAxe(page);
      await irA(page, 'Quién propone');
      await expect(page.getByRole('heading', { name: 'Ana García' })).toBeVisible();
      await sinErroresAxe(page);
      await irA(page, 'Tintero');
      await expect(page.getByRole('heading', { name: 'Lecturas pendientes' })).toBeVisible();
      await sinErroresAxe(page);
      await irA(page, 'Inscritas');
      await expect(page.getByText('marta@example.com')).toBeVisible();
      await sinErroresAxe(page);
      await page.getByRole('button', { name: /Sin inscribir/ }).click();
      await expect(page.getByText('¿Es Marta Ruiz?')).toBeVisible();
      await page.getByRole('button', { name: 'Inscribir a Ana García' }).click();
      const ficha = page.getByRole('dialog', { name: 'Nueva inscrita' });
      await expect(ficha.getByRole('textbox', { name: 'Nombre', exact: true })).toHaveValue('Ana');
      await sinErroresAxe(page);
      await ficha.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.getByText('Ana García ya está inscrita.')).toBeVisible();
      await irA(page, 'Valoraciones');
      await expect(page.getByRole('textbox', { name: 'Marta Ruiz' })).toHaveValue('8');
      await sinErroresAxe(page);
      await page.getByRole('tab', { name: 'Por libro' }).click();
      await expect(page.getByRole('heading', { name: 'Sinsonte' })).toBeVisible();
      await sinErroresAxe(page);
      await irA(page, 'Equipo');
      await expect(page.getByText('ines@example.com')).toBeVisible();
      await sinErroresAxe(page);
      await irA(page, 'Estado');
      await expect(page.getByRole('heading', { name: 'Conexión con la hoja' })).toBeVisible();
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

  // Quien no está en la lista escribe su nombre y elige su club.
  await page.getByLabel(/¿Quién eres\?/).selectOption('otra');
  await page.getByLabel(/^Nombre/).fill('Ana');
  await page.getByLabel(/^Apellidos/).fill('García');
  await page.getByLabel(/De qué club eres/).selectOption('Club 1');
  await page.getByLabel(/^Mes/).selectOption('enero');
  await page.getByLabel(/^Año/).selectOption({ index: 2 });
  await page.getByRole('button', { name: 'Proponer Circe, Madeline Miller' }).click();
  await expect(page.getByLabel(/^Lectura 1/)).toHaveValue('Circe, Madeline Miller');
  await page.getByLabel(/^Lectura 2/).fill('Sinsonte, Walter Tevis');
  const deLaSesion = page.getByRole('region', { name: /Recomendadas por el club para enero/ });
  await expect(deLaSesion.getByText('2020 · 272 págs.')).toBeVisible();
  await expect(deLaSesion.getByText(/autores españoles/)).toBeVisible();
  await deLaSesion.getByRole('button', { name: 'Proponer Piranesi, Susanna Clarke' }).click();
  await expect(page.getByLabel(/^Lectura 3/)).toHaveValue('Piranesi, Susanna Clarke');
  await expect(deLaSesion.getByText('En tus lecturas')).toBeVisible();

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
  await irA(page, 'Propuestas');
  await expect(page.getByLabel('Sesión')).toHaveValue('2027-01');
  const ranking = page.locator('section', {
    has: page.getByRole('heading', { name: 'Los más propuestos' }),
  });
  await expect(ranking.getByRole('listitem').first()).toContainText('2 personas');
  await expect(page.getByText('También en Noviembre de 2026').first()).toBeVisible();

  await irA(page, 'Tintero');
  const porSesion = page.getByRole('region', { name: 'Recomendadas para una sesión' });
  await expect(porSesion.getByLabel('Año', { exact: true })).toHaveValue('2027');
  await expect(porSesion.getByText('Piranesi, Susanna Clarke')).toBeVisible();
  await expect(porSesion.getByLabel(/Notas del club para Enero de 2027/)).toHaveValue(
    /aproximadas/,
  );
  await porSesion.getByLabel('Título', { exact: true }).fill('Sinsonte');
  await porSesion.getByLabel('Autor o autora').fill('Walter Tevis');
  await porSesion.getByLabel('Año de publicación').fill('1980');
  await sinErroresAxe(page);
  await porSesion.getByRole('button', { name: 'Recomendar', exact: true }).click();
  await expect(page.getByText(/«Sinsonte» sale ya recomendada para Enero de 2027/)).toBeVisible();

  const tintero = page.getByRole('region', { name: 'Lecturas pendientes' });
  await tintero.getByLabel('Recomendar una lectura del tintero').selectOption('t1');
  await tintero.getByRole('button', { name: 'Recomendar', exact: true }).click();
  await expect(page.getByText(/«Betty» aparece ahora/)).toBeVisible();
});

test('back: la vista Votación muestra resultados y deja elegir la ganadora', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await irA(page, 'Votación');
  await expect(page.getByRole('heading', { name: 'Votación final · Enero de 2027' })).toBeVisible();
  await expect(page.getByText('Abierta', { exact: true })).toBeVisible();
  await expect(page.getByText('2 votos · 100 %')).toBeVisible();
  await expect(page.getByText('2018 · 400 págs.')).toBeVisible();
  await expect(page.getByText('Ana García, Luis Pérez')).toBeVisible();
  await sinErroresAxe(page);

  // Pegar el mensaje de WhatsApp: añade todas las candidatas con sus detalles.
  await page
    .getByLabel(/Pega aquí el mensaje/)
    .fill(
      '1. Crimen y castigo, de Fiódor Dostoievski (1866) - 832 págs. aprox.\nRaskólnikov…\n2. Rojo y negro, de Stendhal (1830)\nNOTA 1: Páginas aproximadas.',
    );
  await page.getByRole('button', { name: 'Leer el mensaje' }).click();
  await expect(page.getByText('2 libros y notas de la sesión:')).toBeVisible();
  await page.getByRole('button', { name: 'Añadir todas a la votación' }).click();
  await expect(page.getByText(/2 candidatas añadidas/)).toBeVisible();

  // Votaciones archivadas.
  const archivadas = page.getByRole('region', { name: 'Votaciones archivadas' });
  await expect(archivadas).toContainText('Septiembre de 2026');
  await page.getByRole('button', { name: 'Archivar votación' }).click();
  await expect(page.getByText('Votación de enero de 2027 archivada.')).toBeVisible();
  await page.getByRole('button', { name: 'Elegir «Circe» como próxima lectura' }).click();
  const hoja = page.getByRole('dialog', { name: 'Nueva lectura' });
  await expect(hoja.getByLabel(/^Título/)).toHaveValue('Circe');
  await expect(hoja.getByLabel('Estado')).toHaveValue('proximo');
});

test('propuestas: con la votación abierta, el club marca varias candidatas', async ({ page }) => {
  // Las rutas añadidas después ganan a las de fixtures.ts.
  await simularAppsScript(page, { votacionAbierta: true });
  await page.addInitScript(() => window.localStorage.setItem('club:codigo-propuestas', 'e2e'));
  await page.goto('/lecturas/');
  await page.getByRole('tab', { name: 'Propuestas' }).click();
  await expect(page.getByRole('heading', { name: 'Vota la próxima lectura' })).toBeVisible();
  // Con la lista del club, cada uno elige su nombre: el voto queda unido a su ficha.
  await page.getByLabel(/¿Quién eres\?/).selectOption({ label: 'Marta R. · Club 1' });
  await expect(page.getByLabel(/^Nombre/)).toHaveCount(0);
  await expect(page.getByText('2018 · 400 págs.')).toBeVisible();
  await expect(page.getByText(/dependen de la edición/)).toBeVisible();
  await page.getByRole('checkbox', { name: /Circe/ }).check();
  await page.getByRole('checkbox', { name: /Tea Rooms/ }).check();
  await expect(page.getByText('2 lecturas marcadas.')).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.getByRole('button', { name: 'Enviar mi voto' }).click();
  await expect(
    page.getByText(/¡Gracias, Marta! Tu voto para enero de 2027 está guardado/),
  ).toBeVisible();
});

test('back: el resumen filtra al pulsar las cifras y los nombres', async ({ page }) => {
  await conSesion(page);
  await page.goto('/back/');
  await irA(page, 'Propuestas');
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
  await irA(page, 'Archivo');
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
  await irA(page, 'Quién propone');
  await page.getByRole('button', { name: 'Eliminar la propuesta de Ana García' }).click();
  const confirmar = page.getByRole('dialog', { name: 'Eliminar propuesta' });
  await confirmar.getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText('Propuesta de Ana García eliminada.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ana García' })).toHaveCount(0);

  await irA(page, 'Votación');
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
  await irA(page, 'Valoraciones');
  await expect(page.getByRole('textbox', { name: 'Marta Ruiz' })).toHaveValue('8');
  await page.getByRole('textbox', { name: 'Luis Pérez' }).fill('7');
  await page.getByRole('button', { name: 'Guardar notas' }).click();
  await expect(page.getByText(/Notas guardadas: media 7,5/)).toBeVisible();
  await page.getByRole('tab', { name: 'Por libro' }).click();
  await expect(page.getByRole('heading', { name: 'Sinsonte' })).toBeVisible();
});
