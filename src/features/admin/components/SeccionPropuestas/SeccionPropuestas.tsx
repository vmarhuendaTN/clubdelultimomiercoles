'use client';

import { useMemo, useState } from 'react';
import {
  BottomSheet,
  Button,
  SegmentedControl,
  Select,
  useToast,
  type Segment,
} from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import {
  abrirVotacion,
  anadirCandidata,
  archivarSesion,
  eliminarPropuesta,
  eliminarVotos,
  guardarPropuesta,
  listarPropuestas,
  listarVotacion,
  quitarCandidata,
  type LecturaNueva,
} from '../../services/api';
import { ESTADOS_PROPUESTA, etiqueta } from '../../services/etiquetas';
import { mensajePropuestas, mensajeVotacion } from '../../services/mensajes-whatsapp';
import { resultadosVotacion } from '../../services/resultados-votacion';
import { sesionesClub } from '../../services/sesiones';
import {
  claveLibro,
  clavePeriodo,
  etiquetaPeriodo,
  nombreCompleto,
  resumir,
  textoResumen,
} from '../../services/resumen-propuestas';
import type { Candidata, EstadoPropuesta, Propuesta } from '../../types';
import { ArchivoSesiones } from '../ArchivoSesiones';
import { EditorLectura } from '../EditorLectura';
import { EstadoCarga } from '../EstadoCarga';
import { LECTURA_VACIA } from '../FormularioLectura';
import { ListaProponentes } from '../ListaProponentes';
import { ExploradorPropuestas } from '../ExploradorPropuestas';
import { TinteroPanel } from '../TinteroPanel';
import { VotacionPanel } from '../VotacionPanel';
import styles from './SeccionPropuestas.module.css';

type SeccionPropuestasProps = { sesion: string; esAdmin: boolean; alCaducar: () => void };

/** Lo que se va a borrar, a la espera de confirmar. */
type ABorrar =
  { tipo: 'propuesta'; propuesta: Propuesta } | { tipo: 'voto'; nombre: string; votoIds: string[] };

type Vista = 'resumen' | 'votacion' | 'personas' | 'tintero' | 'archivo';
const VISTAS: Segment<Vista>[] = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'votacion', label: 'Votación' },
  { value: 'personas', label: 'Personas' },
  { value: 'tintero', label: 'Tintero' },
  { value: 'archivo', label: 'Archivo' },
];

/** «Circe, Madeline Miller» → título y autor para el editor de lecturas. */
function separar(texto: string): Pick<LecturaNueva, 'titulo' | 'autor'> {
  const [titulo = texto, ...resto] = texto.split(',');
  return { titulo: titulo.trim(), autor: resto.join(',').trim() };
}

/**
 * Tablero de propuestas para preparar cada sesión: qué libros se repiten, quién propone qué,
 * el tintero, y un resumen listo para compartir.
 */
export function SeccionPropuestas({ sesion, esAdmin, alCaducar }: SeccionPropuestasProps) {
  const toast = useToast();
  const { carga, recargar, fijar } = useCarga(() => listarPropuestas(sesion), alCaducar);
  const [vista, setVista] = useState<Vista>('resumen');
  const [elegido, setElegido] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [aLectura, setALectura] = useState<LecturaNueva | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aBorrar, setABorrar] = useState<ABorrar | null>(null);
  const votacion = useCarga(() => listarVotacion(sesion), alCaducar);

  const todas = useMemo(() => (carga.tipo === 'lista' ? carga.datos.propuestas : []), [carga]);
  const datosVotacion = votacion.carga.tipo === 'lista' ? votacion.carga.datos : null;
  const sesionesTodas = useMemo(
    () => sesionesClub(todas, datosVotacion?.candidatas ?? [], datosVotacion?.votos ?? []),
    [todas, datosVotacion],
  );
  // El selector muestra las sesiones en curso; las archivadas se ven desde «Archivo».
  const enCurso = sesionesTodas.filter((s) => !s.archivada);
  // Por defecto, la sesión en curso más reciente.
  const periodo = elegido ?? enCurso[0]?.clave ?? sesionesTodas[0]?.clave ?? '';
  const sesionActual = sesionesTodas.find((s) => s.clave === periodo);
  const resumen = useMemo(() => resumir(todas, periodo), [todas, periodo]);
  const delPeriodo = periodo ? todas.filter((p) => clavePeriodo(p) === periodo) : todas;
  const tituloPeriodo = periodo ? etiquetaPeriodo(periodo) : 'Todas las sesiones';

  const resultados = useMemo(
    () => resultadosVotacion(datosVotacion?.candidatas ?? [], datosVotacion?.votos ?? [], periodo),
    [datosVotacion, periodo],
  );
  const clavesCandidatas = useMemo(
    () => new Set(resultados.candidatas.map((c) => claveLibro(c.titulo))),
    [resultados],
  );

  /** Ejecuta una acción de votación y vuelve a cargar candidatas y votos. */
  async function enVotacion(
    accion: () => ReturnType<typeof abrirVotacion>,
    exito: string,
  ): Promise<boolean> {
    setOcupado(true);
    const r = await accion();
    if (r.ok) await votacion.recargar();
    setOcupado(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return false;
    }
    toast.mostrar(exito, 'exito');
    return true;
  }

  function alternarCandidata(texto: string) {
    const actual = resultados.candidatas.find((c) => claveLibro(c.titulo) === claveLibro(texto));
    if (actual) {
      void enVotacion(
        () => quitarCandidata(sesion, { sesion: periodo, id: actual.id }),
        `«${actual.titulo}» sale de la votación.`,
      );
    } else {
      const libro = separar(texto);
      void enVotacion(
        () => anadirCandidata(sesion, { sesion: periodo, ...libro }),
        `«${libro.titulo}» entra en la votación de ${tituloPeriodo.toLowerCase()}.`,
      );
    }
  }

  const elegir = (c: Candidata) =>
    setALectura({ ...LECTURA_VACIA, titulo: c.titulo, autor: c.autor, estado: 'proximo' });

  async function cambiarEstado(p: Propuesta, estado: EstadoPropuesta) {
    setGuardando(p.id);
    const r = await guardarPropuesta(sesion, { id: p.id, estado, nota_equipo: p.nota_equipo });
    setGuardando(null);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return;
    }
    fijar({ propuestas: todas.map((x) => (x.id === p.id ? { ...x, estado } : x)) });
    toast.mostrar(
      `Propuesta de ${nombreCompleto(p)}: ${etiqueta(ESTADOS_PROPUESTA, estado).toLowerCase()}.`,
      'exito',
    );
  }

  /** Borra una propuesta o los votos de una persona, ya confirmado. */
  async function borrar(b: ABorrar) {
    setOcupado(true);
    const r =
      b.tipo === 'propuesta'
        ? await eliminarPropuesta(sesion, b.propuesta.id)
        : await eliminarVotos(sesion, b.votoIds);
    if (r.ok) {
      if (b.tipo === 'propuesta')
        fijar({ propuestas: todas.filter((x) => x.id !== b.propuesta.id) });
      else await votacion.recargar();
    }
    setOcupado(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return;
    }
    setABorrar(null);
    toast.mostrar(
      b.tipo === 'propuesta'
        ? `Propuesta de ${nombreCompleto(b.propuesta)} eliminada.`
        : `Voto de ${b.nombre} eliminado.`,
      'exito',
    );
  }

  /** Archiva (o recupera) una sesión entera y vuelve a cargar propuestas y votación. */
  async function archivar(clave: string, archivarla: boolean) {
    setOcupado(true);
    const r = await archivarSesion(sesion, { sesion: clave, archivar: archivarla });
    if (r.ok) await Promise.all([recargar(), votacion.recargar()]);
    setOcupado(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return;
    }
    // Al archivar la sesión que se estaba viendo, se pasa a la siguiente en curso.
    if (archivarla && clave === periodo) setElegido(null);
    toast.mostrar(
      archivarla
        ? `${etiquetaPeriodo(clave)} archivada. La encontrarás en «Archivo».`
        : `${etiquetaPeriodo(clave)} vuelve a estar en curso.`,
      'exito',
    );
  }

  async function copiar(texto: string, exito: string) {
    try {
      await navigator.clipboard.writeText(texto);
      toast.mostrar(exito, 'exito');
    } catch {
      toast.mostrar('No se ha podido copiar. Selecciona el texto a mano.', 'error');
    }
  }

  const copiarResumen = () =>
    copiar(
      textoResumen(resumen, tituloPeriodo),
      'Resumen copiado. Pégalo en WhatsApp o en un email.',
    );

  const aLecturas = (texto: string, estado: LecturaNueva['estado'] = 'propuesta') =>
    setALectura({ ...LECTURA_VACIA, ...separar(texto), estado });

  return (
    <div className={styles.seccion}>
      {carga.tipo === 'cargando' && <EstadoCarga tipo="cargando" texto="Cargando propuestas…" />}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}

      {carga.tipo === 'lista' && (
        <>
          <div className={styles.barra}>
            <Select
              label="Sesión"
              opciones={[
                ...enCurso.map((s) => ({
                  value: s.clave,
                  label: `${s.etiqueta} · ${s.propuestas} ${s.propuestas === 1 ? 'propuesta' : 'propuestas'}`,
                })),
                ...(sesionActual?.archivada
                  ? [{ value: sesionActual.clave, label: `${sesionActual.etiqueta} · archivada` }]
                  : []),
                { value: '', label: `Todas las sesiones · ${todas.length}` },
              ]}
              value={periodo}
              onChange={(e) => setElegido(e.target.value)}
              className={styles.sesion}
            />
            <div className={styles.botones}>
              <Button
                variant="secundario"
                icono="externo"
                onClick={() =>
                  void copiar(
                    mensajePropuestas(periodo ? tituloPeriodo : ''),
                    'Mensaje copiado con el enlace para proponer. Pégalo en WhatsApp.',
                  )
                }
              >
                Pedir propuestas
              </Button>
              <Button
                variant="secundario"
                icono="documento"
                onClick={() => void copiarResumen()}
                disabled={resumen.libros.length === 0}
              >
                Copiar resumen
              </Button>
              {esAdmin && sesionActual && !sesionActual.archivada && (
                <Button
                  variant="sencillo"
                  disabled={ocupado}
                  onClick={() => void archivar(sesionActual.clave, true)}
                >
                  Archivar sesión
                </Button>
              )}
            </div>
          </div>

          {sesionActual?.archivada && (
            <div className={styles.archivada} role="note">
              <p>
                Estás viendo <strong>{sesionActual.etiqueta}</strong>, que está archivada.
              </p>
              {esAdmin && (
                <Button
                  variant="secundario"
                  size="sm"
                  disabled={ocupado}
                  onClick={() => void archivar(sesionActual.clave, false)}
                >
                  Desarchivar
                </Button>
              )}
            </div>
          )}

          <SegmentedControl
            id="propuestas"
            label="Vistas de propuestas"
            segments={VISTAS}
            value={vista}
            onChange={setVista}
          />

          <div
            id="propuestas-panel"
            role="tabpanel"
            aria-labelledby={`propuestas-tab-${vista}`}
            className={styles.panel}
          >
            {vista === 'resumen' && (
              <>
                <section className={styles.bloque} aria-labelledby="mas-propuestos">
                  <div className={styles.bloqueCabecera}>
                    <h3 id="mas-propuestos" className={styles.bloqueTitulo}>
                      Los más propuestos
                    </h3>
                    <p className={styles.ayuda}>
                      Pulsa una cifra para filtrar, busca un libro o una persona, o pulsa un nombre
                      para ver lo que propuso. Puntos: 3 si es su primera opción, 2 la segunda y 1
                      la tercera.
                    </p>
                  </div>
                  <ExploradorPropuestas
                    resumen={resumen}
                    onAnadir={(libro) =>
                      aLecturas(libro.texto, libro.votos > 1 ? 'proximo' : 'propuesta')
                    }
                    candidatas={clavesCandidatas}
                    onCandidata={
                      esAdmin && periodo && !ocupado
                        ? (libro) => alternarCandidata(libro.texto)
                        : undefined
                    }
                  />
                </section>

                {resumen.tintero.length > 0 && (
                  <section className={styles.bloque} aria-labelledby="tintero-marcado">
                    <h3 id="tintero-marcado" className={styles.bloqueTitulo}>
                      Lo más marcado del tintero
                    </h3>
                    <ul className={styles.tintero}>
                      {resumen.tintero.slice(0, 8).map((t) => (
                        <li key={t.texto}>
                          <span>{t.texto}</span>
                          <span className={styles.veces}>
                            {t.veces} {t.veces === 1 ? 'vez' : 'veces'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}

            {vista === 'votacion' &&
              (periodo ? (
                votacion.carga.tipo === 'lista' ? (
                  <VotacionPanel
                    resultados={resultados}
                    etiqueta={tituloPeriodo}
                    esAdmin={esAdmin}
                    ocupado={ocupado}
                    onAbrir={(abierta) =>
                      void enVotacion(
                        () => abrirVotacion(sesion, { sesion: periodo, abierta }),
                        abierta
                          ? 'Votación abierta: el club ya puede puntuar las candidatas.'
                          : 'Votación cerrada.',
                      )
                    }
                    onQuitar={(c) => alternarCandidata(c.titulo)}
                    onElegir={elegir}
                    onCompartir={() =>
                      void copiar(
                        mensajeVotacion(tituloPeriodo, resultados.candidatas),
                        resultados.abierta
                          ? 'Mensaje copiado con el enlace para votar. Pégalo en WhatsApp.'
                          : 'Mensaje copiado. Recuerda abrir la votación antes de enviarlo.',
                      )
                    }
                    onEliminarVoto={(v) => setABorrar({ tipo: 'voto', ...v })}
                    onAnadirLibre={async (libro) => {
                      const ok = await enVotacion(
                        () => anadirCandidata(sesion, { sesion: periodo, ...libro }),
                        `«${libro.titulo}» entra en la votación de ${tituloPeriodo.toLowerCase()}.`,
                      );
                      return ok;
                    }}
                  />
                ) : votacion.carga.tipo === 'error' ? (
                  <EstadoCarga
                    tipo="error"
                    error={votacion.carga.error}
                    onReintentar={() => void votacion.recargar()}
                  />
                ) : (
                  <EstadoCarga tipo="cargando" texto="Cargando la votación…" />
                )
              ) : (
                <p className={styles.aviso}>Elige una sesión para preparar su votación final.</p>
              ))}

            {vista === 'personas' && (
              <ListaProponentes
                propuestas={delPeriodo}
                repetidos={resumen.repetidos}
                guardando={guardando}
                onCambiarEstado={(p, e) => void cambiarEstado(p, e)}
                onEliminar={(p) => setABorrar({ tipo: 'propuesta', propuesta: p })}
                onAnadir={(texto, p) =>
                  aLecturas(texto, p.estado === 'aceptada' ? 'proximo' : 'propuesta')
                }
              />
            )}

            {vista === 'tintero' && (
              <TinteroPanel sesion={sesion} esAdmin={esAdmin} alCaducar={alCaducar} />
            )}

            {vista === 'archivo' && (
              <ArchivoSesiones
                sesiones={sesionesTodas}
                esAdmin={esAdmin}
                ocupado={ocupado}
                onVer={(clave) => {
                  setElegido(clave);
                  setVista('resumen');
                }}
                onArchivar={(clave, archivarla) => void archivar(clave, archivarla)}
              />
            )}
          </div>
        </>
      )}

      <BottomSheet
        open={aBorrar !== null}
        onClose={() => setABorrar(null)}
        titulo={aBorrar?.tipo === 'voto' ? 'Eliminar voto' : 'Eliminar propuesta'}
        acciones={
          <>
            <Button variant="secundario" onClick={() => setABorrar(null)}>
              Cancelar
            </Button>
            <Button onClick={() => aBorrar && void borrar(aBorrar)} disabled={ocupado}>
              Eliminar
            </Button>
          </>
        }
      >
        <p>
          {aBorrar?.tipo === 'voto'
            ? `Se borrará el voto de ${aBorrar.nombre}${aBorrar.votoIds.length > 1 ? ` (sus ${aBorrar.votoIds.length} envíos)` : ''} y dejará de contar en los resultados.`
            : aBorrar?.tipo === 'propuesta'
              ? `Se borrará la propuesta de ${nombreCompleto(aBorrar.propuesta)} y dejará de contar en el resumen y en sus participaciones.`
              : ''}{' '}
          Úsalo solo para errores: si te equivocas, se puede recuperar desde Archivo › Historial de
          versiones de la hoja.
        </p>
      </BottomSheet>

      <EditorLectura
        lectura={aLectura}
        sesion={sesion}
        onCerrar={() => setALectura(null)}
        onGuardada={() => setALectura(null)}
        alCaducar={alCaducar}
      />
    </div>
  );
}
