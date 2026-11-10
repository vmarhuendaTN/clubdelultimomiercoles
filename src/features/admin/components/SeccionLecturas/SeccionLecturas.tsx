'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Button, Icon, Pill, SearchField, Select } from '@/components/ui';
import { useCarga } from '../../hooks/use-carga';
import { listarLecturas, type LecturaNueva } from '../../services/api';
import { ESTADOS_LECTURA, etiqueta, fechaCorta, normalizar } from '../../services/etiquetas';
import type { LecturaHoja } from '../../types';
import { EditorLectura } from '../EditorLectura';
import { LECTURA_VACIA } from '../FormularioLectura';
import { EstadoCarga } from '../EstadoCarga';
import styles from './SeccionLecturas.module.css';

type SeccionLecturasProps = { sesion: string; alCaducar: () => void };

const FILTROS = [
  { value: 'todas', label: 'Todas' },
  ...ESTADOS_LECTURA,
  { value: 'ocultas', label: 'Ocultas' },
] as const;

const PESO: Record<string, number> = { proximo: 0, por_clasificar: 1, propuesta: 2, leido: 3 };

/** Próxima primero; después, los leídos del más reciente al más antiguo. */
function ordenar(a: LecturaHoja, b: LecturaHoja): number {
  const peso = (PESO[a.estado] ?? 9) - (PESO[b.estado] ?? 9);
  if (peso) return peso;
  if (a.fecha_sesion !== b.fecha_sesion) return b.fecha_sesion.localeCompare(a.fecha_sesion);
  return Number(b.orden || 0) - Number(a.orden || 0);
}

function portadaDe(l: LecturaHoja): string {
  if (l.portada_manual) return l.portada_manual;
  if (l.google_books_id) {
    return `https://books.google.com/books/content?id=${encodeURIComponent(l.google_books_id)}&printsec=frontcover&img=1&zoom=1`;
  }
  return '';
}

const oculta = (l: LecturaHoja) => l.visible.trim().toLowerCase() === 'no';

/** Lecturas de la hoja: buscar, filtrar, crear y editar. */
export function SeccionLecturas({ sesion, alCaducar }: SeccionLecturasProps) {
  const { carga, recargar, fijar } = useCarga(() => listarLecturas(sesion), alCaducar);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<string>('todas');
  const [editando, setEditando] = useState<LecturaNueva | null>(null);

  const todas = useMemo(
    () => (carga.tipo === 'lista' ? [...carga.datos.lecturas].sort(ordenar) : []),
    [carga],
  );
  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return todas.filter((l) => {
      if (filtro === 'ocultas' ? !oculta(l) : filtro !== 'todas' && l.estado !== filtro)
        return false;
      return !q || normalizar(`${l.titulo} ${l.autor}`).includes(q);
    });
  }, [todas, busqueda, filtro]);

  function alGuardar(guardada: LecturaHoja) {
    const otras = todas.filter((l) => l.id !== guardada.id);
    fijar({ lecturas: [...otras, guardada] });
    setEditando(null);
  }

  return (
    <div className={styles.seccion}>
      <div className={styles.barra}>
        <SearchField
          label="Buscar lecturas"
          placeholder="Buscar por título o autor"
          value={busqueda}
          onChange={setBusqueda}
        />
        <Select
          label="Mostrar"
          etiquetaOculta
          opciones={FILTROS}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <Button icono="anadir" onClick={() => setEditando({ ...LECTURA_VACIA })}>
          Añadir lectura
        </Button>
      </div>

      {carga.tipo === 'cargando' && <EstadoCarga tipo="cargando" texto="Cargando lecturas…" />}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}
      {carga.tipo === 'lista' && (
        <>
          <p className={styles.recuento} aria-live="polite">
            {visibles.length === 1 ? '1 lectura' : `${visibles.length} lecturas`}
          </p>
          {visibles.length === 0 ? (
            <p className={styles.vacio}>
              {todas.length === 0
                ? 'La hoja todavía no tiene lecturas. Añade la primera.'
                : 'Ninguna lectura coincide.'}
            </p>
          ) : (
            <ul className={styles.lista}>
              {visibles.map((l) => {
                const portada = portadaDe(l);
                const fecha = fechaCorta(l.fecha_sesion);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      className={styles.fila}
                      onClick={() => setEditando(l)}
                      aria-label={`Editar «${l.titulo}», de ${l.autor}`}
                    >
                      {portada ? (
                        <Image
                          src={portada}
                          alt=""
                          width={48}
                          height={72}
                          className={styles.portada}
                        />
                      ) : (
                        <span className={styles.portada} aria-hidden="true">
                          <Icon name="libro" size="sm" />
                        </span>
                      )}
                      <span className={styles.datos}>
                        <span className={styles.titulo}>{l.titulo}</span>
                        <span className={styles.autor}>{l.autor}</span>
                        <span className={styles.etiquetas}>
                          <Pill variant={l.estado === 'proximo' ? 'mostaza' : 'neutro'}>
                            {etiqueta(ESTADOS_LECTURA, l.estado)}
                          </Pill>
                          {fecha && <span className={styles.fecha}>{fecha}</span>}
                          {oculta(l) && <Pill variant="acento">Oculta</Pill>}
                          {l.revisar && <Pill variant="acento">Revisar</Pill>}
                        </span>
                      </span>
                      <Icon name="editar" size="sm" className={styles.icono} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <EditorLectura
        lectura={editando}
        sesion={sesion}
        onCerrar={() => setEditando(null)}
        onGuardada={alGuardar}
        alCaducar={alCaducar}
      />
    </div>
  );
}
