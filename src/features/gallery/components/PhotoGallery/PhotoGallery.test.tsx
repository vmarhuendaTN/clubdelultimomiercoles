import { render, screen } from '@testing-library/react';
import { PhotoGallery } from './PhotoGallery';

describe('PhotoGallery', () => {
  it('agrupa las fotos por sesión con fecha legible y alt descriptivo', () => {
    render(
      <PhotoGallery
        sesiones={[
          {
            fecha: '2025-11-26',
            fotos: [
              {
                url: '/generated/fotos/2025-11-26/01.webp',
                miniatura: '/generated/fotos/2025-11-26/01-mini.webp',
                ancho: 1600,
                alto: 1067,
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: '26 de noviembre de 2025' })).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Foto 1 de la sesión del 26 de noviembre de 2025' }),
    ).toBeInTheDocument();
  });
});
