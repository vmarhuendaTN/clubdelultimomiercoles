import { render, screen } from '@testing-library/react';
import { ListaAgrupada } from './ListaAgrupada';

describe('ListaAgrupada', () => {
  it('pinta filas con detalle, enlaces internos y externos', () => {
    render(
      <ListaAgrupada
        etiqueta="Datos del club"
        filas={[
          { icono: 'calendario', titulo: 'Cuándo', detalle: 'Último miércoles, 19:30' },
          { icono: 'documento', titulo: 'Documentos', href: '/documentos/' },
          {
            icono: 'externo',
            titulo: 'Substack',
            href: 'https://ejemplo.substack.com',
            externo: true,
          },
        ]}
      />,
    );
    expect(screen.getByRole('list', { name: 'Datos del club' })).toBeInTheDocument();
    expect(screen.getByText('Último miércoles, 19:30')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Documentos/ })).toHaveAttribute(
      'href',
      '/documentos/',
    );
    expect(screen.getByRole('link', { name: /Substack/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });
});
