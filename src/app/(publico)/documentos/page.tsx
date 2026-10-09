import type { Metadata } from 'next';
import { DocumentsPage } from '@/features/documents';

export const metadata: Metadata = { title: 'Documentos' };

export default function Page() {
  return <DocumentsPage />;
}
