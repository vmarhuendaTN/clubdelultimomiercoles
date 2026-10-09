export type Valoracion = {
  id: string;
  bookSlug: string;
  estrellas: number;
  opinion: string | null;
  /** «Nombre I.», calculado en la base de datos. */
  autorNombre: string;
  creadoEn: string;
  actualizadoEn: string;
};

export type Resumen = { media: number; total: number };
