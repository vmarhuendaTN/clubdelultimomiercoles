import { procesarRespuestaHoja, procesarTextoHoja } from './respuesta-hoja';

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

describe('procesarTextoHoja', () => {
  it('una página de Google en vez de JSON no rompe: explica qué ha llegado', () => {
    expect(
      procesarTextoHoja(
        '<!doctype html><html><head><title>Página no encontrada</title></head></html>',
      ),
    ).toEqual({ tipo: 'no_disponible', motivo: 'Página no encontrada' });
  });

  it('el JSON válido se procesa igual que con procesarRespuestaHoja', () => {
    expect(procesarTextoHoja(JSON.stringify({ ok: true, version: 1 }))).toEqual({
      tipo: 'script_antiguo',
    });
  });
});
