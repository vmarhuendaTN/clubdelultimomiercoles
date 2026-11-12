import { VERSION_SCRIPT, mensajeDeError, type Resultado } from '@/lib/apps-script';
import type { Diagnostico } from './api';
import type { Seccion } from './secciones';

export type EstadoComprobacion = 'ok' | 'aviso' | 'error' | 'cargando';

/** Una cosa que puede fallar, con qué pasa y cómo arreglarla. */
export type Comprobacion = {
  id: string;
  titulo: string;
  estado: EstadoComprobacion;
  detalle: string;
  /** Pasos para arreglarlo (si no está bien). */
  solucion?: string;
  enlace?: { texto: string; url: string };
  /** Sección del panel donde se arregla. */
  irA?: Seccion;
};

const CODE_GS =
  'https://github.com/vmarhuendaTN/clubdelultimomiercoles/raw/main/apps-script/Code.gs';
const PROPIEDADES =
  'Apps Script › Configuración del proyecto (rueda dentada) › Propiedades del script';

/** Qué deja de funcionar si falta cada propiedad del script. */
const SIN_PROPIEDAD: Record<string, { estado: 'error' | 'aviso'; efecto: string }> = {
  GOOGLE_CLIENT_ID: { estado: 'error', efecto: 'nadie del equipo puede entrar al panel' },
  CODIGO_CLUB: {
    estado: 'aviso',
    efecto: 'los formularios de propuestas y votación no piden código',
  },
  GOOGLE_BOOKS_API_KEY: { estado: 'error', efecto: 'el buscador de Google Libros no funciona' },
  GH_DISPATCH_TOKEN: {
    estado: 'aviso',
    efecto: '«Publicar ahora» no funciona (la web se publica sola cada noche)',
  },
};

type Entrada = {
  /** Respuesta de `estado` (null mientras carga). */
  estado: Resultado<{ version?: number }> | null;
  /** Respuesta de `diagnostico` (null mientras carga o si no se pidió). */
  diagnostico: Resultado<Diagnostico> | null;
};

/**
 * Todo lo que puede fallar en el panel y la web, en lenguaje llano y con la solución.
 * Puro: recibe lo que respondió el script y devuelve la lista (para el aviso y la sección Estado).
 */
export function comprobar({ estado, diagnostico }: Entrada): Comprobacion[] {
  if (!estado) {
    return [
      {
        id: 'conexion',
        titulo: 'Conexión con la hoja',
        estado: 'cargando',
        detalle: 'Comprobando…',
      },
    ];
  }
  if (!estado.ok) {
    return [
      {
        id: 'conexion',
        titulo: 'No hay conexión con el script de la hoja',
        estado: 'error',
        detalle: `${mensajeDeError(estado.error)} Sin script no se guarda ni se carga nada.`,
        solucion:
          'En Apps Script › Implementar › Gestionar implementaciones, la implementación debe ejecutarse como «Yo» con acceso «Cualquier persona». Si tienes varias cuentas de Google abiertas, prueba en una ventana privada.',
      },
    ];
  }

  const lista: Comprobacion[] = [
    {
      id: 'conexion',
      titulo: 'Conexión con la hoja',
      estado: 'ok',
      detalle: 'El script responde.',
    },
  ];
  const version = Number(estado.version ?? 0);
  lista.push(
    version >= VERSION_SCRIPT
      ? {
          id: 'version',
          titulo: 'Versión del script',
          estado: 'ok',
          detalle: `Versión ${version}.`,
        }
      : {
          id: 'version',
          titulo: 'El script de la hoja está desactualizado',
          estado: 'error',
          detalle: `La hoja tiene la versión ${version || 'antigua'} y la web necesita la ${VERSION_SCRIPT}. Lo nuevo (y a veces lo de siempre) puede fallar.`,
          solucion:
            'Copia el Code.gs del repositorio, pégalo entero en Extensiones › Apps Script y guarda. Luego Implementar › Gestionar implementaciones › lápiz › Versión: Nueva versión › Implementar.',
          enlace: { texto: 'Abrir Code.gs para copiarlo', url: CODE_GS },
        },
  );

  if (!diagnostico) {
    lista.push({
      id: 'diagnostico',
      titulo: 'Diagnóstico',
      estado: 'cargando',
      detalle: 'Comprobando…',
    });
    return lista;
  }
  if (!diagnostico.ok) {
    if (diagnostico.error !== 'accion_desconocida') {
      lista.push({
        id: 'diagnostico',
        titulo: 'No se ha podido revisar la configuración',
        estado: 'aviso',
        detalle: mensajeDeError(diagnostico.error, diagnostico.detalle),
      });
    }
    return lista;
  }

  const d = diagnostico;
  lista.push(
    d.faltan.length === 0
      ? { id: 'propiedades', titulo: 'Claves del script', estado: 'ok', detalle: 'Están todas.' }
      : {
          id: 'propiedades',
          titulo: `Faltan claves en el script: ${d.faltan.join(', ')}`,
          estado: d.faltan.some((f) => SIN_PROPIEDAD[f]?.estado === 'error') ? 'error' : 'aviso',
          detalle: d.faltan
            .map((f) => `Sin ${f}, ${SIN_PROPIEDAD[f]?.efecto ?? 'algo deja de funcionar'}.`)
            .join(' '),
          solucion: `Añádelas en ${PROPIEDADES} (nombre exacto y valor sin espacios ni comillas).`,
        },
  );

  lista.push(
    d.libros === 'ok'
      ? { id: 'libros', titulo: 'Google Libros', estado: 'ok', detalle: 'El buscador responde.' }
      : {
          id: 'libros',
          titulo: 'El buscador de Google Libros falla',
          estado: 'error',
          detalle: d.libros,
          solucion:
            'Mientras, al añadir una lectura escribe título y autor a mano. La clave está en GOOGLE_BOOKS_API_KEY.',
        },
  );

  const p = d.publicacion;
  if (p) {
    if (p.estado === 'ok') {
      lista.push({
        id: 'publicar',
        titulo: 'Publicar en la web',
        estado: 'ok',
        detalle: 'La última publicación salió bien.',
      });
    } else if (p.estado === 'ultima_fallo') {
      lista.push({
        id: 'publicar',
        titulo: 'La última publicación de la web falló',
        estado: 'error',
        detalle:
          'La web sigue con la versión anterior. Suele ser un dato mal escrito en la hoja (una fecha, una URL de portada) o un fallo pasajero.',
        solucion:
          'Abre el detalle, mira el primer error en rojo y corrige ese dato; luego «Publicar ahora». Si no lo ves claro, reenvía el enlace a quien mantiene la web.',
        enlace: { texto: 'Ver qué falló en GitHub', url: p.url },
      });
    } else if (p.estado === 'token_no_vale') {
      lista.push({
        id: 'publicar',
        titulo: 'El token de GitHub no vale o ha caducado',
        estado: 'error',
        detalle: '«Publicar ahora» no funciona; la web solo se publica sola cada noche.',
        solucion: `En GitHub › Settings › Developer settings › Fine-grained tokens crea uno nuevo solo para el repositorio, con Actions: Read and write, y ponlo en GH_DISPATCH_TOKEN (${PROPIEDADES}).`,
      });
    } else if (p.estado === 'github_no_responde') {
      lista.push({
        id: 'publicar',
        titulo: 'GitHub no responde ahora mismo',
        estado: 'aviso',
        detalle: `No se ha podido comprobar la publicación (código ${p.codigo}). Suele arreglarse solo.`,
      });
    }
  }

  if (d.sinVincular) {
    lista.push({
      id: 'vincular',
      titulo: `${d.sinVincular} ${d.sinVincular === 1 ? 'persona ha enviado' : 'personas han enviado'} cosas sin estar unidas a su ficha`,
      estado: 'aviso',
      detalle:
        'Escribieron su nombre a mano: sus propuestas y votos no cuentan en sus participaciones.',
      solucion: 'En Inscritas › Sin inscribir, pulsa «Sí, vincular» (o «Otra…» / «Inscribir»).',
      irA: 'inscritas',
    });
  }
  return lista;
}

/** Lo que hay que mirar: errores primero, luego avisos. */
export const problemas = (lista: Comprobacion[]) =>
  lista
    .filter((c) => c.estado === 'error' || c.estado === 'aviso')
    .sort((a, b) => (a.estado === b.estado ? 0 : a.estado === 'error' ? -1 : 1));
