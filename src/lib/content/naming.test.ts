import { FECHA_SESION, slugify, tituloDesdeNombre } from './naming';

describe('naming', () => {
  it('normaliza nombres con tildes, eñes y espacios', () => {
    expect(slugify('Normas del Club (versión 2)')).toBe('normas-del-club-version-2');
    expect(slugify('Año Señor')).toBe('ano-senor');
  });

  it('genera títulos legibles', () => {
    expect(tituloDesdeNombre('normas-del-club')).toBe('Normas del club');
    expect(tituloDesdeNombre('Guía de lectura_Circe')).toBe('Guía de lectura Circe');
  });

  it('reconoce carpetas de sesión AAAA-MM-DD', () => {
    expect(FECHA_SESION.test('2025-11-26')).toBe(true);
    expect(FECHA_SESION.test('26-11-2025')).toBe(false);
  });
});
