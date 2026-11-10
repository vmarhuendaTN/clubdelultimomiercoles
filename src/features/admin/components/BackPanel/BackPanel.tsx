'use client';

import { useCallback, useState } from 'react';
import { Button, SegmentedControl, type Segment } from '@/components/ui';
import { useSesionEquipo } from '../../hooks/use-sesion-equipo';
import { AccesoGoogle } from '../AccesoGoogle';
import { PublicarAhora } from '../PublicarAhora';
import { SeccionEquipo } from '../SeccionEquipo';
import { SeccionLecturas } from '../SeccionLecturas';
import { SeccionPropuestas } from '../SeccionPropuestas';
import styles from './BackPanel.module.css';

type Pestana = 'lecturas' | 'propuestas' | 'equipo';

const PESTANAS: Segment<Pestana>[] = [
  { value: 'lecturas', label: 'Lecturas' },
  { value: 'propuestas', label: 'Propuestas' },
];
const PESTANAS_ADMIN: Segment<Pestana>[] = [...PESTANAS, { value: 'equipo', label: 'Equipo' }];

/** Panel del equipo (/back): entrar con Google y gestionar la hoja del club. */
export function BackPanel() {
  const { estado, entrarConGoogle, salir } = useSesionEquipo();
  const [pestana, setPestana] = useState<Pestana>('lecturas');
  const alCaducar = useCallback(() => salir('sesion_no_valida'), [salir]);

  if (estado.tipo !== 'dentro') {
    return (
      <section className={styles.panel} aria-labelledby="titulo-back">
        <h1 id="titulo-back" className={styles.titulo}>
          Panel del club
        </h1>
        {estado.tipo === 'cargando' ? (
          <p role="status" className={styles.saludo}>
            Cargando…
          </p>
        ) : (
          <AccesoGoogle
            onCredencial={(t) => void entrarConGoogle(t)}
            comprobando={estado.tipo === 'comprobando'}
            error={estado.tipo === 'fuera' ? estado.error : undefined}
          />
        )}
      </section>
    );
  }

  const { persona, sesion } = estado;
  const pestanas = persona.rol === 'admin' ? PESTANAS_ADMIN : PESTANAS;
  const actual = pestanas.some((p) => p.value === pestana) ? pestana : 'lecturas';

  return (
    <section className={styles.panel} aria-labelledby="titulo-back">
      <header className={styles.cabecera}>
        <h1 id="titulo-back" className={styles.titulo}>
          Panel del club
        </h1>
        <Button variant="secundario" size="sm" icono="salir" onClick={() => salir()}>
          Salir
        </Button>
      </header>
      <p className={styles.saludo}>
        Hola{persona.nombre ? `, ${persona.nombre}` : ''}. Todo lo que cambies aquí se guarda en la
        hoja del club.
      </p>

      <PublicarAhora sesion={sesion} alCaducar={alCaducar} />

      <SegmentedControl
        id="back"
        label="Secciones del panel"
        segments={pestanas}
        value={actual}
        onChange={setPestana}
      />
      <div
        id="back-panel"
        role="tabpanel"
        aria-labelledby={`back-tab-${actual}`}
        className={styles.contenido}
      >
        {actual === 'lecturas' && <SeccionLecturas sesion={sesion} alCaducar={alCaducar} />}
        {actual === 'propuestas' && <SeccionPropuestas sesion={sesion} alCaducar={alCaducar} />}
        {actual === 'equipo' && (
          <SeccionEquipo sesion={sesion} miEmail={persona.email} alCaducar={alCaducar} />
        )}
      </div>
    </section>
  );
}
