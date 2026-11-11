'use client';

import { useState, type FormEvent } from 'react';
import {
  BottomSheet,
  Button,
  Cifra,
  Input,
  Pill,
  SearchField,
  Select,
  TextArea,
  useToast,
} from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import { guardarInscrita, listarInscritas, type InscritaNueva } from '../../services/api';
import {
  enlaceTelefono,
  estaActiva,
  filtrarInscritas,
  filtrarSinInscribir,
  nombreCompleto,
  participaciones,
  resumenInscritas,
  type FiltroInscritas,
} from '../../services/inscritas';
import type { Inscrita } from '../../types';
import { EstadoCarga } from '../EstadoCarga';
import styles from './SeccionInscritas.module.css';

type SeccionInscritasProps = { sesion: string; alCaducar: () => void };

const VACIA: InscritaNueva = {
  nombre: '',
  apellidos: '',
  telefono: '',
  email: '',
  activa: 'si',
  ajuste: '',
  notas: '',
};

const ESTADOS = [
  { value: 'si', label: 'Activa' },
  { value: 'no', label: 'De baja' },
] as const;

const veces = (n: number) => `${n} ${n === 1 ? 'participación' : 'participaciones'}`;

/**
 * Personas inscritas en el club (pestaña Inscritas de la hoja): datos de contacto y
 * participaciones, que cuentan las sesiones en las que han enviado propuestas.
 */
export function SeccionInscritas({ sesion, alCaducar }: SeccionInscritasProps) {
  const toast = useToast();
  const { carga, recargar } = useCarga(() => listarInscritas(sesion), alCaducar);
  const [filtro, setFiltro] = useState<FiltroInscritas>('activas');
  const [busqueda, setBusqueda] = useState('');
  const [ficha, setFicha] = useState<InscritaNueva | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [errores, setErrores] = useState<Partial<Record<keyof InscritaNueva, string>>>({});

  const abrir = (datos: InscritaNueva) => {
    setErrores({});
    setFicha(datos);
  };
  const editar = (i: Inscrita) =>
    abrir({
      id: i.id,
      nombre: i.nombre,
      apellidos: i.apellidos,
      telefono: i.telefono,
      email: i.email,
      activa: i.activa === 'no' ? 'no' : 'si',
      ajuste: i.ajuste,
      notas: i.notas,
    });

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ficha) return;
    const nuevos: typeof errores = {};
    if (!ficha.nombre.trim()) nuevos.nombre = 'Escribe el nombre.';
    if (ficha.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ficha.email.trim()))
      nuevos.email = 'Escribe un email válido.';
    if (ficha.telefono.trim() && !/^[0-9+()\-. ]{6,30}$/.test(ficha.telefono.trim()))
      nuevos.telefono = 'Solo números, espacios y +.';
    if (ficha.ajuste.trim() && !/^-?\d{1,3}$/.test(ficha.ajuste.trim()))
      nuevos.ajuste = 'Un número entero, por ejemplo 2 o -1.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    setOcupado(true);
    const r = await guardarInscrita(sesion, {
      ...ficha,
      email: ficha.email.trim().toLowerCase(),
      telefono: ficha.telefono.trim(),
      ajuste: ficha.ajuste.trim(),
    });
    setOcupado(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return;
    }
    toast.mostrar(
      ficha.id ? 'Datos guardados.' : `${nombreCompleto(ficha)} ya está inscrita.`,
      'exito',
    );
    setFicha(null);
    await recargar();
  }

  const cambiar = (campo: keyof InscritaNueva) => (valor: string) =>
    setFicha((f) => (f ? { ...f, [campo]: valor } : f));

  return (
    <div className={styles.seccion}>
      <div className={styles.cabecera}>
        <p className={styles.intro}>
          Las participaciones cuentan las sesiones en las que cada persona ha enviado propuestas. Se
          pueden corregir con «Ajuste», aquí o en la pestaña Inscritas de la hoja.
        </p>
        <Button icono="anadir" onClick={() => abrir(VACIA)}>
          Añadir inscrita
        </Button>
      </div>

      {carga.tipo === 'cargando' && <EstadoCarga tipo="cargando" texto="Cargando inscritas…" />}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}
      {carga.tipo === 'lista' &&
        (() => {
          const { inscritas, sinInscribir } = carga.datos;
          const resumen = resumenInscritas(inscritas, sinInscribir);
          return (
            <>
              <div className={styles.cifras} role="group" aria-label="Filtrar inscritas">
                <Cifra
                  valor={resumen.activas}
                  etiqueta="Inscritas"
                  detalle={veces(resumen.participaciones)}
                  activa={filtro === 'activas'}
                  onPulsar={() => setFiltro('activas')}
                />
                <Cifra
                  valor={resumen.bajas}
                  etiqueta="De baja"
                  detalle="ya no vienen"
                  activa={filtro === 'bajas'}
                  onPulsar={() => setFiltro('bajas')}
                />
                <Cifra
                  valor={resumen.sinInscribir}
                  etiqueta="Sin inscribir"
                  detalle="han propuesto y no están"
                  activa={filtro === 'sin_inscribir'}
                  onPulsar={() => setFiltro('sin_inscribir')}
                />
              </div>

              <SearchField
                label="Buscar persona"
                placeholder="Nombre, email o teléfono"
                value={busqueda}
                onChange={setBusqueda}
              />

              {filtro === 'sin_inscribir' ? (
                <ListaSinInscribir
                  personas={filtrarSinInscribir(sinInscribir, busqueda)}
                  onInscribir={(p) => abrir({ ...VACIA, nombre: p.nombre, apellidos: p.apellidos })}
                />
              ) : (
                <ListaInscritas
                  inscritas={filtrarInscritas(inscritas, filtro, busqueda)}
                  onEditar={editar}
                />
              )}
            </>
          );
        })()}

      <BottomSheet
        open={ficha !== null}
        onClose={() => setFicha(null)}
        titulo={ficha?.id ? 'Editar inscrita' : 'Nueva inscrita'}
      >
        {ficha && (
          <form className={styles.formulario} onSubmit={(e) => void guardar(e)} noValidate>
            <Input
              label="Nombre"
              autoComplete="off"
              value={ficha.nombre}
              onChange={(e) => cambiar('nombre')(e.target.value)}
              error={errores.nombre}
              required
            />
            <Input
              label="Apellidos"
              autoComplete="off"
              value={ficha.apellidos}
              onChange={(e) => cambiar('apellidos')(e.target.value)}
              ayuda="Como los escribe en el formulario de propuestas, para contar sus participaciones."
            />
            <Input
              label="Teléfono"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={ficha.telefono}
              onChange={(e) => cambiar('telefono')(e.target.value)}
              error={errores.telefono}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="off"
              value={ficha.email}
              onChange={(e) => cambiar('email')(e.target.value)}
              error={errores.email}
            />
            <Select
              label="Estado"
              opciones={ESTADOS}
              value={ficha.activa}
              onChange={(e) => cambiar('activa')(e.target.value)}
            />
            <Input
              label="Ajuste de participaciones"
              inputMode="numeric"
              autoComplete="off"
              value={ficha.ajuste}
              onChange={(e) => cambiar('ajuste')(e.target.value)}
              error={errores.ajuste}
              ayuda="Se suma a las que cuenta el panel. Por ejemplo, 2 si vino a sesiones sin proponer."
            />
            <TextArea
              label="Notas"
              rows={3}
              value={ficha.notas}
              onChange={(e) => cambiar('notas')(e.target.value)}
            />
            <div className={styles.acciones}>
              <Button type="button" variant="secundario" onClick={() => setFicha(null)}>
                Cancelar
              </Button>
              <Button type="submit" icono="exito" disabled={ocupado}>
                Guardar
              </Button>
            </div>
          </form>
        )}
      </BottomSheet>
    </div>
  );
}

function ListaInscritas({
  inscritas,
  onEditar,
}: {
  inscritas: Inscrita[];
  onEditar: (i: Inscrita) => void;
}) {
  if (inscritas.length === 0) return <p className={styles.vacio}>No hay nadie con ese filtro.</p>;
  return (
    <ul className={styles.lista} aria-label="Inscritas">
      {inscritas.map((i) => (
        <li key={i.id} className={styles.fila}>
          <span className={styles.datos}>
            <span className={styles.nombre}>{nombreCompleto(i)}</span>
            <span className={styles.contacto}>
              {i.telefono && <a href={enlaceTelefono(i.telefono)}>{i.telefono}</a>}
              {i.email && <a href={`mailto:${i.email}`}>{i.email}</a>}
              {!i.telefono && !i.email && 'Sin datos de contacto'}
            </span>
          </span>
          <Pill variant={participaciones(i) > 0 ? 'mostaza' : 'neutro'}>
            {veces(participaciones(i))}
          </Pill>
          {!estaActiva(i) && <Pill variant="neutro">De baja</Pill>}
          <Button
            variant="sencillo"
            size="sm"
            icono="editar"
            onClick={() => onEditar(i)}
            aria-label={`Editar a ${nombreCompleto(i)}`}
          >
            Editar
          </Button>
        </li>
      ))}
    </ul>
  );
}

function ListaSinInscribir({
  personas,
  onInscribir,
}: {
  personas: { nombre: string; apellidos: string; participaciones: string }[];
  onInscribir: (p: { nombre: string; apellidos: string }) => void;
}) {
  if (personas.length === 0)
    return <p className={styles.vacio}>Todas las personas que han propuesto están inscritas.</p>;
  return (
    <ul className={styles.lista} aria-label="Han propuesto y no están inscritas">
      {personas.map((p) => (
        <li key={nombreCompleto(p)} className={styles.fila}>
          <span className={styles.datos}>
            <span className={styles.nombre}>{nombreCompleto(p)}</span>
          </span>
          <Pill variant="neutro">{veces(participaciones(p))}</Pill>
          <Button
            variant="secundario"
            size="sm"
            icono="anadir"
            onClick={() => onInscribir(p)}
            aria-label={`Inscribir a ${nombreCompleto(p)}`}
          >
            Inscribir
          </Button>
        </li>
      ))}
    </ul>
  );
}
