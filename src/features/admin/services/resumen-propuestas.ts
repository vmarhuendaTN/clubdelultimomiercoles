import type { Propuesta } from '../types';
import { MESES } from '@/lib/format';
import { normalizar } from './etiquetas';

/** Puntos por posición: la primera opción pesa más (3, 2, 1). */
export const PUNTOS = [3, 2, 1] as const;

export type Periodo = { clave: string; etiqueta: string; total: number };

export type Proponente = { id: string; nombre: string; posicion: 1 | 2 | 3 };

export type LibroPropuesto = {
  clave: string;
  /** Cómo se escribió más veces (p. ej. «Circe, Madeline Miller»). */
  texto: string;
  personas: Proponente[];
  votos: number;
  puntos: number;
  /** Otras sesiones en las que también se propuso. */
  otrosPeriodos: string[];
};

/** Lo que propuso cada persona en la sesión (su último envío si mandó varios). */
export type PropuestasDePersona = {
  nombre: string;
  grupo: string;
  envios: number;
  libros: { clave: string; texto: string; posicion: 1 | 2 | 3; coincide: number }[];
};

export type Resumen = {
  envios: number;
  personas: number;
  libros: LibroPropuesto[];
  coincidencias: number;
  /** Lecturas del tintero marcadas por la gente, con cuántas veces. */
  tintero: { texto: string; veces: number }[];
  /** Nombres de quien envió más de una vez en la misma sesión. */
  repetidos: string[];
  porPersona: PropuestasDePersona[];
  /** Libros que ya se habían propuesto en otras sesiones. */
  deOtrasSesiones: number;
};

export const nombreCompleto = (p: Pick<Propuesta, 'nombre' | 'apellidos'>) =>
  [p.nombre, p.apellidos]
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' ');

/** «2027-01» para ordenar; vacío si la propuesta no tiene mes o año válidos. */
export function clavePeriodo(p: Pick<Propuesta, 'mes' | 'anio'>): string {
  const mes = (MESES as readonly string[]).indexOf(p.mes.trim().toLowerCase());
  if (mes < 0 || !/^\d{4}$/.test(p.anio.trim())) return '';
  return `${p.anio.trim()}-${String(mes + 1).padStart(2, '0')}`;
}

/** «2027-01» → «Enero de 2027». */
export function etiquetaPeriodo(clave: string): string {
  const [anio, mes] = clave.split('-');
  const nombre = MESES[Number(mes) - 1];
  return nombre ? `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} de ${anio}` : 'Sin fecha';
}

/** Sesiones con propuestas, de la más reciente a la más antigua. */
export function periodos(propuestas: Propuesta[]): Periodo[] {
  const cuenta = new Map<string, number>();
  for (const p of propuestas) {
    const c = clavePeriodo(p);
    if (c) cuenta.set(c, (cuenta.get(c) ?? 0) + 1);
  }
  return [...cuenta.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([clave, total]) => ({ clave, etiqueta: etiquetaPeriodo(clave), total }));
}

/**
 * Clave para agrupar el mismo libro escrito de formas distintas: el título (lo que va antes
 * de la coma o de « de »/« - »), sin tildes, mayúsculas, comillas ni artículos iniciales.
 */
export function claveLibro(texto: string): string {
  const titulo = texto.split(/,|\s[-–—]\s|\sde\s(?=[A-ZÁÉÍÓÚÑ])/)[0] ?? texto;
  return normalizar(titulo)
    .replace(/[«»"“”'’.¿?¡!:;()]/g, '')
    .replace(/^(el|la|los|las|un|una|the)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const masFrecuente = (textos: string[]) => {
  const cuenta = new Map<string, number>();
  for (const t of textos) cuenta.set(t, (cuenta.get(t) ?? 0) + 1);
  return (
    [...cuenta.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0]?.[0] ?? ''
  );
};

/** Resume las propuestas de una sesión (o de todas con `periodo` vacío). */
export function resumir(todas: Propuesta[], periodo: string): Resumen {
  const delPeriodo = periodo ? todas.filter((p) => clavePeriodo(p) === periodo) : todas;

  // En qué sesiones aparece cada libro (para avisar de los que se repiten de otras veces).
  const sesionesPorLibro = new Map<string, Set<string>>();
  for (const p of todas) {
    const sesion = clavePeriodo(p);
    for (const l of [p.lectura_1, p.lectura_2, p.lectura_3]) {
      const clave = claveLibro(l);
      if (!clave || !sesion) continue;
      if (!sesionesPorLibro.has(clave)) sesionesPorLibro.set(clave, new Set());
      sesionesPorLibro.get(clave)?.add(sesion);
    }
  }

  const libros = new Map<string, { textos: string[]; personas: Proponente[] }>();
  const tintero = new Map<string, { textos: string[]; veces: number }>();
  const enviosPorPersona = new Map<string, number>();

  for (const p of delPeriodo) {
    const nombre = nombreCompleto(p) || 'Sin nombre';
    const clavePersona = normalizar(nombre);
    enviosPorPersona.set(clavePersona, (enviosPorPersona.get(clavePersona) ?? 0) + 1);

    [p.lectura_1, p.lectura_2, p.lectura_3].forEach((texto, i) => {
      const clave = claveLibro(texto);
      if (!clave) return;
      const libro = libros.get(clave) ?? { textos: [], personas: [] };
      libro.textos.push(texto.trim());
      libro.personas.push({ id: p.id, nombre, posicion: (i + 1) as 1 | 2 | 3 });
      libros.set(clave, libro);
    });

    for (const texto of p.tintero.split(';')) {
      const clave = claveLibro(texto);
      if (!clave) continue;
      const t = tintero.get(clave) ?? { textos: [], veces: 0 };
      t.textos.push(texto.trim());
      t.veces++;
      tintero.set(clave, t);
    }
  }

  const lista: LibroPropuesto[] = [...libros.entries()].map(([clave, l]) => {
    // Una persona cuenta una vez por libro, aunque lo repita en dos huecos.
    const unicas = new Map<string, Proponente>();
    for (const persona of l.personas) {
      const k = normalizar(persona.nombre);
      const previa = unicas.get(k);
      if (!previa || persona.posicion < previa.posicion) unicas.set(k, persona);
    }
    const personas = [...unicas.values()].sort((a, b) => a.posicion - b.posicion);
    return {
      clave,
      texto: masFrecuente(l.textos),
      personas,
      votos: personas.length,
      puntos: personas.reduce((s, p) => s + (PUNTOS[p.posicion - 1] ?? 0), 0),
      otrosPeriodos: [...(sesionesPorLibro.get(clave) ?? [])]
        .filter((s) => s !== periodo)
        .sort()
        .reverse()
        .map(etiquetaPeriodo),
    };
  });
  lista.sort(
    (a, b) => b.votos - a.votos || b.puntos - a.puntos || a.texto.localeCompare(b.texto, 'es'),
  );

  // Por persona: su envío más reciente, y con cuántas personas coincide cada libro.
  const votosPorLibro = new Map(lista.map((l) => [l.clave, l.votos]));
  const ultimoEnvio = new Map<string, Propuesta>();
  for (const p of delPeriodo) {
    const clave = normalizar(nombreCompleto(p) || 'Sin nombre');
    const previo = ultimoEnvio.get(clave);
    if (!previo || p.creado_en > previo.creado_en) ultimoEnvio.set(clave, p);
  }
  const porPersona: PropuestasDePersona[] = [...ultimoEnvio.entries()]
    .map(([clave, p]) => ({
      nombre: nombreCompleto(p) || 'Sin nombre',
      grupo: p.grupo,
      envios: enviosPorPersona.get(clave) ?? 1,
      libros: [p.lectura_1, p.lectura_2, p.lectura_3]
        .map((texto, i) => ({
          clave: claveLibro(texto),
          texto: texto.trim(),
          posicion: (i + 1) as 1 | 2 | 3,
        }))
        .filter((l) => l.clave)
        .map((l) => ({ ...l, coincide: Math.max(0, (votosPorLibro.get(l.clave) ?? 1) - 1) })),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  return {
    porPersona,
    deOtrasSesiones: lista.filter((l) => l.otrosPeriodos.length > 0).length,
    envios: delPeriodo.length,
    personas: enviosPorPersona.size,
    libros: lista,
    coincidencias: lista.filter((l) => l.votos > 1).length,
    tintero: [...tintero.values()]
      .map((t) => ({ texto: masFrecuente(t.textos), veces: t.veces }))
      .sort((a, b) => b.veces - a.veces || a.texto.localeCompare(b.texto, 'es')),
    repetidos: delPeriodo
      .map((p) => nombreCompleto(p))
      .filter(
        (n, i, todos) =>
          todos.indexOf(n) === i && (enviosPorPersona.get(normalizar(n || 'Sin nombre')) ?? 0) > 1,
      ),
  };
}

/** Texto para copiar y pegar (WhatsApp, email…) con la clasificación de la sesión. */
export function textoResumen(r: Resumen, titulo: string, maximo = 10): string {
  const lineas = r.libros
    .slice(0, maximo)
    .map(
      (l, i) =>
        `${i + 1}. ${l.texto} — ${l.votos} ${l.votos === 1 ? 'persona' : 'personas'}, ${l.puntos} ${l.puntos === 1 ? 'punto' : 'puntos'}`,
    );
  return [
    `Propuestas · ${titulo}`,
    `${r.personas} personas, ${r.libros.length} libros distintos`,
    '',
    ...lineas,
  ].join('\n');
}
