import { render, screen, within } from '@testing-library/react';
import { InstagramCarousel } from './InstagramCarousel';

describe('InstagramCarousel', () => {
  it('muestra cada publicación enlazada a Instagram con alt desde el pie', () => {
    render(
      <InstagramCarousel
        posts={[
          {
            id: '1',
            permalink: 'https://www.instagram.com/p/abc/',
            tipo: 'VIDEO',
            imagenUrl: '/generated/instagram/1.webp',
            pie: 'Sesión de Circe #club',
            publicadoEn: '2025-01-30T10:00:00+0000',
          },
        ]}
      />,
    );
    const region = screen.getByRole('region', { name: 'En Instagram' });
    expect(within(region).getByRole('img', { name: 'Sesión de Circe' })).toBeInTheDocument();
    expect(within(region).getByRole('link', { name: /Sesión de Circe/ })).toHaveAttribute(
      'href',
      'https://www.instagram.com/p/abc/',
    );
    expect(within(region).getByText('Vídeo')).toBeInTheDocument();
  });

  it('sin publicaciones ofrece el perfil incrustado y el enlace a la cuenta', () => {
    render(<InstagramCarousel posts={[]} />);
    expect(screen.getByRole('link', { name: 'Ver en Instagram' })).toHaveAttribute(
      'href',
      expect.stringContaining('instagram.com'),
    );
  });
});
