import { site } from '@/config/site';
import { env } from '@/lib/env';
import type { Lectura } from '../types';
import { bookHref } from '../utils';
import type { EventoSesion } from './calendario';

/** Dirección completa del lugar de las sesiones. */
export const lugarSesion = () => `${site.lugar.nombre}, ${site.lugar.direccion}`;

/** URL pública del calendario al que se suscribe la gente. */
export const urlCalendario = () => `${env.siteUrl}/calendario.ics`;

/** Evento de la sesión de una lectura (si tiene fecha). */
export function eventoDeLectura(
  lectura: Pick<Lectura, 'slug' | 'titulo' | 'autor' | 'fechaSesion'>,
): EventoSesion | null {
  if (!lectura.fechaSesion || !/^\d{4}-\d{2}-\d{2}$/.test(lectura.fechaSesion)) return null;
  const url = `${env.siteUrl}${bookHref(lectura.slug)}`;
  return {
    fecha: lectura.fechaSesion,
    hora: site.sesion.hora,
    duracionMin: site.sesion.duracionMin,
    titulo: `${site.nombre}: ${lectura.titulo}`,
    descripcion: `Sesión del club de lectura. Lectura: ${lectura.titulo}, de ${lectura.autor}.\nFicha: ${url}`,
    lugar: lugarSesion(),
    url,
  };
}
