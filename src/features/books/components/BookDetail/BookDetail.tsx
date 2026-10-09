import Image from 'next/image';
import Link from 'next/link';
import { ExpandableText, Icon, Pill } from '@/components/ui';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import { ReviewsSection } from '@/features/reviews';
import { formatFecha } from '@/lib/format';
import type { Lectura } from '../../types';
import { BookCover } from '../BookCover';
import styles from './BookDetail.module.css';

const ESTADO: Record<
  Lectura['estado'],
  { texto: string; variant: 'acento' | 'mostaza' | 'neutro' }
> = {
  leido: { texto: 'Leído', variant: 'acento' },
  proximo: { texto: 'Próxima lectura', variant: 'mostaza' },
  propuesta: { texto: 'Propuesta', variant: 'neutro' },
};

/** Ficha de libro (DISENO § 4): portada con sombra de objeto sobre su propio color difuminado. */
export function BookDetail({ lectura }: { lectura: Lectura }) {
  const estado = ESTADO[lectura.estado];
  return (
    <article className={styles.ficha}>
      <div className={styles.cabecera}>
        {lectura.portadaUrl && (
          <Image
            src={lectura.portadaUrl}
            alt=""
            fill
            sizes="100vw"
            className={styles.fondo}
            aria-hidden="true"
          />
        )}
        <div className={`contenedor ${styles.cabeceraInner}`}>
          <Link href={routes.lecturas} className={styles.volver}>
            <Icon name="anterior" size="sm" />
            Lecturas
          </Link>
          <div className={styles.portada}>
            <BookCover book={lectura} sizes="(width >= 768px) 240px, 60vw" priority />
          </div>
        </div>
      </div>

      <div className={`contenedor ${styles.cuerpo}`}>
        <header className={styles.titulos}>
          <h1 className={styles.titulo} lang={lectura.idioma}>
            {lectura.titulo}
          </h1>
          {lectura.subtitulo && <p className={styles.subtitulo}>{lectura.subtitulo}</p>}
          <p className={styles.autor}>{lectura.autor}</p>
        </header>

        <ul role="list" className={styles.pills} aria-label="Datos del libro">
          <li>
            <Pill variant={estado.variant}>{estado.texto}</Pill>
          </li>
          {lectura.anio && (
            <li>
              <Pill>{lectura.anio}</Pill>
            </li>
          )}
          {lectura.paginas && (
            <li>
              <Pill>{lectura.paginas} páginas</Pill>
            </li>
          )}
          {lectura.fechaSesion && (
            <li>
              <Pill>Sesión: {formatFecha(lectura.fechaSesion)}</Pill>
            </li>
          )}
        </ul>

        {lectura.descripcion.length > 0 && (
          <section aria-labelledby="sinopsis" className={styles.seccion}>
            <h2 id="sinopsis" className={styles.seccionTitulo}>
              Sinopsis
            </h2>
            <div className={styles.texto}>
              <ExpandableText>
                {lectura.descripcion.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </ExpandableText>
            </div>
          </section>
        )}

        {lectura.notaClub && (
          <section aria-labelledby="nota-club" className={styles.seccion}>
            <h2 id="nota-club" className={styles.seccionTitulo}>
              Nota del club
            </h2>
            <blockquote className={styles.nota}>{lectura.notaClub}</blockquote>
          </section>
        )}

        <ReviewsSection slug={lectura.slug} titulo={lectura.titulo} />

        <section aria-labelledby="mas" className={styles.seccion}>
          <h2 id="mas" className={styles.seccionTitulo}>
            Más información
          </h2>
          <dl className={styles.datos}>
            {lectura.editorial && (
              <div>
                <dt>Editorial</dt>
                <dd>{lectura.editorial}</dd>
              </div>
            )}
            {lectura.isbn && (
              <div>
                <dt>ISBN</dt>
                <dd>{lectura.isbn}</dd>
              </div>
            )}
            {lectura.categorias.length > 0 && (
              <div>
                <dt>Género</dt>
                <dd>{lectura.categorias.join(', ')}</dd>
              </div>
            )}
          </dl>
          <ul role="list" className={styles.enlaces}>
            <li>
              <a href={site.lugar.mapa} rel="noopener noreferrer">
                Pídelo en la {site.lugar.nombre}
                <Icon name="externo" size="sm" />
              </a>
            </li>
            {lectura.enlaceGoogle && (
              <li>
                <a href={lectura.enlaceGoogle} rel="noopener noreferrer">
                  Ver en Google Libros
                  <Icon name="externo" size="sm" />
                </a>
              </li>
            )}
          </ul>
        </section>
      </div>
    </article>
  );
}
