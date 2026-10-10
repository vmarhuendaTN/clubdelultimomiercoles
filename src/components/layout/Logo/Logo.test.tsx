import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  it('en la barra enlaza a inicio con el logo de cabecera', () => {
    render(<Logo />);
    expect(screen.getByRole('link', { name: 'Club del Último Miércoles' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('img', { name: 'Club del Último Miércoles' })).toHaveAttribute(
      'src',
      expect.stringContaining('logo-cabecera'),
    );
  });

  it('en grande usa el logo completo con su texto alternativo', () => {
    render(<Logo tamano="grande" />);
    expect(screen.getByRole('img', { name: 'Club del Último Miércoles' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Club del Último Miércoles' });
    expect(link).toHaveAttribute('href', '/');
  });
});
