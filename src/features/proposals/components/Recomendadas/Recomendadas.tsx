import { Chip } from '@/components/ui';
import { textoLibro, type LibroOpcion } from '../../services/opciones';
import styles from './Recomendadas.module.css';

type RecomendadasProps = {
  libros: LibroOpcion[];
  /** Se llama al pulsar una: el formulario la pone en la primera lectura libre. */
  onElegir: (libro: LibroOpcion) => void;
  /** Ya no hay lecturas libres: las recomendadas se muestran, pero no se pueden pulsar. */
  completo: boolean;
};

/** Lecturas que recomienda el club: un toque y van a «Tus tres lecturas». */
export function Recomendadas({ libros, onElegir, completo }: RecomendadasProps) {
  if (libros.length === 0) return null;
  return (
    <div className={styles.recomendadas}>
      <p className={styles.titulo} id="recomendadas-titulo">
        Recomendadas por el club
      </p>
      <ul className={styles.lista} aria-labelledby="recomendadas-titulo">
        {libros.map((libro) => (
          <li key={libro.id}>
            {completo ? (
              <Chip>{textoLibro(libro)}</Chip>
            ) : (
              <Chip onPulsar={() => onElegir(libro)} etiqueta={`Proponer ${textoLibro(libro)}`}>
                {textoLibro(libro)}
              </Chip>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
