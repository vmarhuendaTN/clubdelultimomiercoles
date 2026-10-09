import { translateCategories } from './categories-es';
import { pickCoverUrl } from './cover';
import { sanitizeDescription } from './description';
import type { BookData, Candidate, Volume } from './types';

/** "Ana", "Luis", "Eva" → "Ana, Luis y Eva" */
export function joinAuthors(authors: readonly string[] = []): string | undefined {
  if (!authors.length) return undefined;
  if (authors.length === 1) return authors[0];
  return `${authors.slice(0, -1).join(', ')} y ${authors[authors.length - 1]}`;
}

export function yearOf(publishedDate: string | undefined): number | undefined {
  const m = /^(\d{4})/.exec(publishedDate ?? '');
  return m ? Number(m[1]) : undefined;
}

function isbnOf(volume: Volume): string | undefined {
  const ids = volume.volumeInfo.industryIdentifiers ?? [];
  return (ids.find((i) => i.type === 'ISBN_13') ?? ids.find((i) => i.type === 'ISBN_10'))
    ?.identifier;
}

/** Volume → ficha (GOOGLE-BOOKS § 5). */
export function mapVolume(volume: Volume): BookData {
  const info = volume.volumeInfo;
  return {
    googleBooksId: volume.id,
    tituloGoogle: info.title ?? '',
    subtitulo: info.subtitle,
    autor: joinAuthors(info.authors),
    editorial: info.publisher,
    anio: yearOf(info.publishedDate),
    descripcion: sanitizeDescription(info.description),
    isbn: isbnOf(volume),
    paginas: info.pageCount && info.pageCount > 0 ? info.pageCount : undefined,
    categorias: translateCategories(info.categories),
    idioma: info.language,
    enlaceGoogle: info.canonicalVolumeLink,
    portadaUrl: pickCoverUrl(info.imageLinks),
  };
}

export function toCandidate(volume: Volume, puntuacion: number): Candidate {
  const info = volume.volumeInfo;
  return {
    googleBooksId: volume.id,
    titulo: info.title ?? '',
    autores: info.authors ?? [],
    editorial: info.publisher,
    anio: yearOf(info.publishedDate),
    miniatura: pickCoverUrl(info.imageLinks),
    puntuacion,
  };
}
