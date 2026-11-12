'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Button, Chip, Input, Select, useToast } from '@/components/ui';
import { BuscadorLibros } from '@/features/book-search';
import { mensajeDeError } from '@/lib/apps-script';
import { MESES, aniosPosibles, claveSesion } from '@/lib/format';
import { useCarga } from '../../hooks/use-carga';
import {
  guardarRecomendacion,
  listarRecomendaciones,
  quitarRecomendacion,
} from '../../services/api';
import { etiquetaPeriodo } from '../../services/resumen-propuestas';
import type { Recomendacion } from '../../types';
import { EstadoCarga } from '../EstadoCarga';
import styles from './RecomendacionesSesion.module.css';

type RecomendacionesSesionProps = {
  sesion: string;
  esAdmin: boolean;
  alCaducar: () => void;
  /** Sesión que se enseña al abrir («2027-01»); si no hay, el mes que viene. */
  periodoInicial?: string;
  hoy?: Date;
};

const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const texto = (r: Recomendacion) => (r.autor ? `${r.titulo}, ${r.autor}` : r.titulo);

function mesQueViene(hoy: Date): { mes: string; anio: string } {
  const d = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
  return { mes: MESES[d.getMonth()] ?? 'enero', anio: String(d.getFullYear()) };
}

function desdeClave(clave: string | undefined, hoy: Date): { mes: string; anio: string } {
  const [anio, mes] = (clave ?? '').split('-');
  const nombre = MESES[Number(mes) - 1];
  return nombre && anio ? { mes: nombre, anio } : mesQueViene(hoy);
}

/**
 * Recomendaciones del club para una sesión concreta: salen en el formulario de propuestas
 * cuando alguien elige ese mes y año. Las añaden y quitan las administradoras.
 */
export function RecomendacionesSesion({
  sesion,
  esAdmin,
  alCaducar,
  periodoInicial,
  hoy = new Date(),
}: RecomendacionesSesionProps) {
  const toast = useToast();
  const { carga, recargar, fijar } = useCarga(() => listarRecomendaciones(sesion), alCaducar);
  const [eleccion, setEleccion] = useState(() => desdeClave(periodoInicial, hoy));
  const [nuevo, setNuevo] = useState({ titulo: '', autor: '' });
  const [ocupado, setOcupado] = useState(false);

  const clave = claveSesion(eleccion.mes, eleccion.anio);
  const todas = useMemo(() => (carga.tipo === 'lista' ? carga.datos.recomendaciones : []), [carga]);
  const deLaSesion = todas.filter((r) => r.sesion.slice(0, 7) === clave);
  const anios = useMemo(() => {
    const lista = aniosPosibles(hoy);
    return lista.includes(eleccion.anio) ? lista : [eleccion.anio, ...lista];
  }, [hoy, eleccion.anio]);

  function avisarError(r: { error: Parameters<typeof mensajeDeError>[0]; detalle?: string }) {
    if (r.error === 'sesion_no_valida') alCaducar();
    toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
  }

  async function quitar(r: Recomendacion) {
    setOcupado(true);
    const res = await quitarRecomendacion(sesion, r.id);
    setOcupado(false);
    if (!res.ok) return avisarError(res);
    fijar({ recomendaciones: todas.filter((x) => x.id !== r.id) });
    toast.mostrar(`«${r.titulo}» ya no está recomendada para ${etiquetaPeriodo(clave)}.`, 'exito');
  }

  async function anadir(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nuevo.titulo.trim()) {
      toast.mostrar('Escribe al menos el título.', 'error');
      return;
    }
    setOcupado(true);
    const res = await guardarRecomendacion(sesion, { sesion: clave, ...nuevo });
    setOcupado(false);
    if (!res.ok) return avisarError(res);
    fijar({ recomendaciones: [...todas, res.recomendacion] });
    setNuevo({ titulo: '', autor: '' });
    toast.mostrar(
      `«${res.recomendacion.titulo}» sale ya recomendada para ${etiquetaPeriodo(clave)}.`,
      'exito',
    );
  }

  return (
    <section className={styles.tarjeta} aria-labelledby="recomendaciones-titulo">
      <div className={styles.cabecera}>
        <h3 id="recomendaciones-titulo" className={styles.titulo}>
          Recomendadas para una sesión
        </h3>
        <p className={styles.texto}>
          Salen en el formulario de propuestas cuando alguien elige ese mes y año. También se editan
          en la pestaña Recomendaciones de la hoja.
        </p>
      </div>

      <div className={styles.fila}>
        <Select
          label="Mes"
          opciones={MESES.map((m) => ({ value: m, label: capitalizar(m) }))}
          value={eleccion.mes}
          onChange={(e) => setEleccion({ ...eleccion, mes: e.target.value })}
          className={styles.crece}
        />
        <Select
          label="Año"
          opciones={anios.map((a) => ({ value: a, label: a }))}
          value={eleccion.anio}
          onChange={(e) => setEleccion({ ...eleccion, anio: e.target.value })}
          className={styles.crece}
        />
      </div>

      {carga.tipo === 'cargando' && (
        <EstadoCarga tipo="cargando" texto="Cargando las recomendaciones…" />
      )}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}
      {carga.tipo === 'lista' && (
        <>
          <div className={styles.bloque}>
            <h4 className={styles.subtitulo}>{etiquetaPeriodo(clave)}</h4>
            {deLaSesion.length > 0 ? (
              <ul
                className={styles.lista}
                aria-label={`Recomendadas para ${etiquetaPeriodo(clave)}`}
              >
                {deLaSesion.map((r) => (
                  <li key={r.id}>
                    {esAdmin ? (
                      <Chip onQuitar={() => void quitar(r)} etiqueta={`Quitar ${texto(r)}`}>
                        {texto(r)}
                      </Chip>
                    ) : (
                      <Chip>{texto(r)}</Chip>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.texto}>Todavía no hay ninguna para esta sesión.</p>
            )}
          </div>

          {esAdmin && (
            <div className={styles.bloque}>
              <h4 className={styles.subtitulo}>Recomendar una lectura</h4>
              <BuscadorLibros
                onElegir={(l) => setNuevo({ titulo: l.titulo, autor: l.autores.join(', ') })}
              />
              <form className={styles.fila} onSubmit={(e) => void anadir(e)} noValidate>
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
                  Recomendar
                </Button>
              </form>
            </div>
          )}
        </>
      )}
    </section>
  );
}
