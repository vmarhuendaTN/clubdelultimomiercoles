import { Logo } from '@/components/layout';
import { Button } from '@/components/ui';
import { site } from '@/config/site';
import styles from './Home.module.css';

/** Inicio provisional hasta la Fase 4 (portada con próxima sesión, lecturas e Instagram). */
export function Home() {
  return (
    <div className={`contenedor ${styles.home}`}>
      <div className={styles.logo}>
        <Logo tamano="grande" priority />
      </div>
      <h1 className={styles.claim}>Leemos juntos el último miércoles</h1>
      <p className={styles.texto}>
        Club de lectura en la {site.lugar.nombre}, {site.lugar.direccion}. Estamos preparando la
        web: muy pronto encontrarás aquí nuestras lecturas y la próxima sesión.
      </p>
      <Button href={`mailto:${site.email}`} variant="secundario">
        Escríbenos
      </Button>
    </div>
  );
}
