import { descriptionLength, sanitizeDescription } from './description';
import { authorMatches, normalizeText, titleSimilarity } from './normalize';
import type { BookQuery, Volume } from './types';

/** Umbrales (GOOGLE-BOOKS § 4). */
export const ACEPTADO = 70;
export const DUDOSO = 50;

const LIBROS_SOBRE_EL_LIBRO = [
  'resumen',
  'guia de lectura',
  'study guide',
  'summary',
  'edicion escolar',
  'cuaderno',
];

/** Puntuación de 0 a 100 de un candidato frente a la fila de la Sheet. */
export function scoreVolume(query: BookQuery, volume: Volume): number {
  const info = volume.volumeInfo;
  const titulo = [info.title, info.subtitle].filter(Boolean).join(' ');
  let puntos = Math.round(40 * titleSimilarity(query.titulo, info.title ?? ''));
  if (authorMatches(query.autor, info.authors)) puntos += 25;
  if (info.language === 'es') puntos += 10;
  if (info.imageLinks && Object.keys(info.imageLinks).length) puntos += 10;
  if (descriptionLength(sanitizeDescription(info.description)) > 200) puntos += 8;
  if (info.industryIdentifiers?.some((i) => i.type === 'ISBN_13')) puntos += 4;
  if ((info.pageCount ?? 0) > 0) puntos += 3;
  const tituloNorm = normalizeText(titulo);
  if (LIBROS_SOBRE_EL_LIBRO.some((p) => tituloNorm.includes(p))) puntos -= 40;
  return Math.max(0, Math.min(100, puntos));
}
