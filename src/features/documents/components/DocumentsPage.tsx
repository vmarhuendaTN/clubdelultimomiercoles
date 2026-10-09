import { PageHeader } from '@/components/layout';
import { getContenido } from '@/lib/content';
import { DocumentList } from './DocumentList';

export function DocumentsPage() {
  const { documentos } = getContenido();
  return (
    <div className="contenedor">
      <PageHeader
        titulo="Documentos"
        subtitulo="Normas del club y otros documentos para descargar."
      />
      <DocumentList documentos={documentos} />
    </div>
  );
}
