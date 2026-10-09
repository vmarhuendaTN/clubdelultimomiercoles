import Image from 'next/image';
import { Button, Card, Carousel, CarouselItem, Icon } from '@/components/ui';
import { site } from '@/config/site';
import { formatFecha } from '@/lib/format';
import type { InstagramPost } from '../../types';
import { altDesdePie } from '../../utils';
import styles from './InstagramCarousel.module.css';

const TIPO: Record<InstagramPost['tipo'], string | undefined> = {
  IMAGE: undefined,
  VIDEO: 'Vídeo',
  CAROUSEL_ALBUM: 'Varias fotos',
};

/** Últimas publicaciones de @elultimomiercoles en carrusel. */
export function InstagramCarousel({ posts }: { posts: readonly InstagramPost[] }) {
  const seguir = (
    <a href={site.instagram} className={styles.seguir} rel="noopener noreferrer">
      <Icon name="instagram" size="sm" />
      Síguenos
    </a>
  );

  if (!posts.length) {
    return (
      <section aria-labelledby="instagram-titulo" className={styles.vacio}>
        <h2 id="instagram-titulo" className={styles.titulo}>
          En Instagram
        </h2>
        <Card>
          <div className={styles.vacioCuerpo}>
            <Icon name="instagram" size="lg" />
            <p>Fotos de las sesiones, lecturas y novedades del club en @elultimomiercoles.</p>
            <Button href={site.instagram} variant="secundario" icono="externo">
              Ver en Instagram
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <Carousel titulo="En Instagram" formato="cuadrado" accion={seguir}>
      {posts.map((post) => {
        const fecha = formatFecha(post.publicadoEn.slice(0, 10));
        const tipo = TIPO[post.tipo];
        return (
          <CarouselItem key={post.id}>
            <a href={post.permalink} className={styles.post} rel="noopener noreferrer">
              <Image
                src={post.imagenUrl}
                alt={altDesdePie(post.pie, fecha)}
                width={600}
                height={600}
                sizes="(width >= 1024px) 280px, 70vw"
                className={styles.img}
              />
              {tipo && <span className={styles.tipo}>{tipo}</span>}
              <span className="visually-hidden">(abre Instagram)</span>
            </a>
            <time dateTime={post.publicadoEn} className={styles.fecha}>
              {fecha}
            </time>
          </CarouselItem>
        );
      })}
    </Carousel>
  );
}
