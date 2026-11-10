import { site } from '@/config/site';
import { descifrarEnlace } from './enlace-cifrado';

/**
 * Comprueba el código del club sin guardarlo en el repositorio: es correcto si descifra
 * el enlace cifrado de `site.formularioPropuestas`. Apps Script lo vuelve a comprobar al enviar.
 */
export async function comprobarCodigo(codigo: string): Promise<boolean> {
  return (await descifrarEnlace(site.formularioPropuestas, codigo)) !== null;
}
