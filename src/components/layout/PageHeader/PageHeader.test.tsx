import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('tiene un único h1 y la barra compacta oculta a tecnologías de apoyo', () => {
    render(<PageHeader titulo="Lecturas" subtitulo="Todo lo que hemos leído" />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Lecturas');
  });
});
