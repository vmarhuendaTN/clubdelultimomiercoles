import { Button, Pill } from '@/components/ui';
import { formatFecha } from '@/lib/format';
import type { Lectura } from '../../types';
import { bookHref } from '../../utils';
import { AnadirCalendario } from '../AnadirCalendario';
import { quedadasDe } from '../../services/evento-sesion';
import { BookCover } from '../BookCover';
import { CuentaAtras } from '../CuentaAtras';
import styles from './NextReading.module.css';

type NextReadingProps = { lectura: Lectura };

/**
 * Próxima lectura destacada: portada grande y, al lado (en pantallas anchas),
 * título, autoría, fecha de la sesión, el comienzo de la sinopsis y el enlace a la ficha.
 */
export function NextReading({ lectura }: NextReadingProps) {
  const [entradilla] = lectura.descripcion;
  const quedadas = quedadasDe(lectura);
  return (
    <article className={styles.destacado}>
      <div className={styles.portada}>
        <BookCover book={lectura} sizes="(width >= 768px) 280px, 60vw" priority decorativa />
      </div>
      <div className={styles.info}>
        <Pill variant="mostaza">Próxima lectura</Pill>
        <h2 className={styles.titulo} lang={lectura.idioma}>
          {lectura.titulo}
        </h2>
        <p className={styles.autor}>{lectura.autor}</p>
        {quedadas.length > 0 && (
          <>
            {quedadas.map((q) => (
              <p key={q.club?.id ?? 'club'} className={styles.sesion}>
                {q.club
                  ? `Quedada del ${q.club.nombre}: ${formatFecha(q.fecha)}`
                  : `Sesión del ${formatFecha(q.fecha)}`}
              </p>
            ))}
            <CuentaAtras
              sesiones={quedadas.map((q) => ({ fecha: q.fecha, nombre: q.club?.nombre }))}
            />
            <AnadirCalendario lectura={lectura} />
          </>
        )}
        {entradilla && <p className={styles.entradilla}>{entradilla}</p>}
        <div className={styles.acciones}>
          <Button
            href={bookHref(lectura.slug)}
            variant="secundario"
            aria-label={`Ver la ficha de ${lectura.titulo}`}
          >
            Ver la ficha
          </Button>
        </div>
      </div>
    </article>
  );
}
