import type { Metadata } from 'next';
import { LecturasPage } from '@/features/books/server';

export const metadata: Metadata = {
  title: 'Lecturas',
  description: 'Todos los libros que hemos leído en el Club del Último Miércoles.',
};

export default function Page() {
  return <LecturasPage />;
}
