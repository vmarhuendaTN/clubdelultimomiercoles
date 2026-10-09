'use client';

import { useId, useRef } from 'react';
import { Icon } from '@/components/ui';
import type { Book } from '../../types';
import { BookCard } from '../BookCard';
import styles from './BookCarousel.module.css';

type BookCarouselProps = {
  titulo: string;
  books: readonly Book[];
};

/**
 * Carrusel horizontal tipo App Store con scroll-snap.
 * Teclado: Tab recorre las tarjetas (el navegador las desplaza a la vista) y los
 * botones Anterior/Siguiente avanzan una página.
 */
export function BookCarousel({ titulo, books }: BookCarouselProps) {
  const headingId = useId();
  const track = useRef<HTMLUListElement>(null);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section className={styles.carousel} aria-labelledby={headingId}>
      <div className={styles.cabecera}>
        <h2 id={headingId} className={styles.titulo}>
          {titulo}
        </h2>
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
      <ul ref={track} role="list" className={styles.pista}>
        {books.map((book) => (
          <li key={book.slug} className={styles.item}>
            <BookCard book={book} sizes="(width >= 1024px) 180px, 40vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
