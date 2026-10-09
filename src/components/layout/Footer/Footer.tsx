import Link from 'next/link';
import { Icon } from '@/components/ui';
import { enlacesPie, site } from '@/config/site';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`contenedor ${styles.inner}`}>
        <div className={styles.club}>
          <p className={styles.nombre}>{site.nombre}</p>
          <p className={styles.dato}>
            {site.lugar.nombre} · {site.lugar.direccion}
          </p>
          <p className={styles.dato}>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <nav aria-label="Legal" className={styles.legal}>
          <ul role="list" className={styles.lista}>
            {enlacesPie.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.etiqueta}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <a href={site.instagram} className={styles.instagram} rel="noopener noreferrer">
          <Icon name="instagram" />
          <span>Síguenos en Instagram</span>
        </a>
      </div>
    </footer>
  );
}
