/**
 * Descarga las lecturas publicadas de la hoja «CMS Club» (Apps Script, ?accion=publico),
 * las valida con el esquema de Lecturas y las deja en src/generated/hoja-lecturas.json,
 * que `pnpm books` usa en lugar de data/seed-lecturas.csv.
 *
 *   SYNC_HOJA=1 APPS_SCRIPT_URL=https://script.google.com/macros/s/…/exec pnpm sync
 *
 * Sin SYNC_HOJA=1 no hace nada (CI de los PR y desarrollo local usan el CSV del repositorio).
 * Si la hoja devuelve datos no válidos (vacía, con error o filas rotas), falla: el despliegue se
 * detiene y la web publicada sigue como estaba (nunca se publica una web vacía ni a medias).
 * Si el script aún no está implementado (versión antigua, o Google responde con una página en
 * vez de JSON), avisa y publica con el CSV de respaldo para no bloquear la web.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { procesarTextoHoja } from '../src/lib/sheets';

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
  const resultado = procesarTextoHoja(await res.text());

  if (resultado.tipo !== 'ok') {
    await rm(OUT, { force: true });
    const motivo =
      resultado.tipo === 'script_antiguo'
        ? 'el Apps Script desplegado es la versión antigua (no publica lecturas)'
        : `Google respondió con una página en vez del script («${resultado.motivo}»): implementa una nueva versión con acceso «Cualquier persona» (apps-script/README.md)`;
    // ::warning:: lo destaca en el resumen de GitHub Actions.
    console.warn(
      `::warning title=Hoja CMS Club::${motivo}. Se publica con data/seed-lecturas.csv.`,
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
