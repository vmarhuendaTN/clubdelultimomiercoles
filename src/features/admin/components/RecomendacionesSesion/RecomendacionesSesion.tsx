'use client';

import { useMemo, useState } from 'react';
import { Button, Select, useToast } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { MESES, aniosPosibles, claveSesion, lineaDetalles } from '@/lib/format';
import { useCarga } from '../../hooks/use-carga';
import {
  guardarNotaSesion,
  guardarRecomendacion,
  listarRecomendaciones,
  quitarRecomendacion,
} from '../../services/api';
import { etiquetaPeriodo } from '../../services/resumen-propuestas';
import type { LibroConDetalles, Recomendacion } from '../../types';
import { EditorLibroDetalles } from '../EditorLibroDetalles';
import { EstadoCarga } from '../EstadoCarga';
import { NotaSesionEditor } from '../NotaSesionEditor';
import { PegarMensaje } from '../PegarMensaje';
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
  const [editando, setEditando] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const clave = claveSesion(eleccion.mes, eleccion.anio);
  const todas = useMemo(() => (carga.tipo === 'lista' ? carga.datos.recomendaciones : []), [carga]);
  const notas = carga.tipo === 'lista' ? (carga.datos.notas ?? {}) : {};
  const nota = notas[clave] ?? '';
  const etiqueta = etiquetaPeriodo(clave);
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
    fijar({ recomendaciones: todas.filter((x) => x.id !== r.id), notas });
    toast.mostrar(`«${r.titulo}» ya no está recomendada para ${etiqueta}.`, 'exito');
  }

  /** Guarda una recomendación nueva (o la corrige, con id) y devuelve la guardada. */
  async function guardarUna(libro: LibroConDetalles, id?: string) {
    const res = await guardarRecomendacion(sesion, { ...libro, sesion: clave, id });
    if (!res.ok) {
      avisarError(res);
      return null;
    }
    return res.recomendacion;
  }

  async function guardar(libro: LibroConDetalles, id?: string): Promise<boolean> {
    setOcupado(true);
    const guardada = await guardarUna(libro, id);
    setOcupado(false);
    if (!guardada) return false;
    fijar({
      recomendaciones: id ? todas.map((x) => (x.id === id ? guardada : x)) : [...todas, guardada],
      notas,
    });
    setEditando(null);
    toast.mostrar(
      id
        ? `«${guardada.titulo}» actualizada.`
        : `«${guardada.titulo}» sale ya recomendada para ${etiqueta}.`,
      'exito',
    );
    return true;
  }

  async function guardarNota(texto: string): Promise<boolean> {
    const res = await guardarNotaSesion(sesion, { sesion: clave, nota: texto });
    if (!res.ok) {
      avisarError(res);
      return false;
    }
    return true;
  }

  async function importar(libros: LibroConDetalles[], notasMensaje: string): Promise<boolean> {
    setOcupado(true);
    const nuevas: Recomendacion[] = [];
    for (const libro of libros) {
      const guardada = await guardarUna(libro);
      if (!guardada) break;
      nuevas.push(guardada);
    }
    const notaFinal = [nota, notasMensaje].filter((t) => t.trim()).join('\n\n');
    const notaOk =
      notasMensaje && nuevas.length === libros.length ? await guardarNota(notaFinal) : true;
    setOcupado(false);
    fijar({
      recomendaciones: [...todas, ...nuevas],
      notas: notasMensaje && notaOk ? { ...notas, [clave]: notaFinal } : notas,
    });
    if (nuevas.length === libros.length) {
      toast.mostrar(
        `${nuevas.length === 1 ? '1 lectura recomendada' : `${nuevas.length} lecturas recomendadas`} para ${etiqueta}.`,
        'exito',
      );
      return true;
    }
    return false;
  }

  async function cambiarNota(texto: string) {
    setOcupado(true);
    const ok = await guardarNota(texto);
    setOcupado(false);
    if (!ok) return;
    fijar({ recomendaciones: todas, notas: { ...notas, [clave]: texto } });
    toast.mostrar(
      texto ? `Notas de ${etiqueta} guardadas.` : `Notas de ${etiqueta} borradas.`,
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
            <h4 className={styles.subtitulo}>{etiqueta}</h4>
            {deLaSesion.length > 0 ? (
              <ul className={styles.libros} aria-label={`Recomendadas para ${etiqueta}`}>
                {deLaSesion.map((r) => (
                  <li key={r.id} className={styles.libro}>
                    <div className={styles.libroCabecera}>
                      <p className={styles.libroNombre}>
                        <strong>{r.titulo}</strong>
                        {r.autor && `, ${r.autor}`}
                      </p>
                      {esAdmin && editando !== r.id && (
                        <div className={styles.acciones}>
                          <Button
                            size="sm"
                            variant="sencillo"
                            icono="editar"
                            disabled={ocupado}
                            onClick={() => setEditando(r.id)}
                            aria-label={`Editar ${texto(r)}`}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="sencillo"
                            disabled={ocupado}
                            onClick={() => void quitar(r)}
                            aria-label={`Quitar ${texto(r)}`}
                          >
                            Quitar
                          </Button>
                        </div>
                      )}
                    </div>
                    {lineaDetalles(r) && <p className={styles.texto}>{lineaDetalles(r)}</p>}
                    {r.sinopsis && <p className={styles.sinopsis}>{r.sinopsis}</p>}
                    {r.nota && <p className={styles.texto}>Nota: {r.nota}</p>}
                    {editando === r.id && (
                      <EditorLibroDetalles
                        inicial={r}
                        textoBoton="Guardar cambios"
                        ocupado={ocupado}
                        onGuardar={(libro) => guardar(libro, r.id)}
                        onCancelar={() => setEditando(null)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.texto}>Todavía no hay ninguna para esta sesión.</p>
            )}
          </div>

          {(esAdmin || nota) && (
            <div className={styles.bloque}>
              <h4 className={styles.subtitulo}>Notas de la sesión</h4>
              <NotaSesionEditor
                etiqueta={etiqueta}
                nota={nota}
                esAdmin={esAdmin}
                ocupado={ocupado}
                onGuardar={(t) => void cambiarNota(t)}
              />
            </div>
          )}

          {esAdmin && (
            <>
              <div className={styles.bloque}>
                <h4 className={styles.subtitulo}>Recomendar una lectura</h4>
                <EditorLibroDetalles
                  textoBoton="Recomendar"
                  ocupado={ocupado}
                  onGuardar={(libro) => guardar(libro)}
                />
              </div>
              <div className={styles.bloque}>
                <h4 className={styles.subtitulo}>O pega el mensaje de WhatsApp</h4>
                <PegarMensaje
                  textoBoton="Recomendar todas"
                  ocupado={ocupado}
                  onImportar={importar}
                />
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
