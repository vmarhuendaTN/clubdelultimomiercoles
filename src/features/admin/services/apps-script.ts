import { env } from '@/lib/env';

export type Rol = 'admin' | 'editora';

export type Persona = {
  email: string;
  nombre: string;
  rol: Rol;
};

export type ResultadoAcceso =
  | { ok: true; persona: Persona }
  | { ok: false; error: 'sin_configurar' | 'sesion_no_valida' | 'no_autorizado' | 'red' };

type RespuestaWhoami = {
  ok: boolean;
  email?: string;
  nombre?: string;
  rol?: string;
  error?: string;
};

/**
 * Pide a Apps Script quién es la persona con este token de Google.
 * El script vuelve a verificar el token y el rol en cada llamada: el navegador no decide nada.
 * Se envía como text/plain para evitar la preflight de CORS.
 */
export async function comprobarAcceso(
  idToken: string,
  fetchFn: typeof fetch = fetch,
): Promise<ResultadoAcceso> {
  if (!env.appsScriptUrl) return { ok: false, error: 'sin_configurar' };

  let datos: RespuestaWhoami;
  try {
    const res = await fetchFn(env.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ accion: 'whoami', idToken }),
    });
    datos = (await res.json()) as RespuestaWhoami;
  } catch {
    return { ok: false, error: 'red' };
  }

  if (!datos.ok) {
    return {
      ok: false,
      error: datos.error === 'no_autorizado' ? 'no_autorizado' : 'sesion_no_valida',
    };
  }
  if (!datos.email || (datos.rol !== 'admin' && datos.rol !== 'editora')) {
    return { ok: false, error: 'no_autorizado' };
  }
  return {
    ok: true,
    persona: { email: datos.email, nombre: datos.nombre ?? '', rol: datos.rol },
  };
}
