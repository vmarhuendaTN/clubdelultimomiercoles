import { render, screen } from '@testing-library/react';
import { ReviewList } from './ReviewList';

describe('ReviewList', () => {
  it('muestra autor, estrellas, fecha y opinión', () => {
    render(
      <ReviewList
        valoraciones={[
          {
            id: '1',
            bookSlug: 'circe',
            estrellas: 4,
            opinion: 'Me encantó el final.',
            autorNombre: 'Victoria M.',
            creadoEn: '2025-02-01T10:00:00Z',
            actualizadoEn: '2025-02-01T10:00:00Z',
          },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Victoria M.' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '4 de 5 estrellas' })).toBeInTheDocument();
    expect(screen.getByText('1 de febrero de 2025')).toBeInTheDocument();
    expect(screen.getByText('Me encantó el final.')).toBeInTheDocument();
  });
});
