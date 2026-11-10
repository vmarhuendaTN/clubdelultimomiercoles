import { env } from '@/lib/env';
import { cargarJsonp, type CargadorJsonp, type RespuestaCruda } from './jsonp';

/** Errores que conoce la web. Cualquier otro llega como `error_interno`. */
export type ErrorApi =
  | 'sin_configurar'
  | 'red'
  | 'sesion_no_valida'
  | 'no_autorizado'
  | 'datos_no_validos'
  | 'codigo_incorrecto'
  | 'demasiadas_peticiones'
  | 'no_encontrada'
  | 'google_no_responde'
  | 'github_rechaza'
  | 'ultima_admin'
  | 'no_puedes_quitarte'
  | 'accion_desconocida'
  | 'pendiente'
  | 'error_interno';

export type Resultado<T> = ({ ok: true } & T) | { ok: false; error: ErrorApi; detalle?: string };

const ERRORES = new Set<string>([
  'sin_configurar',
  'red',
  'sesion_no_valida',
  'no_autorizado',
  'datos_no_validos',
  'codigo_incorrecto',
  'demasiadas_peticiones',
  'no_encontrada',
  'google_no_responde',
  'github_rechaza',
  'ultima_admin',
  'no_puedes_quitarte',
  'accion_desconocida',
  'pendiente',
]);

export type Dependencias = {
  url?: string;
  cargar?: CargadorJsonp;
  enviarPost?: (url: string, cuerpo: string) => Promise<void>;
  esperar?: (ms: number) => Promise<void>;
};

const enviarPostNoCors = async (url: string, cuerpo: string) => {
  await fetch(url, { method: 'POST', mode: 'no-cors', body: cuerpo });
};
const esperarMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function normalizar<T>(datos: RespuestaCruda): Resultado<T> {
  if (datos.ok) return datos as { ok: true } & T;
  const error = ERRORES.has(String(datos.error)) ? (datos.error as ErrorApi) : 'error_interno';
  const detalle = typeof datos.detalle === 'string' ? datos.detalle : undefined;
  return { ok: false, error, detalle };
}

let contador = 0;

/** Lectura (GET por JSONP). Los parámetros van en la URL: solo datos cortos. */
export async function consultar<T>(
  accion: string,
  parametros: Record<string, string | undefined> = {},
  { url = env.appsScriptUrl, cargar = cargarJsonp }: Dependencias = {},
): Promise<Resultado<T>> {
  if (!url) return { ok: false, error: 'sin_configurar' };
  const callback = `clubApi_${Date.now().toString(36)}_${(contador++).toString(36)}`;
  const query = new URLSearchParams({ accion, callback });
  for (const [k, v] of Object.entries(parametros)) if (v) query.set(k, v);
  try {
    return normalizar<T>(await cargar(`${url}?${query.toString()}`, callback));
  } catch {
    return { ok: false, error: 'red' };
  }
}

/** Esperas antes de cada intento de recoger el resultado de una escritura. */
const ESPERAS_RESULTADO_MS = [0, 700, 1500, 3000];

/**
 * Escritura: POST «no-cors» (sin límite de tamaño, pero sin respuesta legible) y después se
 * recoge el resultado con el reqId por JSONP. Apps Script lo guarda unos minutos.
 */
export async function enviar<T>(
  accion: string,
  cuerpo: { sesion?: string; datos?: unknown },
  deps: Dependencias = {},
): Promise<Resultado<T>> {
  const { url = env.appsScriptUrl, enviarPost = enviarPostNoCors, esperar = esperarMs } = deps;
  if (!url) return { ok: false, error: 'sin_configurar' };
  const reqId = crypto.randomUUID();
  try {
    await enviarPost(url, JSON.stringify({ accion, reqId, ...cuerpo }));
  } catch {
    return { ok: false, error: 'red' };
  }
  for (const ms of ESPERAS_RESULTADO_MS) {
    if (ms) await esperar(ms);
    const r = await consultar<T>('resultado', { reqId }, deps);
    if (r.ok || r.error !== 'pendiente') return r;
  }
  return { ok: false, error: 'red' };
}
