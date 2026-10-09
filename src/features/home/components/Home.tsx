import { Logo } from '@/components/layout';
import { Button } from '@/components/ui';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import { BookCarousel, type Lectura } from '@/features/books';
import styles from './Home.module.css';

type HomeProps = { ultimasLecturas: readonly Lectura[] };

/** Inicio. La tarjeta de próxima sesión llegará con la pestaña Sesiones de la Sheet (Fase 3). */
export function Home({ ultimasLecturas }: HomeProps) {
  return (
    <div className="contenedor">
      <div className={styles.hero}>
        <div className={styles.logo}>
          <Logo tamano="grande" priority />
        </div>
        <h1 className={styles.claim}>Leemos juntos el último miércoles</h1>
        <p className={styles.texto}>
          Club de lectura en la {site.lugar.nombre}, {site.lugar.direccion}. Nos vemos cada dos
          meses, a las 19:30.
        </p>
      </div>
      {ultimasLecturas.length > 0 && (
        <div className={styles.seccion}>
          <BookCarousel
            titulo="Lo último que hemos leído"
            books={ultimasLecturas}
            accion={
              <Button href={routes.lecturas} variant="sencillo" size="sm">
                Ver todas
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
