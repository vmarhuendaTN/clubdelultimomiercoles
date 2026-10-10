/**
 * Preferencias de este navegador (localStorage). Si el almacenamiento no está disponible
 * (modo privado, bloqueado…), no se recuerda nada y la web funciona igual.
 */
export function leerPreferencia(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function guardarPreferencia(clave: string, valor: string): void {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento: se volverá a preguntar.
  }
}
