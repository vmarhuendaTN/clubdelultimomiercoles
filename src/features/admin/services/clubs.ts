import { site } from '@/config/site';

export type IdClub = (typeof site.clubs)[number]['id'];
/** Filtro de club: uno de los dos, o todos. */
export type FiltroClub = IdClub | '';

/** «Club 2», «2» o «club2» → «2». Vacío si no es ninguno de los clubs. */
export function clubDe(texto: string | undefined): FiltroClub {
  const m = /([12])/.exec(texto ?? '');
  return (m?.[1] as IdClub | undefined) ?? '';
}

export const nombreClub = (id: string | undefined) =>
  site.clubs.find((c) => c.id === clubDe(id))?.nombre ?? '';

/** Opciones para un desplegable de club. */
export const OPCIONES_CLUB = site.clubs.map((c) => ({ value: c.id, label: c.nombre }));
export const OPCIONES_FILTRO_CLUB = [{ value: '', label: 'Los dos clubs' }, ...OPCIONES_CLUB];

/** ¿Pasa el filtro? (sin filtro, todo pasa). */
export const enClub = (club: string | undefined, filtro: FiltroClub) =>
  !filtro || clubDe(club) === filtro;
