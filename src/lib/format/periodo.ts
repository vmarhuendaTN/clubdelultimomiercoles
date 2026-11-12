/** Meses y años que se pueden elegir en el formulario de propuestas («¿Para qué sesión?»). */
export const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/** Cuántos años se ofrecen (este y los siguientes): se calculan solos, no hay que tocarlos. */
export const ANIOS_VISIBLES = 10;

/** Este año y los nueve siguientes (en diciembre ya se proponen lecturas de enero). */
export function aniosPosibles(hoy: Date = new Date()): string[] {
  const anio = hoy.getFullYear();
  return Array.from({ length: ANIOS_VISIBLES }, (_, i) => String(anio + i));
}

/** «enero» + «2027» → «2027-01» (vacío si falta algo). */
export function claveSesion(mes: string, anio: string): string {
  const i = MESES.indexOf(mes as (typeof MESES)[number]);
  return i >= 0 && /^\d{4}$/.test(anio) ? `${anio}-${String(i + 1).padStart(2, '0')}` : '';
}
