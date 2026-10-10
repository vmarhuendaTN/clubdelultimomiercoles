import { guardarPreferencia, leerPreferencia } from './preferencias';

describe('preferencias', () => {
  beforeEach(() => window.localStorage.clear());

  it('guarda y lee un valor', () => {
    expect(leerPreferencia('x')).toBeNull();
    guardarPreferencia('x', 'si');
    expect(leerPreferencia('x')).toBe('si');
  });

  it('sin almacenamiento disponible no rompe', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('bloqueado');
      },
    });
    expect(leerPreferencia('x')).toBeNull();
    expect(() => guardarPreferencia('x', 'si')).not.toThrow();
    Object.defineProperty(window, 'localStorage', original);
  });
});
