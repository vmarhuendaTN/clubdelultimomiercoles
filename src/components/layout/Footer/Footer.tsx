import Link from 'next/link';
import { Icon } from '@/components/ui';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import styles from './Footer.module.css';

/** Pie discreto: nombre del club y tres enlaces (contacto, Instagram y privacidad). */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`contenedor ${styles.inner}`}>
        <p className={styles.nombre}>{site.nombre}</p>
        <nav aria-label="Pie de página">
          <ul role="list" className={styles.enlaces}>
            <li>
              <a href={`mailto:${site.email}`} className={styles.enlace}>
                Escríbenos
              </a>
            </li>
            <li>
              <a href={site.instagram} className={styles.enlace} rel="noopener noreferrer">
                <Icon name="instagram" size="sm" />
                Instagram
              </a>
            </li>
            <li>
              <Link href={routes.privacidad} className={styles.enlace}>
                Privacidad
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
