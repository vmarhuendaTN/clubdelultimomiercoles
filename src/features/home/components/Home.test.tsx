import { render, screen } from '@testing-library/react';
import { Home } from './Home';

describe('Home', () => {
  it('tiene un único h1', () => {
    render(<Home />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
