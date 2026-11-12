'use client';

import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Button, Input, Select, TextArea } from '@/components/ui';
import type { EstadoOpciones } from '../../hooks/use-opciones-propuesta';
import type { EstadoPersonas } from '../../hooks/use-personas-club';
import type { DatosPropuesta } from '../../services/enviar-propuesta';
import { textoLibro, yaElegido, type LibroOpcion } from '../../services/opciones';
import { MESES, aniosPosibles, claveSesion } from '@/lib/format';
import { idElegido, recordarPersona } from '../../services/personas';
import { QuienEres, validarQuien, type DatosQuien, type ErroresQuien } from '../QuienEres';
import { Recomendadas } from '../Recomendadas';
import { RecomendadasSesion } from '../RecomendadasSesion';
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

const OBLIGATORIOS: Partial<Record<Campo, string>> = {
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
  /** Lista del club para «¿Quién eres?». Sin ella, nombre y apellidos a mano. */
  personas?: EstadoPersonas;
};

const QUIEN_VACIO: DatosQuien = { persona: '', nombre: '', apellidos: '', grupo: '' };

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
  personas = { tipo: 'sin_lista' },
}: FormularioPropuestaProps) {
  const [datos, setDatos] = useState<DatosPropuesta>(VACIA);
  const [quien, setQuien] = useState<DatosQuien>(QUIEN_VACIO);
  const [erroresQuien, setErroresQuien] = useState<ErroresQuien>({});
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
  // Recomendadas por el club para la sesión elegida (mes y año), desde el panel.
  const sesion = claveSesion(datos.mes, datos.anio);
  const deLaSesion =
    opciones.tipo === 'listas' && sesion ? (opciones.opciones.porSesion?.[sesion] ?? []) : [];
  const notaSesion =
    opciones.tipo === 'listas' && sesion ? opciones.opciones.notas?.[sesion] : undefined;

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
      if (!datos[nombre as Campo]?.trim()) nuevos[nombre as Campo] = mensaje;
    }
    const deQuien = validarQuien(quien, personas, true);
    setErrores(nuevos);
    setErroresQuien(deQuien);
    if (Object.keys(nuevos).length === 0 && Object.keys(deQuien).length === 0) {
      const inscrita_id = idElegido(quien.persona);
      const elegida =
        personas.tipo === 'lista' ? personas.personas.find((p) => p.id === inscrita_id) : undefined;
      recordarPersona(inscrita_id);
      onEnviar({
        ...datos,
        nombre: elegida ? (elegida.nombre.split(' ')[0] ?? '') : quien.nombre,
        apellidos: elegida ? '' : quien.apellidos,
        grupo: elegida ? '' : quien.grupo,
        ...(inscrita_id ? { inscrita_id } : {}),
        tintero: tintero.map(textoLibro).join('; '),
      });
    }
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <Grupo legend="Sobre ti">
        <QuienEres
          personas={personas}
          valor={quien}
          errores={erroresQuien}
          conClub
          onCambiar={(campo, v) => {
            setQuien((q) => ({ ...q, [campo]: v }));
            setErroresQuien((er) => ({ ...er, [campo]: undefined }));
          }}
        />
      </Grupo>

      <Grupo legend="¿Para qué sesión?">
        <div className={styles.dos}>
          <Select label="Mes" opciones={meses} required {...campo('mes')} />
          <Select label="Año" opciones={anios} required {...campo('anio')} />
        </div>
      </Grupo>

      <Grupo legend="Tus tres lecturas">
        <RecomendadasSesion
          etiqueta={`${datos.mes} de ${datos.anio}`}
          libros={deLaSesion}
          nota={notaSesion}
          elegido={(l) => yaElegido(l, escritas)}
          completo={!libre}
          onProponer={proponer}
        />
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
