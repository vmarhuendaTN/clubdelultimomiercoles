import { consultar, type Dependencias, type Resultado } from './client';

/** Libro encontrado en Google Books (a través de Apps Script, que guarda la clave). */
export type LibroEncontrado = {
  id: string;
  titulo: string;
  subtitulo: string;
  autores: string[];
  anio: string;
  isbn: string;
  portada: string;
  /** Desde la versión 16 del script. */
  paginas?: string;
  sinopsis?: string;
};

const ID = /^[A-Za-z0-9_-]{6,20}$/;

/**
 * Id de Google Books de una URL pegada, o '' si no es una. Vale para las de Google Libros
 * (`books.google.es/books?id=…`, `google.es/books/edition/Título/ID`, `…/books/about/…?id=…`)
 * y Google Play (`play.google.com/store/books/details?id=…`).
 */
export function idDeUrlGoogleBooks(texto: string): string {
  let url: URL;
  try {
    url = new URL(texto.trim());
  } catch {
    return '';
  }
  if (!/(^|\.)google\.[a-z.]+$/.test(url.hostname)) return '';
  const id = url.searchParams.get('id');
  if (id && ID.test(id)) return id;
  const edicion = /\/books\/edition\/[^/]*\/([A-Za-z0-9_-]{6,20})\/?$/.exec(url.pathname);
  return edicion?.[1] ?? '';
}

/** Busca por texto o, si se pega una URL de Google Libros, trae ese libro exacto. */
export function buscarLibros(
  texto: string,
  deps?: Dependencias,
): Promise<Resultado<{ libros: LibroEncontrado[] }>> {
  const id = idDeUrlGoogleBooks(texto);
  if (id) return consultar('libros.ficha', { id }, deps);
  return consultar('libros.buscar', { q: texto.trim() }, deps);
}
