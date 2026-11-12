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
  nombre: 'Ana',
  apellidos: 'García',
  grupo: 'Club 1',
  mes: 'enero',
  anio: '2027',
  lectura_1: 'Tea Rooms, Luisa Carnés',
  lectura_2: 'Circe, Madeline Miller',
  lectura_3: 'Piranesi, Susanna Clarke',
  tintero: '',
  motivo: 'Una novela de 1934 que merece más lectores.',
  estado: 'nueva',
  nota_equipo: '',
};

type Cuerpo = { accion: string; reqId: string; datos?: Record<string, unknown> };

const CANDIDATAS = [
  { id: 'c1', sesion: '2027-01', titulo: 'Circe', autor: 'Madeline Miller', abierta: 'si' },
  { id: 'c2', sesion: '2027-01', titulo: 'Tea Rooms', autor: 'Luisa Carnés', abierta: 'si' },
];
const VOTOS = [
  {
    id: 'v1',
    creado_en: '2026-12-01T10:00:00Z',
    sesion: '2027-01',
    nombre: 'Ana',
    apellidos: 'García',
    candidata_id: 'c1',
    puntos: '5',
    voto_id: 'x1',
  },
  {
    id: 'v2',
    creado_en: '2026-12-01T10:00:00Z',
    sesion: '2027-01',
    nombre: 'Ana',
    apellidos: 'García',
    candidata_id: 'c2',
    puntos: '3',
    voto_id: 'x1',
  },
  {
    id: 'v3',
    creado_en: '2026-12-02T10:00:00Z',
    sesion: '2027-01',
    nombre: 'Luis',
    apellidos: 'Pérez',
    candidata_id: 'c1',
    puntos: '4',
    voto_id: 'x2',
  },
];

export type OpcionesFalso = { votacionAbierta?: boolean };

function responder(
  accion: string,
  datos?: Record<string, unknown>,
  parametros?: URLSearchParams,
  opciones: OpcionesFalso = {},
): unknown {
  switch (accion) {
    case 'votacion.publica':
      return opciones.votacionAbierta
        ? {
            ok: true,
            abierta: true,
            sesion: '2027-01',
            candidatas: CANDIDATAS.map(({ id, titulo, autor }) => ({ id, titulo, autor })),
          }
        : { ok: true, abierta: false };
    case 'votacion.listar':
      return { ok: true, candidatas: CANDIDATAS, votos: VOTOS };
    case 'sesion.archivar':
    case 'votacion.votar':
    case 'votacion.candidata':
    case 'votacion.abrir':
      return { ok: true };
    case 'personas.lista':
      return {
        ok: true,
        personas: [
          { id: 'i1', nombre: 'Marta R.', club: '1' },
          { id: 'i2', nombre: 'Luis P.', club: '2' },
        ],
      };
    case 'personas.vincular':
      return { ok: true, unidas: 1 };
    case 'codigo.comprobar':
      return parametros?.get('codigo') === 'no-es-el-codigo'
        ? { ok: false, error: 'codigo_incorrecto' }
        : { ok: true };
    case 'yo':
      return { ok: true, ...PERSONA };
    case 'lecturas.listar':
      return { ok: true, lecturas: [LECTURA] };
    case 'lecturas.guardar':
      return { ok: true, lectura: { ...LECTURA, ...datos, id: (datos?.id as string) || 'l2' } };
    case 'propuestas.listar':
      return {
        ok: true,
        propuestas: [
          PROPUESTA,
          {
            ...PROPUESTA,
            id: 'p2',
            nombre: 'Luis',
            apellidos: 'Pérez',
            lectura_1: 'Circe',
            lectura_2: 'Maniac, Benjamín Labatut',
            lectura_3: 'Tea Rooms',
            tintero: 'Betty, Tiffany McDaniel',
          },
          {
            ...PROPUESTA,
            id: 'p3',
            nombre: 'Marta',
            apellidos: 'Ruiz',
            mes: 'noviembre',
            anio: '2026',
            lectura_1: 'Maniac',
            estado: 'descartada',
            archivada: 'si',
          },
        ],
      };
    case 'tintero.listar':
      return {
        ok: true,
        tintero: [
          {
            id: 't1',
            titulo: 'Betty',
            autor: 'Tiffany McDaniel',
            recomendada: '',
            visible: 'si',
            nota: '',
          },
          {
            id: 'r1',
            titulo: 'Circe',
            autor: 'Madeline Miller',
            recomendada: 'si',
            visible: 'si',
            nota: '',
          },
        ],
      };
    case 'tintero.guardar':
      return { ok: true, libro: { ...datos, id: 't9', recomendada: '', visible: 'si', nota: '' } };
    case 'propuestas.opciones':
      return {
        ok: true,
        recomendadas: [{ id: 'r1', titulo: 'Circe', autor: 'Madeline Miller' }],
        tintero: [
          { id: 't1', titulo: 'Betty', autor: 'Tiffany McDaniel' },
          { id: 't2', titulo: 'Maniac', autor: 'Benjamín Labatut' },
        ],
      };
    case 'tintero.recomendar':
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
    case 'estado':
      return { ok: true, servicio: 'club-ultimo-miercoles', version: 13 };
    case 'diagnostico':
      return { ok: true, version: 13, faltan: [], libros: 'ok' };
    case 'inscritas.listar':
      return {
        ok: true,
        inscritas: [
          {
            id: 'i1',
            nombre: 'Marta',
            apellidos: 'Ruiz',
            telefono: '+34 600 00 00 00',
            email: 'marta@example.com',
            alta: '2026-11-11',
            activa: 'si',
            participaciones_auto: '2',
            ajuste: '1',
            participaciones: '3',
            notas: '',
            club: '1',
          },
        ],
        sinInscribir: [
          { nombre: 'Ana', apellidos: 'García', participaciones: '1', club: '1' },
          {
            nombre: 'marta',
            apellidos: 'ruis',
            participaciones: '1',
            club: '1',
            sugerida_id: 'i1',
            sugerida_nombre: 'Marta Ruiz',
          },
        ],
      };
    case 'valoraciones.listar':
      return {
        ok: true,
        lecturas: [
          {
            id: 'l1',
            titulo: 'Sinsonte',
            autor: 'Walter Tevis',
            estado: 'leido',
            fecha_sesion: '2026-10-28',
            orden: '25',
          },
        ],
        inscritas: [
          { id: 'i1', nombre: 'Marta', apellidos: 'Ruiz', activa: 'si', club: '1' },
          { id: 'i2', nombre: 'Luis', apellidos: 'Pérez', activa: 'si', club: '2' },
        ],
        valoraciones: [
          {
            id: 'v1',
            creado_en: '',
            lectura_id: 'l1',
            titulo: 'Sinsonte',
            autor: 'Walter Tevis',
            inscrita_id: 'i1',
            nombre: 'Marta',
            apellidos: 'Ruiz',
            nota: '8',
          },
        ],
      };
    case 'valoraciones.guardar':
    case 'propuestas.eliminar':
    case 'votos.eliminar':
    case 'inscritas.guardar':
      return { ok: true };
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

export async function simularAppsScript(page: Page, opciones: OpcionesFalso = {}) {
  const resultados = new Map<string, unknown>();
  // El SDK de Google no se carga en los tests.
  await page.route('https://accounts.google.com/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  );
  await page.route('https://e2e.script.test/**', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      const cuerpo = JSON.parse(req.postData() ?? '{}') as Cuerpo;
      resultados.set(cuerpo.reqId, responder(cuerpo.accion, cuerpo.datos, undefined, opciones));
      await route.fulfill({ body: '{"ok":true}' });
      return;
    }
    const url = new URL(req.url());
    const accion = url.searchParams.get('accion') ?? '';
    const callback = url.searchParams.get('callback') ?? 'cb';
    const datos =
      accion === 'resultado'
        ? (resultados.get(url.searchParams.get('reqId') ?? '') ?? { ok: false, error: 'pendiente' })
        : responder(accion, undefined, url.searchParams, opciones);
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
