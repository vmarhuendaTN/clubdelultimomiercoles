import { consultar, type Dependencias } from '@/lib/apps-script';
import { guardarPreferencia, leerPreferencia } from '@/lib/dom/preferencias';

/** Persona del club para «¿Quién eres?»: solo nombre e inicial («Marta R.») y club. */
export type PersonaClub = { id: string; nombre: string; club: string };

/** Valor del desplegable: id de la persona, «otra» (no está en la lista) o vacío. */
export const NO_ESTOY = 'otra';

export function cargarPersonas(codigo: string, deps?: Dependencias) {
  return consultar<{ personas: PersonaClub[] }>('personas.lista', { codigo }, deps);
}

export const etiquetaPersona = (p: PersonaClub) =>
  p.club ? `${p.nombre} · Club ${p.club}` : p.nombre;

/** El id de la persona elegida, o vacío si escribe su nombre a mano. */
export const idElegido = (seleccion: string) =>
  seleccion && seleccion !== NO_ESTOY ? seleccion : '';

/** Este navegador recuerda quién eres para la próxima vez. */
const CLAVE = 'club:yo';
export const personaRecordada = () => leerPreferencia(CLAVE) ?? '';
export const recordarPersona = (id: string) => {
  if (id) guardarPreferencia(CLAVE, id);
};
