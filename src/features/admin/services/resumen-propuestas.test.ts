import type { Propuesta } from '../types';
import {
  claveLibro,
  clavePeriodo,
  etiquetaPeriodo,
  periodos,
  resumir,
  textoResumen,
} from './resumen-propuestas';

let n = 0;
const propuesta = (cambios: Partial<Propuesta>): Propuesta => ({
  id: `p${++n}`,
  creado_en: '2026-11-01T10:00:00Z',
  nombre: 'Ana',
  apellidos: 'García',
  grupo: 'Miércoles',
  mes: 'enero',
  anio: '2027',
  lectura_1: '',
  lectura_2: '',
  lectura_3: '',
  tintero: '',
  motivo: '',
  estado: 'nueva',
  nota_equipo: '',
  ...cambios,
});

describe('periodos', () => {
  it('claves ordenables y etiquetas en español', () => {
    expect(clavePeriodo({ mes: 'Enero', anio: '2027' })).toBe('2027-01');
    expect(clavePeriodo({ mes: 'nada', anio: '2027' })).toBe('');
    expect(etiquetaPeriodo('2026-11')).toBe('Noviembre de 2026');
  });

  it('lista las sesiones de la más reciente a la más antigua con su total', () => {
    const lista = periodos([
      propuesta({ mes: 'noviembre', anio: '2026' }),
      propuesta({}),
      propuesta({}),
    ]);
    expect(lista).toEqual([
      { clave: '2027-01', etiqueta: 'Enero de 2027', total: 2 },
      { clave: '2026-11', etiqueta: 'Noviembre de 2026', total: 1 },
    ]);
  });
});

describe('claveLibro', () => {
  it('agrupa el mismo libro escrito de formas distintas', () => {
    const clave = claveLibro('Circe, Madeline Miller');
    expect(claveLibro('circe')).toBe(clave);
    expect(claveLibro('Circe de Madeline Miller')).toBe(clave);
    expect(claveLibro('«Circe» - M. Miller')).toBe(clave);
    expect(claveLibro('La vegetariana, Han Kang')).toBe(claveLibro('vegetariana'));
    expect(claveLibro('  ')).toBe('');
  });

  it('no corta títulos que llevan «de» en minúscula', () => {
    expect(claveLibro('Historia de dos ciudades')).toBe('historia de dos ciudades');
  });
});

describe('resumir', () => {
  const todas = [
    propuesta({
      nombre: 'Ana',
      lectura_1: 'Circe, Madeline Miller',
      lectura_2: 'Betty',
      lectura_3: 'Maniac',
      tintero: 'Piranesi, Susanna Clarke; Hamnet, Maggie O’Farrell',
    }),
    propuesta({
      nombre: 'Luis',
      apellidos: 'Pérez',
      lectura_1: 'Betty, Tiffany McDaniel',
      lectura_2: 'circe',
      lectura_3: 'Reunión',
    }),
    propuesta({
      nombre: 'Marta',
      apellidos: 'Ruiz',
      lectura_1: 'Circe',
      lectura_2: 'Klara y el sol',
      lectura_3: 'Betty',
      tintero: 'Piranesi, Susanna Clarke',
    }),
    // Ana vuelve a enviar: cuenta como una persona, y su Circe no se duplica.
    propuesta({
      nombre: 'Ana',
      lectura_1: 'Tan poca vida',
      lectura_2: 'Circe',
      lectura_3: 'Reunión',
    }),
    propuesta({
      mes: 'noviembre',
      anio: '2026',
      nombre: 'Luis',
      apellidos: 'Pérez',
      lectura_1: 'Betty',
    }),
  ];
  const r = resumir(todas, '2027-01');

  it('cuenta envíos, personas y coincidencias', () => {
    expect(r.envios).toBe(4);
    expect(r.personas).toBe(3);
    expect(r.coincidencias).toBe(3); // Circe, Betty y Reunión
    expect(r.repetidos).toEqual(['Ana García']);
  });

  it('ordena por personas y luego por puntos, y dice quién lo propuso', () => {
    const [primero, segundo] = r.libros;
    expect(primero?.texto).toBe('Circe');
    expect(primero?.votos).toBe(3);
    expect(primero?.puntos).toBe(3 + 2 + 3);
    expect(primero?.personas.map((p) => p.nombre)).toEqual([
      'Ana García',
      'Marta Ruiz',
      'Luis Pérez',
    ]);
    expect(segundo?.clave).toBe(claveLibro('Betty'));
    expect(segundo?.otrosPeriodos).toEqual(['Noviembre de 2026']);
  });

  it('suma el tintero que marcó la gente', () => {
    expect(r.tintero[0]).toEqual({ texto: 'Piranesi, Susanna Clarke', veces: 2 });
  });

  it('con «todas» resume todas las sesiones', () => {
    expect(resumir(todas, '').envios).toBe(5);
  });

  it('prepara un texto para copiar', () => {
    const texto = textoResumen(r, 'Enero de 2027', 2);
    expect(texto.split('\n')).toEqual([
      'Propuestas · Enero de 2027',
      '3 personas, 6 libros distintos',
      '',
      '1. Circe — 3 personas, 8 puntos',
      expect.stringMatching(/^2\. Betty.* — 3 personas, 6 puntos$/),
    ]);
  });
});
