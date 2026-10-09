import Image from 'next/image';
import { logoSillon } from '@/assets/images';
import { Button } from '@/components/ui';
import { routes } from '@/config/routes';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={`contenedor ${styles.error}`}>
      <Image src={logoSillon.src} alt="" className={styles.sillon} priority />
      <h1>Este sillón está vacío</h1>
      <p className={styles.texto}>
        No encontramos la página que buscas. Quizá se ha movido de estantería.
      </p>
      <Button href={routes.inicio}>Volver al inicio</Button>
    </div>
  );
}
