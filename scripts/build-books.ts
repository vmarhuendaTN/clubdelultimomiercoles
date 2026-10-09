/**
 * Genera src/generated/lecturas.json para el build (antes de `dev` y `build`).
 *
 *   pnpm books
 *
 * Fuente de las filas: data/seed-lecturas.csv (hasta la Fase 3, en que será la Sheet CMS).
 * Fichas: Google Books (docs/GOOGLE-BOOKS.md). Se guardan en data/google-books.json, que va
 * en el repositorio: cada publicación tiene portadas y datos aunque no haya clave. Con
 * GOOGLE_BOOKS_API_KEY se consultan solo los libros nuevos o cambiados (hash_origen); para
 * fijarlos en el repo, ejecutar `pnpm books` en local con la clave y hacer commit del JSON.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
// Solo lógica pura: server.ts también exporta componentes (con CSS) que tsx no puede cargar.
import {
  buildLecturas,
  esPublica,
  hashOrigen,
} from '../src/features/books/services/build-lecturas';
import {
  createBooksClient,
  findBestVolume,
  QuotaError,
  type EnrichResult,
} from '../src/lib/books-api';
import type { ContenidoManifest } from '../src/lib/content/types';
import { csvToObjects, validarFilasLecturas } from '../src/lib/sheets';

const ROOT = path.resolve(import.meta.dirname, '..');
const SEED = path.join(ROOT, 'data/seed-lecturas.csv');
const CACHE = path.join(ROOT, 'data/google-books.json');
const CONTENIDO = path.join(ROOT, 'src/generated/contenido.json');
const OUT = path.join(ROOT, 'src/generated/lecturas.json');
/** ≈ 80 consultas por minuto como máximo, por debajo del límite por minuto de Google. */
const PAUSA_MS = 750;
const REFRESCO_DIAS = 180;
const REFRESCO_POR_EJECUCION = 10;
/** Sin resultado (o fallo puntual de Google): se vuelve a intentar pasado un día. */
const REINTENTO_SIN_DATOS_HORAS = 24;

type Cache = Record<string, { enriquecidoEn: string; resultado: EnrichResult }>;

const avisos: string[] = [];
const aviso = (m: string) => avisos.push(m);
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function leerJson<T>(file: string, porDefecto: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch {
    return porDefecto;
  }
}

async function main() {
  const { filas, errores } = validarFilasLecturas(csvToObjects(await readFile(SEED, 'utf8')));
  for (const e of errores) aviso(`Lecturas, fila ${e.fila}: ${e.mensaje}`);

  const cache = await leerJson<Cache>(CACHE, {});
  const publicas = filas.filter(esPublica);
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  let consultas = 0;

  if (!apiKey) {
    aviso('Sin GOOGLE_BOOKS_API_KEY: se usan las fichas en caché y portadas ilustradas.');
  } else {
    const client = createBooksClient({ apiKey });
    const limite = Date.now() - REFRESCO_DIAS * 24 * 3600 * 1000;
    let refrescos = 0;
    const reintento = Date.now() - REINTENTO_SIN_DATOS_HORAS * 3600 * 1000;
    const pendientes = publicas.filter((f) => {
      const c = cache[hashOrigen(f)];
      if (!c) return true;
      if (!c.resultado.data && Date.parse(c.enriquecidoEn) < reintento) return true;
      if (Date.parse(c.enriquecidoEn) < limite && refrescos < REFRESCO_POR_EJECUCION) {
        refrescos++;
        return true;
      }
      return false;
    });
    for (const fila of pendientes) {
      try {
        const resultado = await findBestVolume(
          {
            titulo: fila.titulo,
            autor: fila.autor,
            isbn: fila.isbn,
            googleBooksId: fila.google_books_id,
          },
          client,
        );
        cache[hashOrigen(fila)] = { enriquecidoEn: new Date().toISOString(), resultado };
      } catch (err) {
        if (err instanceof QuotaError) {
          aviso(
            `${err.message}. Se continúa con la caché; el resto se completará en la próxima publicación.`,
          );
          break;
        }
        aviso(`«${fila.titulo}»: ${(err as Error).message}`);
      }
      await dormir(PAUSA_MS);
    }
    consultas = client.requests;
    // Solo las fichas de filas actuales, en orden estable para que los cambios se lean bien en Git
    const vigentes = new Set(filas.map(hashOrigen));
    const ordenada = Object.fromEntries(
      Object.entries(cache)
        .filter(([hash]) => vigentes.has(hash))
        .sort(([, a], [, b]) =>
          (a.resultado.data?.tituloGoogle ?? '').localeCompare(
            b.resultado.data?.tituloGoogle ?? '',
            'es',
          ),
        ),
    );
    await writeFile(CACHE, `${JSON.stringify(ordenada, null, 2)}\n`);
  }

  const contenido = await leerJson<ContenidoManifest | null>(CONTENIDO, null);
  const lecturas = buildLecturas({
    filas,
    fichas: (hash) => cache[hash]?.resultado.data,
    portadas: contenido?.portadas ?? [],
  });
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(lecturas, null, 2)}\n`);

  // Informe (en Fase 4 se verá en /admin)
  const revisar = publicas.filter((f) => f.revisar || cache[hashOrigen(f)]?.resultado.revisar);
  const conPortada = lecturas.filter((l) => l.portadaUrl).length;
  console.log(
    `Lecturas: ${lecturas.length} publicadas (${conPortada} con portada), ${filas.length - publicas.length} sin publicar, ${revisar.length} a revisar, ${consultas} consultas a Google Books.`,
  );
  for (const f of revisar) {
    const nota = f.revisar ?? `puntuación ${cache[hashOrigen(f)]?.resultado.puntuacion ?? 0}`;
    console.log(`  · revisar «${f.titulo}» (${f.autor}): ${nota}`);
  }
  for (const m of avisos)
    console.log(process.env.GITHUB_ACTIONS ? `::warning::${m}` : `Aviso: ${m}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
