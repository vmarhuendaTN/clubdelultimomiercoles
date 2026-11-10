import { cargarOpciones, textoLibro, yaElegido } from './opciones';

const CIRCE = { id: 'c', titulo: 'Circe', autor: 'Madeline Miller' };

describe('opciones de la propuesta', () => {
  it('pide las opciones al script', async () => {
    const cargar = vi.fn().mockResolvedValue({ ok: true, recomendadas: [], tintero: [CIRCE] });
    expect(await cargarOpciones({ url: 'https://s/exec', cargar })).toMatchObject({
      tintero: [CIRCE],
    });
    expect(new URL(cargar.mock.calls[0]?.[0] as string).searchParams.get('accion')).toBe(
      'propuestas.opciones',
    );
  });

  it('escribe «Título, Autor» y reconoce lo ya elegido sin tildes ni mayúsculas', () => {
    expect(textoLibro(CIRCE)).toBe('Circe, Madeline Miller');
    expect(yaElegido(CIRCE, ['circe'])).toBe(true);
    expect(yaElegido(CIRCE, ['Círce, Madeline Miller'])).toBe(true);
    expect(yaElegido(CIRCE, ['Circo'])).toBe(false);
  });
});
