import { PageHeader } from '@/components/layout';
import { getLecturas } from '../server';
import { LecturasExplorer } from './LecturasExplorer';
import styles from './LecturasPage.module.css';

export function LecturasPage() {
  const lecturas = getLecturas();
  return (
    <div className="contenedor">
      <PageHeader titulo="Lecturas" subtitulo="Todo lo que hemos leído juntos y lo que viene." />
      <LecturasExplorer lecturas={lecturas} />
      <p className={styles.fuente}>Datos de libros: Google Libros.</p>
    </div>
  );
}
