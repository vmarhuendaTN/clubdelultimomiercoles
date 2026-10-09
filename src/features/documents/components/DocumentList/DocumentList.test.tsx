import { render, screen } from '@testing-library/react';
import { DocumentList } from './DocumentList';

describe('DocumentList', () => {
  it('enlaza cada PDF con su título y tamaño', () => {
    render(
      <DocumentList
        documentos={[
          {
            titulo: 'Normas del club',
            url: '/generated/documentos/normas-del-club.pdf',
            bytes: 204800,
          },
        ]}
      />,
    );
    const link = screen.getByRole('link', { name: /Normas del club/ });
    expect(link).toHaveAttribute('href', '/generated/documentos/normas-del-club.pdf');
    expect(link).toHaveTextContent('PDF · 200 KB');
  });

  it('muestra un estado vacío amable', () => {
    render(<DocumentList documentos={[]} />);
    expect(screen.getByText('Todavía no hay documentos publicados.')).toBeInTheDocument();
  });
});
