/** Recurso Volume de Google Books (solo los campos que usamos). */
export type ImageLinks = Partial<
  Record<'smallThumbnail' | 'thumbnail' | 'small' | 'medium' | 'large' | 'extraLarge', string>
>;

export type VolumeInfo = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
  pageCount?: number;
  categories?: string[];
  language?: string;
  imageLinks?: ImageLinks;
  canonicalVolumeLink?: string;
};

export type Volume = { id: string; volumeInfo: VolumeInfo };

export type VolumesResponse = { totalItems: number; items?: Volume[] };

/** Datos de entrada de una fila de la Sheet. */
export type BookQuery = {
  titulo: string;
  autor: string;
  isbn?: string;
  googleBooksId?: string;
};

/** Ficha resultante del enriquecimiento (GOOGLE-BOOKS § 5). */
export type BookData = {
  googleBooksId: string;
  tituloGoogle: string;
  subtitulo?: string;
  autor?: string;
  editorial?: string;
  anio?: number;
  descripcion: string[];
  isbn?: string;
  paginas?: number;
  categorias: string[];
  idioma?: string;
  enlaceGoogle?: string;
  portadaUrl?: string;
};

export type Candidate = {
  googleBooksId: string;
  titulo: string;
  autores: string[];
  editorial?: string;
  anio?: number;
  miniatura?: string;
  puntuacion: number;
};

export type EnrichResult = {
  data: BookData | null;
  puntuacion: number;
  revisar: boolean;
  /** Los 5 mejores candidatos (para /admin cuando hay que revisar). */
  candidatos: Candidate[];
  consultas: number;
};
