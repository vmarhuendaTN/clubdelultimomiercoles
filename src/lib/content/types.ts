/** Manifiesto del contenido subido por GitHub (lo genera scripts/build-content.ts). */
export type Documento = {
  titulo: string;
  /** Ruta pública relativa al basePath: /generated/documentos/normas-del-club.pdf */
  url: string;
  bytes: number;
};

export type Foto = {
  url: string;
  miniatura: string;
  ancho: number;
  alto: number;
};

export type SesionFotos = {
  /** AAAA-MM-DD */
  fecha: string;
  fotos: Foto[];
};

export type PortadaManual = {
  slug: string;
  url: string;
  lqip: string;
  colorDominante: string;
};

export type ContenidoManifest = {
  documentos: Documento[];
  sesiones: SesionFotos[];
  portadas: PortadaManual[];
};

export const MANIFEST_VACIO: ContenidoManifest = { documentos: [], sesiones: [], portadas: [] };
