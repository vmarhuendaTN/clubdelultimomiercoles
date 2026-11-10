import { enviarPropuesta, type DatosPropuesta } from './enviar-propuesta';

const DATOS: DatosPropuesta = {
  nombre: 'Ana',
  apellidos: 'García López',
  grupo: 'Miércoles',
  mes: 'enero',
  anio: '2027',
  lectura_1: 'Sinsonte, Walter Tevis',
  lectura_2: 'Tea Rooms, Luisa Carnés',
  lectura_3: 'Circe, Madeline Miller',
  tintero: '',
  motivo: '',
};

describe('enviarPropuesta', () => {
  it('manda los datos con el código a la acción propuesta.enviar', async () => {
    const enviarPost = vi.fn().mockResolvedValue(undefined);
    const cargar = vi.fn().mockResolvedValue({ ok: true, id: 'p1' });
    const r = await enviarPropuesta(DATOS, 'codigo', { url: 'https://s/exec', enviarPost, cargar });
    expect(r).toEqual({ ok: true, id: 'p1' });
    expect(JSON.parse(enviarPost.mock.calls[0]?.[1] as string)).toMatchObject({
      accion: 'propuesta.enviar',
      datos: { ...DATOS, codigo: 'codigo' },
    });
  });
});
