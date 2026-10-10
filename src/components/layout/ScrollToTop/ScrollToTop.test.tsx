import { fireEvent, render, screen } from '@testing-library/react';
import { ScrollToTop } from './ScrollToTop';

describe('ScrollToTop', () => {
  it('es un botón con el nombre manuscrito del club que sube al principio', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
    window.scrollTo = vi.fn() as never;
    const { container } = render(<ScrollToTop />);
    const boton = screen.getByRole('button', { name: 'Club del Último Miércoles: volver arriba' });
    expect(container.querySelector('img')?.getAttribute('src')).toContain('logo-pie');
    fireEvent.click(boton);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
