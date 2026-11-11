import type { Metadata } from 'next';
import { PaginaRonda } from '@/features/proposals';

export const metadata: Metadata = {
  title: 'Propuestas',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PaginaRonda modo="proponer" />;
}
