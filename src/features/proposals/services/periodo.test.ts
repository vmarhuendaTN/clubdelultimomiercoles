import { MESES, aniosPosibles } from './periodo';

describe('periodo de la propuesta', () => {
  it('doce meses en español y este año y el siguiente', () => {
    expect(MESES).toHaveLength(12);
    expect(MESES[0]).toBe('enero');
    expect(aniosPosibles(new Date('2026-12-15'))).toEqual(['2026', '2027']);
  });
});
