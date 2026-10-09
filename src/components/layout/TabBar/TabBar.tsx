import { NavLinks } from '../NavLinks';
import styles from './TabBar.module.css';

/** Barra de pestañas inferior (móvil y tableta, < 1024 px). */
export function TabBar() {
  return (
    <nav aria-label="Pestañas" className={styles.tabbar}>
      <NavLinks estilo="pestanas" />
    </nav>
  );
}
