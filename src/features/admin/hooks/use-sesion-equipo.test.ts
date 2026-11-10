import { act, renderHook, waitFor } from '@testing-library/react';
import { useSesionEquipo } from './use-sesion-equipo';

const api = vi.hoisted(() => ({ entrar: vi.fn(), quienSoy: vi.fn(), salir: vi.fn() }));
vi.mock('../services/api', () => api);

const PERSONA = { email: 'ines@example.com', nombre: 'Inés', rol: 'editora' as const };

describe('useSesionEquipo', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.values(api).forEach((f) => f.mockReset());
  });

  it('sin sesión guardada, queda fuera', async () => {
    const { result } = renderHook(() => useSesionEquipo());
    await waitFor(() => expect(result.current.estado).toEqual({ tipo: 'fuera' }));
  });

  it('al entrar guarda la sesión y la recupera al volver', async () => {
    api.entrar.mockResolvedValue({ ok: true, sesion: 's1', caduca: Date.now() + 1e6, ...PERSONA });
    const { result, unmount } = renderHook(() => useSesionEquipo());
    await act(() => result.current.entrarConGoogle('token'));
    expect(result.current.estado).toEqual({ tipo: 'dentro', sesion: 's1', persona: PERSONA });
    unmount();

    api.quienSoy.mockResolvedValue({ ok: true, ...PERSONA, rol: 'admin' });
    const segunda = renderHook(() => useSesionEquipo());
    await waitFor(() =>
      expect(segunda.result.current.estado).toMatchObject({ persona: { rol: 'admin' } }),
    );
    expect(api.quienSoy).toHaveBeenCalledWith('s1');
  });

  it('si el script dice que la sesión no vale, la borra', async () => {
    window.localStorage.setItem(
      'club:sesion-equipo',
      JSON.stringify({ sesion: 's1', caduca: Date.now() + 1e6, persona: PERSONA }),
    );
    api.quienSoy.mockResolvedValue({ ok: false, error: 'sesion_no_valida' });
    const { result } = renderHook(() => useSesionEquipo());
    await waitFor(() =>
      expect(result.current.estado).toEqual({ tipo: 'fuera', error: 'sesion_no_valida' }),
    );
    expect(window.localStorage.getItem('club:sesion-equipo')).toBeNull();
  });

  it('un acceso denegado deja fuera con el error', async () => {
    api.entrar.mockResolvedValue({ ok: false, error: 'no_autorizado' });
    const { result } = renderHook(() => useSesionEquipo());
    await act(() => result.current.entrarConGoogle('token'));
    expect(result.current.estado).toEqual({ tipo: 'fuera', error: 'no_autorizado' });
  });

  it('salir borra la sesión y avisa al script', async () => {
    api.entrar.mockResolvedValue({ ok: true, sesion: 's1', caduca: Date.now() + 1e6, ...PERSONA });
    api.salir.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useSesionEquipo());
    await act(() => result.current.entrarConGoogle('token'));
    act(() => result.current.salir());
    expect(api.salir).toHaveBeenCalledWith('s1');
    expect(result.current.estado).toEqual({ tipo: 'fuera', error: undefined });
  });
});
