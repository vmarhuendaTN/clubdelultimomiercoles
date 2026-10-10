import { Button } from '@/components/ui';
import { site } from '@/config/site';
import styles from './InstagramEmbed.module.css';

/**
 * Perfil de Instagram incrustado (últimas publicaciones). Se carga con la página; Meta puede
 * usar sus propias cookies (explicado en /privacidad).
 */
export function InstagramEmbed() {
  return (
    <div className={styles.marco}>
      <iframe
        src={site.instagramEmbed}
        title="Publicaciones de @elultimomiercoles en Instagram"
        loading="lazy"
        className={styles.iframe}
      />
      <Button href={site.instagram} variant="sencillo" icono="externo">
        Ver en Instagram
      </Button>
    </div>
  );
}
