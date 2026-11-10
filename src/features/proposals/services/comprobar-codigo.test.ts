import { comprobarCodigo } from './comprobar-codigo';

describe('comprobarCodigo', () => {
  it('pregunta al script con el código sin espacios', async () => {
    const cargar = vi.fn().mockResolvedValue({ ok: false, error: 'codigo_incorrecto' });
    const r = await comprobarCodigo('  club ', { url: 'https://s/exec', cargar });
    expect(r).toEqual({ ok: false, error: 'codigo_incorrecto', detalle: undefined });
    const url = new URL(cargar.mock.calls[0]?.[0] as string);
    expect(url.searchParams.get('accion')).toBe('codigo.comprobar');
    expect(url.searchParams.get('codigo')).toBe('club');
  });
});
