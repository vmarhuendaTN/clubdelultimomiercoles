import { site } from '@/config/site';
import { env } from '@/lib/env';
import type { Lectura } from '../types';
import { bookHref } from '../utils';
import type { EventoSesion } from './calendario';

type Club = (typeof site.clubs)[number];
type ConFechas = Pick<Lectura, 'slug' | 'titulo' | 'autor' | 'fechaSesion' | 'fechaSesion2'>;

/** Una quedada de una lectura: de un club concreto o, si solo hay una fecha, de todo el club. */
export type Quedada = { fecha: string; club?: Club };

/** Dirección completa del lugar de las sesiones. */
export const lugarSesion = () => `${site.lugar.nombre}, ${site.lugar.direccion}`;

/** URL pública del calendario (de los dos clubs o de uno). */
export const urlCalendario = (club?: Club['id']) =>
  `${env.siteUrl}/${club ? `calendario-club-${club}` : 'calendario'}.ics`;

const esFecha = (f?: string): f is string => !!f && /^\d{4}-\d{2}-\d{2}$/.test(f);

/**
 * Quedadas de una lectura. Con las dos fechas, una por club (fechaSesion = Club 1,
 * fechaSesion2 = Club 2); con una sola, una quedada de todo el club.
 */
export function quedadasDe(l: Pick<Lectura, 'fechaSesion' | 'fechaSesion2'>): Quedada[] {
  const [club1, club2] = site.clubs;
  if (!esFecha(l.fechaSesion2)) return esFecha(l.fechaSesion) ? [{ fecha: l.fechaSesion }] : [];
  return [
    ...(esFecha(l.fechaSesion) ? [{ fecha: l.fechaSesion, club: club1 }] : []),
    { fecha: l.fechaSesion2, club: club2 },
  ];
}

/** Evento de calendario de una quedada. */
export function eventoDeQuedada(lectura: ConFechas, q: Quedada): EventoSesion {
  const url = `${env.siteUrl}${bookHref(lectura.slug)}`;
  return {
    fecha: q.fecha,
    uid: q.club ? `sesion-${q.fecha}-club${q.club.id}` : `sesion-${q.fecha}`,
    hora: site.sesion.hora,
    duracionMin: site.sesion.duracionMin,
    titulo: `${q.club ? `${q.club.nombre} · ` : ''}${site.nombre}: ${lectura.titulo}`,
    descripcion: `Sesión del club de lectura${q.club ? ` (${q.club.nombre})` : ''}. Lectura: ${lectura.titulo}, de ${lectura.autor}.\nFicha: ${url}`,
    lugar: lugarSesion(),
    url,
  };
}

/** Eventos de una lectura; con `club`, solo los de ese club (y los de todo el club). */
export function eventosDeLectura(lectura: ConFechas, club?: Club['id']): EventoSesion[] {
  return quedadasDe(lectura)
    .filter((q) => !club || !q.club || q.club.id === club)
    .map((q) => eventoDeQuedada(lectura, q));
}
