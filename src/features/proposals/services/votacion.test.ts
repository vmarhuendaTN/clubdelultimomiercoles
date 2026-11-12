import { cargarVotacion, enviarVoto, textoSesion } from './votacion';

const URL_API = 'https://s/exec';

describe('votación pública', () => {
  it('sin votación abierta devuelve null', async () => {
    const cargar = vi.fn().mockResolvedValue({ ok: true, abierta: false });
    expect(await cargarVotacion({ url: URL_API, cargar })).toEqual({ ok: true, votacion: null });
  });

  it('con votación abierta devuelve la sesión y las candidatas', async () => {
    const candidatas = [{ id: 'a', titulo: 'Circe', autor: 'Madeline Miller' }];
    const cargar = vi
      .fn()
      .mockResolvedValue({ ok: true, abierta: true, sesion: '2027-01', candidatas });
    expect(await cargarVotacion({ url: URL_API, cargar })).toEqual({
      ok: true,
      votacion: { sesion: '2027-01', candidatas, nota: '' },
    });
  });

  it('envía el voto con el código', async () => {
    const enviarPost = vi.fn().mockResolvedValue(undefined);
    const cargar = vi.fn().mockResolvedValue({ ok: true });
    await enviarVoto({ nombre: 'Ana', apellidos: 'G', puntos: { a: 5 } }, 'club', {
      url: URL_API,
      enviarPost,
      cargar,
    });
    expect(JSON.parse(enviarPost.mock.calls[0]?.[1] as string)).toMatchObject({
      accion: 'votacion.votar',
      datos: { nombre: 'Ana', puntos: { a: 5 }, codigo: 'club' },
    });
  });

  it('nombra la sesión en español', () => {
    expect(textoSesion('2027-01')).toBe('enero de 2027');
  });
});
