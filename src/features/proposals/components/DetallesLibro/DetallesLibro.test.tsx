import { render, screen } from '@testing-library/react';
import { DetallesLibro } from './DetallesLibro';

describe('DetallesLibro', () => {
  it('enseña año, páginas, sinopsis y nota', () => {
    render(
      <DetallesLibro
        libro={{ anio: '1866', paginas: '832', sinopsis: 'Raskólnikov…', nota: 'Edición Alba' }}
      />,
    );
    expect(screen.getByText('1866 · 832 págs.')).toBeInTheDocument();
    expect(screen.getByText('Raskólnikov…')).toBeInTheDocument();
    expect(screen.getByText(/Edición Alba/)).toBeInTheDocument();
  });

  it('sin detalles no pinta nada', () => {
    const { container } = render(<DetallesLibro libro={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
