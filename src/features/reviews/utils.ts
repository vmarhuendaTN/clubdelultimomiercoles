import type { Resumen } from './types';

/**
 * Nombre público que mostrará la base de datos (misma regla que `public.nombre_publico`):
 * «Victoria Marhuenda Isamat» → «Victoria M.». Solo para avisar antes de publicar.
 */
export function nombrePublico(nombreCompleto: string | undefined): string {
  const partes = (nombreCompleto ?? '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return 'Lector';
  if (partes.length === 1) return partes[0]!;
  return `${partes[0]} ${partes[1]!.charAt(0).toUpperCase()}.`;
}

const numero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

/** «4,3 · 7 valoraciones» */
export function textoResumen({ media, total }: Resumen): string {
  return `${numero.format(media)} · ${total === 1 ? '1 valoración' : `${total} valoraciones`}`;
}

export const MAX_OPINION = 2000;
