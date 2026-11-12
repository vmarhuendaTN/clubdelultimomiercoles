import { cargarPersonas, etiquetaPersona, idElegido, NO_ESTOY } from './personas';

describe('personas', () => {
  it('pide la lista con el código del club', async () => {
    const cargar = vi.fn().mockResolvedValue({ ok: true, personas: [] });
    await cargarPersonas('secreto', { url: 'https://script.test/exec', cargar });
    expect(cargar.mock.calls[0]?.[0]).toContain('accion=personas.lista');
    expect(cargar.mock.calls[0]?.[0]).toContain('codigo=secreto');
  });

  it('etiqueta e id elegido', () => {
    expect(etiquetaPersona({ id: 'a', nombre: 'Marta R.', club: '1' })).toBe('Marta R. · Club 1');
    expect(idElegido('a')).toBe('a');
    expect(idElegido(NO_ESTOY)).toBe('');
    expect(idElegido('')).toBe('');
  });
});
