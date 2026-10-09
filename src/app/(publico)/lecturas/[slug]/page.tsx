import type { Metadata } from 'next';
import { BookPage, getLectura, getLecturas } from '@/features/books/server';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getLecturas().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lectura = getLectura((await params).slug);
  if (!lectura) return {};
  const description = lectura.descripcion[0] ?? `${lectura.titulo}, de ${lectura.autor}.`;
  return {
    title: `${lectura.titulo}, de ${lectura.autor}`,
    description,
    openGraph: lectura.portadaUrl?.startsWith('https://')
      ? { images: [{ url: lectura.portadaUrl }] }
      : undefined,
  };
}

export default async function Page({ params }: Props) {
  return <BookPage slug={(await params).slug} />;
}
