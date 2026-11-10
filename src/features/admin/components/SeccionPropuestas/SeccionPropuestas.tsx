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
    toast.mostrar(`«${p.titulo}»: ${etiqueta(ESTADOS_PROPUESTA, estado).toLowerCase()}.`, 'exito');
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
                      <h3 className={styles.titulo}>{p.titulo}</h3>
                      <p className={styles.autor}>{p.autor}</p>
                    </div>
                    <Pill variant={VARIANTE[p.estado] ?? 'neutro'}>
                      {etiqueta(ESTADOS_PROPUESTA, p.estado)}
                    </Pill>
                  </div>
                  {p.motivo && <p className={styles.motivo}>{p.motivo}</p>}
                  <p className={styles.meta}>
                    {[p.propuesto_por && `Propuesta de ${p.propuesto_por}`, fechaCorta(p.creado_en)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <div className={styles.acciones}>
                    <Select
                      label={`Estado de «${p.titulo}»`}
                      opciones={ESTADOS_PROPUESTA}
                      value={p.estado}
                      disabled={guardando === p.id}
                      onChange={(e) => void cambiarEstado(p, e.target.value as EstadoPropuesta)}
                      className={styles.estado}
                    />
                    <Button
                      variant="secundario"
                      size="sm"
                      icono="anadir"
                      onClick={() =>
                        setALectura({
                          ...LECTURA_VACIA,
                          titulo: p.titulo,
                          autor: p.autor,
                          google_books_id: p.google_books_id,
                          estado: p.estado === 'aceptada' ? 'proximo' : 'propuesta',
                        })
                      }
                    >
                      Añadir a lecturas
                    </Button>
                  </div>
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
