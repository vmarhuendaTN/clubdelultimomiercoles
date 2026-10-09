import type { Metadata } from 'next';
import { ClubPage } from '@/features/club';

export const metadata: Metadata = { title: 'El club' };

export default function Page() {
  return <ClubPage />;
}
