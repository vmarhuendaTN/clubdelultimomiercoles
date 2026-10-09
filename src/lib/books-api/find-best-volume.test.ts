import { createBooksClient, QuotaError } from './client';
import { findBestVolume } from './find-best-volume';
import {
  guiaHillHouse,
  hillHouse,
  hillHouseCompleto,
  hillHouseIngles,
} from './__fixtures__/volumes';
import { mapVolume } from './map-volume';
import { scoreVolume } from './score';
import type { Volume } from './types';

const query = { titulo: 'La maldición de Hill House', autor: 'Shirley Jackson' };

function fakeFetch(handler: (url: URL) => { status: number; body?: unknown }) {
  return vi.fn(async (input: URL | RequestInfo) => {
    const { status, body } = handler(new URL(String(input)));
    return new Response(body === undefined ? null : JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
}

const sinEspera = () => Promise.resolve();

describe('scoreVolume', () => {
  it('acepta la edición española completa', () => {
    expect(scoreVolume(query, hillHouse)).toBeGreaterThanOrEqual(70);
  });

  it('penaliza las guías de lectura', () => {
    expect(scoreVolume(query, guiaHillHouse)).toBeLessThan(50);
  });

  it('la edición en inglés queda por debajo de la española', () => {
    expect(scoreVolume(query, hillHouseIngles)).toBeLessThan(scoreVolume(query, hillHouse));
  });
});

describe('mapVolume', () => {
  it('mapea los campos de la ficha', () => {
    const data = mapVolume(hillHouseCompleto);
    expect(data).toMatchObject({
      googleBooksId: 'hill-es',
      autor: 'Shirley Jackson',
      editorial: 'Minúscula',
      anio: 2014,
      isbn: '9788495587992',
      paginas: 256,
      categorias: ['Ficción'],
      portadaUrl: 'https://books.google.com/books/content?id=hill-es&zoom=3',
    });
    expect(data.descripcion[0]).toMatch(/^Cuatro desconocidos/);
  });
});

describe('findBestVolume', () => {
  it('elige el mejor candidato y pide la ficha completa', async () => {
    const fetchImpl = fakeFetch((url) =>
      url.pathname.endsWith('/hill-es')
        ? { status: 200, body: hillHouseCompleto }
        : {
            status: 200,
            body: { totalItems: 3, items: [guiaHillHouse, hillHouseIngles, hillHouse] },
          },
    );
    const client = createBooksClient({ apiKey: 'k', fetchImpl, sleep: sinEspera });
    const result = await findBestVolume(query, client);
    expect(result.data?.googleBooksId).toBe('hill-es');
    expect(result.data?.portadaUrl).toContain('zoom=3');
    expect(result.revisar).toBe(false);
    expect(result.consultas).toBe(2);
    expect(result.candidatos[0]?.googleBooksId).toBe('hill-es');
  });

  it('envía clave, país y respuesta parcial', async () => {
    const fetchImpl = fakeFetch(() => ({ status: 200, body: { totalItems: 0 } }));
    await findBestVolume(
      query,
      createBooksClient({ apiKey: 'clave', fetchImpl, sleep: sinEspera }),
    );
    const url = new URL(String(vi.mocked(fetchImpl).mock.calls[0]![0]));
    expect(url.searchParams.get('key')).toBe('clave');
    expect(url.searchParams.get('country')).toBe('ES');
    expect(url.searchParams.get('langRestrict')).toBe('es');
    expect(url.searchParams.get('fields')).toContain('items(id,volumeInfo(');
  });

  it('sin candidatos válidos marca para revisar', async () => {
    const fetchImpl = fakeFetch(() => ({
      status: 200,
      body: { totalItems: 1, items: [guiaHillHouse] },
    }));
    const result = await findBestVolume(
      query,
      createBooksClient({ apiKey: 'k', fetchImpl, sleep: sinEspera }),
    );
    expect(result.data).toBeNull();
    expect(result.revisar).toBe(true);
    expect(result.candidatos).toHaveLength(1);
  });

  it('usa el volumen fijado sin buscar', async () => {
    const fetchImpl = fakeFetch(() => ({ status: 200, body: hillHouseCompleto }));
    const result = await findBestVolume(
      { ...query, googleBooksId: 'hill-es' },
      createBooksClient({ apiKey: 'k', fetchImpl, sleep: sinEspera }),
    );
    expect(result.data?.googleBooksId).toBe('hill-es');
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('reintenta ante 5xx y se detiene ante cuota agotada', async () => {
    let llamadas = 0;
    const fetchImpl = fakeFetch(() => (++llamadas < 3 ? { status: 503 } : { status: 403 }));
    await expect(
      findBestVolume(query, createBooksClient({ apiKey: 'k', fetchImpl, sleep: sinEspera })),
    ).rejects.toBeInstanceOf(QuotaError);
    expect(llamadas).toBe(3);
  });

  it('toma la sinopsis de otro candidato fiable si la elegida no tiene', async () => {
    const sinSinopsis: Volume = {
      ...hillHouseCompleto,
      id: 'hill-b',
      volumeInfo: { ...hillHouseCompleto.volumeInfo, description: undefined, pageCount: 300 },
    };
    // Otra edición con sinopsis pero sin portada ni ISBN: puntúa menos (≥ 70) y presta la sinopsis.
    const donante: Volume = {
      ...hillHouse,
      id: 'hill-c',
      volumeInfo: {
        ...hillHouse.volumeInfo,
        imageLinks: undefined,
        industryIdentifiers: undefined,
      },
    };
    const fetchImpl = fakeFetch((url) =>
      url.pathname.endsWith('/hill-b')
        ? { status: 200, body: sinSinopsis }
        : { status: 200, body: { totalItems: 2, items: [sinSinopsis, donante] } },
    );
    const client = createBooksClient({ apiKey: 'k', fetchImpl, sleep: sinEspera });
    const result = await findBestVolume(query, client);
    expect(result.data?.googleBooksId).toBe('hill-b');
    expect(result.data?.descripcion[0]).toMatch(/^Cuatro desconocidos/);
  });
});
