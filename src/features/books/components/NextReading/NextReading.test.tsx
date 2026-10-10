import { render, screen } from '@testing-library/react';
import type { Lectura } from '../../types';
import { NextReading } from './NextReading';

const lectura: Lectura = {
  slug: 'sinsonte',
  titulo: 'Sinsonte',
  autor: 'Walter Tevis',
  estado: 'proximo',
  fechaSesion: '2026-11-25',
  categorias: [],
  descripcion: ['En un futuro lejano, los robots…', 'Segundo párrafo.'],
  citas: [],
  fuenteGoogle: true,
};

describe('NextReading', () => {
  it('destaca la próxima lectura con su sesión, sinopsis y enlace a la ficha', () => {
    render(<NextReading lectura={lectura} />);
    expect(screen.getByText('Próxima lectura')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Sinsonte' })).toBeInTheDocument();
    expect(screen.getByText('Walter Tevis', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Sesión del 25 de noviembre de 2026')).toBeInTheDocument();
    expect(screen.getByText('En un futuro lejano, los robots…')).toBeInTheDocument();
    expect(screen.queryByText('Segundo párrafo.')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la ficha de Sinsonte' })).toHaveAttribute(
      'href',
      '/lecturas/sinsonte/',
    );
  });
});
