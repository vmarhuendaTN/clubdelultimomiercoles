import { fireEvent, render, screen } from '@testing-library/react';
import { EstadoCarga } from './EstadoCarga';

describe('EstadoCarga', () => {
  it('mientras carga lo anuncia', () => {
    render(<EstadoCarga tipo="cargando" texto="Cargando lecturas…" />);
    expect(screen.getByText('Cargando lecturas…')).toBeInTheDocument();
  });

  it('con error lo explica y deja reintentar', () => {
    const onReintentar = vi.fn();
    render(<EstadoCarga tipo="error" error="red" onReintentar={onReintentar} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/No hemos podido conectar/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onReintentar).toHaveBeenCalled();
  });
});
