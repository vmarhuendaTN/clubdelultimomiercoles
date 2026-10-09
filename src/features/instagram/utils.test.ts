import { altDesdePie } from './utils';

describe('altDesdePie', () => {
  it('quita hashtags y espacios sobrantes', () => {
    expect(altDesdePie('Sesión de enero   con Circe #clubdelectura #madrid', '1 de enero')).toBe(
      'Sesión de enero con Circe',
    );
  });

  it('recorta a 150 caracteres', () => {
    const alt = altDesdePie('a'.repeat(300), 'x');
    expect(alt).toHaveLength(150);
    expect(alt.endsWith('…')).toBe(true);
  });

  it('sin pie usa la fecha', () => {
    expect(altDesdePie(undefined, '3 de marzo de 2025')).toBe(
      'Publicación de Instagram del 3 de marzo de 2025',
    );
  });
});
