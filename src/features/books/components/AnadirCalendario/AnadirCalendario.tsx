import { Button } from '@/components/ui';
import { site } from '@/config/site';
import { enlaceGoogleCalendar, enlacesSuscripcion } from '../../services/calendario';
import { eventoDeLectura, urlCalendario } from '../../services/evento-sesion';
import type { Lectura } from '../../types';
import styles from './AnadirCalendario.module.css';

type AnadirCalendarioProps = {
  lectura: Pick<Lectura, 'slug' | 'titulo' | 'autor' | 'fechaSesion'>;
};

/**
 * Lugar y hora de la sesión y botones para llevarla al calendario. La suscripción se actualiza
 * sola (nuevo libro, nueva fecha); «solo esta sesión» añade un evento suelto en Google Calendar.
 */
export function AnadirCalendario({ lectura }: AnadirCalendarioProps) {
  const evento = eventoDeLectura(lectura);
  if (!evento) return null;
  const { webcal, google } = enlacesSuscripcion(urlCalendario());
  return (
    <div className={styles.calendario}>
      <p className={styles.datos}>
        A las {site.sesion.hora} en{' '}
        <a href={site.lugar.mapa} rel="noopener noreferrer">
          {site.lugar.nombre}
        </a>{' '}
        ({site.lugar.direccion})
      </p>
      <div className={styles.botones}>
        <Button href={webcal} variant="primario" size="sm" icono="calendario">
          Añadir a mi calendario
        </Button>
        <Button href={google} variant="secundario" size="sm" icono="calendario">
          Google Calendar
        </Button>
      </div>
      <p className={styles.ayuda}>
        Te suscribes al calendario del club: se actualiza solo con cada nueva lectura. ¿Prefieres un
        evento suelto?{' '}
        <a href={enlaceGoogleCalendar(evento, site.sesion.zona)} rel="noopener noreferrer">
          Añade solo esta sesión
        </a>
        .
      </p>
    </div>
  );
}
