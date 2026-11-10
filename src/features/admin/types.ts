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

export type EstadoPropuesta = 'nueva' | 'en_votacion' | 'aceptada' | 'descartada';

export type Propuesta = {
  id: string;
  creado_en: string;
  titulo: string;
  autor: string;
  propuesto_por: string;
  motivo: string;
  google_books_id: string;
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
