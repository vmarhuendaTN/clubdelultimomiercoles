import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Lectura } from '../../types';
import { LecturasExplorer } from './LecturasExplorer';

const base = { categorias: [], descripcion: [] };
const lecturas: Lectura[] = [
  { ...base, slug: 'leviatan', titulo: 'Leviatán', autor: 'Paul Auster', estado: 'leido' },
  { ...base, slug: 'amarilla', titulo: 'Amarilla', autor: 'R. F. Kuang', estado: 'leido' },
  { ...base, slug: 'circe', titulo: 'Circe', autor: 'Madeline Miller', estado: 'proximo' },
];

describe('LecturasExplorer', () => {
  it('muestra los leídos por defecto con su recuento', () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    expect(screen.getByText('2 libros')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leviatán' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Circe' })).not.toBeInTheDocument();
  });

  it('cambia de estado con el control segmentado', async () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Próximo' }));
    expect(screen.getByRole('link', { name: 'Circe' })).toBeInTheDocument();
    expect(screen.getByText('1 libro')).toBeInTheDocument();
  });

  it('busca por autor y muestra un estado vacío si no hay coincidencias', async () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    const buscador = screen.getByRole('searchbox', { name: 'Buscar por título o autor' });
    await userEvent.type(buscador, 'auster');
    expect(screen.getByText('1 libro')).toBeInTheDocument();
    await userEvent.clear(buscador);
    await userEvent.type(buscador, 'zzz');
    expect(screen.getByText('No hay libros que coincidan con «zzz».')).toBeInTheDocument();
  });

  it('en propuestas vacías invita a proponer', async () => {
    render(<LecturasExplorer lecturas={lecturas} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Propuestas' }));
    expect(screen.getByRole('link', { name: 'Proponer una lectura' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    );
  });
});
