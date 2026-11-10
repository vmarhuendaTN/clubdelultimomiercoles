import { consultar, type Dependencias } from '@/lib/apps-script';

/** Libro que se puede elegir en el formulario (de la pestaña Lecturas). */
export type LibroOpcion = { id: string; titulo: string; autor: string };

export type OpcionesPropuesta = { recomendadas: LibroOpcion[]; tintero: LibroOpcion[] };

/** Recomendadas por el club y lecturas del tintero, para el formulario de propuestas. */
export function cargarOpciones(deps?: Dependencias) {
  return consultar<OpcionesPropuesta>('propuestas.opciones', {}, deps);
}

/** Cómo se escribe un libro en la propuesta: «Título, Autor». */
export const textoLibro = (l: LibroOpcion) => (l.autor ? `${l.titulo}, ${l.autor}` : l.titulo);

const normalizar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** ¿Ya está escrito este libro en alguno de los textos? (por título, sin tildes) */
export function yaElegido(libro: LibroOpcion, textos: string[]): boolean {
  const titulo = normalizar(libro.titulo);
  return textos.some((t) => {
    const n = normalizar(t);
    return n === titulo || n.startsWith(`${titulo},`) || n === normalizar(textoLibro(libro));
  });
}
