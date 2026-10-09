import { render, screen } from '@testing-library/react';
import { Home } from './Home';

describe('Home', () => {
  it('tiene un único h1 y muestra las últimas lecturas', () => {
    render(
      <Home
        ultimasLecturas={[
          {
            slug: 'circe',
            titulo: 'Circe',
            autor: 'Madeline Miller',
            estado: 'leido',
            categorias: [],
            descripcion: [],
            citas: [],
            fuenteGoogle: false,
          },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Club del Último Miércoles',
    );
    expect(screen.getByRole('region', { name: 'Lo último que hemos leído' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todas' })).toHaveAttribute('href', '/lecturas/');
  });
});
