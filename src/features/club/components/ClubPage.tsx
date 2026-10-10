import { PageHeader } from '@/components/layout';
import { Button, Card, Icon } from '@/components/ui';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import { JoinForm } from './JoinForm';
import styles from './ClubPage.module.css';

/**
 * Página del club. Textos provisionales: en la Fase 3 vendrán de la pestaña
 * «Textos» de la Sheet (club_quienes_somos, club_normas).
 */
export function ClubPage() {
  return (
    <div className="contenedor">
      <PageHeader titulo="El club" />
      <div className={styles.rejilla}>
        <Card as="section" destacada>
          <h2 className={styles.titulo}>Quiénes somos</h2>
          <p>
            Somos un club de lectura que se reúne en Madrid el último miércoles del mes, cada dos
            meses, para hablar de un libro que hemos leído todos.
          </p>
          <p className={styles.cita}>Lo que pasa en el Club, se queda en el Club.</p>
        </Card>

        <Card as="section">
          <h2 className={styles.titulo}>Dónde y cuándo</h2>
          <ul role="list" className={styles.datos}>
            <li>
              <Icon name="calendario" />
              <span>Último miércoles del mes, cada dos meses, a las 19:30</span>
            </li>
            <li>
              <Icon name="lugar" />
              <span>
                {site.lugar.nombre}
                <br />
                {site.lugar.direccion}
              </span>
            </li>
          </ul>
          <Button href={site.lugar.mapa} variant="secundario" icono="externo">
            Cómo llegar
          </Button>
        </Card>

        <Card as="section">
          <h2 className={styles.titulo}>Documentos</h2>
          <p>Normas del club y otros documentos para descargar.</p>
          <Button href={routes.documentos} variant="secundario" icono="documento">
            Ver documentos
          </Button>
        </Card>

        <Card as="section" className={styles.ancha}>
          <h2 className={styles.titulo}>En Substack</h2>
          <p>Textos y novedades del club, también por suscripción en Substack.</p>
          <Button href={site.substack} variant="secundario" icono="externo">
            Leer en Substack
          </Button>
        </Card>

        <Card as="section" className={styles.ancha}>
          <h2 className={styles.titulo}>Quiero ser del club</h2>
          <p>
            ¿Te apetece unirte? Déjanos tus datos y te escribimos cuando haya plaza o una sesión
            abierta.
          </p>
          <JoinForm />
        </Card>
      </div>
    </div>
  );
}
