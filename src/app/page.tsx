import { getLecturas } from '@/features/books/server';
import { Home } from '@/features/home';

export default function InicioPage() {
  const ultimas = getLecturas()
    .filter((l) => l.estado === 'leido')
    .slice(0, 12);
  return <Home ultimasLecturas={ultimas} />;
}
