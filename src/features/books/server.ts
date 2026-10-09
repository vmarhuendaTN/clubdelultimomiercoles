/**
 * API de servidor de la feature (solo build y scripts; usa node:fs y node:crypto).
 * Los componentes cliente importan de '@/features/books'.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
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

export { BookPage } from './components/BookPage';
export { LecturasPage } from './components/LecturasPage';
