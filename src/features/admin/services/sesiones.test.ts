import type { Candidata, Propuesta, VotoFila } from '../types';
import { porAnio, sesionesClub } from './sesiones';

const P = (id: string, mes: string, anio: string, archivada = ''): Propuesta => ({
  id,
  creado_en: '2026-01-01T10:00:00Z',
  nombre: `Persona ${id}`,
  apellidos: 'X',
  grupo: '',
  mes,
  anio,
  lectura_1: `Libro ${id}`,
  lectura_2: 'Común',
  lectura_3: '',
  tintero: '',
  motivo: '',
  estado: 'nueva',
  nota_equipo: '',
  archivada,
});
const C: Candidata[] = [
  {
    id: 'c1',
    sesion: '2026-11',
    titulo: 'Circe',
    autor: 'M. Miller',
    abierta: 'no',
    archivada: 'si',
  },
  { id: 'c2', sesion: '2027-01', titulo: 'Betty', autor: '', abierta: 'si' },
];
const V: VotoFila[] = [
  {
    id: 'v',
    creado_en: '2026-11-20T10:00:00Z',
    sesion: '2026-11',
    nombre: 'Ana',
    apellidos: 'G',
    candidata_id: 'c1',
    puntos: '4',
    voto_id: 'x',
  },
];

describe('sesionesClub', () => {
  const sesiones = sesionesClub(
    [
      P('1', 'noviembre', '2026', 'si'),
      P('2', 'noviembre', '2026', 'si'),
      P('3', 'enero', '2027'),
      P('4', 'septiembre', '2025', 'si'),
    ],
    C,
    V,
  );

  it('lista todas las sesiones de la más reciente a la más antigua con su estado', () => {
    expect(sesiones.map((s) => [s.clave, s.archivada])).toEqual([
      ['2027-01', false],
      ['2026-11', true],
      ['2025-09', true],
    ]);
  });

  it('resume cada sesión: personas, libros, votación y ganadora', () => {
    const nov = sesiones.find((s) => s.clave === '2026-11');
    expect(nov).toMatchObject({
      etiqueta: 'Noviembre de 2026',
      propuestas: 2,
      personas: 2,
      libros: 3,
      candidatas: 1,
      votantes: 1,
      ganadora: { titulo: 'Circe', votos: 1 },
    });
    expect(sesiones[0]?.votacionAbierta).toBe(true);
    expect(sesiones[0]?.ganadora).toBeUndefined();
  });

  it('agrupa por año', () => {
    expect(porAnio(sesiones).map((g) => [g.anio, g.sesiones.length])).toEqual([
      ['2027', 1],
      ['2026', 1],
      ['2025', 1],
    ]);
  });
});
