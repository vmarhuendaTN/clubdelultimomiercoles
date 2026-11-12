import { leerMensajeLibros, lineaDetalles, textoPaginas } from './mensaje-libros';

const MENSAJE = `[11/11/26, 22:24:57] Inés: 1. Crimen y castigo, de Fiódor Dostoievski (1866) - 832 págs. aprox.
Raskólnikov, un joven estudiante sin dinero en San Petersburgo, está convencido de que ciertos hombres están por encima de la moral corriente. Decide poner a prueba su teoría con un crimen.

2. Rojo y negro, de Stendhal (1830) - 688 págs. aprox.
Julien Sorel, hijo de un carpintero, brillante y ambicioso, quiere salir de su pueblo.

3. El retrato de Dorian Gray, versión sin censura, de Oscar Wilde (1890) - 256 págs.
El pintor Basil Hallward retrata a Dorian Gray.
[11/11/26, 22:25:47] Inés: NOTA 1:
Las páginas de Crimen y castigo y Rojo y negro son aproximadas.
[11/11/26, 22:26:27] Inés: NOTA 2:
En abril, mes del libro, todas las propuestas serán de autores españoles.`;

describe('leerMensajeLibros', () => {
  it('saca los libros con sus detalles y las notas', () => {
    const { libros, notas } = leerMensajeLibros(MENSAJE);
    expect(libros).toHaveLength(3);
    expect(libros[0]).toEqual({
      titulo: 'Crimen y castigo',
      autor: 'Fiódor Dostoievski',
      anio: '1866',
      paginas: '832 págs. aprox.',
      sinopsis:
        'Raskólnikov, un joven estudiante sin dinero en San Petersburgo, está convencido de que ciertos hombres están por encima de la moral corriente. Decide poner a prueba su teoría con un crimen.',
    });
    expect(libros[2]).toMatchObject({
      titulo: 'El retrato de Dorian Gray, versión sin censura',
      autor: 'Oscar Wilde',
      anio: '1890',
      paginas: '256 págs.',
    });
    expect(notas).toBe(
      'Las páginas de Crimen y castigo y Rojo y negro son aproximadas.\n\nEn abril, mes del libro, todas las propuestas serán de autores españoles.',
    );
  });

  it('acepta libros sin autor ni año', () => {
    const { libros } = leerMensajeLibros('1) Piranesi\n2. Circe (2018)');
    expect(libros.map((l) => [l.titulo, l.autor, l.anio])).toEqual([
      ['Piranesi', '', ''],
      ['Circe', '', '2018'],
    ]);
  });

  it('sin lista numerada no encuentra libros', () => {
    expect(leerMensajeLibros('Hola, ¿qué tal?').libros).toEqual([]);
  });
});

describe('detalles', () => {
  it('añade «págs.» solo a un número', () => {
    expect(textoPaginas('832')).toBe('832 págs.');
    expect(textoPaginas('832 págs. aprox.')).toBe('832 págs. aprox.');
  });
  it('une año y páginas', () => {
    expect(lineaDetalles({ anio: '1866', paginas: '832' })).toBe('1866 · 832 págs.');
    expect(lineaDetalles({})).toBe('');
  });
});
