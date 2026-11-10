/**
 * Descarga las lecturas publicadas de la hoja «CMS Club» (Apps Script, ?accion=publico),
 * las valida con el esquema de Lecturas y las deja en src/generated/hoja-lecturas.json,
 * que `pnpm books` usa en lugar de data/seed-lecturas.csv.
 *
 *   SYNC_HOJA=1 APPS_SCRIPT_URL=https://script.google.com/macros/s/…/exec pnpm sync
 *
 * Sin SYNC_HOJA=1 no hace nada (CI de los PR y desarrollo local usan el CSV del repositorio).
 * Si la hoja no responde o devuelve datos no válidos, falla: el despliegue se detiene y la
 * web publicada sigue como estaba (nunca se publica una web vacía ni a medias).
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { procesarRespuestaHoja } from '../src/lib/sheets';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/generated/hoja-lecturas.json');
const TIMEOUT_MS = 30_000;

async function main() {
  const url = process.env.APPS_SCRIPT_URL ?? process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  if (process.env.SYNC_HOJA !== '1' || !url) {
    await rm(OUT, { force: true });
    console.log('Sync de la hoja desactivado: las lecturas salen de data/seed-lecturas.csv.');
    return;
  }

  const res = await fetch(`${url}?accion=publico`, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`La hoja respondió ${res.status}`);
  const resultado = procesarRespuestaHoja(await res.json());

  if (resultado.tipo === 'script_antiguo') {
    await rm(OUT, { force: true });
    console.warn(
      '⚠ El Apps Script desplegado es la versión antigua (no publica lecturas). Se usa el CSV.',
    );
    return;
  }
  for (const e of resultado.errores) console.warn(`⚠ Hoja, Lecturas, ${e}`);

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(resultado.filas, null, 2)}\n`);
  console.log(`Hoja sincronizada: ${resultado.filas.length} lecturas.`);
}

main().catch((err: unknown) => {
  console.error('✗ No se ha podido sincronizar la hoja:', err instanceof Error ? err.message : err);
  process.exit(1);
});
