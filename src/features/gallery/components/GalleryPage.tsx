import { PageHeader } from '@/components/layout';
import { getContenido } from '@/lib/content';
import { PhotoGallery } from './PhotoGallery';

export function GalleryPage() {
  const { sesiones } = getContenido();
  return (
    <div className="contenedor">
      <PageHeader titulo="Fotos" subtitulo="Algunos momentos de nuestras sesiones." />
      <PhotoGallery sesiones={sesiones} />
    </div>
  );
}
