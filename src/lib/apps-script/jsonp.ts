/** Respuesta cruda de Apps Script: siempre un objeto con `ok`. */
export type RespuestaCruda = { ok: boolean; error?: string; [clave: string]: unknown };

/** Carga una URL de Apps Script como <script> (JSONP) y resuelve con lo que devuelva. */
export type CargadorJsonp = (url: string, callbackNombre: string) => Promise<RespuestaCruda>;

const TIEMPO_MAXIMO_MS = 20000;

/**
 * JSONP: Apps Script redirige sus respuestas a otro dominio que no permite CORS desde GitHub Pages,
 * así que la respuesta se carga como <script>, que no está sujeto a CORS.
 */
export const cargarJsonp: CargadorJsonp = (url, callbackNombre) =>
  new Promise<RespuestaCruda>((resolver, rechazar) => {
    const ventana = window as unknown as Record<string, unknown>;
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

    ventana[callbackNombre] = (datos: RespuestaCruda) => {
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
