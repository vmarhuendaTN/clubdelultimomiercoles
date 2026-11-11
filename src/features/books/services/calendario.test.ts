import {
  calendarioIcs,
  enlaceGoogleCalendar,
  enlacesSuscripcion,
  escapar,
  fechaLocal,
  plegar,
  type EventoSesion,
} from './calendario';

const EVENTO: EventoSesion = {
  fecha: '2026-11-25',
  hora: '19:30',
  duracionMin: 120,
  titulo: 'Club del Último Miércoles: El sentido de un final',
  descripcion: 'Lectura: El sentido de un final, de Julian Barnes.',
  lugar: 'Librería Celama, C/ Don Ramón de la Cruz, 93, Madrid',
  url: 'https://example.com/lecturas/el-sentido-de-un-final/',
};

describe('calendario', () => {
  it('fechas locales con duración, aunque cambie el día', () => {
    expect(fechaLocal('2026-11-25', '19:30')).toBe('20261125T193000');
    expect(fechaLocal('2026-11-25', '19:30', 120)).toBe('20261125T213000');
    expect(fechaLocal('2026-12-31', '23:30', 60)).toBe('20270101T003000');
  });

  it('escapa y pliega las líneas largas', () => {
    expect(escapar('a, b; c\\d\ne')).toBe('a\\, b\; c\\\\d\\ne');
    const larga = plegar(`DESCRIPTION:${'ñ'.repeat(60)}`);
    for (const l of larga.split('\r\n'))
      expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
    expect(
      larga
        .split('\r\n')
        .slice(1)
        .every((l) => l.startsWith(' ')),
    ).toBe(true);
  });

  it('genera un calendario con un evento por sesión, identificado por la fecha', () => {
    const ics = calendarioIcs([EVENTO], {
      nombre: 'Club del Último Miércoles',
      zona: 'Europe/Madrid',
      dominio: 'clubultimomiercoles',
      ahora: new Date('2026-11-11T10:00:00Z'),
    });
    const lineas = ics.replace(/\r\n /g, '').split('\r\n');
    expect(lineas[0]).toBe('BEGIN:VCALENDAR');
    expect(lineas).toContain('BEGIN:VTIMEZONE');
    expect(lineas).toContain('UID:sesion-2026-11-25@clubultimomiercoles');
    expect(lineas).toContain('DTSTART;TZID=Europe/Madrid:20261125T193000');
    expect(lineas).toContain('DTEND;TZID=Europe/Madrid:20261125T213000');
    expect(lineas).toContain('SUMMARY:Club del Último Miércoles: El sentido de un final');
    expect(lineas).toContain('LOCATION:Librería Celama\\, C/ Don Ramón de la Cruz\\, 93\\, Madrid');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('enlaces de Google Calendar y de suscripción', () => {
    const google = new URL(enlaceGoogleCalendar(EVENTO, 'Europe/Madrid'));
    expect(google.searchParams.get('dates')).toBe('20261125T193000/20261125T213000');
    expect(google.searchParams.get('ctz')).toBe('Europe/Madrid');
    expect(enlacesSuscripcion('https://example.com/club/calendario.ics')).toEqual({
      webcal: 'webcal://example.com/club/calendario.ics',
      google:
        'https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2Fexample.com%2Fclub%2Fcalendario.ics',
    });
  });
});
