import { Logo } from '../Logo';
import { NavLinks } from '../NavLinks';
import styles from './Header.module.css';

/** Barra superior translúcida (solo escritorio, ≥ 1024 px). */
export function Header() {
  return (
    <header className={styles.header}>
      <div className={`contenedor ${styles.inner}`}>
        <Logo />
        <nav aria-label="Principal" className={styles.nav}>
          <NavLinks estilo="barra" />
        </nav>
        <span className={styles.equilibrio} aria-hidden="true" />
      </div>
    </header>
  );
}
