'use client';

import { usePathname } from 'next/navigation';
import { NavLinks } from '../NavLinks';
import styles from './TabBar.module.css';

/** Barra de pestañas inferior (móvil y tableta, < 1024 px). El panel /back tiene su propio menú. */
export function TabBar() {
  const ruta = usePathname() ?? '/';
  if (ruta.startsWith('/back')) return null;
  return (
    <nav aria-label="Pestañas" className={styles.tabbar}>
      <NavLinks estilo="pestanas" />
    </nav>
  );
}
