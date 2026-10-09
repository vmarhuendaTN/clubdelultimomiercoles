import { csvToObjects, parseCsv } from './csv';

describe('csv', () => {
  it('respeta comillas, comas y comillas dobles', () => {
    expect(parseCsv('a,b\n"x, y","dijo ""hola"""\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'dijo "hola"'],
    ]);
  });

  it('convierte a objetos por cabecera', () => {
    expect(csvToObjects('titulo,autor\r\nCirce,Madeline Miller\r\n')).toEqual([
      { titulo: 'Circe', autor: 'Madeline Miller' },
    ]);
  });
});
