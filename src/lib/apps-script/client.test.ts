import { consultar, enviar } from './client';

const URL_API = 'https://script.example/exec';

describe('consultar (JSONP)', () => {
  it('sin URL configurada no llama a nada', async () => {
    const cargar = vi.fn();
    expect(await consultar('estado', {}, { url: '', cargar })).toEqual({
      ok: false,
      error: 'sin_configurar',
    });
    expect(cargar).not.toHaveBeenCalled();
  });

  it('monta la URL con la acción, el callback y los parámetros no vacíos', async () => {
    const cargar = vi.fn().mockResolvedValue({ ok: true, version: 2 });
    const r = await consultar('yo', { sesion: 'abc', vacio: undefined }, { url: URL_API, cargar });
    expect(r).toEqual({ ok: true, version: 2 });
    const [url, callback] = cargar.mock.calls[0] as [string, string];
    const u = new URL(url);
    expect(u.searchParams.get('accion')).toBe('yo');
    expect(u.searchParams.get('sesion')).toBe('abc');
    expect(u.searchParams.has('vacio')).toBe(false);
    expect(u.searchParams.get('callback')).toBe(callback);
  });

  it('un error desconocido llega como error_interno y uno conocido se conserva', async () => {
    const cargar = vi.fn().mockResolvedValueOnce({ ok: false, error: 'raro' });
    expect(await consultar('x', {}, { url: URL_API, cargar })).toMatchObject({
      error: 'error_interno',
    });
    cargar.mockResolvedValueOnce({ ok: false, error: 'datos_no_validos', detalle: 'Falta x.' });
    expect(await consultar('x', {}, { url: URL_API, cargar })).toEqual({
      ok: false,
      error: 'datos_no_validos',
      detalle: 'Falta x.',
    });
  });

  it('si el script no carga, devuelve error de red', async () => {
    const cargar = vi.fn().mockRejectedValue(new Error('red'));
    expect(await consultar('x', {}, { url: URL_API, cargar })).toEqual({ ok: false, error: 'red' });
  });
});

describe('enviar (POST + resultado)', () => {
  it('envía el cuerpo con reqId y recoge el resultado, reintentando si está pendiente', async () => {
    const enviarPost = vi.fn().mockResolvedValue(undefined);
    const esperar = vi.fn().mockResolvedValue(undefined);
    const cargar = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, error: 'pendiente' })
      .mockResolvedValueOnce({ ok: true, id: 'p1' });

    const r = await enviar(
      'propuesta.enviar',
      { datos: { titulo: 'T' } },
      { url: URL_API, enviarPost, esperar, cargar },
    );

    expect(r).toEqual({ ok: true, id: 'p1' });
    const cuerpo = JSON.parse(enviarPost.mock.calls[0]?.[1] as string) as Record<string, unknown>;
    expect(cuerpo).toMatchObject({ accion: 'propuesta.enviar', datos: { titulo: 'T' } });
    const reqId = new URL(cargar.mock.calls[1]?.[0] as string).searchParams.get('reqId');
    expect(reqId).toBe(cuerpo.reqId);
  });

  it('si el resultado nunca llega, devuelve error de red', async () => {
    const r = await enviar(
      'x',
      {},
      {
        url: URL_API,
        enviarPost: vi.fn().mockResolvedValue(undefined),
        esperar: vi.fn().mockResolvedValue(undefined),
        cargar: vi.fn().mockResolvedValue({ ok: false, error: 'pendiente' }),
      },
    );
    expect(r).toEqual({ ok: false, error: 'red' });
  });

  it('si el POST falla, no intenta recoger nada', async () => {
    const cargar = vi.fn();
    const r = await enviar(
      'x',
      {},
      { url: URL_API, enviarPost: vi.fn().mockRejectedValue(new Error()), cargar },
    );
    expect(r).toEqual({ ok: false, error: 'red' });
    expect(cargar).not.toHaveBeenCalled();
  });
});
