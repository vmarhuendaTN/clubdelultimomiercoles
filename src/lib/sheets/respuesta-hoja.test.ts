import { procesarRespuestaHoja } from './respuesta-hoja';

const FILA = {
  titulo: 'Sinsonte',
  autor: 'Walter Tevis',
  estado: 'proximo',
  orden: 26,
  visible: 'si',
};

describe('procesarRespuestaHoja', () => {
  it('convierte las filas a texto e informa de las que no valen', () => {
    const r = procesarRespuestaHoja({
      ok: true,
      lecturas: [FILA, { titulo: '', autor: 'X', estado: 'leido' }],
    });
    expect(r).toEqual({
      tipo: 'ok',
      filas: [
        {
          titulo: 'Sinsonte',
          autor: 'Walter Tevis',
          estado: 'proximo',
          orden: '26',
          visible: 'si',
        },
        { titulo: '', autor: 'X', estado: 'leido' },
      ],
      errores: ['fila 3: falta el título'],
    });
  });

  it('reconoce el script antiguo (sin lecturas) para seguir con el CSV', () => {
    expect(procesarRespuestaHoja({ ok: true, version: 1 })).toEqual({ tipo: 'script_antiguo' });
  });

  it('no deja publicar una hoja vacía, con error o con basura', () => {
    expect(() => procesarRespuestaHoja({ ok: true, lecturas: [] })).toThrow(/ninguna fila válida/);
    expect(() => procesarRespuestaHoja({ ok: false, error: 'x' })).toThrow(/error/);
    expect(() => procesarRespuestaHoja('<html>')).toThrow();
  });
});
