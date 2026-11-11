/** Desplazamiento (en minutos) de una zona horaria respecto a UTC en un instante dado. */
function desfase(instante: Date, zona: string): number {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(instante);
  const v = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  const comoUtc = Date.UTC(v('year'), v('month') - 1, v('day'), v('hour'), v('minute'));
  return Math.round((comoUtc - instante.getTime()) / 60000);
}

/** «2026-11-25» a las «19:30» en Madrid → instante exacto (con horario de verano o invierno). */
export function instanteSesion(fecha: string, hora: string, zona: string): Date | null {
  const f = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  const h = /^(\d{1,2}):(\d{2})$/.exec(hora);
  if (!f || !h) return null;
  const local = Date.UTC(Number(f[1]), Number(f[2]) - 1, Number(f[3]), Number(h[1]), Number(h[2]));
  // Dos pasadas: el desfase depende del propio instante (cambios de hora).
  let utc = local - desfase(new Date(local), zona) * 60000;
  utc = local - desfase(new Date(utc), zona) * 60000;
  return new Date(utc);
}

/** Fecha del calendario («2026-11-25») de un instante en una zona horaria. */
function diaEn(instante: Date, zona: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zona }).format(instante);
}

export type CuentaAtras =
  | { tipo: 'dias'; dias: number; horas: number }
  | { tipo: 'manana' }
  | { tipo: 'hoy'; horas: number; minutos: number }
  | { tipo: 'en_marcha' }
  | { tipo: 'pasada' };

/** Duración de una sesión: durante este rato se dice «está en marcha». */
const DURACION_MS = 2.5 * 3600 * 1000;

/** Cuánto falta para la sesión, en días de calendario de la zona del club. */
export function cuentaAtras(sesion: Date, ahora: Date, zona: string): CuentaAtras {
  const ms = sesion.getTime() - ahora.getTime();
  if (ms <= -DURACION_MS) return { tipo: 'pasada' };
  if (ms <= 0) return { tipo: 'en_marcha' };
  const diaSesion = Date.parse(`${diaEn(sesion, zona)}T00:00:00Z`);
  const diaHoy = Date.parse(`${diaEn(ahora, zona)}T00:00:00Z`);
  const dias = Math.round((diaSesion - diaHoy) / 86400000);
  if (dias === 0) {
    const minutosTotales = Math.ceil(ms / 60000);
    return { tipo: 'hoy', horas: Math.floor(minutosTotales / 60), minutos: minutosTotales % 60 };
  }
  if (dias === 1) return { tipo: 'manana' };
  return { tipo: 'dias', dias, horas: Math.floor((ms % 86400000) / 3600000) };
}
