import { render, screen } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('expone el valor en texto', () => {
    render(<StarRating valor={4.3} />);
    expect(screen.getByRole('img', { name: '4,3 de 5 estrellas' })).toBeInTheDocument();
  });
});
