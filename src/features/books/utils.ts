import type { Book } from './types';

/** Texto alternativo de una portada (DISENO § 5): "Portada de Título, de Autor". */
export function coverAlt(book: Pick<Book, 'titulo' | 'autor'>): string {
  return `Portada de ${book.titulo}, de ${book.autor}`;
}

/** Ruta de la ficha del libro. */
export function bookHref(slug: string): string {
  return `/lecturas/${slug}/`;
}
