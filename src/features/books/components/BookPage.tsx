import { notFound } from 'next/navigation';
import { getLectura } from '../server';
import { BookDetail } from './BookDetail';

export function BookPage({ slug }: { slug: string }) {
  const lectura = getLectura(slug);
  if (!lectura) notFound();
  return <BookDetail lectura={lectura} />;
}
