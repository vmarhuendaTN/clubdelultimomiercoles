import { render, screen } from '@testing-library/react';
import { ClubPage } from './ClubPage';

describe('ClubPage', () => {
  it('explica cuándo, dónde y cómo proponer', () => {
    render(<ClubPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'El club' })).toBeInTheDocument();
    expect(screen.getByText(/a las 19:30/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Escribir al club' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    );
  });
});
