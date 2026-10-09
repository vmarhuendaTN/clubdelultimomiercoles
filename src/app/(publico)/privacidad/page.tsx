import type { Metadata } from 'next';
import { PrivacyPage } from '@/features/legal';

export const metadata: Metadata = {
  title: 'Privacidad',
  description: 'Política de privacidad del Club del Último Miércoles.',
};

export default function Page() {
  return <PrivacyPage />;
}
