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

/** Este año y el siguiente (en diciembre se proponen lecturas de enero). */
export function aniosPosibles(hoy: Date = new Date()): string[] {
  const anio = hoy.getFullYear();
  return [String(anio), String(anio + 1)];
}
