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
};

export function buscarLibros(
  texto: string,
  deps?: Dependencias,
): Promise<Resultado<{ libros: LibroEncontrado[] }>> {
  return consultar('libros.buscar', { q: texto.trim() }, deps);
}
