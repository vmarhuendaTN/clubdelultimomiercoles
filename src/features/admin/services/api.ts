import { consultar, enviar, type Dependencias, type Resultado } from '@/lib/apps-script';
import type {
  Candidata,
  VotoFila,
  LecturaHoja,
  LibroTintero,
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

export type Diagnostico = { version: number; faltan: string[]; libros: string };

/** Solo administradoras: propiedades que faltan y si Google Libros responde. */
export const diagnostico = (sesion: string, deps?: Dependencias) =>
  consultar<Diagnostico>('diagnostico', { sesion }, deps);
