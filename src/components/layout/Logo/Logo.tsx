import { getImageProps } from 'next/image';
import Link from 'next/link';
import { logoCompleto, logoCompletoOscuro } from '@/assets/images';
import { routes } from '@/config/routes';
import styles from './Logo.module.css';

type LogoProps = { tamano?: 'barra' | 'grande'; priority?: boolean };

/** Logo enlazado a inicio, con la variante oscura servida por <picture>. */
export function Logo({ tamano = 'barra', priority = false }: LogoProps) {
  const common = { alt: logoCompleto.alt, sizes: tamano === 'barra' ? '120px' : '480px', priority };
  const { props: claro } = getImageProps({ ...common, src: logoCompleto.src });
  const { props: oscuro } = getImageProps({ ...common, src: logoCompletoOscuro.src });

  return (
    <Link href={routes.inicio} className={`${styles.logo} ${styles[tamano]}`}>
      <picture>
        {/* Sin optimizador (GitHub Pages) no hay srcSet: se usa la URL directa. */}
        <source media="(prefers-color-scheme: dark)" srcSet={oscuro.srcSet ?? oscuro.src} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt viene en props */}
        <img {...claro} className={styles.img} />
      </picture>
    </Link>
  );
}
