import { nombrePublico, textoResumen } from './utils';

describe('nombrePublico', () => {
  it.each([
    ['Victoria Marhuenda Isamat', 'Victoria M.'],
    ['Luis', 'Luis'],
    ['  ana   garcía ', 'ana G.'],
    [undefined, 'Lector'],
  ])('%s → %s', (entrada, salida) => {
    expect(nombrePublico(entrada)).toBe(salida);
  });
});

describe('textoResumen', () => {
  it('formatea la media en español y el plural', () => {
    expect(textoResumen({ media: 4.25, total: 7 })).toBe('4,3 · 7 valoraciones');
    expect(textoResumen({ media: 5, total: 1 })).toBe('5 · 1 valoración');
  });
});
