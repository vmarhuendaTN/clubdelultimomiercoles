import {
  agruparPorAnio,
  bookHref,
  coverAlt,
  filtrarLecturas,
  nombreIdioma,
  varianteDePortada,
} from './utils';

describe('utils de libros', () => {
  it('construye el alt de la portada', () => {
    expect(coverAlt({ titulo: 'Piranesi', autor: 'Susanna Clarke' })).toBe(
      'Portada de Piranesi, de Susanna Clarke',
    );
  });

  it('construye la ruta de la ficha con barra final', () => {
    expect(bookHref('el-secreto')).toBe('/lecturas/el-secreto/');
  });
});

describe('filtrarLecturas', () => {
  const lecturas = [
    { titulo: 'Leviatán', autor: 'Paul Auster', estado: 'leido' },
    { titulo: 'Circe', autor: 'Madeline Miller', estado: 'proximo' },
    { titulo: 'Amarilla', autor: 'R. F. Kuang', estado: 'leido' },
  ];

  it('filtra por estado', () => {
    expect(filtrarLecturas(lecturas, 'leido', '').map((l) => l.titulo)).toEqual([
      'Leviatán',
      'Amarilla',
    ]);
  });

  it('busca en título y autor sin tildes ni mayúsculas', () => {
    expect(filtrarLecturas(lecturas, 'leido', 'leviatan')).toHaveLength(1);
    expect(filtrarLecturas(lecturas, 'leido', 'KUANG')[0]?.titulo).toBe('Amarilla');
  });
});

describe('agruparPorAnio', () => {
  it('sin fechas devuelve un solo grupo', () => {
    expect(agruparPorAnio([{}, {}])).toEqual([{ lecturas: [{}, {}] }]);
  });

  it('agrupa por año, el más reciente primero y sin fecha al final', () => {
    const grupos = agruparPorAnio([
      { fechaSesion: '2024-05-29' },
      {},
      { fechaSesion: '2025-01-29' },
    ]);
    expect(grupos.map((g) => g.anio)).toEqual(['2025', '2024', 'Sin fecha']);
  });
});

describe('varianteDePortada', () => {
  it('es estable para un mismo título y varía entre títulos', () => {
    expect(varianteDePortada('Circe')).toBe(varianteDePortada('Circe'));
    const variantes = new Set(
      ['Circe', 'Leviatán', 'Amarilla', 'Tristana', 'El secreto', 'La promesa'].map(
        varianteDePortada,
      ),
    );
    expect(variantes.size).toBeGreaterThan(1);
  });
});

describe('nombreIdioma', () => {
  it('traduce el código ISO al español', () => {
    expect(nombreIdioma('es')).toBe('Español');
    expect(nombreIdioma('en')).toBe('Inglés');
    expect(nombreIdioma(undefined)).toBeUndefined();
  });
});
