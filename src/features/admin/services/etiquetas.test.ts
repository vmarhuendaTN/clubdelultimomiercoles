import { ESTADOS_PROPUESTA, etiqueta, fechaCorta, normalizar } from './etiquetas';

describe('etiquetas del panel', () => {
  it('traduce valores y deja tal cual los desconocidos', () => {
    expect(etiqueta(ESTADOS_PROPUESTA, 'en_votacion')).toBe('En votación');
    expect(etiqueta(ESTADOS_PROPUESTA, 'otro')).toBe('otro');
  });

  it('formatea fechas y no rompe con texto que no es fecha', () => {
    expect(fechaCorta('2026-11-25')).toBe('25 nov 2026');
    expect(fechaCorta('')).toBe('');
    expect(fechaCorta('mañana')).toBe('');
  });

  it('normaliza tildes y mayúsculas', () => {
    expect(normalizar('Leviatán')).toBe('leviatan');
  });
});
