import Link from 'next/link';
import {
  logoCabecera,
  logoCabeceraOscuro,
  logoCompleto,
  logoCompletoOscuro,
} from '@/assets/images';
import { ThemedImage } from '@/components/ui';
import { routes } from '@/config/routes';
import styles from './Logo.module.css';

type LogoProps = { tamano?: 'barra' | 'grande'; priority?: boolean };

/**
 * Logo enlazado a inicio, con variante para modo oscuro.
 * - `barra`: logo de cabecera (sillón y nombre manuscrito en una línea).
 * - `grande`: el logo completo.
 */
export function Logo({ tamano = 'barra', priority = false }: LogoProps) {
  const barra = tamano === 'barra';
  const [claro, oscuro] = barra
    ? [logoCabecera, logoCabeceraOscuro]
    : [logoCompleto, logoCompletoOscuro];
  return (
    <Link href={routes.inicio} className={`${styles.logo} ${barra ? styles.barra : styles.grande}`}>
      <ThemedImage
        claro={claro.src}
        oscuro={oscuro.src}
        alt={claro.alt}
        sizes={barra ? '320px' : '(width >= 480px) 420px, 90vw'}
        priority={priority}
        className={barra ? styles.cabecera : styles.img}
      />
    </Link>
  );
}
