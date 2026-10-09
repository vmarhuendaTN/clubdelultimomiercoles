import { render, screen } from '@testing-library/react';
import type { Lectura } from '../../types';
import { BookDetail } from './BookDetail';

const lectura: Lectura = {
  slug: 'circe',
  titulo: 'Circe',
  autor: 'Madeline Miller',
  estado: 'leido',
  anio: 2019,
  paginas: 400,
  fechaSesion: '2025-01-29',
  categorias: ['Ficción'],
  descripcion: ['En la casa de Helios nace una niña.'],
  notaClub: 'Nos encantó.',
  enlaceGoogle: 'https://books.google.com/books?id=x',
};

describe('BookDetail', () => {
  it('muestra título, autor, datos, sinopsis y enlaces', () => {
    render(<BookDetail lectura={lectura} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Circe' })).toBeInTheDocument();
    expect(screen.getByText('Madeline Miller', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('400 páginas')).toBeInTheDocument();
    expect(screen.getByText('Sesión: 29 de enero de 2025')).toBeInTheDocument();
    expect(screen.getByText('En la casa de Helios nace una niña.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver en Google Libros/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lecturas' })).toHaveAttribute('href', '/lecturas/');
  });

  it('sin sinopsis no muestra la sección (no se inventa texto)', () => {
    render(<BookDetail lectura={{ ...lectura, descripcion: [], notaClub: undefined }} />);
    expect(screen.queryByRole('heading', { name: 'Sinopsis' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nota del club' })).not.toBeInTheDocument();
  });
});
