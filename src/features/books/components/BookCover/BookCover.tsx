import Image from 'next/image';
import type { Book } from '../../types';
import { coverAlt } from '../../utils';
import styles from './BookCover.module.css';

type BookCoverProps = {
  book: Pick<Book, 'titulo' | 'autor' | 'portadaUrl' | 'portadaLqip' | 'idioma'>;
  /** Atributo `sizes` según dónde se muestre (rejilla, carrusel, ficha). */
  sizes: string;
  priority?: boolean;
  /** Si la portada acompaña al título visible (tarjetas), es decorativa para no repetir. */
  decorativa?: boolean;
};

/** Portada 2:3 con sombra de objeto; sin imagen, placeholder ilustrado con título y autor. */
export function BookCover({ book, sizes, priority = false, decorativa = false }: BookCoverProps) {
  const alt = decorativa ? '' : coverAlt(book);
  return (
    <div className={styles.cover}>
      {book.portadaUrl ? (
        <Image
          src={book.portadaUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.img}
          {...(book.portadaLqip
            ? { placeholder: 'blur' as const, blurDataURL: book.portadaLqip }
            : {})}
        />
      ) : (
        <div
          className={styles.placeholder}
          {...(decorativa ? { 'aria-hidden': true } : { role: 'img', 'aria-label': alt })}
        >
          <span className={styles.lomo} />
          <span className={styles.phTitulo} lang={book.idioma}>
            {book.titulo}
          </span>
          <span className={styles.phAutor}>{book.autor}</span>
        </div>
      )}
    </div>
  );
}
