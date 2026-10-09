import { validarFilasLecturas } from '@/lib/sheets';
import { asignarSlugs, buildLecturas, hashOrigen } from './build-lecturas';

const { filas } = validarFilasLecturas([
  { titulo: 'La promesa', autor: 'Silvina Ocampo', estado: 'leido', orden: '16', visible: 'si' },
  { titulo: 'Circe', autor: 'Madeline Miller', estado: 'proximo', visible: 'si' },
  { titulo: 'Pirómano', autor: 'Anónimo', estado: 'por_clasificar', visible: 'si' },
  { titulo: 'Oculto', autor: 'X', estado: 'leido', visible: 'no' },
  {
    titulo: 'El secreto',
    autor: 'Donna Tartt',
    estado: 'leido',
    orden: '24',
    visible: 'si',
    descripcion_manual: 'Primer párrafo.\n\nSegundo párrafo.',
    portada_manual: 'https://ejemplo.test/secreto.jpg',
  },
]);

const ficha = {
  googleBooksId: 'g1',
  tituloGoogle: 'El secreto',
  autor: 'Donna Tartt',
  anio: 1993,
  paginas: 640,
  descripcion: ['Sinopsis de Google.'],
  categorias: ['Ficción'],
  idioma: 'es',
  portadaUrl: 'https://books.google.com/x',
};

describe('buildLecturas', () => {
  const secreto = filas.find((f) => f.titulo === 'El secreto')!;
  const lecturas = buildLecturas({
    filas,
    fichas: (hash) => (hash === hashOrigen(secreto) ? ficha : undefined),
    portadas: [],
  });

  it('solo publica lecturas visibles y clasificadas', () => {
    expect(lecturas.map((l) => l.titulo)).toEqual(['Circe', 'El secreto', 'La promesa']);
  });

  it('lo manual gana a Google', () => {
    const l = lecturas.find((x) => x.slug === 'el-secreto')!;
    expect(l.descripcion).toEqual(['Primer párrafo.', 'Segundo párrafo.']);
    expect(l.portadaUrl).toBe('https://ejemplo.test/secreto.jpg');
    expect(l).toMatchObject({ anio: 1993, paginas: 640, categorias: ['Ficción'] });
  });

  it('la portada subida a content/portadas gana a todo', () => {
    const [l] = buildLecturas({
      filas: [secreto],
      fichas: () => ficha,
      portadas: [
        {
          slug: 'el-secreto',
          url: '/generated/portadas/el-secreto.webp',
          lqip: 'data:',
          colorDominante: 'rgb(1 2 3)',
        },
      ],
    });
    expect(l?.portadaUrl).toBe('/generated/portadas/el-secreto.webp');
    expect(l?.portadaLqip).toBe('data:');
  });

  it('sin ficha de Google la lectura sale igual, sin sinopsis ni portada', () => {
    const promesa = lecturas.find((x) => x.slug === 'la-promesa')!;
    expect(promesa.descripcion).toEqual([]);
    expect(promesa.portadaUrl).toBeUndefined();
  });
});

describe('asignarSlugs', () => {
  it('desambigua títulos repetidos con el apellido', () => {
    const { filas: repetidas } = validarFilasLecturas([
      { titulo: 'Reunión', autor: 'Natasha Brown', estado: 'leido' },
      { titulo: 'Reunión', autor: 'Otra Autora', estado: 'leido' },
    ]);
    expect(asignarSlugs(repetidas)).toEqual(['reunion', 'reunion-autora']);
  });
});
