import { render, screen } from '@testing-library/react';
import { BookCover } from './BookCover';

const book = { titulo: 'Circe', autor: 'Madeline Miller' };

describe('BookCover', () => {
  it('sin portada muestra un placeholder con alt descriptivo', () => {
    render(<BookCover book={book} sizes="200px" />);
    expect(
      screen.getByRole('img', { name: 'Portada de Circe, de Madeline Miller' }),
    ).toBeInTheDocument();
  });

  it('con portada usa la imagen y su alt', () => {
    render(<BookCover book={{ ...book, portadaUrl: '/portada.webp' }} sizes="200px" />);
    expect(
      screen.getByRole('img', { name: 'Portada de Circe, de Madeline Miller' }),
    ).toHaveAttribute('src', expect.stringContaining('portada.webp'));
  });

  it('decorativa no se anuncia', () => {
    render(<BookCover book={book} sizes="200px" decorativa />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
