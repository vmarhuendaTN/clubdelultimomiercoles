import { consultar, enviar, type Dependencias, type Resultado } from '@/lib/apps-script';
import type { LecturaHoja, MiembroEquipo, Persona, Propuesta, UltimaPublicacion } from '../types';

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

export type LecturaNueva = Omit<
  LecturaHoja,
  'id' | 'actualizado_en' | 'actualizado_por' | 'recomendada'
> & {
  id?: string;
};

export const guardarLectura = (sesion: string, lectura: LecturaNueva, deps?: Dependencias) =>
  enviar<{ lectura: LecturaHoja }>('lecturas.guardar', { sesion, datos: lectura }, deps);

/** Solo administradoras: recomendar (o dejar de recomendar) una lectura en el formulario. */
export const recomendarLectura = (
  sesion: string,
  id: string,
  recomendada: boolean,
  deps?: Dependencias,
) => enviar<object>('lecturas.recomendar', { sesion, datos: { id, recomendada } }, deps);

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
