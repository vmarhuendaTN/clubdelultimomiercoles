import { enviar, type Dependencias } from '@/lib/apps-script';

export type DatosPropuesta = {
  titulo: string;
  autor: string;
  motivo: string;
  propuesto_por: string;
  google_books_id: string;
};

/** Envía la propuesta a la pestaña Propuestas de la hoja del club. */
export function enviarPropuesta(datos: DatosPropuesta, codigo: string, deps?: Dependencias) {
  return enviar<{ id: string }>('propuesta.enviar', { datos: { ...datos, codigo } }, deps);
}
