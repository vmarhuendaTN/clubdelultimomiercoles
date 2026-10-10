import { logoCompleto, logoCompletoOscuro } from '@/assets/images';
import { Button, ThemedImage } from '@/components/ui';
import { site } from '@/config/site';
import styles from './ReadingPause.module.css';

type ReadingPauseProps = { onReintentar?: () => void };

/**
 * «Estamos leyendo»: lo que se ve si algo falla o la web está en obras.
 * El logo completo sobre fondo neutro, sin datos técnicos.
 */
export function ReadingPause({ onReintentar }: ReadingPauseProps) {
  return (
    <div className={styles.pausa}>
      <div className={styles.logo}>
        <ThemedImage
          claro={logoCompleto.src}
          oscuro={logoCompletoOscuro.src}
          alt={logoCompleto.alt}
          sizes="(width >= 480px) 360px, 80vw"
          priority
          className={styles.img}
        />
      </div>
      <h1 className={styles.titulo}>Estamos leyendo</h1>
      <p className={styles.texto}>
        La web vuelve enseguida. Si tienes prisa, escríbenos a{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      {onReintentar && (
        <Button variant="secundario" onClick={onReintentar}>
          Volver a intentarlo
        </Button>
      )}
    </div>
  );
}
