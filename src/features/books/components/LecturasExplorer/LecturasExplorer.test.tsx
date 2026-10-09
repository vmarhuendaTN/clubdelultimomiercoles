import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Lectura } from '../../types';
import { LecturasExplorer } from './LecturasExplorer';

const base = { categorias: [], descripcion: [], citas: [], fuenteGoogle: false };
const lecturas: Lectura[] = [
  { ...base, slug: 'leviatan', titulo: 'Leviatán', autor: 'Paul Auster', estado: 'leido' },
  { ...base, slug: 'amarilla', titulo: 'Amarilla', autor: 'R. F. Kuang', estado: 'leido' },
  { ...base, slug: 'circe', titulo: 'Circe', autor: 'Madeline Miller', estado: 'proximo' },
];
const ATRIBUCION = 'Datos de libros: Google Libros.';

describe('LecturasExplorer', () => {
  it('ordena las pestañas: Próximo, Leídos, Propuestas', () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Próximo',
      'Leídos',
      'Propuestas',
    ]);
  });

  it('se abre en Próximo si hay próxima lectura, sin la atribución de Google', () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    expect(screen.getByRole('tab', { name: 'Próximo' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('link', { name: 'Circe' })).toBeInTheDocument();
    expect(screen.getByText('1 libro')).toBeInTheDocument();
    expect(screen.queryByText(ATRIBUCION)).not.toBeInTheDocument();
  });

  it('sin próxima lectura se abre en Leídos', () => {
    render(<LecturasExplorer lecturas={lecturas.filter((l) => l.estado === 'leido')} />);
    expect(screen.getByRole('tab', { name: 'Leídos' })).toHaveAttribute('aria-selected', 'true');
  });

  it('en Leídos muestra los libros y la atribución a Google Libros', async () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Leídos' }));
    expect(screen.getByText('2 libros')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leviatán' })).toBeInTheDocument();
    expect(screen.getByText(ATRIBUCION)).toBeInTheDocument();
  });

  it('busca por autor y muestra un estado vacío si no hay coincidencias', async () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Leídos' }));
    const buscador = screen.getByRole('searchbox', { name: 'Buscar por título o autor' });
    await userEvent.type(buscador, 'auster');
    expect(screen.getByText('1 libro')).toBeInTheDocument();
    await userEvent.clear(buscador);
    await userEvent.type(buscador, 'zzz');
    expect(screen.getByText('No hay libros que coincidan con «zzz».')).toBeInTheDocument();
  });

  it('en propuestas vacías invita a proponer, sin la atribución de Google', async () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Propuestas' }));
    expect(screen.getByRole('link', { name: 'Proponer una lectura' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    );
    expect(screen.queryByText(ATRIBUCION)).not.toBeInTheDocument();
  });
});
