import { PageHeader } from '@/components/layout';
import { getLecturas } from '../server';
import { LecturasExplorer } from './LecturasExplorer';

export function LecturasPage() {
  const lecturas = getLecturas();
  return (
    <div className="contenedor">
      <PageHeader titulo="Lecturas" subtitulo="Lo que viene y todo lo que hemos leído juntos." />
      <LecturasExplorer lecturas={lecturas} />
    </div>
  );
}
