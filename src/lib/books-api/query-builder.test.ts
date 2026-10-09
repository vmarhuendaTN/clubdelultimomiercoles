import { buildAttempts } from './query-builder';

describe('buildAttempts', () => {
  it('prueba ISBN, título exacto en español, palabras clave y sin idioma', () => {
    expect(
      buildAttempts({
        titulo: 'La maldición de Hill House',
        autor: 'Shirley Jackson',
        isbn: '978-84-339-2023-2',
      }),
    ).toEqual([
      { q: 'isbn:9788433920232' },
      { q: 'intitle:"La maldición de Hill House" inauthor:"Jackson"', langRestrict: 'es' },
      { q: 'intitle:maldicion de hill house inauthor:Jackson', langRestrict: 'es' },
      { q: 'intitle:"La maldición de Hill House" inauthor:"Jackson"' },
    ]);
  });

  it('sin ISBN empieza por el título', () => {
    expect(buildAttempts({ titulo: 'Circe', autor: 'Madeline Miller' })[0]).toEqual({
      q: 'intitle:"Circe" inauthor:"Miller"',
      langRestrict: 'es',
    });
  });
});
