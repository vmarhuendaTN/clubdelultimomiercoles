/**
 * Cifra un enlace con un código de acceso para publicarlo sin dejarlo en claro.
 *   CODIGO='…' ENLACE='https://…' pnpm cifrar-enlace
 * Pega el resultado en `site.formularioPropuestas` (src/config/site.ts).
 * El código nunca se guarda en el repositorio.
 */
import { cifrarEnlace } from '../src/features/proposals/services/enlace-cifrado';

const { CODIGO, ENLACE } = process.env;
if (!CODIGO || !ENLACE) {
  console.error("Uso: CODIGO='…' ENLACE='https://…' pnpm cifrar-enlace");
  process.exit(1);
}
void cifrarEnlace(ENLACE, CODIGO).then((cifrado) => console.log(JSON.stringify(cifrado, null, 2)));
