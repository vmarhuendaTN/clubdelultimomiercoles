import Image from 'next/image';
import Link from 'next/link';
import { Button, ExpandableText, Icon, Pill } from '@/components/ui';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import { ReviewsSection } from '@/features/reviews';
import { formatFecha } from '@/lib/format';
import type { Lectura } from '../../types';
import { nombreIdioma } from '../../utils';
import { BookCover } from '../BookCover';
import styles from './BookDetail.module.css';

/** Críticas visibles de entrada; el resto, en un desplegable. */
const CITAS_VISIBLES = 3;

const ESTADO: Record<
  Lectura['estado'],
  { texto: string; variant: 'acento' | 'mostaza' | 'neutro' }
> = {
  leido: { texto: 'Leído en el club', variant: 'acento' },
  proximo: { texto: 'Próxima lectura', variant: 'mostaza' },
  propuesta: { texto: 'Propuesta', variant: 'neutro' },
};

/**
 * Ficha de libro (DISENO § 4): portada con sombra de objeto sobre su propio color difuminado,
 * datos de Google Libros (ficha técnica, sinopsis, críticas) y la vida del libro en el club.
 */
export function BookDetail({ lectura }: { lectura: Lectura }) {
  const estado = ESTADO[lectura.estado];
  const idioma = nombreIdioma(lectura.idiomaEdicion);
  const lineaEdicion = [
    lectura.editorial,
    lectura.anio,
    lectura.paginas && `${lectura.paginas} páginas`,
  ]
    .filter(Boolean)
    .join(' · ');
  const ficha: [string, string | number | undefined][] = [
    ['Autoría', lectura.autor],
    ['Editorial', lectura.editorial],
    ['Año de la edición', lectura.anio],
    ['Páginas', lectura.paginas],
    ['ISBN', lectura.isbn],
    ['Idioma', idioma],
    ['Género', lectura.categorias.join(', ') || undefined],
    ['Sesión del club', lectura.fechaSesion && formatFecha(lectura.fechaSesion)],
  ];

  return (
    <article className={styles.ficha}>
      <header className={styles.cabecera}>
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
          <div className={styles.presentacion}>
            <div className={styles.portada}>
              <BookCover book={lectura} sizes="(width >= 768px) 280px, 60vw" priority />
            </div>
            <div className={styles.titulos}>
              <Pill variant={estado.variant}>{estado.texto}</Pill>
              <h1 className={styles.titulo} lang={lectura.idioma}>
                {lectura.titulo}
              </h1>
              {lectura.subtitulo && <p className={styles.subtitulo}>{lectura.subtitulo}</p>}
              <p className={styles.autor}>{lectura.autor}</p>
              {lineaEdicion && <p className={styles.edicion}>{lineaEdicion}</p>}
              <div className={styles.botones}>
                {lectura.enlaceGoogle && (
                  <Button
                    href={lectura.enlaceGoogle}
                    variant="secundario"
                    size="sm"
                    icono="externo"
                  >
                    Ver en Google Libros
                  </Button>
                )}
                <Button href={site.lugar.mapa} variant="sencillo" size="sm" icono="lugar">
                  Pídelo en la {site.lugar.nombre}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`contenedor ${styles.cuerpo}`}>
        <div className={styles.principal}>
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

          {lectura.citas.length > 0 && (
            <section aria-labelledby="critica" className={styles.seccion}>
              <h2 id="critica" className={styles.seccionTitulo}>
                Lo que dice la crítica
              </h2>
              <ListaCitas citas={lectura.citas.slice(0, CITAS_VISIBLES)} />
              {lectura.citas.length > CITAS_VISIBLES && (
                <details className={styles.masCitas}>
                  <summary>Ver más críticas ({lectura.citas.length - CITAS_VISIBLES})</summary>
                  <ListaCitas citas={lectura.citas.slice(CITAS_VISIBLES)} />
                </details>
              )}
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
        </div>

        <aside className={styles.lateral} aria-labelledby="ficha-tecnica">
          <h2 id="ficha-tecnica" className={styles.seccionTitulo}>
            Ficha técnica
          </h2>
          <dl className={styles.datos}>
            {ficha
              .filter(([, valor]) => valor !== undefined && valor !== '')
              .map(([etiqueta, valor]) => (
                <div key={etiqueta}>
                  <dt>{etiqueta}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
          </dl>
          {lectura.fuenteGoogle && (
            <p className={styles.fuente}>
              Datos y portada:{' '}
              {lectura.enlaceGoogle ? (
                <a href={lectura.enlaceGoogle} rel="noopener noreferrer">
                  Google Libros
                </a>
              ) : (
                'Google Libros'
              )}
              .
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}

function ListaCitas({ citas }: { citas: Lectura['citas'] }) {
  return (
    <ul role="list" className={styles.citas}>
      {citas.map((c) => (
        <li key={c.texto}>
          <figure className={styles.cita}>
            <blockquote>
              <p>{c.texto}</p>
            </blockquote>
            {c.fuente && <figcaption>{c.fuente}</figcaption>}
          </figure>
        </li>
      ))}
    </ul>
  );
}
