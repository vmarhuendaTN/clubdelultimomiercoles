import { validarFilasLecturas } from './lecturas-schema';

describe('validarFilasLecturas', () => {
  it('acepta una fila mínima y aplica valores por defecto', () => {
    const { filas, errores } = validarFilasLecturas([
      {
        titulo: 'Circe',
        autor: 'Madeline Miller',
        estado: 'leido',
        orden: '3',
        visible: 'si',
        isbn: '',
      },
    ]);
    expect(errores).toEqual([]);
    expect(filas[0]).toMatchObject({ titulo: 'Circe', orden: 3, visible: true, isbn: undefined });
  });

  it('informa de las filas con errores sin descartar las demás', () => {
    const { filas, errores } = validarFilasLecturas([
      { titulo: '', autor: 'X', estado: 'leido' },
      { titulo: 'Y', autor: 'Z', estado: 'leyendo' },
      { titulo: 'Circe', autor: 'Madeline Miller', estado: 'propuesta', visible: 'no' },
    ]);
    expect(errores.map((e) => e.fila)).toEqual([2, 3]);
    expect(errores[1]?.mensaje).toMatch(/estado debe ser/);
    expect(filas).toHaveLength(1);
    expect(filas[0]?.visible).toBe(false);
  });
});
