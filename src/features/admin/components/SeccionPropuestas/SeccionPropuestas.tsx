'use client';

import { useMemo, useState } from 'react';
import { Button, Cifra, SegmentedControl, Select, useToast, type Segment } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import { guardarPropuesta, listarPropuestas, type LecturaNueva } from '../../services/api';
import { ESTADOS_PROPUESTA, etiqueta } from '../../services/etiquetas';
import {
  clavePeriodo,
  etiquetaPeriodo,
  nombreCompleto,
  periodos,
  resumir,
  textoResumen,
} from '../../services/resumen-propuestas';
import type { EstadoPropuesta, Propuesta } from '../../types';
import { EditorLectura } from '../EditorLectura';
import { EstadoCarga } from '../EstadoCarga';
import { LECTURA_VACIA } from '../FormularioLectura';
import { ListaProponentes } from '../ListaProponentes';
import { RankingLibros } from '../RankingLibros';
import { TinteroPanel } from '../TinteroPanel';
import styles from './SeccionPropuestas.module.css';

type SeccionPropuestasProps = { sesion: string; esAdmin: boolean; alCaducar: () => void };

type Vista = 'resumen' | 'personas' | 'tintero';
const VISTAS: Segment<Vista>[] = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'personas', label: 'Personas' },
  { value: 'tintero', label: 'Tintero' },
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

  const todas = useMemo(() => (carga.tipo === 'lista' ? carga.datos.propuestas : []), [carga]);
  const sesiones = useMemo(() => periodos(todas), [todas]);
  // Por defecto, la sesión más reciente con propuestas.
  const periodo = elegido ?? sesiones[0]?.clave ?? '';
  const resumen = useMemo(() => resumir(todas, periodo), [todas, periodo]);
  const delPeriodo = periodo ? todas.filter((p) => clavePeriodo(p) === periodo) : todas;
  const tituloPeriodo = periodo ? etiquetaPeriodo(periodo) : 'Todas las sesiones';

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

  async function copiarResumen() {
    try {
      await navigator.clipboard.writeText(textoResumen(resumen, tituloPeriodo));
      toast.mostrar('Resumen copiado. Pégalo en WhatsApp o en un email.', 'exito');
    } catch {
      toast.mostrar('No se ha podido copiar. Selecciona el texto a mano.', 'error');
    }
  }

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
                ...sesiones.map((s) => ({
                  value: s.clave,
                  label: `${s.etiqueta} · ${s.total} ${s.total === 1 ? 'propuesta' : 'propuestas'}`,
                })),
                { value: '', label: `Todas las sesiones · ${todas.length}` },
              ]}
              value={periodo}
              onChange={(e) => setElegido(e.target.value)}
              className={styles.sesion}
            />
            <Button
              variant="secundario"
              icono="documento"
              onClick={() => void copiarResumen()}
              disabled={resumen.libros.length === 0}
            >
              Copiar resumen
            </Button>
          </div>

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
                <div className={styles.cifras}>
                  <Cifra valor={resumen.personas} etiqueta="Personas" detalle="han propuesto" />
                  <Cifra valor={resumen.libros.length} etiqueta="Libros distintos" />
                  <Cifra
                    valor={resumen.coincidencias}
                    etiqueta="Coincidencias"
                    detalle="propuestos por más de una persona"
                  />
                  <Cifra
                    valor={resumen.libros[0]?.votos ?? 0}
                    etiqueta="Máximo de apoyos"
                    detalle={resumen.libros[0]?.texto ?? 'Sin propuestas'}
                  />
                </div>

                {resumen.repetidos.length > 0 && (
                  <p className={styles.aviso} role="note">
                    {resumen.repetidos.join(', ')}{' '}
                    {resumen.repetidos.length === 1 ? 'ha enviado' : 'han enviado'} el formulario
                    más de una vez: en la clasificación cuentan una sola vez por libro.
                  </p>
                )}

                <section className={styles.bloque} aria-labelledby="mas-propuestos">
                  <div className={styles.bloqueCabecera}>
                    <h3 id="mas-propuestos" className={styles.bloqueTitulo}>
                      Los más propuestos
                    </h3>
                    <p className={styles.ayuda}>
                      Ordenados por personas que los proponen. Puntos: 3 si es su primera opción, 2
                      la segunda y 1 la tercera.
                    </p>
                  </div>
                  <RankingLibros
                    libros={resumen.libros}
                    onAnadir={(libro) =>
                      aLecturas(libro.texto, libro.votos > 1 ? 'proximo' : 'propuesta')
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

            {vista === 'personas' && (
              <ListaProponentes
                propuestas={delPeriodo}
                repetidos={resumen.repetidos}
                guardando={guardando}
                onCambiarEstado={(p, e) => void cambiarEstado(p, e)}
                onAnadir={(texto, p) =>
                  aLecturas(texto, p.estado === 'aceptada' ? 'proximo' : 'propuesta')
                }
              />
            )}

            {vista === 'tintero' && (
              <TinteroPanel sesion={sesion} esAdmin={esAdmin} alCaducar={alCaducar} />
            )}
          </div>
        </>
      )}

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
