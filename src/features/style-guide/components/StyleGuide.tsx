import { Logo, PageHeader } from '@/components/layout';
import { Button, Card, ExpandableText, Icon, Pill, Skeleton, StarRating } from '@/components/ui';
import { BookCard, BookCarousel, BookCover } from '@/features/books';
import { claseDe, escalaTipografica, librosEjemplo, paleta } from '../data';
import { FormDemo, SearchDemo, SegmentedDemo, SheetDemo, StarInputDemo, ToastDemo } from './Demos';
import { Section } from './Section';
import styles from './StyleGuide.module.css';

/** Referencia visual del sistema de diseño (DISENO § 7). Solo para aprobar la Fase 1. */
export function StyleGuide() {
  const [destacado, ...resto] = librosEjemplo;
  return (
    <div className="contenedor">
      <PageHeader
        titulo="Guía de estilo"
        subtitulo="Tokens y componentes del Club del Último Miércoles. Cambia el modo claro u oscuro del sistema para ver ambas paletas."
      />

      <Section id="marca" titulo="Marca">
        <div className={styles.logo}>
          <Logo tamano="grande" />
        </div>
      </Section>

      <Section id="color" titulo="Color">
        <ul role="list" className={styles.paleta}>
          {paleta.map((c) => (
            <li key={c.token} className={styles.color}>
              <span
                className={`${styles.muestra} ${styles[claseDe('c', c.token)]}`}
                aria-hidden="true"
              />
              <span className={styles.colorNombre}>--color-{c.token}</span>
              <span className={styles.colorUso}>{c.uso}</span>
            </li>
          ))}
        </ul>
        <div
          className={styles.tablaScroll}
          role="region"
          aria-label="Valores de la paleta"
          tabIndex={0}
        >
          <table className={styles.tabla}>
            <caption className="visually-hidden">
              Valores de cada color en modo claro y oscuro
            </caption>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Claro</th>
                <th scope="col">Oscuro</th>
              </tr>
            </thead>
            <tbody>
              {paleta.map((c) => (
                <tr key={c.token}>
                  <th scope="row">--color-{c.token}</th>
                  <td>{c.claro}</td>
                  <td>{c.oscuro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="tipografia" titulo="Tipografía">
        <dl className={styles.tipos}>
          {escalaTipografica.map((t) => (
            <div key={t.token} className={styles.tipo}>
              <dt className={styles.tipoMeta}>
                --text-{t.token} · {t.fuente}
              </dt>
              <dd className={styles[claseDe('t', t.token)]}>{t.muestra}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="botones" titulo="Botones">
        <div className="cluster">
          <Button>Entrar</Button>
          <Button icono="calendario">Añadir al calendario</Button>
          <Button variant="secundario">Reintentar</Button>
          <Button variant="sencillo">Leer más</Button>
          <Button size="sm">Pequeño</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </Section>

      <Section id="formularios" titulo="Formularios">
        <FormDemo />
      </Section>

      <Section id="control-segmentado" titulo="Control segmentado">
        <SegmentedDemo />
      </Section>

      <Section id="tarjetas" titulo="Tarjetas y etiquetas">
        <div className={styles.tarjetas}>
          <Card as="article" destacada>
            <div className={styles.sesion}>
              {destacado && (
                <div className={styles.sesionPortada}>
                  <BookCover book={destacado} sizes="120px" decorativa />
                </div>
              )}
              <div className="stack">
                <h3 className={styles.sesionTitulo}>Próxima sesión</h3>
                <p>
                  <strong>miércoles 25 de noviembre · 19:30</strong>
                </p>
                <p className={styles.sesionLugar}>
                  <Icon name="lugar" size="sm" /> Librería Celama
                </p>
                <div className="cluster">
                  <Pill>2023</Pill>
                  <Pill>272 páginas</Pill>
                  <Pill variant="acento">Leído</Pill>
                  <Pill variant="mostaza">Próximo</Pill>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <p>Tarjeta normal: radio de 20 px y sombra suave.</p>
          </Card>
        </div>
      </Section>

      <Section id="portadas" titulo="Portadas">
        <ul role="list" className="rejilla-portadas">
          {resto.slice(0, 6).map((book) => (
            <li key={book.slug}>
              <BookCard book={book} sizes="(width >= 1024px) 180px, 45vw" />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="carrusel" titulo="Carrusel">
        <BookCarousel titulo="Lo último que hemos leído" books={librosEjemplo} />
      </Section>

      <Section id="buscador" titulo="Buscador">
        <SearchDemo />
      </Section>

      <Section id="valoraciones" titulo="Estrellas">
        <div className="stack">
          <div className="cluster">
            <StarRating valor={4.5} />
            <span>4,5 · 12 valoraciones</span>
          </div>
          <StarRating valor={3} tamano="sm" />
          <StarInputDemo />
        </div>
      </Section>

      <Section id="texto-largo" titulo="Texto largo con «Leer más»">
        <div className={styles.formulario}>
          <ExpandableText>
            <p>
              La vida no es fácil en un college de Nueva Inglaterra si eres un chico modesto y falto
              de afecto que llega de California, y Richard Papen lo sabe; por eso agradece que lo
              admitan en un pequeño grupo de cinco estudiantes.
            </p>
            <p>
              Los chicos sueltan comentarios en griego y se ríen de la ingenuidad y la torpeza de
              los demás, pero bien mirado se pasan el día bebiendo. Hasta que un mal día lo que
              parecían chiquilladas adquieren una gravedad inesperada.
            </p>
            <p>
              Es entonces cuando Richard y su pandilla descubren qué difícil es vivir sin máscaras.
            </p>
          </ExpandableText>
        </div>
      </Section>

      <Section id="hojas" titulo="Hoja modal">
        <SheetDemo />
      </Section>

      <Section id="avisos" titulo="Avisos (toasts)">
        <ToastDemo />
      </Section>

      <Section id="carga" titulo="Esqueletos de carga">
        <div className={styles.esqueletos} aria-busy="true">
          <p className="visually-hidden">Cargando lecturas…</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="stack">
              <Skeleton forma="portada" />
              <Skeleton />
              <Skeleton ancho="medio" />
            </div>
          ))}
        </div>
      </Section>

      <Section id="estados" titulo="Estados vacío y de error">
        <div className={styles.tarjetas}>
          <Card>
            <div className={styles.estado}>
              <Icon name="club" size="lg" />
              <p>Aún no hay propuestas. ¡Escribe al club!</p>
            </div>
          </Card>
          <Card>
            <div className={styles.estado}>
              <Icon name="error" size="lg" />
              <p>No hemos podido cargar las lecturas.</p>
              <Button variant="secundario" size="sm">
                Reintentar
              </Button>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
}
