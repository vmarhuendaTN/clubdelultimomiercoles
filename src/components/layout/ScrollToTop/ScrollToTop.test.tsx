import { fireEvent, render, screen } from '@testing-library/react';
import { ScrollToTop } from './ScrollToTop';

describe('ScrollToTop', () => {
  it('es un botón con el nombre del club que sube al principio', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
    window.scrollTo = vi.fn() as never;
    render(<ScrollToTop texto="Club del Último Miércoles" />);
    const boton = screen.getByRole('button', { name: 'Club del Último Miércoles: volver arriba' });
    expect(boton).toHaveTextContent('Club del Último Miércoles');
    fireEvent.click(boton);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
