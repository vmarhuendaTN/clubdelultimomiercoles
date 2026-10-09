import type { Metadata } from 'next';
import { StyleGuide } from '@/features/style-guide';

export const metadata: Metadata = {
  title: 'Guía de estilo',
  robots: { index: false, follow: false },
};

export default function EstiloPage() {
  return <StyleGuide />;
}
