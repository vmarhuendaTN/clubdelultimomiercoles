import { Button } from '@/components/ui';
import styles from './VotacionesArchivadas.module.css';

export type VotacionArchivada = {
  clave: string;
  etiqueta: string;
  ganadora?: { candidata: { titulo: string }; votos: number };
};

type VotacionesArchivadasProps = {
  votaciones: VotacionArchivada[];
  /** La que se está viendo (no se ofrece «Ver»). */
  actual: string;
  onVer: (clave: string) => void;
};

/** Votaciones que la administradora ha archivado, con la más votada de cada una. */
export function VotacionesArchivadas({ votaciones, actual, onVer }: VotacionesArchivadasProps) {
  if (votaciones.length === 0) return null;
  return (
    <section className={styles.bloque} aria-labelledby="votaciones-archivadas">
      <h3 id="votaciones-archivadas" className={styles.titulo}>
        Votaciones archivadas
      </h3>
      <ul className={styles.lista}>
        {votaciones.map((v) => (
          <li key={v.clave} className={styles.fila}>
            <div className={styles.texto}>
              <p className={styles.nombre}>{v.etiqueta}</p>
              <p className={styles.detalle}>
                {v.ganadora?.votos
                  ? `La más votada: «${v.ganadora.candidata.titulo}» · ${v.ganadora.votos} ${v.ganadora.votos === 1 ? 'voto' : 'votos'}`
                  : 'Sin votos'}
              </p>
            </div>
            {v.clave !== actual && (
              <Button
                size="sm"
                variant="secundario"
                icono="ver"
                onClick={() => onVer(v.clave)}
                aria-label={`Ver la votación de ${v.etiqueta}`}
              >
                Ver
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
