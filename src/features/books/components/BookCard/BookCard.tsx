import Link from 'next/link';
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
};

/** Portada + título + autor. Toda la tarjeta es un único enlace a la ficha. */
export function BookCard({ book, sizes, priority, nivel: Heading = 'h3' }: BookCardProps) {
  return (
    <article className={styles.card}>
      <BookCover book={book} sizes={sizes} priority={priority} decorativa />
      <Heading className={styles.titulo} lang={book.idioma}>
        <Link href={bookHref(book.slug)} className={styles.link}>
          {book.titulo}
        </Link>
      </Heading>
      <p className={styles.autor}>{book.autor}</p>
    </article>
  );
}
