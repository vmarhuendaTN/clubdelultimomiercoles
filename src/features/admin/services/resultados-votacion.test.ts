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

  it('ordena por media y cuenta el reparto de estrellas', () => {
    const [primera, segunda] = r.ranking;
    expect(primera?.candidata.titulo).toBe('Betty');
    expect(primera?.media).toBe(4.5);
    expect(primera?.reparto).toEqual([0, 0, 0, 1, 1]);
    expect(segunda?.candidata.titulo).toBe('Circe');
    expect(segunda?.total).toBe(6);
    expect(segunda?.votos).toBe(2);
  });

  it('sin votos, media 0 y cerrada si ninguna candidata está abierta', () => {
    const vacio = resultadosVotacion([C('a', 'Circe', '2027-03', 'no')], [], '2027-03');
    expect(vacio.abierta).toBe(false);
    expect(vacio.ranking[0]?.media).toBe(0);
    expect(vacio.votantes).toEqual([]);
  });
});
