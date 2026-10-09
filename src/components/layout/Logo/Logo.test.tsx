import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  it('enlaza a inicio con el nombre del club como texto alternativo', () => {
    render(<Logo />);
    const link = screen.getByRole('link', { name: 'Club del Último Miércoles' });
    expect(link).toHaveAttribute('href', '/');
  });
});
