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

/** Lectura del club: libro + datos de la Sheet + ficha de Google Books. */
export type Lectura = Book & {
  estado: Exclude<EstadoLectura, 'por_clasificar'>;
  orden?: number;
  /** AAAA-MM-DD */
  fechaSesion?: string;
  notaClub?: string;
  subtitulo?: string;
  editorial?: string;
  isbn?: string;
  categorias: string[];
  /** Sinopsis en párrafos de texto plano (vacía si no hay: no se inventa). */
  descripcion: string[];
  enlaceGoogle?: string;
};
