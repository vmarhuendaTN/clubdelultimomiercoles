/** Publicación de Instagram ya copiada a nuestro almacenamiento (las URL de Meta caducan). */
export type InstagramPost = {
  id: string;
  permalink: string;
  tipo: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  /** Imagen o miniatura del vídeo. */
  imagenUrl: string;
  pie?: string;
  /** ISO 8601 */
  publicadoEn: string;
};
