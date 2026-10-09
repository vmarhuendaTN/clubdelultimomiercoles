import {
  authorMatches,
  mainSurname,
  normalizeText,
  titleSimilarity,
  titleTokens,
} from './normalize';

describe('normalize', () => {
  it('quita tildes, mayúsculas y puntuación', () => {
    expect(normalizeText('¡Leviatán, o la Ballena!')).toBe('leviatan o la ballena');
  });

  it('quita artículos solo para comparar', () => {
    expect(titleTokens('La maldición de Hill House')).toEqual(['maldicion', 'de', 'hill', 'house']);
  });

  it.each([
    ['Kazuo Ishiguro', 'Ishiguro'],
    ['Dominique Lapierre y Larry Collins', 'Lapierre'],
    ['Madame de La Fayette', 'Fayette'],
    ['Mary Ann Shaffer y Annie Barrows', 'Shaffer'],
    ['R. F. Kuang', 'Kuang'],
  ])('apellido principal de %s', (autor, apellido) => {
    expect(mainSurname(autor)).toBe(apellido);
  });

  it('compara títulos tolerando subtítulos y tildes', () => {
    expect(titleSimilarity('Circe', 'Circe')).toBe(1);
    expect(titleSimilarity('Leviatán', 'Leviatan')).toBe(1);
    expect(titleSimilarity('Circe', 'Circe: una novela')).toBeGreaterThan(0.9);
    expect(titleSimilarity('El secreto', 'El secreto de la última luna')).toBeGreaterThan(0.6);
    expect(titleSimilarity('Circe', 'Pirómano')).toBe(0);
  });

  it('reconoce al autor por el apellido', () => {
    expect(authorMatches('Donna Tartt', ['DONNA TARTT'])).toBe(true);
    expect(authorMatches('Gabriel García Márquez', ['Gabriel Garcia Marquez'])).toBe(true);
    expect(authorMatches('Donna Tartt', ['Rhonda Byrne'])).toBe(false);
  });
});
