import { mainSurname, titleTokens } from './normalize';
import type { BookQuery } from './types';

export type SearchAttempt = { q: string; langRestrict?: 'es' };

/** Intentos de búsqueda en orden (GOOGLE-BOOKS § 3). El volumen fijado va aparte. */
export function buildAttempts(query: BookQuery): SearchAttempt[] {
  const attempts: SearchAttempt[] = [];
  const isbn = query.isbn?.replace(/[^0-9Xx]/g, '');
  if (isbn) attempts.push({ q: `isbn:${isbn}` });

  const titulo = query.titulo.replace(/["“”]/g, '').trim();
  const apellido = mainSurname(query.autor);
  const exacta = `intitle:"${titulo}" inauthor:"${apellido}"`;
  attempts.push({ q: exacta, langRestrict: 'es' });

  const claves = titleTokens(titulo).join(' ');
  if (claves && claves !== titulo.toLowerCase()) {
    attempts.push({ q: `intitle:${claves} inauthor:${apellido}`, langRestrict: 'es' });
  }
  attempts.push({ q: exacta });
  return attempts;
}
