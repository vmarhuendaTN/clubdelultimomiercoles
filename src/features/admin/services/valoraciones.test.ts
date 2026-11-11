import type { InscritaBasica, LecturaValorable, Valoracion } from '../types';
import {
  formatoNota,
  lecturasOrdenadas,
  mediaBorrador,
  notaValida,
  notasDeLectura,
  numeroNota,
  porLibro,
  porPersona,
} from './valoraciones';

const L = (
  id: string,
  titulo: string,
  cambios: Partial<LecturaValorable> = {},
): LecturaValorable => ({
  id,
  titulo,
  autor: '',
  estado: 'leido',
  fecha_sesion: '',
  orden: '',
  ...cambios,
});
const I = (id: string, nombre: string, apellidos: string): InscritaBasica => ({
  id,
  nombre,
  apellidos,
  activa: 'si',
});
const V = (lectura: LecturaValorable, inscrita: InscritaBasica, nota: string): Valoracion => ({
  id: `${lectura.id}-${inscrita.id}`,
  creado_en: '',
  lectura_id: lectura.id,
  titulo: lectura.titulo,
  autor: '',
  inscrita_id: inscrita.id,
  nombre: inscrita.nombre,
  apellidos: inscrita.apellidos,
  nota,
});

const sinsonte = L('l1', 'Sinsonte', { fecha_sesion: '2026-10-28' });
const secreto = L('l2', 'El secreto', { fecha_sesion: '2026-09-30' });
const final = L('l3', 'El sentido de un final', { estado: 'proximo', fecha_sesion: '2026-11-25' });
const ana = I('i1', 'Ana', 'García');
const luis = I('i2', 'Luis', 'Pérez');
const VALORACIONES = [V(sinsonte, ana, '8'), V(sinsonte, luis, '6,5'), V(secreto, ana, '9')];

describe('valoraciones', () => {
  it('lee y valida notas de 0 a 10 con un decimal', () => {
    expect(numeroNota('7,5')).toBe(7.5);
    expect(numeroNota('')).toBeNull();
    expect(notaValida('')).toBe(true);
    expect(notaValida('10')).toBe(true);
    expect(notaValida('7,25')).toBe(false);
    expect(notaValida('11')).toBe(false);
    expect(notaValida('siete')).toBe(false);
    expect(formatoNota(7.25)).toBe('7,3');
    expect(formatoNota(8)).toBe('8');
  });

  it('media por libro, con las notas de mayor a menor', () => {
    const libros = porLibro(VALORACIONES, [sinsonte, secreto, final]);
    expect(libros.map((l) => [l.lectura.titulo, l.n, l.media])).toEqual([
      ['Sinsonte', 2, 7.25],
      ['El secreto', 1, 9],
    ]);
    expect(libros[0]?.notas.map((n) => `${n.nombre} ${n.nota}`)).toEqual([
      'Ana G. 8',
      'Luis P. 6,5',
    ]);
  });

  it('media por persona', () => {
    const personas = porPersona(VALORACIONES, [luis, ana]);
    expect(personas.map((p) => [p.inscrita.nombre, p.n, p.media])).toEqual([
      ['Ana', 2, 8.5],
      ['Luis', 1, 6.5],
    ]);
  });

  it('ordena lecturas con la próxima primero y rellena el formulario', () => {
    expect(lecturasOrdenadas([secreto, final, sinsonte]).map((l) => l.id)).toEqual([
      'l3',
      'l1',
      'l2',
    ]);
    expect(notasDeLectura(VALORACIONES, 'l1')).toEqual({ i1: '8', i2: '6,5' });
    expect(mediaBorrador({ i1: '8', i2: '7', i3: '', i4: 'x' })).toEqual({ n: 2, media: 7.5 });
  });
});
