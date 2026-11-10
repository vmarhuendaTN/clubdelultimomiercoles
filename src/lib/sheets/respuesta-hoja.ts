import { validarFilasLecturas } from './lecturas-schema';

export type ResultadoHoja =
  | { tipo: 'script_antiguo' }
  /** Google devolvió una página (HTML) en vez del script: sin implementar, sin acceso público o con error. */
  | { tipo: 'no_disponible'; motivo: string }
  | { tipo: 'ok'; filas: Record<string, string>[]; errores: string[] };

/** Título de una página HTML de Google, para explicar qué ha pasado. */
function tituloHtml(texto: string): string {
  const titulo = /<title[^>]*>([^<]*)<\/title>/i.exec(texto)?.[1]?.trim();
  return titulo || texto.replace(/\s+/g, ' ').slice(0, 120);
}

/** Como `procesarRespuestaHoja`, pero desde el texto tal como llega por HTTP. */
export function procesarTextoHoja(texto: string): ResultadoHoja {
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    return { tipo: 'no_disponible', motivo: tituloHtml(texto) };
  }
  return procesarRespuestaHoja(json);
}

/**
 * Valida la respuesta de `?accion=publico`. Devuelve las filas tal cual (texto) para que
 * `pnpm books` las procese como las del CSV. Lanza un error si no se puede publicar.
 */
export function procesarRespuestaHoja(json: unknown): ResultadoHoja {
  if (!json || typeof json !== 'object') throw new Error('respuesta no válida');
  const r = json as { ok?: unknown; error?: unknown; lecturas?: unknown };
  if (r.ok !== true) throw new Error(`la hoja respondió con error: ${String(r.error)}`);
  if (r.lecturas === undefined) return { tipo: 'script_antiguo' };
  if (!Array.isArray(r.lecturas)) throw new Error('«lecturas» no es una lista');

  const filas = r.lecturas
    .filter((f): f is Record<string, unknown> => !!f && typeof f === 'object')
    .map((f) =>
      Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v == null ? '' : String(v)])),
    );
  const { filas: validas, errores } = validarFilasLecturas(filas);
  if (validas.length === 0) throw new Error('la pestaña Lecturas no tiene ninguna fila válida');
  return {
    tipo: 'ok',
    filas,
    errores: errores.map((e) => `fila ${e.fila}: ${e.mensaje}`),
  };
}
