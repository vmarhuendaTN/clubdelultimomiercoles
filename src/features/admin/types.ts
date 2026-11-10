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
  /** «si» si una administradora la recomienda en el formulario de propuestas. */
  recomendada?: string;
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
};

export type MiembroEquipo = { email: string; nombre: string; rol: Rol };

export type UltimaPublicacion = {
  estado: string;
  resultado: string | null;
  creada_en: string;
  url: string;
};
