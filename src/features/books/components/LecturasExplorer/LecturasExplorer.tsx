'use client';

import { useMemo, useState } from 'react';
import { SearchField, SegmentedControl } from '@/components/ui';
import { site } from '@/config/site';
import type { Lectura } from '../../types';
import { agruparPorAnio, filtrarLecturas } from '../../utils';
import { BookCard } from '../BookCard';
import styles from './LecturasExplorer.module.css';

const SEGMENTOS = [
  { value: 'leido', label: 'Leídos' },
  { value: 'proximo', label: 'Próximo' },
  { value: 'propuesta', label: 'Propuestas' },
] as const;
type Estado = (typeof SEGMENTOS)[number]['value'];

const VACIO: Record<Estado, string> = {
  leido: 'Todavía no hay lecturas terminadas.',
  proximo: 'Aún no hemos elegido la próxima lectura.',
  propuesta: 'Aún no hay propuestas. ¡Escribe al club!',
};

const contar = (n: number) => (n === 1 ? '1 libro' : `${n} libros`);

/** Rejilla de lecturas con control segmentado y buscador (DISENO § 4, Lecturas). */
export function LecturasExplorer({ lecturas }: { lecturas: readonly Lectura[] }) {
  const [estado, setEstado] = useState<Estado>('leido');
  const [busqueda, setBusqueda] = useState('');
  const visibles = useMemo(
    () => filtrarLecturas(lecturas, estado, busqueda),
    [lecturas, estado, busqueda],
  );
  const grupos = agruparPorAnio(visibles);

  return (
    <div className={styles.explorer}>
      <div className={styles.controles}>
        <SegmentedControl
          id="lecturas"
          label="Mostrar lecturas"
          segments={SEGMENTOS}
          value={estado}
          onChange={setEstado}
        />
        <div className={styles.buscador}>
          <SearchField label="Buscar por título o autor" value={busqueda} onChange={setBusqueda} />
        </div>
      </div>

      <div
        id="lecturas-panel"
        role="tabpanel"
        aria-labelledby={`lecturas-tab-${estado}`}
        className={styles.panel}
      >
        <p className={styles.recuento} aria-live="polite">
          {contar(visibles.length)}
        </p>

        {visibles.length === 0 ? (
          <div className={styles.vacio}>
            <p>{busqueda ? `No hay libros que coincidan con «${busqueda}».` : VACIO[estado]}</p>
            {estado === 'propuesta' && !busqueda && (
              <a href={`mailto:${site.email}?subject=Propuesta de lectura`}>Proponer una lectura</a>
            )}
          </div>
        ) : (
          grupos.map((grupo) => (
            <section key={grupo.anio ?? 'todas'} aria-label={grupo.anio}>
              {grupo.anio && <h2 className={styles.anio}>{grupo.anio}</h2>}
              <ul role="list" className="rejilla-portadas">
                {grupo.lecturas.map((l, i) => (
                  <li key={l.slug}>
                    <BookCard
                      book={l}
                      nivel={grupo.anio ? 'h3' : 'h2'}
                      priority={i < 4}
                      sizes="(width >= 1280px) 180px, (width >= 1024px) 20vw, (width >= 768px) 30vw, 45vw"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
