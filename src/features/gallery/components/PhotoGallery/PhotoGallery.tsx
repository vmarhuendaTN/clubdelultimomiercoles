import Image from 'next/image';
import { Icon } from '@/components/ui';
import type { SesionFotos } from '@/lib/content';
import { withBasePath } from '@/lib/env';
import { formatFecha } from '@/lib/format';
import styles from './PhotoGallery.module.css';

type PhotoGalleryProps = { sesiones: readonly SesionFotos[] };

/** Fotos agrupadas por sesión; cada miniatura abre la foto a tamaño completo. */
export function PhotoGallery({ sesiones }: PhotoGalleryProps) {
  if (!sesiones.length) {
    return (
      <div className={styles.vacio}>
        <Icon name="club" size="lg" />
        <p>Aún no hay fotos de las sesiones.</p>
      </div>
    );
  }
  return (
    <div className={styles.galeria}>
      {sesiones.map((sesion) => {
        const fecha = formatFecha(sesion.fecha);
        return (
          <section key={sesion.fecha} aria-labelledby={`sesion-${sesion.fecha}`}>
            <h2 id={`sesion-${sesion.fecha}`} className={styles.fecha}>
              <time dateTime={sesion.fecha}>{fecha}</time>
            </h2>
            <ul role="list" className={styles.rejilla}>
              {sesion.fotos.map((foto, i) => (
                <li key={foto.url}>
                  <a href={withBasePath(foto.url)} className={styles.foto}>
                    <Image
                      src={withBasePath(foto.miniatura)}
                      alt={`Foto ${i + 1} de la sesión del ${fecha}`}
                      width={foto.ancho}
                      height={foto.alto}
                      sizes="(width >= 1024px) 280px, 45vw"
                      className={styles.img}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
