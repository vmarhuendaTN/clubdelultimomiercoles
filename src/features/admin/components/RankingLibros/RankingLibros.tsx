'use client';

import { useState } from 'react';
import { Button, Pill } from '@/components/ui';
import type { LibroPropuesto } from '../../services/resumen-propuestas';
import styles from './RankingLibros.module.css';

type RankingLibrosProps = {
  libros: LibroPropuesto[];
  /** Cuántos se ven antes de «Ver todos». */
  inicial?: number;
  onAnadir: (libro: LibroPropuesto) => void;
  /** Claves de los libros que ya son candidatas en la votación final. */
  candidatas?: ReadonlySet<string>;
  /** Solo administradoras: llevar el libro a la votación final (o sacarlo). */
  onCandidata?: (libro: LibroPropuesto) => void;
};

const ORDINAL = ['1.ª', '2.ª', '3.ª'] as const;

/** «Ana García» → «Ana G.» (compacto en las fichas). */
const corto = (nombre: string) => {
  const [primero, ...resto] = nombre.split(' ');
  return resto.length ? `${primero} ${resto[0]?.charAt(0)}.` : (primero ?? nombre);
};

/**
 * Clasificación de los libros propuestos: barra proporcional a las personas que lo proponen,
 * puntos (3, 2 y 1 según la posición), quién lo propuso y si se repite de otras sesiones.
 */
export function RankingLibros({
  libros,
  inicial = 8,
  onAnadir,
  candidatas,
  onCandidata,
}: RankingLibrosProps) {
  const [todos, setTodos] = useState(false);
  const maximo = Math.max(1, ...libros.map((l) => l.votos));
  const visibles = todos ? libros : libros.slice(0, inicial);

  if (libros.length === 0) {
    return <p className={styles.vacio}>Todavía no hay lecturas propuestas en esta sesión.</p>;
  }

  return (
    <div className={styles.ranking}>
      <ol className={styles.lista}>
        {visibles.map((libro, i) => (
          <li key={libro.clave} className={styles.fila}>
            <span className={styles.posicion} aria-hidden="true">
              {i + 1}
            </span>
            <div className={styles.cuerpo}>
              <div className={styles.cabecera}>
                <h4 className={styles.titulo}>{libro.texto}</h4>
                <span className={styles.cifras}>
                  {libro.votos} {libro.votos === 1 ? 'persona' : 'personas'} · {libro.puntos}{' '}
                  {libro.puntos === 1 ? 'punto' : 'puntos'}
                </span>
              </div>
              <svg
                className={styles.barra}
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect className={styles.pista} width="100" height="6" rx="3" />
                <rect
                  className={styles.valor}
                  width={Math.max(4, (libro.votos / maximo) * 100)}
                  height="6"
                  rx="3"
                />
              </svg>
              <div className={styles.detalles}>
                {libro.votos > 1 && <Pill variant="mostaza">Coincidencia</Pill>}
                {libro.otrosPeriodos.length > 0 && (
                  <Pill variant="acento">
                    También en {libro.otrosPeriodos.slice(0, 2).join(' y ')}
                  </Pill>
                )}
                <span className={styles.personas}>
                  {libro.personas
                    .map((p) => `${corto(p.nombre)} (${ORDINAL[p.posicion - 1]})`)
                    .join(', ')}
                </span>
              </div>
            </div>
            <div className={styles.acciones}>
              {onCandidata &&
                (candidatas?.has(libro.clave) ? (
                  <Button
                    variant="primario"
                    size="sm"
                    icono="exito"
                    onClick={() => onCandidata(libro)}
                    aria-label={`Sacar «${libro.texto}» de la votación`}
                  >
                    En votación
                  </Button>
                ) : (
                  <Button
                    variant="secundario"
                    size="sm"
                    icono="anadir"
                    onClick={() => onCandidata(libro)}
                    aria-label={`Llevar «${libro.texto}» a la votación`}
                  >
                    A votación
                  </Button>
                ))}
              <Button
                variant="sencillo"
                size="sm"
                icono="libro"
                onClick={() => onAnadir(libro)}
                aria-label={`Añadir «${libro.texto}» a lecturas`}
              >
                Lecturas
              </Button>
            </div>
          </li>
        ))}
      </ol>
      {libros.length > inicial && (
        <Button variant="secundario" size="sm" onClick={() => setTodos((t) => !t)}>
          {todos ? 'Ver menos' : `Ver los ${libros.length} libros`}
        </Button>
      )}
    </div>
  );
}
