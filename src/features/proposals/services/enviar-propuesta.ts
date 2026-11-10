import { enviar, type Dependencias } from '@/lib/apps-script';

/** Mismas preguntas que el antiguo Google Form «Propuestas de lectura». */
export type DatosPropuesta = {
  nombre: string;
  apellidos: string;
  grupo: string;
  mes: string;
  anio: string;
  lectura_1: string;
  lectura_2: string;
  lectura_3: string;
  tintero: string;
  motivo: string;
};

/** Envía la propuesta a la pestaña Propuestas de la hoja del club. */
export function enviarPropuesta(datos: DatosPropuesta, codigo: string, deps?: Dependencias) {
  return enviar<{ id: string }>('propuesta.enviar', { datos: { ...datos, codigo } }, deps);
}
