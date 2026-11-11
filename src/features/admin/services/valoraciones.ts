import type { InscritaBasica, LecturaValorable, Valoracion } from '../types';
import { nombreCompleto } from './inscritas';

/** «7,5» o «7.5» → 7.5; null si está vacía o no es un número. */
export function numeroNota(t: string): number | null {
  const limpio = t.trim().replace(',', '.');
  if (!limpio) return null;
  const n = Number(limpio);
  return Number.isNaN(n) ? null : n;
}

/** ¿Es una nota válida (vacía, o de 0 a 10 con un decimal como mucho)? */
export function notaValida(t: string): boolean {
  if (!t.trim()) return true;
  const n = numeroNota(t);
  return n !== null && n >= 0 && n <= 10 && Math.round(n * 10) === n * 10;
}

/** 7.84 → «7,8». */
export const formatoNota = (n: number) =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(Math.round(n * 10) / 10);

type Media = { n: number; media: number };

const media = (notas: number[]): Media => ({
  n: notas.length,
  media: notas.length ? notas.reduce((s, x) => s + x, 0) / notas.length : 0,
});

const notasDe = (lista: Valoracion[]) =>
  lista.map((v) => numeroNota(v.nota)).filter((n): n is number => n !== null);

/** «Ana García» → «Ana G.». */
const corto = (v: { nombre: string; apellidos: string }) =>
  v.apellidos ? `${v.nombre} ${v.apellidos.charAt(0)}.` : v.nombre;

export type ResumenLibro = Media & {
  lectura: LecturaValorable;
  notas: { inscritaId: string; nombre: string; nota: string }[];
};

/** Media de cada lectura con sus notas (las más recientes primero; solo las que tienen notas). */
export function porLibro(valoraciones: Valoracion[], lecturas: LecturaValorable[]): ResumenLibro[] {
  return lecturas
    .map((lectura) => {
      const suyas = valoraciones.filter((v) => v.lectura_id === lectura.id);
      return {
        lectura,
        ...media(notasDe(suyas)),
        notas: suyas
          .map((v) => ({ inscritaId: v.inscrita_id, nombre: corto(v), nota: v.nota }))
          .sort((a, b) => (numeroNota(b.nota) ?? 0) - (numeroNota(a.nota) ?? 0)),
      };
    })
    .filter((r) => r.n > 0)
    .sort(ordenLecturas);
}

/** Primero la próxima, luego por fecha de sesión y orden, de la más reciente a la más antigua. */
function ordenLecturas(a: { lectura: LecturaValorable }, b: { lectura: LecturaValorable }) {
  const clave = (l: LecturaValorable) =>
    `${l.estado === 'proximo' ? '1' : '0'}|${l.fecha_sesion || '0000'}|${String(l.orden || '0').padStart(4, '0')}`;
  return clave(b.lectura).localeCompare(clave(a.lectura));
}

export const lecturasOrdenadas = (lecturas: LecturaValorable[]) =>
  lecturas
    .map((lectura) => ({ lectura }))
    .sort(ordenLecturas)
    .map((x) => x.lectura);

export type ResumenPersona = Media & {
  inscrita: InscritaBasica;
  notas: { lecturaId: string; titulo: string; nota: string }[];
};

/** Media de cada persona con las notas que ha dado (las que más valoran primero). */
export function porPersona(
  valoraciones: Valoracion[],
  inscritas: InscritaBasica[],
): ResumenPersona[] {
  return inscritas
    .map((inscrita) => {
      const suyas = valoraciones.filter((v) => v.inscrita_id === inscrita.id);
      return {
        inscrita,
        ...media(notasDe(suyas)),
        notas: suyas.map((v) => ({ lecturaId: v.lectura_id, titulo: v.titulo, nota: v.nota })),
      };
    })
    .filter((r) => r.n > 0)
    .sort(
      (a, b) =>
        b.n - a.n || nombreCompleto(a.inscrita).localeCompare(nombreCompleto(b.inscrita), 'es'),
    );
}

/** Notas ya guardadas de una lectura, por inscrita (para rellenar el formulario). */
export function notasDeLectura(valoraciones: Valoracion[], lecturaId: string) {
  return Object.fromEntries(
    valoraciones.filter((v) => v.lectura_id === lecturaId).map((v) => [v.inscrita_id, v.nota]),
  ) as Record<string, string>;
}

/** Media de lo que hay escrito ahora en el formulario. */
export function mediaBorrador(notas: Record<string, string>): Media {
  return media(
    Object.values(notas)
      .filter(notaValida)
      .map(numeroNota)
      .filter((n): n is number => n !== null),
  );
}
