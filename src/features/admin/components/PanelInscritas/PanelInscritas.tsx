'use client';

import { useState } from 'react';
import { SegmentedControl, type Segment } from '@/components/ui';
import { SeccionInscritas } from '../SeccionInscritas';
import { SeccionValoraciones } from '../SeccionValoraciones';
import styles from './PanelInscritas.module.css';

type PanelInscritasProps = { sesion: string; alCaducar: () => void };

type Vista = 'personas' | 'valoraciones';
const VISTAS: Segment<Vista>[] = [
  { value: 'personas', label: 'Personas' },
  { value: 'valoraciones', label: 'Valoraciones' },
];

/** Pestaña «Inscritas» del panel: el registro de personas y las valoraciones de cada lectura. */
export function PanelInscritas({ sesion, alCaducar }: PanelInscritasProps) {
  const [vista, setVista] = useState<Vista>('personas');
  return (
    <div className={styles.panel}>
      <SegmentedControl
        id="inscritas"
        label="Inscritas y valoraciones"
        segments={VISTAS}
        value={vista}
        onChange={setVista}
      />
      <div id="inscritas-panel" role="tabpanel" aria-labelledby={`inscritas-tab-${vista}`}>
        {vista === 'personas' ? (
          <SeccionInscritas sesion={sesion} alCaducar={alCaducar} />
        ) : (
          <SeccionValoraciones sesion={sesion} alCaducar={alCaducar} />
        )}
      </div>
    </div>
  );
}
