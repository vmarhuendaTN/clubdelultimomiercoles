import { fireEvent, render, screen } from '@testing-library/react';
import { Chip } from './Chip';

describe('Chip', () => {
  it('pulsable: es un botón que avisa al pulsarlo', () => {
    const onPulsar = vi.fn();
    render(<Chip onPulsar={onPulsar}>Circe</Chip>);
    fireEvent.click(screen.getByRole('button', { name: /Circe/ }));
    expect(onPulsar).toHaveBeenCalled();
  });

  it('elegido: el texto se ve y el botón de quitar tiene nombre', () => {
    const onQuitar = vi.fn();
    render(<Chip onQuitar={onQuitar}>Circe</Chip>);
    expect(screen.getByText('Circe')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Circe' }));
    expect(onQuitar).toHaveBeenCalled();
  });
});
