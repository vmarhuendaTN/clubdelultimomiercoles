import { test as base, expect } from '@playwright/test';

/** Respuestas de Supabase para los tests (el build apunta a https://e2e.supabase.test). */
export const VALORACIONES = [
  {
    id: '1',
    book_slug: 'leviatan',
    estrellas: 5,
    opinion: 'De lo mejor que hemos leído.',
    autor_nombre: 'Ana G.',
    creado_en: '2025-02-01T10:00:00Z',
    actualizado_en: '2025-02-01T10:00:00Z',
  },
  {
    id: '2',
    book_slug: 'leviatan',
    estrellas: 4,
    opinion: null,
    autor_nombre: 'Luis',
    creado_en: '2025-02-02T10:00:00Z',
    actualizado_en: '2025-02-02T10:00:00Z',
  },
];

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://e2e.supabase.test/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith('/valoraciones_resumen')) {
        await route.fulfill({ json: [{ book_slug: 'leviatan', media: 4.5, total: 2 }] });
      } else if (url.pathname.endsWith('/valoraciones')) {
        const slug = url.searchParams.get('book_slug')?.replace('eq.', '');
        await route.fulfill({ json: VALORACIONES.filter((v) => v.book_slug === slug) });
      } else {
        await route.fulfill({ json: {} });
      }
    });
    await use(page);
  },
});

export { expect };
