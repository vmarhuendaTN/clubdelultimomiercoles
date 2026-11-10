import type { ErrorApi } from './client';

/** Mensajes para la interfaz, en lenguaje llano. */
export function mensajeDeError(error: ErrorApi, detalle?: string): string {
  switch (error) {
    case 'sin_configurar':
      return 'Esta parte todavía no está conectada con la hoja del club.';
    case 'red':
      return 'No hemos podido conectar. Revisa tu conexión e inténtalo de nuevo.';
    case 'sesion_no_valida':
      return 'Tu sesión ha caducado. Vuelve a entrar con Google.';
    case 'no_autorizado':
      return 'Tu cuenta no tiene permiso para esto.';
    case 'datos_no_validos':
      return detalle ?? 'Revisa los datos del formulario.';
    case 'codigo_incorrecto':
      return 'El código del club no es correcto.';
    case 'demasiadas_peticiones':
      return 'Demasiados intentos seguidos. Espera unos minutos.';
    case 'no_encontrada':
      return 'No la encontramos en la hoja: quizá alguien la ha borrado. Recarga la lista.';
    case 'google_no_responde':
      return (
        detalle ??
        'Google Libros no responde ahora mismo. Puedes escribir el título y el autor a mano.'
      );
    case 'github_rechaza':
      return 'GitHub no ha aceptado la publicación. Revisa el token en las propiedades del script.';
    case 'ultima_admin':
      return 'Tiene que quedar al menos una administradora.';
    case 'no_puedes_quitarte':
      return 'No puedes quitarte a ti misma del equipo.';
    case 'accion_desconocida':
      return 'La hoja tiene una versión antigua del script. Hay que volver a implementarlo.';
    case 'votacion_cerrada':
      return 'La votación se ha cerrado. ¡Gracias de todos modos!';
    case 'pendiente':
    case 'error_interno':
      return 'Algo ha fallado en la hoja. Inténtalo de nuevo en un momento.';
  }
}
