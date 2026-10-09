const MAX_ALT = 150;

/** Texto alternativo desde el pie de foto, recortado a 150 caracteres (DISENO § 5). */
export function altDesdePie(pie: string | undefined, fecha: string): string {
  const limpio = (pie ?? '')
    .replace(/#[\p{L}\p{N}_]+/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) return `Publicación de Instagram del ${fecha}`;
  return limpio.length > MAX_ALT ? `${limpio.slice(0, MAX_ALT - 1).trimEnd()}…` : limpio;
}
