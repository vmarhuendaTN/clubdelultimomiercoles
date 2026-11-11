import { buscarLibros, idDeUrlGoogleBooks } from './libros';

describe('idDeUrlGoogleBooks', () => {
  it('saca el id de las URL de Google Libros y Google Play', () => {
    expect(
      idDeUrlGoogleBooks(
        'https://www.google.es/books/edition/El_sentido_de_un_final/1j4p5-Pa4msC?hl=es&gbpv=0',
      ),
    ).toBe('1j4p5-Pa4msC');
    expect(idDeUrlGoogleBooks('https://books.google.es/books?id=PjKD0AEACAAJ&hl=es')).toBe(
      'PjKD0AEACAAJ',
    );
    expect(
      idDeUrlGoogleBooks('https://books.google.com/books/about/Sinsonte.html?id=q1k6zwEACAAJ'),
    ).toBe('q1k6zwEACAAJ');
    expect(idDeUrlGoogleBooks('https://play.google.com/store/books/details?id=1j4p5-Pa4msC')).toBe(
      '1j4p5-Pa4msC',
    );
  });

  it('ignora textos y webs que no son de Google', () => {
    expect(idDeUrlGoogleBooks('El sentido de un final')).toBe('');
    expect(idDeUrlGoogleBooks('https://example.com/books?id=1j4p5-Pa4msC')).toBe('');
    expect(idDeUrlGoogleBooks('https://www.google.es/search?q=libros')).toBe('');
  });
});

describe('buscarLibros', () => {
  it('con una URL pide la ficha; con texto, busca', async () => {
    const cargar = vi.fn().mockResolvedValue({ ok: true, libros: [] });
    await buscarLibros('https://books.google.es/books?id=PjKD0AEACAAJ', {
      url: 'https://script.test/exec',
      cargar,
    });
    expect(cargar.mock.calls[0]?.[0]).toContain('accion=libros.ficha');
    expect(cargar.mock.calls[0]?.[0]).toContain('id=PjKD0AEACAAJ');
    await buscarLibros('circe', { url: 'https://script.test/exec', cargar });
    expect(cargar.mock.calls[1]?.[0]).toContain('accion=libros.buscar');
  });
});
