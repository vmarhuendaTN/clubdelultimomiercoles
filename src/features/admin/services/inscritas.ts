import type { Inscrita, SinInscribir } from '../types';

export type FiltroInscritas = 'activas' | 'bajas' | 'sin_inscribir';

/** Texto sin tildes ni mayúsculas, para buscar. */
const plano = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const nombreCompleto = (p: { nombre: string; apellidos: string }) =>
  `${p.nombre} ${p.apellidos}`.trim();

export const participaciones = (p: { participaciones: string }) =>
  Number.parseInt(p.participaciones, 10) || 0;

export const estaActiva = (i: Inscrita) => i.activa !== 'no';

/** Más participaciones primero; a igualdad, por nombre. */
const orden = <T extends { nombre: string; apellidos: string; participaciones: string }>(
  a: T,
  b: T,
) =>
  participaciones(b) - participaciones(a) ||
  nombreCompleto(a).localeCompare(nombreCompleto(b), 'es');

export function resumenInscritas(inscritas: Inscrita[], sinInscribir: SinInscribir[]) {
  const activas = inscritas.filter(estaActiva);
  return {
    activas: activas.length,
    bajas: inscritas.length - activas.length,
    sinInscribir: sinInscribir.length,
    participaciones: activas.reduce((n, i) => n + participaciones(i), 0),
  };
}

/** Busca por nombre, apellidos, email o teléfono. */
export function filtrarInscritas(
  inscritas: Inscrita[],
  filtro: Exclude<FiltroInscritas, 'sin_inscribir'>,
  busqueda: string,
): Inscrita[] {
  const q = plano(busqueda);
  const qTelefono = busqueda.replace(/\D/g, '');
  return inscritas
    .filter((i) => (filtro === 'activas' ? estaActiva(i) : !estaActiva(i)))
    .filter(
      (i) =>
        !q ||
        plano(`${nombreCompleto(i)} ${i.email}`).includes(q) ||
        (qTelefono.length >= 3 && i.telefono.replace(/\D/g, '').includes(qTelefono)),
    )
    .sort(orden);
}

export function filtrarSinInscribir(lista: SinInscribir[], busqueda: string): SinInscribir[] {
  const q = plano(busqueda);
  return lista.filter((p) => !q || plano(nombreCompleto(p)).includes(q)).sort(orden);
}

/** «+34 600 11 22 33» → «+34600112233» para el enlace tel:. */
export const enlaceTelefono = (telefono: string) => `tel:${telefono.replace(/[^\d+]/g, '')}`;
