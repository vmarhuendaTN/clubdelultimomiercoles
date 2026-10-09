import { volverArriba } from './scroll';

function simularMovimientoReducido(reduce: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as never;
}

describe('volverArriba', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as never;
  });

  it('sube con suavidad y lleva el foco al contenido principal', () => {
    simularMovimientoReducido(false);
    document.body.innerHTML = '<main id="contenido" tabindex="-1"></main>';
    volverArriba('contenido');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(document.activeElement).toBe(document.getElementById('contenido'));
  });

  it('sube sin animación si se prefiere menos movimiento', () => {
    simularMovimientoReducido(true);
    volverArriba('no-existe');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });
});
