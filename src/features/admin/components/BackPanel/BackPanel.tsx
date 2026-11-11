'use client';

import { useCallback, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Button, SegmentedControl, type Segment } from '@/components/ui';
import { useSesionEquipo } from '../../hooks/use-sesion-equipo';
import { AccesoGoogle } from '../AccesoGoogle';
import { AvisoScript } from '../AvisoScript';
import { PanelInscritas } from '../PanelInscritas';
import { PublicarAhora } from '../PublicarAhora';
import { SeccionEquipo } from '../SeccionEquipo';
import { SeccionLecturas } from '../SeccionLecturas';
import { SeccionPropuestas } from '../SeccionPropuestas';
import styles from './BackPanel.module.css';

type Pestana = 'lecturas' | 'propuestas' | 'inscritas' | 'equipo';

const PESTANAS: Segment<Pestana>[] = [
  { value: 'lecturas', label: 'Lecturas' },
  { value: 'propuestas', label: 'Propuestas' },
  { value: 'inscritas', label: 'Inscritas' },
];
const PESTANAS_ADMIN: Segment<Pestana>[] = [...PESTANAS, { value: 'equipo', label: 'Equipo' }];

/** Panel del equipo (/back): entrar con Google y gestionar la hoja del club. */
export function BackPanel() {
  const { estado, entrarConGoogle, salir } = useSesionEquipo();
  const [pestana, setPestana] = useState<Pestana>('lecturas');
  const alCaducar = useCallback(() => salir('sesion_no_valida'), [salir]);

  if (estado.tipo !== 'dentro') {
    return (
      <section className={`contenedor ${styles.panel}`}>
        <PageHeader titulo="Panel del club" subtitulo="Lecturas, propuestas y equipo del club." />
        {estado.tipo === 'cargando' ? (
          <p role="status" className={styles.saludo}>
            Cargando…
          </p>
        ) : (
          <AccesoGoogle
            onCredencial={(t) => void entrarConGoogle(t)}
            comprobando={estado.tipo === 'comprobando'}
            error={estado.tipo === 'fuera' ? estado.error : undefined}
            detalle={estado.tipo === 'fuera' ? estado.detalle : undefined}
          />
        )}
      </section>
    );
  }

  const { persona, sesion } = estado;
  const pestanas = persona.rol === 'admin' ? PESTANAS_ADMIN : PESTANAS;
  const actual = pestanas.some((p) => p.value === pestana) ? pestana : 'lecturas';

  return (
    <section className={`contenedor ${styles.panel}`}>
      <PageHeader
        titulo="Panel del club"
        subtitulo={`Hola${persona.nombre ? `, ${persona.nombre}` : ''}. Todo lo que cambies aquí se guarda en la hoja del club.`}
        acciones={
          <Button variant="secundario" size="sm" icono="salir" onClick={() => salir()}>
            Salir
          </Button>
        }
      />

      <AvisoScript sesion={sesion} esAdmin={persona.rol === 'admin'} />
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
        {actual === 'propuestas' && (
          <SeccionPropuestas
            sesion={sesion}
            esAdmin={persona.rol === 'admin'}
            alCaducar={alCaducar}
          />
        )}
        {actual === 'inscritas' && <PanelInscritas sesion={sesion} alCaducar={alCaducar} />}
        {actual === 'equipo' && (
          <SeccionEquipo sesion={sesion} miEmail={persona.email} alCaducar={alCaducar} />
        )}
      </div>
    </section>
  );
}
