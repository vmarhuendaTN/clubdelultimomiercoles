import { borrarPreferencia, guardarPreferencia, leerPreferencia } from '@/lib/dom/preferencias';

/**
 * Acceso con Google sin ventana emergente: se va a Google en la misma pestaña y vuelve al
 * panel con el ID token en el `#hash` (flujo «implícito» de OpenID). Sirve para navegadores que
 * bloquean las ventanas emergentes del botón oficial (p. ej. Chrome en iPhone).
 */
const CLAVE_ESTADO = 'club:google-estado';

export function crearEstado(): string {
  return crypto.randomUUID();
}

export function urlDeAcceso(clientId: string, volverA: string, estado: string): string {
  const parametros = new URLSearchParams({
    client_id: clientId,
    redirect_uri: volverA,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: estado,
    state: estado,
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${parametros.toString()}`;
}

/** Guarda el estado y navega a Google. */
export function entrarPorRedireccion(clientId: string): void {
  const estado = crearEstado();
  guardarPreferencia(CLAVE_ESTADO, estado);
  const volverA = `${window.location.origin}${window.location.pathname}`;
  window.location.assign(urlDeAcceso(clientId, volverA, estado));
}

export type Retorno = { tipo: 'token'; idToken: string } | { tipo: 'error' } | null;

/** Interpreta el `#hash` al volver de Google. Devuelve null si no es una vuelta de Google. */
export function leerRetorno(hash: string, estadoGuardado: string | null): Retorno {
  const datos = new URLSearchParams(hash.replace(/^#/, ''));
  const idToken = datos.get('id_token');
  if (!idToken && !datos.get('error')) return null;
  if (!idToken || !estadoGuardado || datos.get('state') !== estadoGuardado)
    return { tipo: 'error' };
  return { tipo: 'token', idToken };
}

/** Lee la vuelta de Google de la URL actual, la limpia y borra el estado. */
export function recogerRetorno(): Retorno {
  const retorno = leerRetorno(window.location.hash, leerPreferencia(CLAVE_ESTADO));
  if (retorno) {
    borrarPreferencia(CLAVE_ESTADO);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  return retorno;
}
