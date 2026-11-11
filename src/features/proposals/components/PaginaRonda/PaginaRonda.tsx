import { PageHeader } from '@/components/layout';
import { ProposalForm } from '../ProposalForm';
import styles from './PaginaRonda.module.css';

const TEXTOS = {
  votar: {
    titulo: 'Votación',
    subtitulo: 'Puntúa las lecturas candidatas para la próxima sesión del club.',
  },
  proponer: {
    titulo: 'Propuestas',
    subtitulo: 'Propón tres lecturas para la próxima sesión del club.',
  },
} as const;

/** Páginas /votar/ y /proponer/: el enlace que las administradoras comparten por WhatsApp. */
export function PaginaRonda({ modo }: { modo: 'votar' | 'proponer' }) {
  const { titulo, subtitulo } = TEXTOS[modo];
  return (
    <div className="contenedor">
      <PageHeader titulo={titulo} subtitulo={subtitulo} />
      <div className={styles.cuerpo}>
        <ProposalForm modo={modo} />
      </div>
    </div>
  );
}
