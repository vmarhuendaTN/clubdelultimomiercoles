import type { ReactNode } from 'react';
import styles from './StyleGuide.module.css';

export function Section({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.seccion} aria-labelledby={id}>
      <h2 id={id} className={styles.seccionTitulo}>
        {titulo}
      </h2>
      {children}
    </section>
  );
}
