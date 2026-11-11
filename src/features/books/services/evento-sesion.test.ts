import { eventosDeLectura, quedadasDe, urlCalendario } from './evento-sesion';

const LECTURA = {
  slug: 'el-sentido-de-un-final',
  titulo: 'El sentido de un final',
  autor: 'Julian Barnes',
  fechaSesion: '2026-11-25',
};

describe('quedadas', () => {
  it('con una fecha, una quedada de todo el club', () => {
    expect(quedadasDe(LECTURA)).toEqual([{ fecha: '2026-11-25' }]);
    expect(eventosDeLectura(LECTURA, '2')[0]?.uid).toBe('sesion-2026-11-25');
  });

  it('con dos fechas, una por club y cada calendario con la suya', () => {
    const dos = { ...LECTURA, fechaSesion2: '2026-11-26' };
    expect(quedadasDe(dos).map((q) => [q.fecha, q.club?.id])).toEqual([
      ['2026-11-25', '1'],
      ['2026-11-26', '2'],
    ]);
    const club2 = eventosDeLectura(dos, '2');
    expect(club2.map((e) => e.uid)).toEqual(['sesion-2026-11-26-club2']);
    expect(club2[0]?.titulo).toBe('Club 2 · Club del Último Miércoles: El sentido de un final');
    expect(eventosDeLectura(dos)).toHaveLength(2);
  });

  it('URL del calendario de cada club', () => {
    expect(urlCalendario()).toMatch(/\/calendario\.ics$/);
    expect(urlCalendario('1')).toMatch(/\/calendario-club-1\.ics$/);
  });
});
