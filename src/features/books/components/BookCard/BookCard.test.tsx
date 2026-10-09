import { render, screen } from '@testing-library/react';
import { BookCard } from './BookCard';

describe('BookCard', () => {
  it('es un único enlace a la ficha con título y autor', () => {
    render(
      <BookCard
        book={{ slug: 'piranesi', titulo: 'Piranesi', autor: 'Susanna Clarke' }}
        sizes="50vw"
      />,
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Piranesi' })).toHaveAttribute(
      'href',
      '/lecturas/piranesi/',
    );
    expect(screen.getByRole('heading', { name: 'Piranesi' })).toBeInTheDocument();
    expect(screen.getByText('Susanna Clarke', { selector: 'p' })).toBeInTheDocument();
  });
});
