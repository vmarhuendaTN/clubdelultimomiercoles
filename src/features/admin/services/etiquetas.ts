import type { EstadoLectura, EstadoPropuesta, Rol } from '../types';

export const ESTADOS_LECTURA: readonly { value: EstadoLectura; label: string }[] = [
  { value: 'proximo', label: 'Próxima lectura' },
  { value: 'leido', label: 'Leído' },
  { value: 'propuesta', label: 'Propuesta' },
  { value: 'por_clasificar', label: 'Por clasificar' },
];

export const ESTADOS_PROPUESTA: readonly { value: EstadoPropuesta; label: string }[] = [
  { value: 'nueva', label: 'Nueva' },
  { value: 'en_votacion', label: 'En votación' },
  { value: 'aceptada', label: 'Aceptada' },
  { value: 'descartada', label: 'Descartada' },
];

export const ROLES: readonly { value: Rol; label: string }[] = [
  { value: 'editora', label: 'Editora' },
  { value: 'admin', label: 'Administradora' },
];

export const etiqueta = <T extends string>(
  lista: readonly { value: T; label: string }[],
  valor: string,
): string => lista.find((o) => o.value === valor)?.label ?? valor;

/** «2026-11-25» → «25 nov 2026». Texto vacío si no es una fecha. */
export function fechaCorta(iso: string): string {
  const fecha = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(fecha)
    .replace('.', '');
}

/** Normaliza para buscar sin tildes ni mayúsculas. */
export const normalizar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
