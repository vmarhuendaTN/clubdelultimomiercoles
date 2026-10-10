import { render, screen } from '@testing-library/react';
import { ClubPage } from './ClubPage';

describe('ClubPage', () => {
  it('explica cuándo y dónde, enlaza el Substack y ofrece unirse', () => {
    render(<ClubPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'El club' })).toBeInTheDocument();
    expect(screen.getByText(/a las 19:30/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Proponer una lectura' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leer en Substack' })).toHaveAttribute(
      'href',
      'https://idecuba.substack.com/',
    );
    expect(screen.getByRole('heading', { name: 'Quiero ser del club' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preparar el email' })).toBeInTheDocument();
  });
});
