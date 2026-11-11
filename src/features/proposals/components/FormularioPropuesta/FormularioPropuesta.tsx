'use client';

import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Button, Input, Select, TextArea } from '@/components/ui';
import { site } from '@/config/site';
import type { EstadoOpciones } from '../../hooks/use-opciones-propuesta';
import type { DatosPropuesta } from '../../services/enviar-propuesta';
import { textoLibro, yaElegido, type LibroOpcion } from '../../services/opciones';
import { MESES, aniosPosibles } from '../../services/periodo';
import { Recomendadas } from '../Recomendadas';
import { SelectorTintero } from '../SelectorTintero';
import styles from './FormularioPropuesta.module.css';

const VACIA: DatosPropuesta = {
  nombre: '',
  apellidos: '',
  grupo: '',
  mes: '',
  anio: '',
  lectura_1: '',
  lectura_2: '',
  lectura_3: '',
  tintero: '',
  motivo: '',
};

type Campo = keyof DatosPropuesta;
type Errores = Partial<Record<Campo, string>>;

const OBLIGATORIOS: Record<Exclude<Campo, 'tintero' | 'motivo'>, string> = {
  nombre: 'Escribe tu nombre.',
  apellidos: 'Escribe tus apellidos.',
  grupo: 'Dinos de qué club eres.',
  mes: 'Elige el mes.',
  anio: 'Elige el año.',
  lectura_1: 'Escribe tu primera lectura.',
  lectura_2: 'Escribe tu segunda lectura.',
  lectura_3: 'Escribe tu tercera lectura.',
};

const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const conVacia = (opciones: { value: string; label: string }[]) => [
  { value: '', label: 'Elige…' },
  ...opciones,
];

const LECTURAS = ['lectura_1', 'lectura_2', 'lectura_3'] as const;

type FormularioPropuestaProps = {
  /** Recomendadas y tintero de la hoja. Si no se cargan, el formulario funciona igual. */
  opciones?: EstadoOpciones;
  onEnviar: (datos: DatosPropuesta) => void;
  enviando: boolean;
  /** Error al enviar (red, código…), se anuncia encima del botón. */
  error?: string;
};

function Grupo({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className={styles.grupo}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}

/** Las mismas preguntas que el antiguo Google Form de propuestas, con el aspecto de la web. */
export function FormularioPropuesta({
  opciones = { tipo: 'sin_opciones' },
  onEnviar,
  enviando,
  error,
}: FormularioPropuestaProps) {
  const [datos, setDatos] = useState<DatosPropuesta>(VACIA);
  const [tintero, setTintero] = useState<LibroOpcion[]>([]);
  const [errores, setErrores] = useState<Errores>({});
  const sugerenciasId = useId();

  const recomendadas = opciones.tipo === 'listas' ? opciones.opciones.recomendadas : [];
  const delTintero = opciones.tipo === 'listas' ? opciones.opciones.tintero : [];
  const escritas = LECTURAS.map((c) => datos[c]).filter((t) => t.trim());
  const libre = LECTURAS.find((c) => !datos[c].trim());
  const recomendadasLibres = recomendadas.filter((l) => !yaElegido(l, escritas));
  const tinteroDisponible = delTintero.filter(
    (l) => !tintero.some((t) => t.id === l.id) && !yaElegido(l, escritas),
  );
  const sugerencias = [...recomendadasLibres, ...tinteroDisponible];

  function proponer(libro: LibroOpcion) {
    if (!libre) return;
    setDatos((d) => ({ ...d, [libre]: textoLibro(libro) }));
    setErrores((er) => ({ ...er, [libre]: undefined }));
  }
  const meses = useMemo(
    () => conVacia(MESES.map((m) => ({ value: m, label: capitalizar(m) }))),
    [],
  );
  const anios = useMemo(() => conVacia(aniosPosibles().map((a) => ({ value: a, label: a }))), []);
  const grupos = site.gruposClub;

  const campo = (nombre: Campo) => ({
    value: datos[nombre],
    error: errores[nombre],
    onChange: (e: { target: { value: string } }) => {
      setDatos((d) => ({ ...d, [nombre]: e.target.value }));
      setErrores((er) => ({ ...er, [nombre]: undefined }));
    },
  });

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevos: Errores = {};
    for (const [nombre, mensaje] of Object.entries(OBLIGATORIOS)) {
      if (!datos[nombre as Campo].trim()) nuevos[nombre as Campo] = mensaje;
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0) {
      onEnviar({ ...datos, tintero: tintero.map(textoLibro).join('; ') });
    }
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <Grupo legend="Sobre ti">
        <div className={styles.dos}>
          <Input
            label="Nombre"
            autoComplete="given-name"
            maxLength={60}
            required
            {...campo('nombre')}
          />
          <Input
            label="Apellidos"
            autoComplete="family-name"
            maxLength={80}
            required
            {...campo('apellidos')}
          />
        </div>
        {grupos.length > 0 ? (
          <Select
            label="¿De qué club eres?"
            opciones={conVacia(grupos.map((g) => ({ value: g, label: g })))}
            required
            {...campo('grupo')}
          />
        ) : (
          <Input label="¿De qué club eres?" maxLength={60} required {...campo('grupo')} />
        )}
      </Grupo>

      <Grupo legend="¿Para qué sesión?">
        <div className={styles.dos}>
          <Select label="Mes" opciones={meses} required {...campo('mes')} />
          <Select label="Año" opciones={anios} required {...campo('anio')} />
        </div>
      </Grupo>

      <Grupo legend="Tus tres lecturas">
        <Recomendadas libros={recomendadasLibres} onElegir={proponer} completo={!libre} />
        {LECTURAS.map((c, i) => (
          <Input
            key={c}
            label={`Lectura ${i + 1}`}
            ayuda={
              i === 0
                ? 'Título y autor o autora. Al escribir te sugerimos las del club.'
                : undefined
            }
            maxLength={200}
            required
            list={sugerencias.length ? sugerenciasId : undefined}
            autoComplete="off"
            {...campo(c)}
          />
        ))}
        <datalist id={sugerenciasId}>
          {sugerencias.map((l) => (
            <option key={l.id} value={textoLibro(l)} />
          ))}
        </datalist>
      </Grupo>

      <SelectorTintero
        disponibles={tinteroDisponible}
        elegidas={tintero}
        onCambiar={setTintero}
        aviso={
          opciones.tipo === 'sin_opciones'
            ? 'Ahora mismo no podemos cargar el tintero del club. Puedes enviar la propuesta sin él.'
            : opciones.tipo === 'cargando'
              ? 'Cargando las lecturas del tintero…'
              : undefined
        }
      />
      <TextArea
        label="¿Por qué te interesan? (opcional)"
        maxLength={2000}
        rows={3}
        {...campo('motivo')}
      />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar propuesta'}
        </Button>
      </div>
    </form>
  );
}
