import { fireEvent, render, screen } from '@testing-library/react';
import { Recomendadas } from './Recomendadas';

const CIRCE = { id: 'c', titulo: 'Circe', autor: 'Madeline Miller' };

describe('Recomendadas', () => {
  it('sin recomendadas no muestra nada', () => {
    const { container } = render(<Recomendadas libros={[]} onElegir={vi.fn()} completo={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('al pulsar una la propone', () => {
    const onElegir = vi.fn();
    render(<Recomendadas libros={[CIRCE]} onElegir={onElegir} completo={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Proponer Circe, Madeline Miller' }));
    expect(onElegir).toHaveBeenCalledWith(CIRCE);
  });

  it('con las tres lecturas llenas ya no se pueden pulsar', () => {
    render(<Recomendadas libros={[CIRCE]} onElegir={vi.fn()} completo />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Circe, Madeline Miller')).toBeInTheDocument();
  });
});
