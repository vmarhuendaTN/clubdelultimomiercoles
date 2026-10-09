'use client';

import { useId, useRef, type ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Carousel.module.css';

type CarouselProps = {
  titulo: string;
  /** `portada`: columnas estrechas 2:3 (libros); `cuadrado`: columnas más anchas (publicaciones). */
  formato?: 'portada' | 'cuadrado';
  /** Acción junto al título (p. ej. "Ver todas"). */
  accion?: ReactNode;
  /** Elementos `<CarouselItem>`. */
  children: ReactNode;
};

/**
 * Carrusel horizontal tipo App Store con scroll-snap.
 * Teclado: Tab recorre los elementos (el navegador los desplaza a la vista) y los
 * botones Anteriores/Siguientes avanzan una página.
 */
export function Carousel({ titulo, formato = 'portada', accion, children }: CarouselProps) {
  const headingId = useId();
  const track = useRef<HTMLUListElement>(null);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section className={`${styles.carousel} ${styles[formato]}`} aria-labelledby={headingId}>
      <div className={styles.cabecera}>
        <h2 id={headingId} className={styles.titulo}>
          {titulo}
        </h2>
        <div className={styles.acciones}>
          {accion}
          <div className={styles.controles}>
            <button
              type="button"
              className={styles.boton}
              onClick={() => page(-1)}
              aria-label="Anteriores"
            >
              <Icon name="anterior" />
            </button>
            <button
              type="button"
              className={styles.boton}
              onClick={() => page(1)}
              aria-label="Siguientes"
            >
              <Icon name="siguiente" />
            </button>
          </div>
        </div>
      </div>
      <ul ref={track} role="list" className={styles.pista}>
        {children}
      </ul>
    </section>
  );
}

export function CarouselItem({ children }: { children: ReactNode }) {
  return <li className={styles.item}>{children}</li>;
}
