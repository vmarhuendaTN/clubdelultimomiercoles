import { enviarPropuesta } from './enviar-propuesta';

describe('enviarPropuesta', () => {
  it('manda los datos con el código a la acción propuesta.enviar', async () => {
    const enviarPost = vi.fn().mockResolvedValue(undefined);
    const cargar = vi.fn().mockResolvedValue({ ok: true, id: 'p1' });
    const datos = {
      titulo: 'Sinsonte',
      autor: 'Walter Tevis',
      motivo: '',
      propuesto_por: 'Ana',
      google_books_id: '',
    };
    const r = await enviarPropuesta(datos, 'codigo', { url: 'https://s/exec', enviarPost, cargar });
    expect(r).toEqual({ ok: true, id: 'p1' });
    expect(JSON.parse(enviarPost.mock.calls[0]?.[1] as string)).toMatchObject({
      accion: 'propuesta.enviar',
      datos: { ...datos, codigo: 'codigo' },
    });
  });
});
