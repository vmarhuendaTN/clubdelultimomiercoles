import { consultar, enviar, type Dependencias, type Resultado } from '@/lib/apps-script';
import type {
  Candidata,
  Inscrita,
  InscritaBasica,
  LecturaValorable,
  Valoracion,
  SinInscribir,
  VotoFila,
  LecturaHoja,
  LibroTintero,
  Recomendacion,
  MiembroEquipo,
  Persona,
  Propuesta,
  UltimaPublicacion,
} from '../types';

/** Llamadas del panel a Apps Script. El script comprueba sesión y rol en cada una. */

export type Entrada = Persona & { sesion: string; caduca: number };

export const entrar = (idToken: string, deps?: Dependencias) =>
  consultar<Entrada>('entrar', { idToken }, deps);

export const quienSoy = (sesion: string, deps?: Dependencias) =>
  consultar<Persona>('yo', { sesion }, deps);

export const salir = (sesion: string, deps?: Dependencias) =>
  consultar<object>('salir', { sesion }, deps);

export const listarLecturas = (sesion: string, deps?: Dependencias) =>
  consultar<{ lecturas: LecturaHoja[] }>('lecturas.listar', { sesion }, deps);

export type LecturaNueva = Omit<LecturaHoja, 'id' | 'actualizado_en' | 'actualizado_por'> & {
  id?: string;
};

export const guardarLectura = (sesion: string, lectura: LecturaNueva, deps?: Dependencias) =>
  enviar<{ lectura: LecturaHoja }>('lecturas.guardar', { sesion, datos: lectura }, deps);

export const listarTintero = (sesion: string, deps?: Dependencias) =>
  consultar<{ tintero: LibroTintero[] }>('tintero.listar', { sesion }, deps);

/** Añade una lectura al tintero. */
export const guardarEnTintero = (
  sesion: string,
  libro: { titulo: string; autor: string },
  deps?: Dependencias,
) => enviar<{ libro: LibroTintero }>('tintero.guardar', { sesion, datos: libro }, deps);

/** Solo administradoras: recomendar (o dejar de recomendar) una lectura del tintero. */
export const recomendarTintero = (
  sesion: string,
  id: string,
  recomendada: boolean,
  deps?: Dependencias,
) => enviar<object>('tintero.recomendar', { sesion, datos: { id, recomendada } }, deps);

/** Recomendaciones del club por sesión (salen en el formulario al elegir mes y año). */
export const listarRecomendaciones = (sesion: string, deps?: Dependencias) =>
  consultar<{ recomendaciones: Recomendacion[] }>('recomendaciones.listar', { sesion }, deps);

/** Solo administradoras: recomienda una lectura para una sesión («2027-01»). */
export const guardarRecomendacion = (
  sesion: string,
  datos: { sesion: string; titulo: string; autor: string },
  deps?: Dependencias,
) => enviar<{ recomendacion: Recomendacion }>('recomendaciones.guardar', { sesion, datos }, deps);

/** Solo administradoras: quita una recomendación. */
export const quitarRecomendacion = (sesion: string, id: string, deps?: Dependencias) =>
  enviar<object>('recomendaciones.quitar', { sesion, datos: { id } }, deps);

export const listarPropuestas = (sesion: string, deps?: Dependencias) =>
  consultar<{ propuestas: Propuesta[] }>('propuestas.listar', { sesion }, deps);

export const guardarPropuesta = (
  sesion: string,
  cambios: Pick<Propuesta, 'id' | 'estado' | 'nota_equipo'>,
  deps?: Dependencias,
) => enviar<{ propuesta: Propuesta }>('propuestas.guardar', { sesion, datos: cambios }, deps);

export const listarEquipo = (sesion: string, deps?: Dependencias) =>
  consultar<{ equipo: MiembroEquipo[] }>('equipo.listar', { sesion }, deps);

export const guardarEnEquipo = (sesion: string, miembro: MiembroEquipo, deps?: Dependencias) =>
  enviar<object>('equipo.guardar', { sesion, datos: miembro }, deps);

export const quitarDeEquipo = (sesion: string, email: string, deps?: Dependencias) =>
  enviar<object>('equipo.quitar', { sesion, datos: { email } }, deps);

export const estadoPublicacion = (sesion: string, deps?: Dependencias) =>
  consultar<{ configurado: boolean; ultima?: UltimaPublicacion | null }>(
    'publicar.estado',
    { sesion },
    deps,
  );

export const publicar = (sesion: string, deps?: Dependencias): Promise<Resultado<object>> =>
  enviar<object>('publicar', { sesion }, deps);

/** Votación final: candidatas y votos de todas las sesiones. */
export const listarVotacion = (sesion: string, deps?: Dependencias) =>
  consultar<{ candidatas: Candidata[]; votos: VotoFila[] }>('votacion.listar', { sesion }, deps);

/** Admin: añadir una candidata a la votación de una sesión («2027-01»). */
export const anadirCandidata = (
  sesion: string,
  datos: { sesion: string; titulo: string; autor: string },
  deps?: Dependencias,
) => enviar<{ candidata: Candidata }>('votacion.candidata', { sesion, datos }, deps);

/** Admin: quitar una candidata. */
export const quitarCandidata = (
  sesion: string,
  datos: { sesion: string; id: string },
  deps?: Dependencias,
) =>
  enviar<object>(
    'votacion.candidata',
    { sesion, datos: { sesion: datos.sesion, quitar: datos.id } },
    deps,
  );

/** Admin: abrir o cerrar la votación de una sesión. */
export const abrirVotacion = (
  sesion: string,
  datos: { sesion: string; abierta: boolean },
  deps?: Dependencias,
) => enviar<object>('votacion.abrir', { sesion, datos }, deps);

/** Admin: archivar (o recuperar) una sesión entera: propuestas y votación. */
export const archivarSesion = (
  sesion: string,
  datos: { sesion: string; archivar: boolean },
  deps?: Dependencias,
) => enviar<object>('sesion.archivar', { sesion, datos }, deps);

export const estadoScript = (deps?: Dependencias) =>
  consultar<{ version?: number }>('estado', {}, deps);

export type EstadoPublicacionDiag =
  | { estado: 'ok' | 'sin_token' }
  | { estado: 'token_no_vale' | 'github_no_responde'; codigo: number }
  | { estado: 'ultima_fallo'; url: string; creada_en: string };

export type Diagnostico = {
  version: number;
  /** Propiedades del script que faltan (solo los nombres). */
  faltan: string[];
  /** «ok» o el motivo por el que falla Google Libros. */
  libros: string;
  /** Desde la versión 14. */
  publicacion?: EstadoPublicacionDiag;
  /** Personas con envíos escritos a mano aún sin unir a su ficha (desde la versión 14). */
  sinVincular?: number;
};

export type Enlace = { nombre: string; url: string; descripcion: string };

/** Accesos directos de la pestaña Enlaces de la hoja (Drive, la propia hoja…). */
export const listarEnlaces = (sesion: string, deps?: Dependencias) =>
  consultar<{ enlaces: Enlace[] }>('enlaces.listar', { sesion }, deps);

/** Solo administradoras: propiedades que faltan y si Google Libros responde. */
export const diagnostico = (sesion: string, deps?: Dependencias) =>
  consultar<Diagnostico>('diagnostico', { sesion }, deps);

export const listarInscritas = (sesion: string, deps?: Dependencias) =>
  consultar<{ inscritas: Inscrita[]; sinInscribir: SinInscribir[] }>(
    'inscritas.listar',
    { sesion },
    deps,
  );

export type InscritaNueva = Pick<
  Inscrita,
  'nombre' | 'apellidos' | 'telefono' | 'email' | 'activa' | 'ajuste' | 'notas'
> & { id?: string; club: string };

/** Da de alta (sin id) o corrige a una inscrita. */
export const guardarInscrita = (sesion: string, inscrita: InscritaNueva, deps?: Dependencias) =>
  enviar<{ inscrita: Inscrita }>('inscritas.guardar', { sesion, datos: inscrita }, deps);

/** Borra una propuesta enviada por error. */
export const eliminarPropuesta = (sesion: string, id: string, deps?: Dependencias) =>
  enviar<object>('propuestas.eliminar', { sesion, datos: { id } }, deps);

/** Borra los votos indicados (todas las filas de cada voto_id). */
export const eliminarVotos = (sesion: string, votoIds: string[], deps?: Dependencias) =>
  enviar<{ borradas: number }>('votos.eliminar', { sesion, datos: { votoIds } }, deps);

export const listarValoraciones = (sesion: string, deps?: Dependencias) =>
  consultar<{
    valoraciones: Valoracion[];
    lecturas: LecturaValorable[];
    inscritas: InscritaBasica[];
  }>('valoraciones.listar', { sesion }, deps);

/** Guarda las notas de una lectura; con la nota vacía se borra la de esa persona. */
export const guardarValoraciones = (
  sesion: string,
  datos: { lectura_id: string; notas: { inscrita_id: string; nota: string }[] },
  deps?: Dependencias,
) => enviar<object>('valoraciones.guardar', { sesion, datos }, deps);

/** Une a una inscrita las propuestas y votos que alguien envió escribiendo su nombre a mano. */
export const vincularPersona = (
  sesion: string,
  datos: { nombre: string; apellidos: string; inscrita_id: string },
  deps?: Dependencias,
) => enviar<{ unidas: number }>('personas.vincular', { sesion, datos }, deps);
