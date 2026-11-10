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

/** Carga una respuesta de Apps Script mediante JSONP. Resuelve con los datos o rechaza. */
export type CargadorJsonp = (url: string, callbackNombre: string) => Promise<RespuestaWhoami>;

const TIEMPO_MAXIMO_MS = 15000;

type VentanaConCallbacks = Record<string, unknown>;

/**
 * JSONP: Apps Script redirige sus respuestas a otro dominio que no permite CORS desde GitHub Pages,
 * así que la respuesta se carga como <script>, que no está sujeto a CORS.
 */
export const cargarJsonp: CargadorJsonp = (url, callbackNombre) =>
  new Promise<RespuestaWhoami>((resolver, rechazar) => {
    const ventana = window as unknown as VentanaConCallbacks;
    const script = document.createElement('script');

    const limpiar = () => {
      window.clearTimeout(temporizador);
      script.remove();
      delete ventana[callbackNombre];
    };
    const temporizador = window.setTimeout(() => {
      limpiar();
      rechazar(new Error('tiempo_agotado'));
    }, TIEMPO_MAXIMO_MS);

    ventana[callbackNombre] = (datos: RespuestaWhoami) => {
      limpiar();
      resolver(datos);
    };
    script.src = url;
    script.async = true;
    script.onerror = () => {
      limpiar();
      rechazar(new Error('red'));
    };
    document.head.appendChild(script);
  });

/**
 * Pide a Apps Script quién es la persona con este token de Google.
 * El script vuelve a verificar el token y el rol en cada llamada: el navegador no decide nada.
 */
export async function comprobarAcceso(
  idToken: string,
  cargar: CargadorJsonp = cargarJsonp,
): Promise<ResultadoAcceso> {
  if (!env.appsScriptUrl) return { ok: false, error: 'sin_configurar' };

  const callbackNombre = `clubWhoami_${Math.random().toString(36).slice(2)}`;
  const url =
    `${env.appsScriptUrl}?accion=whoami&callback=${callbackNombre}` +
    `&idToken=${encodeURIComponent(idToken)}`;

  let datos: RespuestaWhoami;
  try {
    datos = await cargar(url, callbackNombre);
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
