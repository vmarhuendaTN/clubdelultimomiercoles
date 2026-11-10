'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Button, Chip, Input, Select, useToast } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import { guardarEnTintero, listarTintero, recomendarTintero } from '../../services/api';
import type { LibroTintero } from '../../types';
import { EstadoCarga } from '../EstadoCarga';
import styles from './TinteroPanel.module.css';

type TinteroPanelProps = { sesion: string; esAdmin: boolean; alCaducar: () => void };

const esRecomendada = (l: LibroTintero) => l.recomendada.toLowerCase() === 'si';
const visible = (l: LibroTintero) => l.visible.toLowerCase() !== 'no';
const texto = (l: LibroTintero) => (l.autor ? `${l.titulo}, ${l.autor}` : l.titulo);

/**
 * Pestaña Tintero de la hoja: lecturas pendientes que salen en el formulario de propuestas.
 * Todo el equipo puede añadir; solo las administradoras recomiendan (salen las primeras).
 */
export function TinteroPanel({ sesion, esAdmin, alCaducar }: TinteroPanelProps) {
  const toast = useToast();
  const { carga, recargar, fijar } = useCarga(() => listarTintero(sesion), alCaducar);
  const [elegida, setElegida] = useState('');
  const [nuevo, setNuevo] = useState({ titulo: '', autor: '' });
  const [ocupado, setOcupado] = useState(false);

  const libros = useMemo(
    () => (carga.tipo === 'lista' ? carga.datos.tintero.filter(visible) : []),
    [carga],
  );
  const recomendadas = libros.filter(esRecomendada);
  const candidatas = libros
    .filter((l) => !esRecomendada(l))
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));

  function avisarError(r: { error: Parameters<typeof mensajeDeError>[0]; detalle?: string }) {
    if (r.error === 'sesion_no_valida') alCaducar();
    toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
  }

  async function recomendar(libro: LibroTintero, recomendada: boolean) {
    setOcupado(true);
    const r = await recomendarTintero(sesion, libro.id, recomendada);
    setOcupado(false);
    if (!r.ok) return avisarError(r);
    const todos = carga.tipo === 'lista' ? carga.datos.tintero : [];
    fijar({
      tintero: todos.map((l) =>
        l.id === libro.id ? { ...l, recomendada: recomendada ? 'si' : '' } : l,
      ),
    });
    setElegida('');
    toast.mostrar(
      recomendada
        ? `«${libro.titulo}» aparece ahora como recomendada al proponer.`
        : `«${libro.titulo}» ya no está recomendada.`,
      'exito',
    );
  }

  async function anadir(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nuevo.titulo.trim() || !nuevo.autor.trim()) {
      toast.mostrar('Escribe el título y el autor.', 'error');
      return;
    }
    setOcupado(true);
    const r = await guardarEnTintero(sesion, nuevo);
    setOcupado(false);
    if (!r.ok) return avisarError(r);
    const todos = carga.tipo === 'lista' ? carga.datos.tintero : [];
    fijar({ tintero: [...todos, r.libro] });
    setNuevo({ titulo: '', autor: '' });
    toast.mostrar(`«${r.libro.titulo}» está ya en el tintero.`, 'exito');
  }

  return (
    <section className={styles.tarjeta} aria-labelledby="tintero-titulo">
      <div className={styles.cabecera}>
        <h3 id="tintero-titulo" className={styles.titulo}>
          Tintero
        </h3>
        <p className={styles.texto}>
          Las lecturas pendientes que salen en el formulario de propuestas. También se editan en la
          pestaña Tintero de la hoja.
        </p>
      </div>

      {carga.tipo === 'cargando' && <EstadoCarga tipo="cargando" texto="Cargando el tintero…" />}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}
      {carga.tipo === 'lista' && (
        <>
          <p className={styles.recuento}>
            {libros.length === 1
              ? '1 lectura en el tintero'
              : `${libros.length} lecturas en el tintero`}
          </p>

          <div className={styles.bloque}>
            <h4 className={styles.subtitulo}>Recomendadas por el club</h4>
            {recomendadas.length > 0 ? (
              <ul className={styles.lista} aria-label="Recomendadas ahora">
                {recomendadas.map((l) => (
                  <li key={l.id}>
                    {esAdmin ? (
                      <Chip
                        onQuitar={() => void recomendar(l, false)}
                        etiqueta={`Dejar de recomendar ${texto(l)}`}
                      >
                        {texto(l)}
                      </Chip>
                    ) : (
                      <Chip>{texto(l)}</Chip>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.texto}>Todavía no hay ninguna recomendada.</p>
            )}
            {esAdmin && (
              <div className={styles.fila}>
                <Select
                  label="Recomendar una lectura del tintero"
                  opciones={[
                    {
                      value: '',
                      label: candidatas.length ? 'Elige una lectura…' : 'No hay más lecturas',
                    },
                    ...candidatas.map((l) => ({ value: l.id, label: texto(l) })),
                  ]}
                  value={elegida}
                  onChange={(e) => setElegida(e.target.value)}
                  disabled={candidatas.length === 0}
                  className={styles.crece}
                />
                <Button
                  icono="anadir"
                  variant="secundario"
                  disabled={!elegida || ocupado}
                  onClick={() => {
                    const l = libros.find((x) => x.id === elegida);
                    if (l) void recomendar(l, true);
                  }}
                >
                  Recomendar
                </Button>
              </div>
            )}
          </div>

          <form className={styles.bloque} onSubmit={(e) => void anadir(e)} noValidate>
            <h4 className={styles.subtitulo}>Añadir al tintero</h4>
            <div className={styles.fila}>
              <Input
                label="Título"
                value={nuevo.titulo}
                onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
                className={styles.crece}
              />
              <Input
                label="Autor o autora"
                value={nuevo.autor}
                onChange={(e) => setNuevo({ ...nuevo, autor: e.target.value })}
                className={styles.crece}
              />
              <Button type="submit" icono="anadir" variant="secundario" disabled={ocupado}>
                Añadir
              </Button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
