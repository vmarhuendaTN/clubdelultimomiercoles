import type { Metadata } from 'next';
import { GalleryPage } from '@/features/gallery';

export const metadata: Metadata = {
  title: 'Galería',
  description:
    'Fotos de las sesiones del Club del Último Miércoles y nuestras publicaciones en Instagram.',
};

export default function Page() {
  return <GalleryPage />;
}
