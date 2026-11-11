'use client';

import { useState } from 'react';
import { Button, Pill, Select } from '@/components/ui';
import { ESTADOS_PROPUESTA, etiqueta, fechaCorta } from '../../services/etiquetas';
import { etiquetaPeriodo, clavePeriodo, nombreCompleto } from '../../services/resumen-propuestas';
import type { EstadoPropuesta, Propuesta } from '../../types';
import styles from './ListaProponentes.module.css';

type ListaProponentesProps = {
  propuestas: Propuesta[];
  /** Nombres de quien envió más de una vez en la sesión. */
  repetidos: string[];
  guardando: string | null;
  onCambiarEstado: (p: Propuesta, estado: EstadoPropuesta) => void;
  onAnadir: (texto: string, p: Propuesta) => void;
  /** Borra una propuesta enviada por error (pide confirmación fuera). */
  onEliminar?: (p: Propuesta) => void;
};

const FILTROS = [{ value: 'todas', label: 'Todos los estados' }, ...ESTADOS_PROPUESTA] as const;
const VARIANTE: Record<string, 'mostaza' | 'acento' | 'neutro'> = {
  nueva: 'mostaza',
  en_votacion: 'acento',
};
const lecturasDe = (p: Propuesta) =>
  [p.lectura_1, p.lectura_2, p.lectura_3].map((l) => l.trim()).filter(Boolean);

/** Quién ha propuesto qué: una tarjeta por envío, con su estado y sus tres lecturas. */
export function ListaProponentes({
  propuestas,
  repetidos,
  guardando,
  onCambiarEstado,
  onAnadir,
  onEliminar,
}: ListaProponentesProps) {
  const [filtro, setFiltro] = useState('todas');
  const visibles = filtro === 'todas' ? propuestas : propuestas.filter((p) => p.estado === filtro);

  return (
    <div className={styles.seccion}>
      <div className={styles.barra}>
        <p className={styles.recuento} aria-live="polite">
          {visibles.length === 1 ? '1 propuesta' : `${visibles.length} propuestas`}
        </p>
        <Select
          label="Filtrar por estado"
          etiquetaOculta
          opciones={FILTROS}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className={styles.filtro}
        />
      </div>

      {visibles.length === 0 ? (
        <p className={styles.vacio}>
          {propuestas.length === 0
            ? 'Todavía no ha llegado ninguna propuesta para esta sesión.'
            : 'No hay propuestas con este estado.'}
        </p>
      ) : (
        <ul className={styles.lista}>
          {visibles.map((p) => {
            const nombre = nombreCompleto(p);
            const sesion = clavePeriodo(p);
            return (
              <li key={p.id} className={styles.tarjeta}>
                <div className={styles.cabecera}>
                  <div>
                    <h3 className={styles.titulo}>{nombre}</h3>
                    <p className={styles.meta}>
                      {[
                        p.grupo && `Grupo ${p.grupo}`,
                        sesion && `para ${etiquetaPeriodo(sesion).toLowerCase()}`,
                        fechaCorta(p.creado_en) && `enviada el ${fechaCorta(p.creado_en)}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className={styles.etiquetas}>
                    {repetidos.includes(nombre) && <Pill variant="acento">Envió varias</Pill>}
                    <Pill variant={VARIANTE[p.estado] ?? 'neutro'}>
                      {etiqueta(ESTADOS_PROPUESTA, p.estado)}
                    </Pill>
                  </div>
                </div>
                <ol className={styles.lecturas} aria-label={`Lecturas de ${nombre}`}>
                  {lecturasDe(p).map((lectura, i) => (
                    <li key={`${i}-${lectura}`} className={styles.lectura}>
                      <span>
                        <span className={styles.numero}>{i + 1}.</span> {lectura}
                      </span>
                      <Button
                        variant="sencillo"
                        size="sm"
                        icono="anadir"
                        aria-label={`Añadir «${lectura}» a lecturas`}
                        onClick={() => onAnadir(lectura, p)}
                      >
                        Añadir
                      </Button>
                    </li>
                  ))}
                </ol>
                {p.tintero && (
                  <p className={styles.texto}>
                    <strong>En el tintero:</strong> {p.tintero.split(';').join(' · ')}
                  </p>
                )}
                {p.motivo && <p className={styles.texto}>{p.motivo}</p>}
                <div className={styles.pie}>
                  <Select
                    label={`Estado de la propuesta de ${nombre}`}
                    opciones={ESTADOS_PROPUESTA}
                    value={p.estado}
                    disabled={guardando === p.id}
                    onChange={(e) => onCambiarEstado(p, e.target.value as EstadoPropuesta)}
                    className={styles.estado}
                  />
                  {onEliminar && (
                    <Button
                      variant="sencillo"
                      size="sm"
                      icono="cerrar"
                      onClick={() => onEliminar(p)}
                      aria-label={`Eliminar la propuesta de ${nombre}`}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
