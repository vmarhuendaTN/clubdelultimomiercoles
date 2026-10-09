import { render, screen, within } from '@testing-library/react';
import { TabBar } from './TabBar';

vi.mock('next/navigation', () => ({ usePathname: () => '/el-club/' }));

describe('TabBar', () => {
  it('muestra las cuatro pestañas', () => {
    render(<TabBar />);
    const nav = screen.getByRole('navigation', { name: 'Pestañas' });
    expect(within(nav).getAllByRole('link')).toHaveLength(4);
    expect(within(nav).getByRole('link', { name: 'El club' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
