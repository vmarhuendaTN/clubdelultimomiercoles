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
import {
  guardarInscrita,
  listarInscritas,
  vincularPersona,
  type InscritaNueva,
} from '../../services/api';
import { enClub, nombreClub, OPCIONES_CLUB, type FiltroClub } from '../../services/clubs';
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
import type { Inscrita, SinInscribir } from '../../types';
import { EstadoCarga } from '../EstadoCarga';
import styles from './SeccionInscritas.module.css';

type SeccionInscritasProps = {
  sesion: string;
  alCaducar: () => void;
  /** Filtro de club del panel. */
  club?: FiltroClub;
};

const VACIA: InscritaNueva = {
  nombre: '',
  apellidos: '',
  telefono: '',
  email: '',
  activa: 'si',
  club: '',
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
export function SeccionInscritas({ sesion, alCaducar, club = '' }: SeccionInscritasProps) {
  const toast = useToast();
  const { carga, recargar } = useCarga(() => listarInscritas(sesion), alCaducar);
  const [filtro, setFiltro] = useState<FiltroInscritas>('activas');
  const [busqueda, setBusqueda] = useState('');
  const [ficha, setFicha] = useState<InscritaNueva | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [errores, setErrores] = useState<Partial<Record<keyof InscritaNueva, string>>>({});
  // Vincular a alguien que escribió su nombre a mano con una inscrita (hoja «Otra…»).
  const [aVincular, setAVincular] = useState<SinInscribir | null>(null);
  const [destino, setDestino] = useState('');

  async function vincular(p: SinInscribir, inscritaId: string, nombre: string) {
    setOcupado(true);
    const r = await vincularPersona(sesion, {
      nombre: p.nombre,
      apellidos: p.apellidos,
      inscrita_id: inscritaId,
    });
    setOcupado(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return;
    }
    setAVincular(null);
    toast.mostrar(
      `${nombreCompleto(p)} es ${nombre}: ${r.unidas} ${r.unidas === 1 ? 'envío unido' : 'envíos unidos'} a su ficha.`,
      'exito',
    );
    await recargar();
  }

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
      club: i.club ?? '',
      ajuste: i.ajuste,
      notas: i.notas,
    });

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ficha) return;
    const nuevos: typeof errores = {};
    if (!ficha.nombre.trim()) nuevos.nombre = 'Escribe el nombre.';
    if (!ficha.club) nuevos.club = 'Elige su club.';
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
        <Button icono="anadir" onClick={() => abrir({ ...VACIA, club })}>
          Añadir inscrita
        </Button>
        <details className={styles.ayuda}>
          <summary>¿Cómo se cuentan las participaciones?</summary>
          <p>
            Son las sesiones en las que cada persona ha enviado propuestas (casando nombre y
            apellidos). Si vino sin proponer, súmalas con «Ajuste» en su ficha o en la hoja. La
            media es la de sus notas en Valoraciones.
          </p>
        </details>
      </div>

      {carga.tipo === 'cargando' && <EstadoCarga tipo="cargando" texto="Cargando inscritas…" />}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}
      {carga.tipo === 'lista' &&
        (() => {
          const inscritas = carga.datos.inscritas.filter((i) => enClub(i.club, club));
          const sinInscribir = carga.datos.sinInscribir.filter((p) => enClub(p.club, club));
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
                  ocupado={ocupado}
                  onVincular={(p) =>
                    p.sugerida_id && void vincular(p, p.sugerida_id, p.sugerida_nombre ?? '')
                  }
                  onOtra={(p) => {
                    setDestino('');
                    setAVincular(p);
                  }}
                  onInscribir={(p) =>
                    abrir({
                      ...VACIA,
                      nombre: p.nombre,
                      apellidos: p.apellidos,
                      club: p.club ?? '',
                    })
                  }
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
              label="Club"
              opciones={[{ value: '', label: 'Elige su club' }, ...OPCIONES_CLUB]}
              value={ficha.club}
              onChange={(e) => cambiar('club')(e.target.value)}
              error={errores.club}
              required
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
      <BottomSheet
        open={aVincular !== null}
        onClose={() => setAVincular(null)}
        titulo="Es la misma persona"
        acciones={
          <>
            <Button variant="secundario" onClick={() => setAVincular(null)}>
              Cancelar
            </Button>
            <Button
              disabled={!destino || ocupado}
              onClick={() => {
                const elegida =
                  carga.tipo === 'lista'
                    ? carga.datos.inscritas.find((i) => i.id === destino)
                    : undefined;
                if (aVincular && elegida)
                  void vincular(aVincular, elegida.id, nombreCompleto(elegida));
              }}
            >
              Vincular
            </Button>
          </>
        }
      >
        {aVincular && (
          <div className={styles.formulario}>
            <p>
              Todo lo que envió <strong>{nombreCompleto(aVincular)}</strong> (propuestas y votos)
              pasará a la ficha de la inscrita que elijas, escrito como en Inscritas.
            </p>
            <Select
              label="Es la misma persona que…"
              opciones={[
                { value: '', label: 'Elige una inscrita…' },
                ...(carga.tipo === 'lista' ? carga.datos.inscritas : [])
                  .slice()
                  .sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b), 'es'))
                  .map((i) => ({
                    value: i.id,
                    label: `${nombreCompleto(i)}${i.club ? ` · ${nombreClub(i.club)}` : ''}`,
                  })),
              ]}
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
            />
          </div>
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
          <span className={styles.etiquetas}>
            {i.club && <Pill variant="neutro">{nombreClub(i.club)}</Pill>}
            <Pill variant={participaciones(i) > 0 ? 'mostaza' : 'neutro'}>
              {veces(participaciones(i))}
            </Pill>
            {i.media_valoraciones && (
              <Pill variant="acento">
                Media {i.media_valoraciones}
                {i.valoraciones ? ` (${i.valoraciones})` : ''}
              </Pill>
            )}
            {!estaActiva(i) && <Pill variant="neutro">De baja</Pill>}
          </span>
          <Button
            variant="secundario"
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
  ocupado,
  onInscribir,
  onVincular,
  onOtra,
}: {
  personas: SinInscribir[];
  ocupado: boolean;
  onInscribir: (p: SinInscribir) => void;
  onVincular: (p: SinInscribir) => void;
  onOtra: (p: SinInscribir) => void;
}) {
  if (personas.length === 0)
    return <p className={styles.vacio}>Todas las personas que han propuesto están inscritas.</p>;
  return (
    <ul className={styles.lista} aria-label="Han propuesto y no están inscritas">
      {personas.map((p) => (
        <li key={nombreCompleto(p)} className={styles.fila}>
          <span className={styles.datos}>
            <span className={styles.nombre}>{nombreCompleto(p)}</span>
            {p.sugerida_nombre && (
              <span className={styles.sugerencia}>¿Es {p.sugerida_nombre}?</span>
            )}
          </span>
          <span className={styles.etiquetas}>
            {p.club && <Pill variant="neutro">{nombreClub(p.club)}</Pill>}
            <Pill variant="neutro">{veces(participaciones(p))}</Pill>
          </span>
          <span className={styles.accionesFila}>
            {p.sugerida_id && (
              <Button
                variant="primario"
                size="sm"
                icono="exito"
                disabled={ocupado}
                onClick={() => onVincular(p)}
                aria-label={`Vincular a ${nombreCompleto(p)} con ${p.sugerida_nombre}`}
              >
                Sí, vincular
              </Button>
            )}
            <Button
              variant="secundario"
              size="sm"
              onClick={() => onOtra(p)}
              aria-label={`Vincular a ${nombreCompleto(p)} con otra inscrita`}
            >
              {p.sugerida_id ? 'Otra…' : 'Vincular…'}
            </Button>
            <Button
              variant={p.sugerida_id ? 'sencillo' : 'primario'}
              size="sm"
              icono="anadir"
              onClick={() => onInscribir(p)}
              aria-label={`Inscribir a ${nombreCompleto(p)}`}
            >
              Inscribir
            </Button>
          </span>
        </li>
      ))}
    </ul>
  );
}
