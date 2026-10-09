import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('enlaza los textos legales y el Instagram del club', () => {
    render(<Footer />);
    expect(screen.getByRole('navigation', { name: 'Legal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Síguenos en Instagram' })).toHaveAttribute(
      'href',
      expect.stringContaining('instagram.com'),
    );
  });
});
