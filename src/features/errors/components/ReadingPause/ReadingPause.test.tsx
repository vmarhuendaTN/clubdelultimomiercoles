import { fireEvent, render, screen } from '@testing-library/react';
import { ReadingPause } from './ReadingPause';

describe('ReadingPause', () => {
  it('muestra «Estamos leyendo» con el logo completo y sin datos técnicos', () => {
    render(<ReadingPause />);
    expect(screen.getByRole('heading', { level: 1, name: 'Estamos leyendo' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Club del Último Miércoles' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('ofrece reintentar si se puede', () => {
    const reintentar = vi.fn();
    render(<ReadingPause onReintentar={reintentar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a intentarlo' }));
    expect(reintentar).toHaveBeenCalled();
  });
});
