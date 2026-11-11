/**
 * API de servidor de la feature (solo build y scripts; usa node:fs y node:crypto).
 * Los componentes cliente importan de '@/features/books'.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { site } from '@/config/site';
import { calendarioIcs } from './services/calendario';
import { eventosDeLectura } from './services/evento-sesion';
import type { Lectura } from './types';

let cache: Lectura[] | undefined;

/** Lecturas públicas generadas por `scripts/build-books.ts` (vacío si aún no existen). */
export function getLecturas(): Lectura[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(
      readFileSync(path.join(process.cwd(), 'src/generated/lecturas.json'), 'utf8'),
    ) as Lectura[];
  } catch {
    cache = [];
  }
  return cache;
}

export function getLectura(slug: string): Lectura | undefined {
  return getLecturas().find((l) => l.slug === slug);
}

/**
 * Calendario .ics con las quedadas del club (próxima y pasadas con fecha), de los dos clubs o de
 * uno. Cada quedada se identifica por su fecha y club: si cambia el libro, el evento se
 * actualiza en quien esté suscrito.
 */
export function calendarioDelClub(club?: '1' | '2', ahora = new Date()): string {
  const eventos = getLecturas()
    .filter((l) => l.estado === 'proximo' || l.estado === 'leido')
    .flatMap((l) => eventosDeLectura(l, club))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const nombre = club ? `${site.nombre} · Club ${club}` : site.nombre;
  return calendarioIcs(eventos, {
    nombre,
    zona: site.sesion.zona,
    dominio: 'clubultimomiercoles.es',
    ahora,
  });
}

export { BookPage } from './components/BookPage';
export { LecturasPage } from './components/LecturasPage';
