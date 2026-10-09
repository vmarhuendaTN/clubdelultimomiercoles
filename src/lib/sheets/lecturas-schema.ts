import { z } from 'zod';

const vacioAUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(vacioAUndefined, schema.optional());
const siNo = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
  z.enum(['si', 'sí', 'no']).transform((v) => v !== 'no'),
);

/**
 * Fila de la pestaña Lecturas de la Sheet CMS (docs/PLAN.md § Plantilla).
 * La usan el seed y el sync: las filas con errores se informan y no rompen nada.
 */
export const filaLecturaSchema = z.object({
  titulo: z.string().trim().min(1, 'falta el título'),
  autor: z.string().trim().min(1, 'falta el autor'),
  estado: z.enum(['leido', 'proximo', 'propuesta', 'por_clasificar'], {
    message: 'estado debe ser leido, proximo, propuesta o por_clasificar',
  }),
  orden: opcional(z.coerce.number().int()),
  fecha_sesion: opcional(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha_sesion debe ser AAAA-MM-DD'),
  ),
  isbn: opcional(z.string()),
  google_books_id: opcional(z.string()),
  portada_manual: opcional(z.string().url('portada_manual debe ser una URL')),
  descripcion_manual: opcional(z.string()),
  nota_club: opcional(z.string()),
  visible: z.preprocess(vacioAUndefined, siNo.optional()).transform((v) => v ?? true),
  revisar: opcional(z.string()),
});

export type FilaLectura = z.infer<typeof filaLecturaSchema>;

export type ResultadoFilas = {
  filas: FilaLectura[];
  errores: { fila: number; mensaje: string }[];
};

/** Valida filas; `fila` es el número de fila en la hoja (la cabecera es la 1). */
export function validarFilasLecturas(objetos: Record<string, string>[]): ResultadoFilas {
  const filas: FilaLectura[] = [];
  const errores: ResultadoFilas['errores'] = [];
  objetos.forEach((obj, i) => {
    const r = filaLecturaSchema.safeParse(obj);
    if (r.success) filas.push(r.data);
    else errores.push({ fila: i + 2, mensaje: r.error.issues.map((e) => e.message).join('; ') });
  });
  return { filas, errores };
}
