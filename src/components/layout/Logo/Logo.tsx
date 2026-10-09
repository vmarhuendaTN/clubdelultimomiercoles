import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { logoCompleto, logoCompletoOscuro, logoSillon } from '@/assets/images';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import styles from './Logo.module.css';

type LogoProps = { tamano?: 'barra' | 'grande'; priority?: boolean };

/**
 * Logo enlazado a inicio.
 * - `barra`: el sillón y el nombre en texto (el logo completo no se lee a 40 px).
 * - `grande`: el logo completo, con la variante oscura servida por <picture>.
 */
export function Logo({ tamano = 'barra', priority = false }: LogoProps) {
  if (tamano === 'barra') {
    return (
      <Link href={routes.inicio} className={`${styles.logo} ${styles.barra}`}>
        <Image
          src={logoSillon.src}
          alt=""
          className={styles.sillon}
          priority={priority}
          sizes="48px"
        />
        <span className={styles.nombre}>{site.nombre}</span>
      </Link>
    );
  }

  const common = { alt: logoCompleto.alt, sizes: '(width >= 480px) 420px, 90vw', priority };
  const { props: claro } = getImageProps({ ...common, src: logoCompleto.src });
  const { props: oscuro } = getImageProps({ ...common, src: logoCompletoOscuro.src });
  return (
    <Link href={routes.inicio} className={`${styles.logo} ${styles.grande}`}>
      <picture>
        {/* Sin optimizador (GitHub Pages) no hay srcSet: se usa la URL directa. */}
        <source media="(prefers-color-scheme: dark)" srcSet={oscuro.srcSet ?? oscuro.src} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt viene en props */}
        <img {...claro} className={styles.img} />
      </picture>
    </Link>
  );
}
