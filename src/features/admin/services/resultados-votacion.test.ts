import type { Candidata, VotoFila } from '../types';
import { resultadosVotacion } from './resultados-votacion';

const C = (id: string, titulo: string, sesion = '2027-01', abierta = 'si'): Candidata => ({
  id,
  titulo,
  autor: '',
  sesion,
  abierta,
});
let n = 0;
const V = (
  nombre: string,
  candidata_id: string,
  puntos: number,
  voto_id: string,
  creado_en = '2026-12-01T10:00:00Z',
  sesion = '2027-01',
): VotoFila => ({
  id: `v${++n}`,
  creado_en,
  sesion,
  nombre,
  apellidos: 'García',
  candidata_id,
  puntos: String(puntos),
  voto_id,
});

describe('resultadosVotacion', () => {
  const candidatas = [C('a', 'Circe'), C('b', 'Betty'), C('x', 'Otra sesión', '2026-11', 'no')];
  const votos = [
    V('Ana', 'a', 5, 'v1'),
    V('Ana', 'b', 3, 'v1'),
    V('Luis', 'a', 4, 'v2'),
    V('Luis', 'b', 5, 'v2'),
    // Ana vuelve a votar más tarde: cuenta solo este voto.
    V('ana', 'a', 2, 'v3', '2026-12-02T10:00:00Z'),
    V('ana', 'b', 4, 'v3', '2026-12-02T10:00:00Z'),
    V('Marta', 'x', 5, 'v4', '2026-10-01T10:00:00Z', '2026-11'),
  ];

  const r = resultadosVotacion(candidatas, votos, '2027-01');

  it('solo la sesión pedida, abierta, con quién ha votado (una vez cada persona)', () => {
    expect(r.abierta).toBe(true);
    expect(r.candidatas.map((c) => c.id)).toEqual(['a', 'b']);
    expect(r.votantes).toEqual(['ana García', 'Luis García']);
    expect(r.votosPorPersona).toEqual([
      { nombre: 'ana García', votoIds: ['v1', 'v3'] },
      { nombre: 'Luis García', votoIds: ['v2'] },
    ]);
  });

  it('como una encuesta: cuenta quién ha marcado cada una y el porcentaje', () => {
    const encuesta = resultadosVotacion(
      [C('a', 'Circe'), C('b', 'Betty'), C('c', 'Maniac')],
      [
        V('Ana', 'a', 1, 'e1'),
        V('Ana', 'b', 1, 'e1'),
        V('Luis', 'b', 1, 'e2'),
        V('Marta', 'b', 1, 'e3'),
        V('Marta', 'c', 1, 'e3'),
      ],
      '2027-01',
    );
    expect(
      encuesta.ranking.map((x) => [x.candidata.titulo, x.votos, x.porcentaje, x.personas]),
    ).toEqual([
      ['Betty', 3, 100, ['Ana García', 'Luis García', 'Marta García']],
      ['Circe', 1, 33, ['Ana García']],
      ['Maniac', 1, 33, ['Marta García']],
    ]);
  });

  it('los votos antiguos con estrellas cuentan como marcados (solo el último de cada persona)', () => {
    const [primera, segunda] = r.ranking;
    expect(primera?.votos).toBe(2);
    expect(segunda?.votos).toBe(2);
    expect(primera?.personas).toEqual(['ana García', 'Luis García']);
  });

  it('sin votos, 0 y cerrada si ninguna candidata está abierta', () => {
    const vacio = resultadosVotacion([C('a', 'Circe', '2027-03', 'no')], [], '2027-03');
    expect(vacio.abierta).toBe(false);
    expect(vacio.archivada).toBe(false);
    expect(vacio.ranking[0]?.votos).toBe(0);
    expect(vacio.ranking[0]?.porcentaje).toBe(0);
    expect(vacio.votantes).toEqual([]);
  });

  it('archivada cuando todas sus candidatas lo están', () => {
    const archivada = resultadosVotacion(
      [{ ...C('a', 'Circe'), votacion_archivada: 'si' }],
      [],
      '2027-01',
    );
    expect(archivada.archivada).toBe(true);
  });
});
