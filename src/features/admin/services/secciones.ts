import type { IconName } from '@/components/ui';
import type { Rol } from '../types';

/** Secciones del panel, en un solo nivel. */
export type Seccion =
  | 'lecturas'
  | 'propuestas'
  | 'envios'
  | 'votacion'
  | 'tintero'
  | 'archivo'
  | 'inscritas'
  | 'valoraciones'
  | 'equipo';

export type DefSeccion = {
  id: Seccion;
  etiqueta: string;
  icono: IconName;
  /** Una línea bajo el título de la sección. */
  descripcion: string;
  /** Muestra el filtro de club. */
  conClub?: boolean;
  soloAdmin?: boolean;
};

export type GrupoSecciones = { titulo: string; secciones: DefSeccion[] };

export const GRUPOS: readonly GrupoSecciones[] = [
  {
    titulo: 'Web',
    secciones: [
      {
        id: 'lecturas',
        etiqueta: 'Lecturas',
        icono: 'libro',
        descripcion: 'Lo que sale en la web: leídas y próxima lectura.',
      },
    ],
  },
  {
    titulo: 'Elegir la próxima',
    secciones: [
      {
        id: 'propuestas',
        etiqueta: 'Propuestas',
        icono: 'documento',
        descripcion: 'Los libros más propuestos de la sesión.',
        conClub: true,
      },
      {
        id: 'envios',
        etiqueta: 'Quién propone',
        icono: 'ver',
        descripcion: 'Cada envío del formulario, con su estado.',
        conClub: true,
      },
      {
        id: 'votacion',
        etiqueta: 'Votación',
        icono: 'exito',
        descripcion: 'Candidatas, votación final y resultados.',
      },
      {
        id: 'tintero',
        etiqueta: 'Tintero',
        icono: 'editar',
        descripcion: 'Lecturas pendientes que salen en el formulario.',
      },
      {
        id: 'archivo',
        etiqueta: 'Archivo',
        icono: 'calendario',
        descripcion: 'Sesiones en curso y archivadas, por años.',
      },
    ],
  },
  {
    titulo: 'El club',
    secciones: [
      {
        id: 'inscritas',
        etiqueta: 'Inscritas',
        icono: 'club',
        descripcion: 'Personas del club, contacto y participaciones.',
        conClub: true,
      },
      {
        id: 'valoraciones',
        etiqueta: 'Valoraciones',
        icono: 'estrella',
        descripcion: 'Notas de 0 a 10 de cada lectura.',
        conClub: true,
      },
      {
        id: 'equipo',
        etiqueta: 'Equipo',
        icono: 'perfil',
        descripcion: 'Quién puede entrar a este panel.',
        soloAdmin: true,
      },
    ],
  },
];

/** Grupos visibles para un rol (las editoras no ven Equipo). */
export const gruposPara = (rol: Rol): GrupoSecciones[] =>
  GRUPOS.map((g) => ({
    ...g,
    secciones: g.secciones.filter((s) => !s.soloAdmin || rol === 'admin'),
  })).filter((g) => g.secciones.length > 0);

export const definicion = (id: Seccion): DefSeccion =>
  GRUPOS.flatMap((g) => g.secciones).find((s) => s.id === id) ?? GRUPOS[0]!.secciones[0]!;

export const esSeccion = (v: string | null): v is Seccion =>
  !!v && GRUPOS.some((g) => g.secciones.some((s) => s.id === v));
