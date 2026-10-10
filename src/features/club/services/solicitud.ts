/** Solicitud para entrar en el club. Se envía como email desde la aplicación de correo. */
export type Solicitud = {
  nombre: string;
  apellidos: string;
  telefono: string;
  descripcion: string;
  deParteDe: string;
};

export type ErroresSolicitud = Partial<Record<keyof Solicitud, string>>;

const MIN_DIGITOS_TELEFONO = 9;

export function validarSolicitud(s: Solicitud): ErroresSolicitud {
  const errores: ErroresSolicitud = {};
  if (!s.nombre.trim()) errores.nombre = 'Escribe tu nombre.';
  if (!s.apellidos.trim()) errores.apellidos = 'Escribe tus apellidos.';
  if (s.telefono.replace(/\D/g, '').length < MIN_DIGITOS_TELEFONO)
    errores.telefono = 'Escribe un teléfono de contacto válido.';
  if (!s.descripcion.trim()) errores.descripcion = 'Cuéntanos algo de ti.';
  return errores;
}

/** Enlace `mailto:` con el asunto y el cuerpo ya escritos. */
export function enlaceSolicitud(destino: string, s: Solicitud): string {
  const nombreCompleto = `${s.nombre.trim()} ${s.apellidos.trim()}`;
  const lineas = [
    `Nombre: ${nombreCompleto}`,
    `Teléfono: ${s.telefono.trim()}`,
    `De parte de: ${s.deParteDe.trim() || '—'}`,
    '',
    s.descripcion.trim(),
  ];
  const asunto = `Quiero ser del club: ${nombreCompleto}`;
  return `mailto:${destino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(lineas.join('\n'))}`;
}
