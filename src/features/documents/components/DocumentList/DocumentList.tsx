import { Icon } from '@/components/ui';
import type { Documento } from '@/lib/content';
import { withBasePath } from '@/lib/env';
import { formatBytes } from '@/lib/format';
import styles from './DocumentList.module.css';

type DocumentListProps = { documentos: readonly Documento[] };

export function DocumentList({ documentos }: DocumentListProps) {
  if (!documentos.length) {
    return (
      <div className={styles.vacio}>
        <Icon name="libro" size="lg" />
        <p>Todavía no hay documentos publicados.</p>
      </div>
    );
  }
  return (
    <ul role="list" className={styles.lista}>
      {documentos.map((doc) => (
        <li key={doc.url}>
          <a href={withBasePath(doc.url)} className={styles.documento} download>
            <span className={styles.icono}>
              <Icon name="documento" />
            </span>
            <span className={styles.texto}>
              <span className={styles.titulo}>{doc.titulo}</span>
              <span className={styles.meta}>PDF · {formatBytes(doc.bytes)}</span>
            </span>
            <Icon name="descargar" />
          </a>
        </li>
      ))}
    </ul>
  );
}
