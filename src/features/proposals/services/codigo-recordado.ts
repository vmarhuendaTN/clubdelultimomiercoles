import { borrarPreferencia, guardarPreferencia, leerPreferencia } from '@/lib/dom/preferencias';

/** Recuerda en este navegador el código del club ya comprobado, para no pedirlo cada vez. */
const CLAVE = 'club:codigo-propuestas';

export const codigoRecordado = () => leerPreferencia(CLAVE);
export const recordarCodigo = (codigo: string) => guardarPreferencia(CLAVE, codigo);
export const olvidarCodigo = () => borrarPreferencia(CLAVE);
