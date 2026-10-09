import Link from 'next/link';
import { StarRating } from '@/components/ui';
import type { Book } from '../../types';
import { bookHref } from '../../utils';
import { BookCover } from '../BookCover';
import styles from './BookCard.module.css';

type BookCardProps = {
  book: Book;
  sizes: string;
  priority?: boolean;
  /** Nivel del encabezado del título según la jerarquía de la página. */
  nivel?: 'h2' | 'h3';
  /** Media de estrellas del club (si hay valoraciones). */
  valoracion?: { media: number; total: number };
};

/** Portada + título + autor. Toda la tarjeta es un único enlace a la ficha. */
export function BookCard({
  book,
  sizes,
  priority,
  nivel: Heading = 'h3',
  valoracion,
}: BookCardProps) {
  return (
    <article className={styles.card}>
      <BookCover book={book} sizes={sizes} priority={priority} decorativa />
      <Heading className={styles.titulo} lang={book.idioma}>
        <Link href={bookHref(book.slug)} className={styles.link}>
          {book.titulo}
        </Link>
      </Heading>
      <p className={styles.autor}>{book.autor}</p>
      {valoracion && (
        <p className={styles.valoracion}>
          <StarRating valor={valoracion.media} tamano="sm" />
          <span aria-hidden="true">({valoracion.total})</span>
          <span className="visually-hidden">
            , {valoracion.total === 1 ? '1 valoración' : `${valoracion.total} valoraciones`}
          </span>
        </p>
      )}
    </article>
  );
}
