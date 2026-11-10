import { consultar, type Dependencias } from '@/lib/apps-script';

/**
 * Pregunta al Apps Script si el código del club es correcto (propiedad CODIGO_CLUB).
 * Es la única comprobación: la misma que se hace al enviar la propuesta.
 */
export function comprobarCodigo(codigo: string, deps?: Dependencias) {
  return consultar<object>('codigo.comprobar', { codigo: codigo.trim() }, deps);
}
