import type { Page } from '@playwright/test';

/** Apps Script simulado para los e2e: responde JSONP y guarda los POST por reqId. */
export const PERSONA = { email: 'admin@example.com', nombre: 'Victoria', rol: 'admin' };

const LECTURA = {
  id: 'l1',
  titulo: 'Sinsonte',
  autor: 'Walter Tevis',
  estado: 'proximo',
  orden: '25',
  fecha_sesion: '2026-11-25',
  isbn: '',
  google_books_id: '',
  portada_manual: '',
  descripcion_manual: '',
  nota_club: '',
  visible: 'si',
  revisar: '',
};

const PROPUESTA = {
  id: 'p1',
  creado_en: '2026-11-01T10:00:00Z',
  titulo: 'Tea Rooms',
  autor: 'Luisa Carnés',
  propuesto_por: 'Ana',
  motivo: 'Una novela de 1934 que merece más lectores.',
  google_books_id: '',
  estado: 'nueva',
  nota_equipo: '',
};

type Cuerpo = { accion: string; reqId: string; datos?: Record<string, unknown> };

function responder(accion: string, datos?: Record<string, unknown>): unknown {
  switch (accion) {
    case 'yo':
      return { ok: true, ...PERSONA };
    case 'lecturas.listar':
      return { ok: true, lecturas: [LECTURA] };
    case 'lecturas.guardar':
      return { ok: true, lectura: { ...LECTURA, ...datos, id: (datos?.id as string) || 'l2' } };
    case 'propuestas.listar':
      return { ok: true, propuestas: [PROPUESTA] };
    case 'propuestas.guardar':
    case 'equipo.guardar':
    case 'equipo.quitar':
    case 'publicar':
    case 'propuesta.enviar':
      return { ok: true, id: 'x' };
    case 'equipo.listar':
      return {
        ok: true,
        equipo: [PERSONA, { email: 'ines@example.com', nombre: 'Inés', rol: 'editora' }],
      };
    case 'publicar.estado':
      return {
        ok: true,
        configurado: true,
        ultima: {
          estado: 'completed',
          resultado: 'success',
          creada_en: '2026-11-10T18:00:00Z',
          url: 'https://github.com/',
        },
      };
    case 'libros.buscar':
      return {
        ok: true,
        libros: [
          {
            id: 'gbPedroPar',
            titulo: 'Pedro Páramo',
            subtitulo: '',
            autores: ['Juan Rulfo'],
            anio: '1955',
            isbn: '9788437604183',
            portada: '',
          },
        ],
      };
    default:
      return { ok: false, error: 'accion_desconocida' };
  }
}

export async function simularAppsScript(page: Page) {
  const resultados = new Map<string, unknown>();
  // El SDK de Google no se carga en los tests.
  await page.route('https://accounts.google.com/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  );
  await page.route('https://e2e.script.test/**', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      const cuerpo = JSON.parse(req.postData() ?? '{}') as Cuerpo;
      resultados.set(cuerpo.reqId, responder(cuerpo.accion, cuerpo.datos));
      await route.fulfill({ body: '{"ok":true}' });
      return;
    }
    const url = new URL(req.url());
    const accion = url.searchParams.get('accion') ?? '';
    const callback = url.searchParams.get('callback') ?? 'cb';
    const datos =
      accion === 'resultado'
        ? (resultados.get(url.searchParams.get('reqId') ?? '') ?? { ok: false, error: 'pendiente' })
        : responder(accion);
    await route.fulfill({
      contentType: 'text/javascript',
      body: `${callback}(${JSON.stringify(datos)});`,
    });
  });
}

/** Deja una sesión del equipo guardada, como tras entrar con Google. */
export async function conSesion(page: Page) {
  await page.addInitScript((persona) => {
    window.localStorage.setItem(
      'club:sesion-equipo',
      JSON.stringify({
        sesion: 'sesion-e2e-0123456789abcdef0123456789abcdef0123',
        caduca: Date.now() + 3_600_000,
        persona,
      }),
    );
  }, PERSONA);
}
