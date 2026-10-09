import type { Book } from './types';

/** Texto alternativo de una portada (DISENO § 5): "Portada de Título, de Autor". */
export function coverAlt(book: Pick<Book, 'titulo' | 'autor'>): string {
  return `Portada de ${book.titulo}, de ${book.autor}`;
}

const VARIANTES = ['mostaza', 'naranja', 'granate', 'papel'] as const;

/** Variante de color estable para la portada ilustrada (siempre la misma para un título). */
export function varianteDePortada(titulo: string): (typeof VARIANTES)[number] {
  let h = 0;
  for (const c of titulo) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return VARIANTES[h % VARIANTES.length]!;
}

/** Ruta de la ficha del libro. */
export function bookHref(slug: string): string {
  return `/lecturas/${slug}/`;
}

const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Filtra por estado y por texto en título o autor (sin distinguir tildes ni mayúsculas). */
export function filtrarLecturas<T extends Pick<Book, 'titulo' | 'autor'> & { estado: string }>(
  lecturas: readonly T[],
  estado: string,
  busqueda: string,
): T[] {
  const q = normalizar(busqueda.trim());
  return lecturas.filter(
    (l) => l.estado === estado && (!q || normalizar(`${l.titulo} ${l.autor}`).includes(q)),
  );
}

/** Agrupa por año de sesión (más reciente primero). Sin fechas, un único grupo sin título. */
export function agruparPorAnio<T extends { fechaSesion?: string }>(
  lecturas: readonly T[],
): { anio?: string; lecturas: T[] }[] {
  if (!lecturas.some((l) => l.fechaSesion)) return [{ lecturas: [...lecturas] }];
  const grupos = new Map<string, T[]>();
  for (const l of lecturas) {
    const anio = l.fechaSesion?.slice(0, 4) ?? 'Sin fecha';
    grupos.set(anio, [...(grupos.get(anio) ?? []), l]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => (a === 'Sin fecha' ? 1 : b === 'Sin fecha' ? -1 : b.localeCompare(a)))
    .map(([anio, ls]) => ({ anio, lecturas: ls }));
}
