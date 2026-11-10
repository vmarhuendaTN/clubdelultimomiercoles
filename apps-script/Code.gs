/**
 * Backend del Club del Último Miércoles (Google Apps Script).
 *
 * Vive DENTRO de la Sheet «CMS Club» (Extensiones → Apps Script) y se despliega
 * como Aplicación web: «Ejecutar como: Yo» · «Quién tiene acceso: Cualquier persona».
 *
 * Seguridad: cada llamada privada vuelve a verificar el token de Google y el rol
 * en la pestaña Equipo. Nada privado sale sin ello. No se guarda ningún secreto aquí:
 * el ID de cliente de Google va en las Propiedades del script.
 *
 * Propiedades del script (Configuración del proyecto → Propiedades del script):
 *   GOOGLE_CLIENT_ID = el ID de cliente OAuth (tipo «Aplicación web») de Google Cloud
 */

const PESTANA_EQUIPO = 'Equipo';
const CABECERA_EQUIPO = ['email', 'nombre', 'rol'];

/** Punto de entrada GET: comprobación de que el despliegue responde. */
function doGet(e) {
  const parametros = (e && e.parameter) || {};

  // Llamada desde la web (JSONP): se carga como <script>, así no hay problemas de CORS.
  if (parametros.accion === 'whoami') {
    return jsonp(whoamiDatos(parametros.idToken), parametros.callback);
  }

  return respuesta({ ok: true, servicio: 'club-ultimo-miercoles', version: 1 });
}

/** Punto de entrada POST. El cliente envía text/plain con JSON, así evita la preflight de CORS. */
function doPost(e) {
  let peticion;
  try {
    peticion = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return respuesta({ ok: false, error: 'json_no_valido' }, 400);
  }

  const accion = String(peticion.accion || '');
  if (accion === 'whoami') return whoami(peticion);

  return respuesta({ ok: false, error: 'accion_desconocida' }, 400);
}

/**
 * Devuelve quién es la persona si su token de Google es válido y figura en Equipo.
 * Entrada: { accion: 'whoami', idToken }
 */
function whoami(peticion) {
  return respuesta(whoamiDatos(peticion.idToken));
}

/** Lógica común de whoami: devuelve el objeto de respuesta, sin envolverlo. */
function whoamiDatos(idToken) {
  const email = emailDesdeToken(idToken);
  if (!email) return { ok: false, error: 'sesion_no_valida' };

  const miembro = buscarEnEquipo(email);
  if (!miembro) return { ok: false, error: 'no_autorizado' };

  return { ok: true, email: email, nombre: miembro.nombre, rol: miembro.rol };
}

/**
 * Comprueba el ID token con Google (tokeninfo) y devuelve el email verificado,
 * o null si el token no es válido, ha caducado o es de otra aplicación.
 */
function emailDesdeToken(idToken) {
  if (!idToken) return null;

  const clienteEsperado = PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_ID');
  if (!clienteEsperado) return null;

  const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;

  const datos = JSON.parse(res.getContentText());
  const ahora = Math.floor(Date.now() / 1000);

  const valido =
    datos.aud === clienteEsperado &&
    (datos.iss === 'https://accounts.google.com' || datos.iss === 'accounts.google.com') &&
    datos.email_verified === 'true' &&
    Number(datos.exp) > ahora;

  return valido ? String(datos.email).toLowerCase() : null;
}

/** Busca un email en la pestaña Equipo. Devuelve { nombre, rol } o null. */
function buscarEnEquipo(email) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PESTANA_EQUIPO);
  if (!hoja) return null;

  const filas = hoja.getDataRange().getValues();
  const cabecera = filas[0].map(function (c) {
    return String(c).trim().toLowerCase();
  });
  const iEmail = cabecera.indexOf('email');
  const iNombre = cabecera.indexOf('nombre');
  const iRol = cabecera.indexOf('rol');
  if (iEmail < 0 || iRol < 0) return null;

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];
    if (String(fila[iEmail]).trim().toLowerCase() === email) {
      const rol = String(fila[iRol]).trim().toLowerCase();
      if (rol !== 'admin' && rol !== 'editora') return null;
      return { nombre: String(fila[iNombre] || ''), rol: rol };
    }
  }
  return null;
}

/** Crea la pestaña Equipo con sus cabeceras si aún no existe. Ejecutar una vez a mano. */
function crearPestanaEquipo() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(PESTANA_EQUIPO);
  if (!hoja) hoja = libro.insertSheet(PESTANA_EQUIPO);
  if (hoja.getLastRow() === 0) hoja.appendRow(CABECERA_EQUIPO);
}

function respuesta(obj) {
  // ContentService no permite fijar el código HTTP; el cliente lee el campo ok.
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Responde con JavaScript que llama a la función indicada con los datos.
 * El callback solo admite letras, números, guiones bajos y puntos, para no ejecutar código ajeno.
 */
function jsonp(obj, callback) {
  const nombre = String(callback || '');
  if (!/^[A-Za-z_][A-Za-z0-9_.]{0,80}$/.test(nombre)) {
    return respuesta({ ok: false, error: 'callback_no_valido' });
  }
  return ContentService.createTextOutput(nombre + '(' + JSON.stringify(obj) + ');').setMimeType(
    ContentService.MimeType.JAVASCRIPT,
  );
}
