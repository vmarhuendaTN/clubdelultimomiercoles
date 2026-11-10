import type { Metadata } from 'next';
import { BackPanel } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Panel del club',
  robots: { index: false, follow: false },
};

export default function BackPage() {
  return <BackPanel />;
}
