import { render, screen } from '@testing-library/react';
import { Header } from './Header';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

describe('Header', () => {
  it('contiene la navegación principal', () => {
    render(<Header />);
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page');
  });
});
