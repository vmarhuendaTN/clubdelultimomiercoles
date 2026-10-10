import { guardarPreferencia, leerPreferencia } from '@/lib/dom/preferencias';

/** Recuerda en este navegador el formulario ya desbloqueado, para no pedir el código cada vez. */
const CLAVE = 'club:formulario-propuestas';

export const enlaceRecordado = () => leerPreferencia(CLAVE);
export const recordarEnlace = (enlace: string) => guardarPreferencia(CLAVE, enlace);

/** Enlace para abrir el formulario fuera de la web (sin el modo incrustado). */
export function enlaceSinIncrustar(enlace: string): string {
  const url = new URL(enlace);
  url.searchParams.delete('embedded');
  return url.toString();
}
