import { cuentaAtras, instanteSesion } from './cuenta-atras';

const MADRID = 'Europe/Madrid';

describe('instanteSesion', () => {
  it('19:30 en Madrid en invierno (UTC+1) y en verano (UTC+2)', () => {
    expect(instanteSesion('2026-11-25', '19:30', MADRID)?.toISOString()).toBe(
      '2026-11-25T18:30:00.000Z',
    );
    expect(instanteSesion('2027-05-26', '19:30', MADRID)?.toISOString()).toBe(
      '2027-05-26T17:30:00.000Z',
    );
  });

  it('fechas no válidas: null', () => {
    expect(instanteSesion('25/11/2026', '19:30', MADRID)).toBeNull();
  });
});

describe('cuentaAtras', () => {
  const sesion = instanteSesion('2026-11-25', '19:30', MADRID)!;
  const en = (iso: string) => cuentaAtras(sesion, new Date(iso), MADRID);

  it('cuenta días de calendario en Madrid', () => {
    expect(en('2026-11-11T10:00:00Z')).toEqual({ tipo: 'dias', dias: 14, horas: 8 });
    // Lunes a las 23:30 de Madrid: el miércoles son 2 días.
    expect(en('2026-11-23T22:30:00Z')).toMatchObject({ tipo: 'dias', dias: 2 });
  });

  it('mañana, hoy, en marcha y pasada', () => {
    expect(en('2026-11-24T08:00:00Z')).toEqual({ tipo: 'manana' });
    expect(en('2026-11-25T16:00:00Z')).toEqual({ tipo: 'hoy', horas: 2, minutos: 30 });
    expect(en('2026-11-25T19:00:00Z')).toEqual({ tipo: 'en_marcha' });
    expect(en('2026-11-26T10:00:00Z')).toEqual({ tipo: 'pasada' });
  });
});
