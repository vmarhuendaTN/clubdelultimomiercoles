import { describe, expect, it, vi } from 'vitest';
import { comprobarAcceso } from './apps-script';

vi.mock('@/lib/env', () => ({
  env: { appsScriptUrl: 'https://script.google.com/macros/s/TEST/exec' },
}));

function fetchQueDevuelve(cuerpo: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(cuerpo)));
}

describe('comprobarAcceso', () => {
  it('acepta una admin de la pestaña Equipo', async () => {
    const fetchFn = fetchQueDevuelve({
      ok: true,
      email: 'inés@ejemplo.es',
      nombre: 'Inés',
      rol: 'admin',
    });
    const r = await comprobarAcceso('token', fetchFn);
    expect(r).toEqual({
      ok: true,
      persona: { email: 'inés@ejemplo.es', nombre: 'Inés', rol: 'admin' },
    });
  });

  it('rechaza a quien no está en Equipo', async () => {
    const fetchFn = fetchQueDevuelve({ ok: false, error: 'no_autorizado' });
    expect(await comprobarAcceso('token', fetchFn)).toEqual({
      ok: false,
      error: 'no_autorizado',
    });
  });

  it('rechaza un rol desconocido aunque el script responda ok', async () => {
    const fetchFn = fetchQueDevuelve({ ok: true, email: 'x@y.z', rol: 'miembro' });
    expect(await comprobarAcceso('token', fetchFn)).toEqual({
      ok: false,
      error: 'no_autorizado',
    });
  });

  it('informa de un error de red sin lanzar excepción', async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError('fallo de red');
    });
    expect(await comprobarAcceso('token', fetchFn)).toEqual({ ok: false, error: 'red' });
  });
});
