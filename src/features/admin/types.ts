export type Rol = 'admin' | 'editora';

export type Persona = { email: string; nombre: string; rol: Rol };

export type EstadoLectura = 'leido' | 'proximo' | 'propuesta' | 'por_clasificar';

/** Fila de la pestaña Lecturas tal como la devuelve Apps Script (todo texto). */
export type LecturaHoja = {
  id: string;
  titulo: string;
  autor: string;
  estado: EstadoLectura;
  orden: string;
  fecha_sesion: string;
  isbn: string;
  google_books_id: string;
  portada_manual: string;
  descripcion_manual: string;
  nota_club: string;
  visible: string;
  revisar: string;
  actualizado_en?: string;
  actualizado_por?: string;
};

/** Fila de la pestaña Tintero: lecturas pendientes que salen en el formulario de propuestas. */
export type LibroTintero = {
  id: string;
  titulo: string;
  autor: string;
  /** «si» si una administradora la recomienda en el formulario. */
  recomendada: string;
  visible: string;
  nota: string;
};

export type EstadoPropuesta = 'nueva' | 'en_votacion' | 'aceptada' | 'descartada';

/** Fila de la pestaña Propuestas: mismas preguntas que el antiguo Google Form. */
export type Propuesta = {
  id: string;
  creado_en: string;
  nombre: string;
  apellidos: string;
  grupo: string;
  mes: string;
  anio: string;
  lectura_1: string;
  lectura_2: string;
  lectura_3: string;
  tintero: string;
  motivo: string;
  estado: EstadoPropuesta;
  nota_equipo: string;
  /** «si» cuando la sesión está archivada. */
  archivada?: string;
};

export type MiembroEquipo = { email: string; nombre: string; rol: Rol };

export type UltimaPublicacion = {
  estado: string;
  resultado: string | null;
  creada_en: string;
  url: string;
};

/** Candidata de la votación final de una sesión (pestaña Votacion). */
export type Candidata = {
  id: string;
  sesion: string;
  titulo: string;
  autor: string;
  abierta: string;
  /** «si» cuando la sesión está archivada. */
  archivada?: string;
};

/** Una candidata puntuada en un voto (pestaña Votos). */
export type VotoFila = {
  id: string;
  creado_en: string;
  sesion: string;
  nombre: string;
  apellidos: string;
  candidata_id: string;
  puntos: string;
  voto_id: string;
};
