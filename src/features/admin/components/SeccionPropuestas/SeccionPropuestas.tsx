'use client';

import { useMemo, useState } from 'react';
import { Button, Pill, Select, useToast } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import { guardarPropuesta, listarPropuestas, type LecturaNueva } from '../../services/api';
import { ESTADOS_PROPUESTA, etiqueta, fechaCorta } from '../../services/etiquetas';
import type { EstadoPropuesta, Propuesta } from '../../types';
import { EditorLectura } from '../EditorLectura';
import { EstadoCarga } from '../EstadoCarga';
import { LECTURA_VACIA } from '../FormularioLectura';
import styles from './SeccionPropuestas.module.css';

type SeccionPropuestasProps = { sesion: string; alCaducar: () => void };

const FILTROS = [{ value: 'todas', label: 'Todas' }, ...ESTADOS_PROPUESTA] as const;

const lecturasDe = (p: Propuesta) =>
  [p.lectura_1, p.lectura_2, p.lectura_3].map((l) => l.trim()).filter(Boolean);
const nombreDe = (p: Propuesta) => [p.nombre, p.apellidos].filter(Boolean).join(' ');

const VARIANTE: Record<string, 'mostaza' | 'acento' | 'neutro'> = {
  nueva: 'mostaza',
  en_votacion: 'acento',
};

/** Propuestas que llegan del formulario de la web: revisar, cambiar estado y pasar a lecturas. */
export function SeccionPropuestas({ sesion, alCaducar }: SeccionPropuestasProps) {
  const toast = useToast();
  const { carga, recargar, fijar } = useCarga(() => listarPropuestas(sesion), alCaducar);
  const [filtro, setFiltro] = useState('todas');
  const [guardando, setGuardando] = useState<string | null>(null);
  const [aLectura, setALectura] = useState<LecturaNueva | null>(null);

  const todas = useMemo(() => (carga.tipo === 'lista' ? carga.datos.propuestas : []), [carga]);
  const visibles = filtro === 'todas' ? todas : todas.filter((p) => p.estado === filtro);

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
      `Propuesta de ${nombreDe(p)}: ${etiqueta(ESTADOS_PROPUESTA, estado).toLowerCase()}.`,
      'exito',
    );
  }

  return (
    <div className={styles.seccion}>
      <Select
        label="Mostrar"
        opciones={FILTROS}
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className={styles.filtro}
      />

      {carga.tipo === 'cargando' && <EstadoCarga tipo="cargando" texto="Cargando propuestas…" />}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}
      {carga.tipo === 'lista' && (
        <>
          <p className={styles.recuento} aria-live="polite">
            {visibles.length === 1 ? '1 propuesta' : `${visibles.length} propuestas`}
          </p>
          {visibles.length === 0 ? (
            <p className={styles.vacio}>
              {todas.length === 0
                ? 'Todavía no ha llegado ninguna propuesta desde la web.'
                : 'No hay propuestas con este estado.'}
            </p>
          ) : (
            <ul className={styles.lista}>
              {visibles.map((p) => (
                <li key={p.id} className={styles.tarjeta}>
                  <div className={styles.cabecera}>
                    <div>
                      <h3 className={styles.titulo}>{nombreDe(p)}</h3>
                      <p className={styles.autor}>
                        {[p.grupo && `Grupo ${p.grupo}`, p.mes && `para ${p.mes} de ${p.anio}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <Pill variant={VARIANTE[p.estado] ?? 'neutro'}>
                      {etiqueta(ESTADOS_PROPUESTA, p.estado)}
                    </Pill>
                  </div>
                  <ol className={styles.lecturas} aria-label={`Lecturas de ${nombreDe(p)}`}>
                    {lecturasDe(p).map((lectura) => (
                      <li key={lectura} className={styles.lectura}>
                        <span>{lectura}</span>
                        <Button
                          variant="sencillo"
                          size="sm"
                          icono="anadir"
                          aria-label={`Añadir «${lectura}» a lecturas`}
                          onClick={() =>
                            setALectura({
                              ...LECTURA_VACIA,
                              titulo: lectura,
                              estado: p.estado === 'aceptada' ? 'proximo' : 'propuesta',
                            })
                          }
                        >
                          Añadir
                        </Button>
                      </li>
                    ))}
                  </ol>
                  {p.tintero && (
                    <p className={styles.motivo}>
                      <strong>En el tintero:</strong> {p.tintero}
                    </p>
                  )}
                  {p.motivo && <p className={styles.motivo}>{p.motivo}</p>}
                  <p className={styles.meta}>Enviada el {fechaCorta(p.creado_en)}</p>
                  <Select
                    label={`Estado de la propuesta de ${nombreDe(p)}`}
                    opciones={ESTADOS_PROPUESTA}
                    value={p.estado}
                    disabled={guardando === p.id}
                    onChange={(e) => void cambiarEstado(p, e.target.value as EstadoPropuesta)}
                    className={styles.estado}
                  />
                </li>
              ))}
            </ul>
          )}
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
