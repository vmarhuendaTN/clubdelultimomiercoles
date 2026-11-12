'use client';

import { useEffect, useId, useState } from 'react';
import { Button, Icon, SegmentedControl, type Segment } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useOpcionesPropuesta } from '../../hooks/use-opciones-propuesta';
import { usePersonasClub } from '../../hooks/use-personas-club';
import { useVotacionPublica } from '../../hooks/use-votacion-publica';
import { codigoRecordado, olvidarCodigo, recordarCodigo } from '../../services/codigo-recordado';
import { enviarPropuesta, type DatosPropuesta } from '../../services/enviar-propuesta';
import { enviarVoto, textoSesion, type DatosVoto } from '../../services/votacion';
import { CodigoClub } from '../CodigoClub';
import { FormularioPropuesta } from '../FormularioPropuesta';
import { VotacionFinal } from '../VotacionFinal';
import styles from './ProposalForm.module.css';

type Modo = 'votar' | 'proponer';
const MODOS: Segment<Modo>[] = [
  { value: 'votar', label: 'Votación final' },
  { value: 'proponer', label: 'Proponer' },
];

/** completo: votar y proponer (pestaña de Lecturas); votar / proponer: páginas para WhatsApp. */
export type ModoFormulario = 'completo' | 'votar' | 'proponer';

type Paso =
  | { tipo: 'codigo'; error?: string }
  | { tipo: 'formulario'; codigo: string }
  | { tipo: 'enviada'; codigo: string; mensaje: string };

/**
 * «Propón la próxima lectura»: primera ronda (cada miembro propone tres lecturas) y, cuando la
 * administradora la abre, segunda ronda (votación final de las candidatas, tipo encuesta).
 * Protegido con el código del club; todo llega a la hoja y se gestiona desde /back.
 */
export function ProposalForm({ modo: modoFijo = 'completo' }: { modo?: ModoFormulario }) {
  const tituloId = useId();
  const [paso, setPaso] = useState<Paso>({ tipo: 'codigo' });
  const [modo, setModo] = useState<Modo>('votar');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();
  // Clave para vaciar el formulario al volver a empezar.
  const [vuelta, setVuelta] = useState(0);
  const dentro = paso.tipo === 'formulario';
  const opciones = useOpcionesPropuesta(dentro);
  const personas = usePersonasClub(paso.tipo === 'codigo' ? null : paso.codigo);
  const estadoVotacion = useVotacionPublica(dentro && modoFijo !== 'proponer');
  const votacion = estadoVotacion.tipo === 'abierta' ? estadoVotacion.votacion : null;
  // En /votar/ siempre se vota; en /proponer/ nunca; en Lecturas, según la pestaña elegida.
  const votando =
    modoFijo === 'votar' || (modoFijo === 'completo' && votacion !== null && modo === 'votar');
  const conPestanas = modoFijo === 'completo' && votacion !== null;

  useEffect(() => {
    const codigo = codigoRecordado();
    if (codigo) setPaso({ tipo: 'formulario', codigo });
  }, []);

  /** Envía (propuesta o voto) y decide el siguiente paso según la respuesta del script. */
  async function tramitar(
    codigo: string,
    envio: () => ReturnType<typeof enviarVoto>,
    gracias: string,
  ) {
    setEnviando(true);
    setError(undefined);
    const r = await envio();
    setEnviando(false);
    if (r.ok) {
      setPaso({ tipo: 'enviada', codigo, mensaje: gracias });
    } else if (r.error === 'codigo_incorrecto') {
      olvidarCodigo();
      setPaso({ tipo: 'codigo', error: 'El código del club ha cambiado. Escribe el nuevo.' });
    } else {
      setError(mensajeDeError(r.error, r.detalle));
    }
  }

  const proponer = (codigo: string, datos: DatosPropuesta) =>
    tramitar(
      codigo,
      () => enviarPropuesta(datos, codigo),
      `¡Gracias${datos.nombre.trim() ? `, ${datos.nombre.trim()}` : ''}! Hemos recibido tus lecturas para ${datos.mes} de ${datos.anio}. Las veremos en la próxima sesión.`,
    );

  const votar = (codigo: string, datos: DatosVoto, sesion: string) =>
    tramitar(
      codigo,
      () => enviarVoto(datos, codigo),
      `¡Gracias${datos.nombre.trim() ? `, ${datos.nombre.trim()}` : ''}! Tu voto para ${textoSesion(sesion)} está guardado. Si cambias de opinión, puedes votar otra vez.`,
    );

  return (
    <section aria-labelledby={tituloId} className={styles.seccion}>
      <h2 id={tituloId} className={styles.titulo}>
        {votando ? 'Vota la próxima lectura' : 'Propón la próxima lectura'}
      </h2>

      {paso.tipo === 'codigo' && (
        <CodigoClub
          errorInicial={paso.error}
          onCorrecto={(codigo) => {
            recordarCodigo(codigo);
            setPaso({ tipo: 'formulario', codigo });
          }}
        />
      )}

      {paso.tipo === 'formulario' && (
        <>
          {conPestanas && (
            <SegmentedControl
              id="ronda"
              label="Votar o proponer"
              segments={MODOS}
              value={modo}
              onChange={(m) => {
                setModo(m);
                setError(undefined);
              }}
            />
          )}
          <div
            {...(conPestanas
              ? { id: 'ronda-panel', role: 'tabpanel', 'aria-labelledby': `ronda-tab-${modo}` }
              : {})}
            className={styles.ronda}
          >
            {votando && !votacion ? (
              <p className={styles.texto} role="status">
                {estadoVotacion.tipo === 'cargando'
                  ? 'Comprobando si hay una votación abierta…'
                  : 'Ahora mismo no hay ninguna votación abierta. Cuando el club la abra, os avisaremos por WhatsApp con este mismo enlace.'}
              </p>
            ) : votando && votacion ? (
              <VotacionFinal
                key={`v${vuelta}`}
                votacion={votacion}
                personas={personas}
                enviando={enviando}
                error={error}
                onEnviar={(datos) => void votar(paso.codigo, datos, votacion.sesion)}
              />
            ) : (
              <>
                <p className={styles.texto}>
                  ¿Qué te gustaría leer con el club? Propón tres lecturas y las tendremos en cuenta
                  para la próxima sesión.
                </p>
                <FormularioPropuesta
                  key={`p${vuelta}`}
                  opciones={opciones}
                  personas={personas}
                  enviando={enviando}
                  error={error}
                  onEnviar={(datos) => void proponer(paso.codigo, datos)}
                />
              </>
            )}
          </div>
        </>
      )}

      {paso.tipo === 'enviada' && (
        <div className={styles.gracias} role="status">
          <span className={styles.check} aria-hidden="true">
            <Icon name="exito" />
          </span>
          <p className={styles.mensaje}>{paso.mensaje}</p>
          <Button
            variant="secundario"
            onClick={() => {
              setVuelta((v) => v + 1);
              setPaso({ tipo: 'formulario', codigo: paso.codigo });
            }}
          >
            Volver al formulario
          </Button>
        </div>
      )}
    </section>
  );
}
