/** Normaliza un nombre de archivo: minúsculas, sin tildes ni espacios, con guiones. */
export function slugify(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Título legible a partir del nombre: "normas-del-club" → "Normas del club". */
export function tituloDesdeNombre(nombre: string): string {
  const limpio = nombre.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export const FECHA_SESION = /^\d{4}-\d{2}-\d{2}$/;
