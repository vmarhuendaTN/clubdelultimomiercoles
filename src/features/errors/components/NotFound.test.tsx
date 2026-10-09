import { render, screen } from '@testing-library/react';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('explica el error y ofrece volver al inicio', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Este sillón está vacío');
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
