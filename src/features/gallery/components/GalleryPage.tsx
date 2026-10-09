import { PageHeader } from '@/components/layout';
import { InstagramCarousel } from '@/features/instagram';
import { getInstagramPosts } from '@/features/instagram/server';
import { getContenido } from '@/lib/content';
import { PhotoGallery } from './PhotoGallery';
import styles from './GalleryPage.module.css';

export function GalleryPage() {
  const { sesiones } = getContenido();
  return (
    <div className="contenedor">
      <PageHeader
        titulo="Galería"
        subtitulo="Momentos del club: nuestras sesiones y lo último en Instagram."
      />
      <div className={styles.secciones}>
        <InstagramCarousel posts={getInstagramPosts()} />
        <section aria-labelledby="fotos-sesiones">
          <h2 id="fotos-sesiones" className={styles.titulo}>
            Fotos de las sesiones
          </h2>
          <PhotoGallery sesiones={sesiones} />
        </section>
      </div>
    </div>
  );
}
