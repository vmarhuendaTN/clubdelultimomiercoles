/**
 * Calendario de las sesiones del club en formato iCalendar (RFC 5545). Sin dependencias: lo usa
 * la ruta estática /calendario.ics (a la que se suscribe la gente) y los enlaces de la ficha.
 */

export type EventoSesion = {
  /** AAAA-MM-DD de la sesión: también es el identificador del evento, así que al cambiar el
   * libro de esa fecha, el evento se actualiza en los calendarios suscritos. */
  fecha: string;
  /** «19:30» (hora local de `zona`). */
  hora: string;
  duracionMin: number;
  titulo: string;
  descripcion: string;
  lugar: string;
  url?: string;
};

export type OpcionesCalendario = { nombre: string; zona: string; dominio: string; ahora?: Date };

const dos = (n: number) => String(n).padStart(2, '0');

/** «2026-11-25» + «19:30» → «20261125T193000» (hora local, sin zona). */
export function fechaLocal(fecha: string, hora: string, sumarMin = 0): string {
  const [a, m, d] = fecha.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  const t = new Date(Date.UTC(a ?? 0, (m ?? 1) - 1, d ?? 1, h ?? 0, (min ?? 0) + sumarMin));
  return (
    `${t.getUTCFullYear()}${dos(t.getUTCMonth() + 1)}${dos(t.getUTCDate())}` +
    `T${dos(t.getUTCHours())}${dos(t.getUTCMinutes())}00`
  );
}

const sello = (d: Date) => `${d.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;

/** Escapa texto de iCalendar (barra, coma, punto y coma y saltos de línea). */
export const escapar = (t: string) =>
  t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Parte las líneas de más de 75 bytes (UTF-8) como pide el estándar. */
export function plegar(linea: string): string {
  const partes: string[] = [];
  let actual = '';
  let bytes = 0;
  for (const c of linea) {
    const n = new TextEncoder().encode(c).length;
    if (bytes + n > (partes.length ? 74 : 75)) {
      partes.push(actual);
      actual = '';
      bytes = 0;
    }
    actual += c;
    bytes += n;
  }
  partes.push(actual);
  return partes.join('\r\n ');
}

/** Zona de Madrid (horario de verano europeo), para que todos los calendarios la entiendan. */
const VTIMEZONE_MADRID = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Madrid',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

export function calendarioIcs(eventos: EventoSesion[], opciones: OpcionesCalendario): string {
  const { nombre, zona, dominio, ahora = new Date() } = opciones;
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${dominio}//Sesiones del club//ES`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapar(nombre)}`,
    `X-WR-TIMEZONE:${zona}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
    ...(zona === 'Europe/Madrid' ? VTIMEZONE_MADRID : []),
  ];
  for (const e of eventos) {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:sesion-${e.fecha}@${dominio}`,
      `DTSTAMP:${sello(ahora)}`,
      // La versión crece con cada publicación: así los calendarios aplican los cambios.
      `SEQUENCE:${Math.floor(ahora.getTime() / 60000)}`,
      `DTSTART;TZID=${zona}:${fechaLocal(e.fecha, e.hora)}`,
      `DTEND;TZID=${zona}:${fechaLocal(e.fecha, e.hora, e.duracionMin)}`,
      `SUMMARY:${escapar(e.titulo)}`,
      `DESCRIPTION:${escapar(e.descripcion)}`,
      `LOCATION:${escapar(e.lugar)}`,
      ...(e.url ? [`URL:${e.url}`] : []),
      'END:VEVENT',
    );
  }
  lineas.push('END:VCALENDAR');
  return `${lineas.map(plegar).join('\r\n')}\r\n`;
}

/** Enlace para añadir un solo evento en Google Calendar (sin suscribirse). */
export function enlaceGoogleCalendar(e: EventoSesion, zona: string): string {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.titulo,
    dates: `${fechaLocal(e.fecha, e.hora)}/${fechaLocal(e.fecha, e.hora, e.duracionMin)}`,
    ctz: zona,
    details: e.descripcion,
    location: e.lugar,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

/** Suscripción (se actualiza sola): webcal:// para Apple y Outlook, y el enlace de Google. */
export function enlacesSuscripcion(urlIcs: string) {
  const webcal = urlIcs.replace(/^https?:\/\//, 'webcal://');
  return {
    webcal,
    google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
  };
}
