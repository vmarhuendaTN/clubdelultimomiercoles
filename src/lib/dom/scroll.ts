/** ¿Ha pedido la persona menos movimiento en su sistema? */
export function prefiereMenosMovimiento(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Vuelve al principio de la página y deja el foco en el contenido principal,
 * para que quien navega con teclado o lector de pantalla también «suba».
 */
export function volverArriba(destinoId: string): void {
  window.scrollTo({ top: 0, behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth' });
  document.getElementById(destinoId)?.focus({ preventScroll: true });
}
