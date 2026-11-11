'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Button,
  Cifra,
  Input,
  SegmentedControl,
  Select,
  useToast,
  type Segment,
} from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import { guardarValoraciones, listarValoraciones } from '../../services/api';
import { estaActiva, nombreCompleto } from '../../services/inscritas';
import {
  formatoNota,
  lecturasOrdenadas,
  mediaBorrador,
  notaValida,
  notasDeLectura,
  porLibro,
  porPersona,
} from '../../services/valoraciones';
import { EstadoCarga } from '../EstadoCarga';
import styles from './SeccionValoraciones.module.css';

type SeccionValoracionesProps = { sesion: string; alCaducar: () => void };

type Vista = 'apuntar' | 'libros' | 'personas';
const VISTAS: Segment<Vista>[] = [
  { value: 'apuntar', label: 'Apuntar notas' },
  { value: 'libros', label: 'Por libro' },
  { value: 'personas', label: 'Por persona' },
];

const valoraciones = (n: number) => `${n} ${n === 1 ? 'valoración' : 'valoraciones'}`;

/**
 * Valoraciones del club: las notas (0 a 10) que cada persona da a la lectura al final de la
 * sesión. Se apuntan aquí y se ven las medias por libro y por persona (también en la hoja).
 */
export function SeccionValoraciones({ sesion, alCaducar }: SeccionValoracionesProps) {
  const toast = useToast();
  const { carga, recargar } = useCarga(() => listarValoraciones(sesion), alCaducar);
  const [vista, setVista] = useState<Vista>('apuntar');
  const [lecturaId, setLecturaId] = useState('');
  const [borrador, setBorrador] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);

  const datos = carga.tipo === 'lista' ? carga.datos : null;
  const lecturas = useMemo(() => lecturasOrdenadas(datos?.lecturas ?? []), [datos]);
  const elegida = lecturaId || lecturas[0]?.id || '';

  // Al cambiar de lectura (o al recargar), el formulario muestra lo guardado.
  useEffect(() => {
    if (datos && elegida) setBorrador(notasDeLectura(datos.valoraciones, elegida));
  }, [datos, elegida]);

  if (carga.tipo === 'cargando')
    return <EstadoCarga tipo="cargando" texto="Cargando valoraciones…" />;
  if (carga.tipo === 'error')
    return <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />;

  const { inscritas } = carga.datos;
  const guardadas = notasDeLectura(carga.datos.valoraciones, elegida);
  // Las activas y, si ya tenían nota en esta lectura, también las que están de baja.
  const personas = inscritas
    .filter((i) => estaActiva(i) || guardadas[i.id])
    .sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b), 'es'));
  const actual = mediaBorrador(borrador);
  const errores = Object.entries(borrador).filter(([, n]) => !notaValida(n));

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (errores.length || !elegida) return;
    const cambios = personas
      .map((p) => ({ inscrita_id: p.id, nota: (borrador[p.id] ?? '').trim() }))
      .filter((n) => n.nota !== (guardadas[n.inscrita_id] ?? ''));
    if (cambios.length === 0) {
      toast.mostrar('No hay cambios que guardar.', 'info');
      return;
    }
    setOcupado(true);
    const r = await guardarValoraciones(sesion, { lectura_id: elegida, notas: cambios });
    setOcupado(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return;
    }
    toast.mostrar(
      actual.n
        ? `Notas guardadas: media ${formatoNota(actual.media)} con ${valoraciones(actual.n)}.`
        : 'Notas guardadas.',
      'exito',
    );
    await recargar();
  }

  const libros = porLibro(carga.datos.valoraciones, carga.datos.lecturas);
  const porPersonas = porPersona(carga.datos.valoraciones, inscritas);

  return (
    <div className={styles.seccion}>
      <SegmentedControl
        id="valoraciones"
        label="Vistas de valoraciones"
        segments={VISTAS}
        value={vista}
        onChange={setVista}
      />
      <div
        id="valoraciones-panel"
        role="tabpanel"
        aria-labelledby={`valoraciones-tab-${vista}`}
        className={styles.panel}
      >
        {vista === 'apuntar' &&
          (lecturas.length === 0 ? (
            <p className={styles.vacio}>Aún no hay lecturas leídas en la hoja.</p>
          ) : personas.length === 0 ? (
            <p className={styles.vacio}>
              Primero añade a las personas del club en «Inscritas»: las notas se apuntan a cada una.
            </p>
          ) : (
            <form className={styles.formulario} onSubmit={(e) => void guardar(e)} noValidate>
              <p className={styles.intro}>
                Apunta la nota de 0 a 10 que cada persona da a la lectura al final de la sesión (por
                ejemplo, 7,5). Deja vacío a quien no valoró; si borras una nota, se quita.
              </p>
              <Select
                label="Lectura"
                opciones={lecturas.map((l) => ({
                  value: l.id,
                  label: `${l.titulo}${l.estado === 'proximo' ? ' (próxima)' : ''}`,
                }))}
                value={elegida}
                onChange={(e) => setLecturaId(e.target.value)}
              />
              <div className={styles.cifras}>
                <Cifra
                  valor={actual.n ? formatoNota(actual.media) : '—'}
                  etiqueta="Media"
                  detalle={valoraciones(actual.n)}
                />
              </div>
              <div className={styles.notas}>
                {personas.map((p) => {
                  const nota = borrador[p.id] ?? '';
                  return (
                    <Input
                      key={p.id}
                      label={nombreCompleto(p)}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="—"
                      value={nota}
                      onChange={(e) => setBorrador((b) => ({ ...b, [p.id]: e.target.value }))}
                      error={notaValida(nota) ? undefined : 'De 0 a 10'}
                    />
                  );
                })}
              </div>
              <div>
                <Button type="submit" icono="exito" disabled={ocupado || errores.length > 0}>
                  Guardar notas
                </Button>
              </div>
            </form>
          ))}

        {vista === 'libros' &&
          (libros.length === 0 ? (
            <p className={styles.vacio}>Todavía no hay valoraciones apuntadas.</p>
          ) : (
            <ul className={styles.lista} aria-label="Valoraciones por libro">
              {libros.map((l) => (
                <li key={l.lectura.id} className={styles.tarjeta}>
                  <div className={styles.cabecera}>
                    <div>
                      <h3 className={styles.titulo}>{l.lectura.titulo}</h3>
                      <p className={styles.meta}>
                        {[l.lectura.autor, valoraciones(l.n)].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <p className={styles.media} aria-label={`Media ${formatoNota(l.media)}`}>
                      {formatoNota(l.media)}
                    </p>
                  </div>
                  <ul className={styles.detalle}>
                    {l.notas.map((n) => (
                      <li key={n.inscritaId}>
                        {n.nombre} <strong>{n.nota}</strong>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ))}

        {vista === 'personas' &&
          (porPersonas.length === 0 ? (
            <p className={styles.vacio}>Todavía no hay valoraciones apuntadas.</p>
          ) : (
            <ul className={styles.lista} aria-label="Valoraciones por persona">
              {porPersonas.map((p) => (
                <li key={p.inscrita.id} className={styles.tarjeta}>
                  <div className={styles.cabecera}>
                    <div>
                      <h3 className={styles.titulo}>{nombreCompleto(p.inscrita)}</h3>
                      <p className={styles.meta}>{valoraciones(p.n)}</p>
                    </div>
                    <p className={styles.media} aria-label={`Media ${formatoNota(p.media)}`}>
                      {formatoNota(p.media)}
                    </p>
                  </div>
                  <ul className={styles.detalle}>
                    {p.notas.map((n) => (
                      <li key={n.lecturaId}>
                        {n.titulo} <strong>{n.nota}</strong>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
}
