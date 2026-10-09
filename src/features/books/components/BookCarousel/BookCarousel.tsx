import type { ReactNode } from 'react';
import { Carousel, CarouselItem } from '@/components/ui';
import type { Book } from '../../types';
import { BookCard } from '../BookCard';

type BookCarouselProps = {
  titulo: string;
  books: readonly Book[];
  accion?: ReactNode;
};

export function BookCarousel({ titulo, books, accion }: BookCarouselProps) {
  return (
    <Carousel titulo={titulo} accion={accion}>
      {books.map((book) => (
        <CarouselItem key={book.slug}>
          <BookCard book={book} sizes="(width >= 1024px) 180px, 40vw" />
        </CarouselItem>
      ))}
    </Carousel>
  );
}
