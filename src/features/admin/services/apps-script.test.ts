import { describe, expect, it, vi } from 'vitest';
import { comprobarAcceso, type CargadorJsonp } from './apps-script';

vi.mock('@/lib/env', () => ({
  env: { appsScriptUrl: 'https://script.google.com/macros/s/TEST/exec' },
}));

function cargadorQueDevuelve(datos: unknown): CargadorJsonp {
  return vi.fn(async () => datos as never);
}

describe('comprobarAcceso', () => {
  it('acepta una admin de la pestaña Equipo', async () => {
    const cargar = cargadorQueDevuelve({
      ok: true,
      email: 'inés@ejemplo.es',
      nombre: 'Inés',
      rol: 'admin',
    });
    const r = await comprobarAcceso('token', cargar);
    expect(r).toEqual({
      ok: true,
      persona: { email: 'inés@ejemplo.es', nombre: 'Inés', rol: 'admin' },
    });
  });

  it('envía el token en la URL con el callback de JSONP', async () => {
    const cargar = cargadorQueDevuelve({ ok: false, error: 'no_autorizado' });
    await comprobarAcceso('a b&c', cargar);
    const [url, callback] = vi.mocked(cargar).mock.calls[0] ?? [];
    expect(url).toContain('accion=whoami');
    expect(url).toContain('idToken=a%20b%26c');
    expect(url).toContain(`callback=${callback}`);
  });

  it('rechaza a quien no está en Equipo', async () => {
    const cargar = cargadorQueDevuelve({ ok: false, error: 'no_autorizado' });
    expect(await comprobarAcceso('token', cargar)).toEqual({
      ok: false,
      error: 'no_autorizado',
    });
  });

  it('rechaza un rol desconocido aunque el script responda ok', async () => {
    const cargar = cargadorQueDevuelve({ ok: true, email: 'x@y.z', rol: 'miembro' });
    expect(await comprobarAcceso('token', cargar)).toEqual({
      ok: false,
      error: 'no_autorizado',
    });
  });

  it('informa de un error de red sin lanzar excepción', async () => {
    const cargar: CargadorJsonp = vi.fn(async () => {
      throw new Error('red');
    });
    expect(await comprobarAcceso('token', cargar)).toEqual({ ok: false, error: 'red' });
  });
});
