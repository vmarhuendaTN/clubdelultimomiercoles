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
  /** Quedada del Club 2 (fecha_sesion es la del Club 1). */
  fecha_sesion_2?: string;
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

/** Fila de la pestaña Inscritas: personas del club (datos privados, solo en la hoja). */
export type Inscrita = {
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  /** Fecha de alta (AAAA-MM-DD). */
  alta: string;
  /** «no» si se ha dado de baja. */
  activa: string;
  /** Sesiones con propuesta (lo calcula el script). */
  participaciones_auto: string;
  /** Corrección manual de una administradora (puede ser negativa). */
  ajuste: string;
  /** participaciones_auto + ajuste. */
  participaciones: string;
  notas: string;
  actualizado_en?: string;
  /** Número de valoraciones y su media («7,8»): las calcula el script. */
  valoraciones?: string;
  media_valoraciones?: string;
  /** «1» o «2». */
  club?: string;
};

/** Alguien que ha enviado propuestas pero aún no está en Inscritas. */
export type SinInscribir = {
  nombre: string;
  apellidos: string;
  participaciones: string;
  /** Club que puso en su última propuesta. */
  club?: string;
  /** Inscrita con un nombre muy parecido (erratas, tildes, apellidos de más o de menos). */
  sugerida_id?: string;
  sugerida_nombre?: string;
};

/** Nota (0 a 10) que una inscrita da a una lectura en la sesión (pestaña Valoraciones). */
export type Valoracion = {
  id: string;
  creado_en: string;
  lectura_id: string;
  titulo: string;
  autor: string;
  inscrita_id: string;
  nombre: string;
  apellidos: string;
  /** «7,5». */
  nota: string;
  actualizado_en?: string;
  actualizado_por?: string;
  club?: string;
};

/** Lectura que se puede valorar (leída o próxima). */
export type LecturaValorable = Pick<
  LecturaHoja,
  'id' | 'titulo' | 'autor' | 'estado' | 'fecha_sesion' | 'fecha_sesion_2' | 'orden'
>;

export type InscritaBasica = Pick<Inscrita, 'id' | 'nombre' | 'apellidos' | 'activa' | 'club'>;
