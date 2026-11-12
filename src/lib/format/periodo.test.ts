import { MESES, aniosPosibles, claveSesion } from './periodo';

describe('periodo de la propuesta', () => {
  it('doce meses en español y diez años desde este, sin tener que tocarlos', () => {
    expect(MESES).toHaveLength(12);
    expect(MESES[0]).toBe('enero');
    const anios = aniosPosibles(new Date('2026-12-15'));
    expect(anios).toHaveLength(10);
    expect(anios[0]).toBe('2026');
    expect(anios.at(-1)).toBe('2035');
    expect(aniosPosibles(new Date('2031-03-01'))[0]).toBe('2031');
  });

  it('clave de la sesión a partir del mes y el año', () => {
    expect(claveSesion('enero', '2027')).toBe('2027-01');
    expect(claveSesion('diciembre', '2026')).toBe('2026-12');
    expect(claveSesion('', '2027')).toBe('');
  });
});
