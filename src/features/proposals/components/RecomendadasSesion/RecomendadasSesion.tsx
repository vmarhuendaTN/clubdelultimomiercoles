import { Button, Pill } from '@/components/ui';
import { textoLibro, type LibroOpcion } from '../../services/opciones';
import { DetallesLibro } from '../DetallesLibro';
import { NotaClub } from '../NotaClub';
import styles from './RecomendadasSesion.module.css';

type RecomendadasSesionProps = {
  /** «enero de 2027». */
  etiqueta: string;
  libros: LibroOpcion[];
  nota?: string;
  /** ¿Ya está en sus tres lecturas? */
  elegido: (libro: LibroOpcion) => boolean;
  /** Ya no quedan lecturas libres. */
  completo: boolean;
  onProponer: (libro: LibroOpcion) => void;
};

/** Lecturas que el club recomienda para la sesión elegida, con sus detalles y la nota. */
export function RecomendadasSesion({
  etiqueta,
  libros,
  nota,
  elegido,
  completo,
  onProponer,
}: RecomendadasSesionProps) {
  if (libros.length === 0 && !nota?.trim()) return null;
  return (
    <section className={styles.seccion} aria-labelledby="recomendadas-sesion">
      <h3 id="recomendadas-sesion" className={styles.titulo}>
        Recomendadas por el club para {etiqueta}
      </h3>
      {libros.length > 0 && (
        <ol className={styles.lista}>
          {libros.map((l) => {
            const ya = elegido(l);
            return (
              <li key={l.id} className={styles.libro}>
                <div className={styles.cabecera}>
                  <p className={styles.nombre}>
                    <span className={styles.tituloLibro}>{l.titulo}</span>
                    {l.autor && <span className={styles.autor}>{l.autor}</span>}
                  </p>
                  {ya ? (
                    <Pill variant="mostaza">En tus lecturas</Pill>
                  ) : (
                    <Button
                      size="sm"
                      variant="secundario"
                      icono="anadir"
                      disabled={completo}
                      onClick={() => onProponer(l)}
                      aria-label={`Proponer ${textoLibro(l)}`}
                    >
                      Proponer
                    </Button>
                  )}
                </div>
                <DetallesLibro libro={l} />
              </li>
            );
          })}
        </ol>
      )}
      <NotaClub nota={nota} />
    </section>
  );
}
