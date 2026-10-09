import { render, screen, within } from '@testing-library/react';
import { BookCarousel } from './BookCarousel';

const books = [
  { slug: 'circe', titulo: 'Circe', autor: 'Madeline Miller' },
  { slug: 'piranesi', titulo: 'Piranesi', autor: 'Susanna Clarke' },
];

describe('BookCarousel', () => {
  it('es una región con título y una lista de libros', () => {
    render(<BookCarousel titulo="Lo último que hemos leído" books={books} />);
    const region = screen.getByRole('region', { name: 'Lo último que hemos leído' });
    expect(within(region).getAllByRole('listitem')).toHaveLength(2);
    expect(within(region).getByRole('button', { name: 'Siguientes' })).toBeInTheDocument();
  });
});
