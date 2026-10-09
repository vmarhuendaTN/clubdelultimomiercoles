import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('solo enlaza contacto, Instagram y privacidad, sin dirección', () => {
    render(<Footer />);
    const enlaces = screen.getAllByRole('link');
    expect(enlaces.map((a) => a.textContent)).toEqual(['Escríbenos', 'Instagram', 'Privacidad']);
    expect(screen.getByRole('link', { name: 'Escríbenos' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    );
    expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute(
      'href',
      '/privacidad/',
    );
    expect(
      screen.getByRole('button', { name: 'Club del Último Miércoles: volver arriba' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Don Ramón de la Cruz/)).not.toBeInTheDocument();
  });
});
