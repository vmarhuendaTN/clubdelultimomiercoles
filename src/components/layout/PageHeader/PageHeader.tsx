'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './PageHeader.module.css';

type PageHeaderProps = {
  titulo: string;
  subtitulo?: ReactNode;
  /** Acciones a la derecha del título (p. ej. buscar). */
  acciones?: ReactNode;
};

/**
 * Título grande (Caveat) que, al salir de pantalla, se compacta en una barra fina
 * con el título centrado en Inter. IntersectionObserver, sin escuchar el scroll.
 */
export function PageHeader({ titulo, subtitulo, acciones }: PageHeaderProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [compacta, setCompacta] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setCompacta(!entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={styles.barra} data-visible={compacta} aria-hidden="true">
        <span className={styles.barraTitulo}>{titulo}</span>
      </div>
      <header className={styles.cabecera}>
        <div className={styles.fila}>
          <h1 className={styles.titulo}>{titulo}</h1>
          {acciones && <div className={styles.acciones}>{acciones}</div>}
        </div>
        {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
        <div ref={sentinel} className={styles.sentinel} />
      </header>
    </>
  );
}
