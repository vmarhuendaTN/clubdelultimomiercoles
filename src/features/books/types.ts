export type EstadoLectura = 'leido' | 'proximo' | 'propuesta' | 'por_clasificar';

/** Datos de un libro que necesita la interfaz (subconjunto de la tabla `books`). */
export type Book = {
  slug: string;
  titulo: string;
  autor: string;
  anio?: number;
  paginas?: number;
  /** URL de la portada (Storage o Google según COVERS_MODE). Sin ella se muestra el placeholder. */
  portadaUrl?: string;
  /** LQIP en base64 generado en el sync. */
  portadaLqip?: string;
  colorDominante?: string;
  /** Idioma del título si no es español (atributo lang). */
  idioma?: string;
};
