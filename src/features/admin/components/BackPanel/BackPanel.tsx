'use client';

import { useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { Button, Select } from '@/components/ui';
import { useEnlaces } from '../../hooks/use-enlaces';
import { useEstadoSistema } from '../../hooks/use-estado-sistema';
import { usePreferencia } from '../../hooks/use-preferencia';
import { useSesionEquipo } from '../../hooks/use-sesion-equipo';
import { OPCIONES_FILTRO_CLUB, type FiltroClub } from '../../services/clubs';
import { problemas } from '../../services/comprobaciones';
import { definicion, esSeccion, gruposPara, type Seccion } from '../../services/secciones';
import { AccesoGoogle } from '../AccesoGoogle';
import { AlertasSistema } from '../AlertasSistema';
import { MenuPanel } from '../MenuPanel';
import { PublicarAhora } from '../PublicarAhora';
import { SeccionEquipo } from '../SeccionEquipo';
import { SeccionEstado } from '../SeccionEstado';
import { SeccionInscritas } from '../SeccionInscritas';
import { SeccionLecturas } from '../SeccionLecturas';
import { SeccionPropuestas, type VistaPropuestas } from '../SeccionPropuestas';
import { SeccionValoraciones } from '../SeccionValoraciones';
import styles from './BackPanel.module.css';

const esClub = (v: string): v is FiltroClub => v === '' || v === '1' || v === '2';

const VISTA_PROPUESTAS: Partial<Record<Seccion, VistaPropuestas>> = {
  propuestas: 'resumen',
  envios: 'personas',
  votacion: 'votacion',
  tintero: 'tintero',
  archivo: 'archivo',
};

/** Panel del equipo (/back): entrar con Google y gestionar la hoja del club. */
export function BackPanel() {
  const { estado, entrarConGoogle, salir } = useSesionEquipo();
  const [seccion, setSeccion] = usePreferencia<Seccion>(
    'club:panel-seccion',
    'lecturas',
    esSeccion,
  );
  const [club, setClub] = usePreferencia<FiltroClub>('club:panel-club', '', esClub);
  const alCaducar = useCallback(() => salir('sesion_no_valida'), [salir]);

  if (estado.tipo !== 'dentro') {
    return (
      <section className={`contenedor ${styles.fuera}`}>
        <PageHeader titulo="Panel del club" subtitulo="Lecturas, propuestas y equipo del club." />
        {estado.tipo === 'cargando' ? (
          <p role="status" className={styles.texto2}>
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

  return (
    <PanelDentro
      persona={estado.persona}
      sesion={estado.sesion}
      seccion={seccion}
      setSeccion={setSeccion}
      club={club}
      setClub={setClub}
      alCaducar={alCaducar}
      salir={() => salir()}
    />
  );
}

type PanelDentroProps = {
  persona: { email: string; nombre: string; rol: 'admin' | 'editora' };
  sesion: string;
  seccion: Seccion;
  setSeccion: (s: Seccion) => void;
  club: FiltroClub;
  setClub: (c: FiltroClub) => void;
  alCaducar: () => void;
  salir: () => void;
};

/** El panel con sesión: comprueba el sistema y carga los accesos directos una vez. */
function PanelDentro({
  persona,
  sesion,
  seccion,
  setSeccion,
  club,
  setClub,
  alCaducar,
  salir,
}: PanelDentroProps) {
  const sistema = useEstadoSistema(sesion);
  const enlaces = useEnlaces(sesion);
  const avisos = problemas(sistema.comprobaciones).length;
  const esAdmin = persona.rol === 'admin';
  const grupos = gruposPara(persona.rol);
  const visible = grupos.some((g) => g.secciones.some((s) => s.id === seccion));
  const actual: Seccion = visible ? seccion : 'lecturas';
  const def = definicion(actual);
  const vista = VISTA_PROPUESTAS[actual];

  return (
    <div className={`contenedor ${styles.panel}`}>
      <header className={styles.cabecera}>
        <div className={styles.marca}>
          <h1 className={styles.titulo}>Panel del club</h1>
          <p className={styles.texto2}>
            {persona.nombre ? `Hola, ${persona.nombre}.` : 'Hola.'} Lo que guardes va a la hoja del
            club.
          </p>
        </div>
        <Button variant="secundario" size="sm" icono="salir" onClick={salir}>
          Salir
        </Button>
      </header>

      {actual !== 'estado' && (
        <AlertasSistema
          comprobaciones={sistema.comprobaciones}
          onVer={() => setSeccion('estado')}
        />
      )}
      <PublicarAhora sesion={sesion} alCaducar={alCaducar} />

      <div className={styles.cuerpo}>
        <MenuPanel
          grupos={grupos}
          actual={actual}
          onCambiar={setSeccion}
          enlaces={enlaces}
          avisos={avisos}
        />

        <section className={styles.contenido} aria-labelledby="seccion-titulo">
          <div className={styles.encabezado}>
            <div>
              <h2 id="seccion-titulo" className={styles.seccionTitulo}>
                {def.etiqueta}
              </h2>
              <p className={styles.texto2}>{def.descripcion}</p>
            </div>
            {def.conClub && (
              <Select
                label="Club"
                opciones={OPCIONES_FILTRO_CLUB}
                value={club}
                onChange={(e) => setClub(e.target.value as FiltroClub)}
                className={styles.club}
              />
            )}
          </div>

          {actual === 'lecturas' && <SeccionLecturas sesion={sesion} alCaducar={alCaducar} />}
          {vista && (
            <SeccionPropuestas
              sesion={sesion}
              esAdmin={esAdmin}
              alCaducar={alCaducar}
              vista={vista}
              club={club}
              onVerSesion={() => setSeccion('propuestas')}
            />
          )}
          {actual === 'inscritas' && (
            <SeccionInscritas sesion={sesion} club={club} alCaducar={alCaducar} />
          )}
          {actual === 'valoraciones' && (
            <SeccionValoraciones sesion={sesion} club={club} alCaducar={alCaducar} />
          )}
          {actual === 'estado' && (
            <SeccionEstado
              comprobaciones={sistema.comprobaciones}
              onRecargar={() => void sistema.recargar()}
              onIrA={setSeccion}
            />
          )}
          {actual === 'equipo' && (
            <SeccionEquipo sesion={sesion} miEmail={persona.email} alCaducar={alCaducar} />
          )}
        </section>
      </div>
    </div>
  );
}
