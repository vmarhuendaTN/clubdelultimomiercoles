import { render, screen } from '@testing-library/react';
import { NavLinks } from './NavLinks';

vi.mock('next/navigation', () => ({ usePathname: () => '/lecturas/el-secreto' }));

describe('NavLinks', () => {
  it('marca la sección actual con aria-current', () => {
    render(<NavLinks estilo="pestanas" />);
    expect(screen.getByRole('link', { name: 'Lecturas' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });
});
