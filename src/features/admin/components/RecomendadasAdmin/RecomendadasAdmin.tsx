'use client';

import { useMemo, useState } from 'react';
import { Button, Chip, Select, useToast } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import { listarLecturas, recomendarLectura } from '../../services/api';
import type { LecturaHoja } from '../../types';
import { EstadoCarga } from '../EstadoCarga';
import styles from './RecomendadasAdmin.module.css';

type RecomendadasAdminProps = { sesion: string; alCaducar: () => void };

const esRecomendada = (l: LecturaHoja) => (l.recomendada ?? '').toLowerCase() === 'si';
const candidata = (l: LecturaHoja) =>
  l.visible.toLowerCase() !== 'no' && (l.estado === 'por_clasificar' || l.estado === 'propuesta');
const texto = (l: LecturaHoja) => `${l.titulo}, ${l.autor}`;

/**
 * Lecturas que el club recomienda en el formulario de propuestas (solo administradoras).
 * Se eligen del tintero con un desplegable; aparecen como sugerencias al proponer.
 */
export function RecomendadasAdmin({ sesion, alCaducar }: RecomendadasAdminProps) {
  const toast = useToast();
  const { carga, recargar, fijar } = useCarga(() => listarLecturas(sesion), alCaducar);
  const [elegida, setElegida] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const lecturas = useMemo(() => (carga.tipo === 'lista' ? carga.datos.lecturas : []), [carga]);
  const recomendadas = lecturas.filter(esRecomendada);
  const candidatas = lecturas
    .filter((l) => candidata(l) && !esRecomendada(l))
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));

  async function cambiar(lectura: LecturaHoja, recomendada: boolean) {
    setOcupado(true);
    const r = await recomendarLectura(sesion, lectura.id, recomendada);
    setOcupado(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return;
    }
    fijar({
      lecturas: lecturas.map((l) =>
        l.id === lectura.id ? { ...l, recomendada: recomendada ? 'si' : '' } : l,
      ),
    });
    setElegida('');
    toast.mostrar(
      recomendada
        ? `«${lectura.titulo}» aparece ahora como recomendada al proponer.`
        : `«${lectura.titulo}» ya no está recomendada.`,
      'exito',
    );
  }

  return (
    <section className={styles.tarjeta} aria-labelledby="recomendadas-admin">
      <div className={styles.cabecera}>
        <h3 id="recomendadas-admin" className={styles.titulo}>
          Lecturas recomendadas
        </h3>
        <p className={styles.texto}>
          Salen las primeras en el formulario de propuestas, para proponerlas con un toque.
        </p>
      </div>

      {carga.tipo === 'cargando' && <EstadoCarga tipo="cargando" texto="Cargando lecturas…" />}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}
      {carga.tipo === 'lista' && (
        <>
          {recomendadas.length > 0 ? (
            <ul className={styles.lista} aria-label="Recomendadas ahora">
              {recomendadas.map((l) => (
                <li key={l.id}>
                  <Chip
                    onQuitar={() => void cambiar(l, false)}
                    etiqueta={`Dejar de recomendar ${texto(l)}`}
                  >
                    {texto(l)}
                  </Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.texto}>Todavía no hay ninguna recomendada.</p>
          )}
          <div className={styles.anadir}>
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
              className={styles.select}
            />
            <Button
              icono="anadir"
              variant="secundario"
              disabled={!elegida || ocupado}
              onClick={() => {
                const l = lecturas.find((x) => x.id === elegida);
                if (l) void cambiar(l, true);
              }}
            >
              Recomendar
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
