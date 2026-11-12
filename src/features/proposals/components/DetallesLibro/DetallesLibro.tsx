import { ExpandableText } from '@/components/ui';
import { lineaDetalles, type DetallesLibro as Detalles } from '@/lib/format';
import styles from './DetallesLibro.module.css';

type DetallesLibroProps = { libro: Detalles; id?: string };

/** Año, páginas, sinopsis y nota de un libro recomendado o candidato (si los hay). */
export function DetallesLibro({ libro, id }: DetallesLibroProps) {
  const linea = lineaDetalles(libro);
  const sinopsis = libro.sinopsis?.trim();
  const nota = libro.nota?.trim();
  if (!linea && !sinopsis && !nota) return null;
  return (
    <div id={id} className={styles.detalles}>
      {linea && <p className={styles.linea}>{linea}</p>}
      {sinopsis && (
        <ExpandableText>
          <p className={styles.sinopsis}>{sinopsis}</p>
        </ExpandableText>
      )}
      {nota && (
        <p className={styles.nota}>
          <strong>Nota:</strong> {nota}
        </p>
      )}
    </div>
  );
}
