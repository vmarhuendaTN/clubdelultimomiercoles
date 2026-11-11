import { Button } from '@/components/ui';
import { site } from '@/config/site';
import { formatFecha } from '@/lib/format';
import { enlaceGoogleCalendar, enlacesSuscripcion } from '../../services/calendario';
import { eventoDeQuedada, quedadasDe, urlCalendario } from '../../services/evento-sesion';
import type { Lectura } from '../../types';
import styles from './AnadirCalendario.module.css';

type AnadirCalendarioProps = {
  lectura: Pick<Lectura, 'slug' | 'titulo' | 'autor' | 'fechaSesion' | 'fechaSesion2'>;
};

/**
 * Lugar y hora de las quedadas y botones para llevarlas al calendario. Con dos clubs, cada uno
 * se suscribe a su calendario. La suscripción se actualiza sola (nuevo libro, nueva fecha);
 * «solo esta sesión» añade un evento suelto en Google Calendar.
 */
export function AnadirCalendario({ lectura }: AnadirCalendarioProps) {
  const quedadas = quedadasDe(lectura);
  if (quedadas.length === 0) return null;
  return (
    <div className={styles.calendario}>
      <p className={styles.datos}>
        A las {site.sesion.hora} en{' '}
        <a href={site.lugar.mapa} rel="noopener noreferrer">
          {site.lugar.nombre}
        </a>{' '}
        ({site.lugar.direccion})
      </p>
      {quedadas.map((q) => {
        const { webcal, google } = enlacesSuscripcion(urlCalendario(q.club?.id));
        const de = q.club ? ` del ${q.club.nombre}` : '';
        return (
          <div key={q.club?.id ?? 'club'} className={styles.quedada}>
            {q.club && (
              <p className={styles.club}>
                <strong>{q.club.nombre}</strong> · {formatFecha(q.fecha)}
              </p>
            )}
            <div className={styles.botones}>
              <Button
                href={webcal}
                variant="primario"
                size="sm"
                icono="calendario"
                aria-label={q.club ? `Añadir el calendario${de} a mi calendario` : undefined}
              >
                Añadir a mi calendario
              </Button>
              <Button
                href={google}
                variant="secundario"
                size="sm"
                icono="calendario"
                aria-label={
                  q.club ? `Suscribirme al calendario${de} en Google Calendar` : undefined
                }
              >
                Google Calendar
              </Button>
            </div>
          </div>
        );
      })}
      <p className={styles.ayuda}>
        Te suscribes al calendario {quedadas.some((q) => q.club) ? 'de tu club' : 'del club'}: se
        actualiza solo con cada nueva lectura. ¿Prefieres un evento suelto?{' '}
        {quedadas.map((q, i) => (
          <span key={q.club?.id ?? 'club'}>
            {i > 0 && ' · '}
            <a
              href={enlaceGoogleCalendar(eventoDeQuedada(lectura, q), site.sesion.zona)}
              rel="noopener noreferrer"
            >
              {q.club ? `Solo esta sesión del ${q.club.nombre}` : 'Añade solo esta sesión'}
            </a>
          </span>
        ))}
        .
      </p>
    </div>
  );
}
