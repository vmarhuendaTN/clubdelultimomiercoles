/**
 * Backend del Club del Último Miércoles (Google Apps Script).
 *
 * Vive DENTRO de la Sheet «CMS Club» (Extensiones → Apps Script) y se despliega como
 * Aplicación web: «Ejecutar como: Yo» · «Quién tiene acceso: Cualquier persona».
 * Para actualizarlo: pegar este archivo entero, guardar y Implementar → Gestionar
 * implementaciones → editar (lápiz) → Versión: «Nueva versión» → Implementar. Así la URL no cambia.
 *
 * Cómo habla la web con el script (GitHub Pages no puede leer respuestas de otro dominio):
 *   · Lecturas (GET) por JSONP: ?accion=…&callback=…  → se carga como <script>.
 *   · Escrituras (POST) con fetch «no-cors»: el script guarda el resultado unos minutos con el
 *     reqId que manda la web, y la web lo recoge con ?accion=resultado&reqId=… (JSONP).
 *
 * Seguridad: las acciones privadas comprueban la sesión Y el rol en la pestaña Equipo en cada
 * llamada (quitar a alguien de Equipo le corta el acceso al momento). Nada privado sale sin ello.
 * Nunca se escribe en otros documentos: solo en esta hoja.
 *
 * Propiedades del script (Configuración del proyecto → Propiedades del script):
 *   GOOGLE_CLIENT_ID      ID de cliente OAuth (tipo «Aplicación web»). Obligatoria para entrar.
 *   CODIGO_CLUB           Código de acceso del club para el formulario de propuestas (opcional).
 *   GOOGLE_BOOKS_API_KEY  Clave de Google Books para el buscador de libros (recomendada).
 *   GH_DISPATCH_TOKEN     Token fino de GitHub con «Actions: read and write» (para «Publicar ahora»).
 *   GH_REPO               Repositorio, por defecto vmarhuendaTN/clubdelultimomiercoles.
 */

const VERSION = 12;
const DURACION_SESION_S = 6 * 60 * 60; // máximo que permite CacheService
const ROLES = ['admin', 'editora'];
const ESTADOS_LECTURA = ['leido', 'proximo', 'propuesta', 'por_clasificar'];
const ESTADOS_PROPUESTA = ['nueva', 'en_votacion', 'aceptada', 'descartada'];
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Pestañas y columnas. Si falta una pestaña o una columna, el script la crea solo. */
const ESQUEMA = {
  Equipo: ['email', 'nombre', 'rol'],
  // Personas inscritas en el club. Datos privados: solo salen del script con sesión del equipo.
  // participaciones_auto la calcula el script (sesiones con propuesta); ajuste lo corrige a mano
  // una administradora y participaciones = participaciones_auto + ajuste.
  Inscritas: [
    'nombre',
    'apellidos',
    'telefono',
    'email',
    'alta',
    'activa',
    'participaciones_auto',
    'ajuste',
    'participaciones',
    'notas',
    'id',
    'actualizado_en',
    // Las calcula el script con la pestaña Valoraciones (no se editan a mano).
    'valoraciones',
    'media_valoraciones',
    // Club al que pertenece: 1 o 2.
    'club',
  ],
  // Valoración (0 a 10) que cada inscrita da a una lectura al final de la sesión.
  Valoraciones: [
    'creado_en',
    'lectura_id',
    'titulo',
    'autor',
    'inscrita_id',
    'nombre',
    'apellidos',
    'nota',
    'id',
    'actualizado_en',
    'actualizado_por',
    // Club de la persona al apuntar la nota (1 o 2).
    'club',
  ],
  Lecturas: [
    'titulo',
    'autor',
    'estado',
    'orden',
    'fecha_sesion',
    'isbn',
    'google_books_id',
    'portada_manual',
    'descripcion_manual',
    'nota_club',
    'visible',
    'revisar',
    'id',
    'actualizado_en',
    'actualizado_por',
    // Valoraciones del club (privadas: no se publican). Las calcula el script.
    'valoraciones_club',
    'media_club',
    // Fecha de la quedada del Club 2 (fecha_sesion es la del Club 1).
    'fecha_sesion_2',
    // Media de cada club (privadas: no se publican).
    'media_club_1',
    'media_club_2',
  ],
  // Mismas preguntas que el antiguo Google Form «Propuestas de lectura».
  // Lecturas pendientes que el club tiene en mente: salen en el formulario de propuestas.
  Tintero: ['titulo', 'autor', 'recomendada', 'visible', 'nota', 'id'],
  // Candidatas de la votación final de cada sesión (sesion = «2027-01»).
  Votacion: ['sesion', 'titulo', 'autor', 'abierta', 'id', 'archivada'],
  // Una fila por candidata puntuada (1 a 5) en cada voto.
  Votos: ['creado_en', 'sesion', 'nombre', 'apellidos', 'candidata_id', 'puntos', 'voto_id', 'id'],
  Propuestas: [
    'creado_en',
    'nombre',
    'apellidos',
    'grupo',
    'mes',
    'anio',
    'lectura_1',
    'lectura_2',
    'lectura_3',
    'tintero',
    'motivo',
    'estado',
    'nota_equipo',
    'id',
    'archivada',
  ],
};

/** Columnas de Lecturas que pueden salir en la web pública (nunca quién la editó). */
const COLUMNAS_PUBLICAS_LECTURAS = [
  'titulo',
  'autor',
  'estado',
  'orden',
  'fecha_sesion',
  'fecha_sesion_2',
  'isbn',
  'google_books_id',
  'portada_manual',
  'descripcion_manual',
  'nota_club',
  'visible',
  'revisar',
  'id',
];

const LIMITES = {
  corto: 200,
  largo: 2000,
};

// ─────────────────────────────── Entradas ───────────────────────────────

function doGet(e) {
  const p = (e && e.parameter) || {};
  const datos = p.datos ? leerJson(p.datos) : {};
  const resultado = ejecutar(String(p.accion || 'estado'), {
    sesion: p.sesion,
    idToken: p.idToken,
    q: p.q,
    codigo: p.codigo,
    reqId: p.reqId,
    datos: datos,
  });
  return p.callback ? jsonp(resultado, p.callback) : respuesta(resultado);
}

/** El cliente envía text/plain con JSON (sin preflight de CORS). */
function doPost(e) {
  const peticion = leerJson((e && e.postData && e.postData.contents) || '{}');
  if (!peticion) return respuesta({ ok: false, error: 'json_no_valido' });

  const resultado = ejecutar(String(peticion.accion || ''), {
    sesion: peticion.sesion,
    idToken: peticion.idToken,
    datos: peticion.datos || {},
  });
  if (reqIdValido(peticion.reqId)) {
    CacheService.getScriptCache().put('res:' + peticion.reqId, JSON.stringify(resultado), 600);
  }
  return respuesta(resultado);
}

/** Tabla de acciones: quién puede llamar a cada una. */
const ACCIONES = {
  estado: { acceso: 'publico', fn: accionEstado },
  resultado: { acceso: 'publico', fn: accionResultado },
  publico: { acceso: 'publico', fn: accionPublico },
  'libros.buscar': { acceso: 'publico', fn: accionBuscarLibros },
  'libros.ficha': { acceso: 'publico', fn: accionFichaLibro },
  'propuesta.enviar': { acceso: 'publico', fn: accionEnviarPropuesta },
  'codigo.comprobar': { acceso: 'publico', fn: accionComprobarCodigo },
  'propuestas.opciones': { acceso: 'publico', fn: accionOpcionesPropuesta },
  'votacion.publica': { acceso: 'publico', fn: accionVotacionPublica },
  'votacion.votar': { acceso: 'publico', fn: accionVotar },
  'votacion.listar': { acceso: 'equipo', fn: accionListarVotacion },
  'votacion.candidata': { acceso: 'admin', fn: accionCandidata },
  'votacion.abrir': { acceso: 'admin', fn: accionAbrirVotacion },
  'sesion.archivar': { acceso: 'admin', fn: accionArchivarSesion },
  'tintero.listar': { acceso: 'equipo', fn: accionListarTintero },
  'tintero.guardar': { acceso: 'equipo', fn: accionGuardarTintero },
  'tintero.recomendar': { acceso: 'admin', fn: accionRecomendarTintero },
  entrar: { acceso: 'publico', fn: accionEntrar },
  whoami: { acceso: 'publico', fn: accionEntrar }, // compatibilidad con la versión 1
  yo: { acceso: 'equipo', fn: accionYo },
  salir: { acceso: 'equipo', fn: accionSalir },
  'lecturas.listar': { acceso: 'equipo', fn: accionListarLecturas },
  'lecturas.guardar': { acceso: 'equipo', fn: accionGuardarLectura },
  'propuestas.listar': { acceso: 'equipo', fn: accionListarPropuestas },
  'propuestas.guardar': { acceso: 'equipo', fn: accionGuardarPropuesta },
  'publicar.estado': { acceso: 'equipo', fn: accionEstadoPublicacion },
  publicar: { acceso: 'equipo', fn: accionPublicar },
  'equipo.listar': { acceso: 'admin', fn: accionListarEquipo },
  'equipo.guardar': { acceso: 'admin', fn: accionGuardarEquipo },
  'equipo.quitar': { acceso: 'admin', fn: accionQuitarEquipo },
  diagnostico: { acceso: 'admin', fn: accionDiagnostico },
  'inscritas.listar': { acceso: 'equipo', fn: accionListarInscritas },
  'inscritas.guardar': { acceso: 'equipo', fn: accionGuardarInscrita },
  'propuestas.eliminar': { acceso: 'equipo', fn: accionEliminarPropuesta },
  'votos.eliminar': { acceso: 'equipo', fn: accionEliminarVotos },
  'valoraciones.listar': { acceso: 'equipo', fn: accionListarValoraciones },
  'valoraciones.guardar': { acceso: 'equipo', fn: accionGuardarValoraciones },
};

function ejecutar(accion, p) {
  const definicion = ACCIONES[accion];
  if (!definicion) return { ok: false, error: 'accion_desconocida' };
  try {
    let persona = null;
    if (definicion.acceso !== 'publico') {
      persona = personaDeSesion(p.sesion);
      if (!persona) return { ok: false, error: 'sesion_no_valida' };
      if (definicion.acceso === 'admin' && persona.rol !== 'admin') {
        return { ok: false, error: 'no_autorizado' };
      }
    }
    return definicion.fn(p, persona);
  } catch (err) {
    if (err && err.esValidacion)
      return { ok: false, error: 'datos_no_validos', detalle: err.message };
    console.error(accion, err && err.stack ? err.stack : err);
    return { ok: false, error: 'error_interno' };
  }
}

// ─────────────────────────────── Sesión ───────────────────────────────

/** Entrada: { idToken } de Google. Devuelve una sesión de 6 h si el email está en Equipo. */
function accionEntrar(p) {
  const email = emailDesdeToken(p.idToken);
  if (!email) return { ok: false, error: 'sesion_no_valida' };
  const miembro = buscarEnEquipo(email);
  if (!miembro) return { ok: false, error: 'no_autorizado' };

  const sesion = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put('sesion:' + sesion, email, DURACION_SESION_S);
  return {
    ok: true,
    sesion: sesion,
    caduca: Date.now() + DURACION_SESION_S * 1000,
    email: email,
    nombre: miembro.nombre,
    rol: miembro.rol,
  };
}

function accionYo(p, persona) {
  return { ok: true, email: persona.email, nombre: persona.nombre, rol: persona.rol };
}

function accionSalir(p) {
  CacheService.getScriptCache().remove('sesion:' + p.sesion);
  return { ok: true };
}

/** Sesión → persona del Equipo, comprobando el rol en la hoja en cada llamada. */
function personaDeSesion(sesion) {
  if (!sesion || !/^[A-Za-z0-9-]{40,80}$/.test(String(sesion))) return null;
  const email = CacheService.getScriptCache().get('sesion:' + sesion);
  if (!email) return null;
  const miembro = buscarEnEquipo(email);
  return miembro ? { email: email, nombre: miembro.nombre, rol: miembro.rol } : null;
}

/** Comprueba el ID token con Google y devuelve el email verificado, o null. */
function emailDesdeToken(idToken) {
  if (!idToken) return null;
  const clienteEsperado = propiedad('GOOGLE_CLIENT_ID');
  if (!clienteEsperado) return null;

  const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;

  const datos = JSON.parse(res.getContentText());
  const valido =
    datos.aud === clienteEsperado &&
    (datos.iss === 'https://accounts.google.com' || datos.iss === 'accounts.google.com') &&
    String(datos.email_verified) === 'true' &&
    Number(datos.exp) > Math.floor(Date.now() / 1000);
  return valido ? String(datos.email).toLowerCase() : null;
}

function buscarEnEquipo(email) {
  const fila = leerTabla('Equipo').filas.find(function (f) {
    return f.email.trim().toLowerCase() === String(email).toLowerCase();
  });
  if (!fila) return null;
  const rol = fila.rol.trim().toLowerCase();
  return ROLES.indexOf(rol) >= 0 ? { nombre: fila.nombre, rol: rol } : null;
}

// ─────────────────────────────── Públicas ───────────────────────────────

function accionEstado() {
  return { ok: true, servicio: 'club-ultimo-miercoles', version: VERSION };
}

/** Recoge el resultado de una escritura enviada por POST (ver cabecera). */
function accionResultado(p) {
  if (!reqIdValido(p.reqId)) return { ok: false, error: 'datos_no_validos' };
  const cache = CacheService.getScriptCache();
  const guardado = cache.get('res:' + p.reqId);
  if (!guardado) return { ok: false, error: 'pendiente' };
  cache.remove('res:' + p.reqId);
  return JSON.parse(guardado);
}

/** Contenido público para el build de la web: lecturas visibles, sin datos de quién edita. */
function accionPublico() {
  const lecturas = leerTabla('Lecturas')
    .filas.filter(function (f) {
      return f.visible.trim().toLowerCase() !== 'no';
    })
    .map(function (f) {
      const limpia = {};
      COLUMNAS_PUBLICAS_LECTURAS.forEach(function (c) {
        limpia[c] = f[c];
      });
      return limpia;
    });
  return { ok: true, generado_en: new Date().toISOString(), lecturas: lecturas };
}

/**
 * Llama a Google Books con la clave del script y el país (sin país, Google responde 403
 * «Cannot determine user location» desde los servidores de Apps Script). Si falla con la clave,
 * prueba sin ella; si tampoco, devuelve el error de la clave, que es el que hay que arreglar.
 */
function pedirGoogleBooks(ruta, parametros) {
  const base = 'https://www.googleapis.com/books/v1/' + ruta + '?country=ES' + parametros;
  const clave = propiedad('GOOGLE_BOOKS_API_KEY');
  let res = UrlFetchApp.fetch(clave ? base + '&key=' + encodeURIComponent(clave) : base, {
    muteHttpExceptions: true,
  });
  if (clave && res.getResponseCode() !== 200) {
    const conClave = res;
    res = UrlFetchApp.fetch(base, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) res = conClave;
  }
  if (res.getResponseCode() !== 200) {
    console.warn('Google Books', res.getResponseCode(), res.getContentText().slice(0, 300));
    return {
      error: explicarErrorGoogle(res.getResponseCode(), res.getContentText(), !!clave),
      codigo: res.getResponseCode(),
    };
  }
  return { datos: JSON.parse(res.getContentText()) };
}

const CAMPOS_VOLUMEN =
  'id,volumeInfo(title,subtitle,authors,publishedDate,industryIdentifiers,imageLinks/thumbnail)';

/** Volumen de Google Books → lo que necesita el panel. */
function libroDeVolumen(v) {
  const info = v.volumeInfo || {};
  const ids = info.industryIdentifiers || [];
  const isbn13 = ids.find(function (i) {
    return i.type === 'ISBN_13';
  });
  const isbn10 = ids.find(function (i) {
    return i.type === 'ISBN_10';
  });
  const portada = info.imageLinks && info.imageLinks.thumbnail;
  return {
    id: v.id,
    titulo: String(info.title || ''),
    subtitulo: String(info.subtitle || ''),
    autores: (info.authors || []).map(String),
    anio: String(info.publishedDate || '').slice(0, 4),
    isbn: (isbn13 || isbn10 || {}).identifier || '',
    portada: portada ? String(portada).replace('http://', 'https://') : '',
  };
}

/** Buscador de libros (Google Books) para el panel y el formulario de propuestas. */
function accionBuscarLibros(p) {
  const q = texto(p.q, 120);
  if (q.length < 2) return { ok: true, libros: [] };
  if (!dentroDelLimite('buscar', 120, 600)) return { ok: false, error: 'demasiadas_peticiones' };

  const cache = CacheService.getScriptCache();
  const claveCache = 'libros:' + Utilities.base64EncodeWebSafe(q.toLowerCase()).slice(0, 200);
  const enCache = cache.get(claveCache);
  if (enCache) return { ok: true, libros: JSON.parse(enCache) };

  const r = pedirGoogleBooks(
    'volumes',
    '&maxResults=8&printType=books&q=' +
      encodeURIComponent(q) +
      '&fields=' +
      encodeURIComponent('items(' + CAMPOS_VOLUMEN + ')'),
  );
  if (r.error) return { ok: false, error: 'google_no_responde', detalle: r.error };
  const libros = (r.datos.items || []).map(libroDeVolumen);
  cache.put(claveCache, JSON.stringify(libros), 6 * 60 * 60);
  return { ok: true, libros: libros };
}

/** Ficha de un libro por su id de Google Books (al pegar una URL de Google Libros). */
function accionFichaLibro(p) {
  const id = idGoogleBooks(p.id);
  if (!id) throw validacion('Esa dirección no es de un libro de Google Libros.');
  if (!dentroDelLimite('buscar', 120, 600)) return { ok: false, error: 'demasiadas_peticiones' };
  const r = pedirGoogleBooks(
    'volumes/' + encodeURIComponent(id),
    '&fields=' + encodeURIComponent(CAMPOS_VOLUMEN),
  );
  if (r.codigo === 404 || r.codigo === 503) return { ok: true, libros: [] };
  if (r.error) return { ok: false, error: 'google_no_responde', detalle: r.error };
  return { ok: true, libros: [libroDeVolumen(r.datos)] };
}

/** Explica en llano por qué Google Books no ha respondido (se muestra en el panel). */
function explicarErrorGoogle(codigo, cuerpo, conClave) {
  const mensaje = (/"message":\s*"([^"]+)"/.exec(cuerpo) || [])[1] || '';
  const todo = cuerpo + ' ' + mensaje;
  if (!conClave) {
    return (
      'Google Libros no deja buscar sin clave (' +
      codigo +
      '). Añade la propiedad GOOGLE_BOOKS_API_KEY al script. Mientras, escribe título y autor a mano.'
    );
  }
  if (/API_KEY_INVALID|API key not valid/i.test(todo)) {
    return (
      'La clave GOOGLE_BOOKS_API_KEY del script no es válida. Cópiala otra vez desde Google Cloud › ' +
      'APIs y servicios › Credenciales (empieza por «AIza», sin espacios ni comillas) y pégala en ' +
      'Apps Script › Configuración del proyecto › Propiedades del script.'
    );
  }
  if (/SERVICE_DISABLED|has not been used|is disabled/i.test(todo)) {
    return (
      'La Books API no está activada en el proyecto de Google Cloud de la clave. Actívala en ' +
      'APIs y servicios › Biblioteca › «Books API» › Habilitar y espera unos minutos.'
    );
  }
  if (
    /API_KEY_SERVICE_BLOCKED|API_KEY_HTTP_REFERRER_BLOCKED|API_KEY_IP_ADDRESS_BLOCKED|referer|blocked/i.test(
      todo,
    )
  ) {
    return (
      'Google rechaza la clave por sus restricciones. En Google Cloud › Credenciales, en la clave: ' +
      '«Restricciones de aplicaciones» = Ninguna y «Restricciones de API» = solo Books API.'
    );
  }
  if (codigo === 429 || /RATE_LIMIT|quota/i.test(todo))
    return 'Google Libros ha agotado la cuota de hoy. Prueba mañana o escribe a mano.';
  return (
    'Google Libros responde con un error (' +
    codigo +
    (mensaje ? ': ' + mensaje : '') +
    '). Mientras, escribe el título y el autor a mano.'
  );
}

/**
 * Diagnóstico para administradoras: qué propiedades faltan (solo los nombres, nunca los valores)
 * y si el buscador de Google Libros funciona ahora mismo.
 */
function accionDiagnostico() {
  const faltan = [
    'GOOGLE_CLIENT_ID',
    'CODIGO_CLUB',
    'GOOGLE_BOOKS_API_KEY',
    'GH_DISPATCH_TOKEN',
  ].filter(function (n) {
    return !propiedad(n);
  });
  const prueba = pedirGoogleBooks('volumes', '&maxResults=1&q=quijote');
  return { ok: true, version: VERSION, faltan: faltan, libros: prueba.error || 'ok' };
}

/**
 * Opciones del formulario de propuestas, de la pestaña Tintero: las recomendadas por el club y
 * el resto. Solo título y autor: nada privado.
 */
function accionOpcionesPropuesta() {
  const libro = function (f) {
    return { id: f.id, titulo: f.titulo, autor: f.autor };
  };
  const filas = leerTabla('Tintero', true).filas.filter(function (f) {
    return f.titulo && f.visible.toLowerCase() !== 'no';
  });
  const recomendada = function (f) {
    return f.recomendada.toLowerCase() === 'si';
  };
  return {
    ok: true,
    recomendadas: filas.filter(recomendada).map(libro),
    tintero: filas
      .filter(function (f) {
        return !recomendada(f);
      })
      .map(libro),
  };
}

// ─────────────────────────────── Votación final ───────────────────────────────

/** «2027-01» a partir del mes y el año de una propuesta (o '' si no son válidos). */
function clavePropuesta(f) {
  const mes = MESES.indexOf(String(f.mes).trim().toLowerCase());
  const anio = String(f.anio).trim();
  return mes >= 0 && /^\d{4}$/.test(anio) ? anio + '-' + ('0' + (mes + 1)).slice(-2) : '';
}

/**
 * Admin: archiva (o recupera) una sesión entera: sus propuestas y sus candidatas. Al archivar,
 * la votación se cierra. No se borra nada: el archivo se ve en el panel, agrupado por años.
 */
function accionArchivarSesion(p) {
  const d = p.datos || {};
  const sesion = texto(d.sesion, 7);
  if (!/^\d{4}-\d{2}$/.test(sesion)) throw validacion('Sesión no válida.');
  const valor = d.archivar ? 'si' : '';
  return conBloqueo(function () {
    const propuestas = leerTabla('Propuestas');
    propuestas.filas.forEach(function (f) {
      if (clavePropuesta(f) === sesion && f.archivada !== valor) {
        escribirFila(propuestas, f._fila, { archivada: valor });
      }
    });
    const votacion = leerTabla('Votacion');
    votacion.filas.forEach(function (f) {
      if (f.sesion !== sesion) return;
      const cambios = { archivada: valor };
      if (valor) cambios.abierta = 'no';
      escribirFila(votacion, f._fila, cambios);
    });
    return { ok: true };
  });
}

/** Sesión con la votación abierta (la más reciente si hubiera varias), o ''. */
function sesionAbierta(filas) {
  return (
    filas
      .filter(function (f) {
        return f.abierta.toLowerCase() === 'si' && f.archivada.toLowerCase() !== 'si';
      })
      .map(function (f) {
        return f.sesion;
      })
      .sort()
      .reverse()[0] || ''
  );
}

/** Pública: si hay votación abierta, sus candidatas (solo título y autor). */
function accionVotacionPublica() {
  const filas = leerTabla('Votacion', true).filas;
  const sesion = sesionAbierta(filas);
  if (!sesion) return { ok: true, abierta: false };
  return {
    ok: true,
    abierta: true,
    sesion: sesion,
    candidatas: filas
      .filter(function (f) {
        return f.sesion === sesion;
      })
      .map(function (f) {
        return { id: f.id, titulo: f.titulo, autor: f.autor };
      }),
  };
}

/** Pública (con el código del club): puntúa de 1 a 5 las candidatas de la votación abierta. */
function accionVotar(p) {
  const d = p.datos || {};
  if (!codigoValido(d.codigo)) return { ok: false, error: 'codigo_incorrecto' };
  if (!dentroDelLimite('votos', 60, 3600)) return { ok: false, error: 'demasiadas_peticiones' };
  const filas = leerTabla('Votacion', true).filas;
  const sesion = sesionAbierta(filas);
  if (!sesion) return { ok: false, error: 'votacion_cerrada' };

  const ids = filas
    .filter(function (f) {
      return f.sesion === sesion;
    })
    .map(function (f) {
      return f.id;
    });
  const puntos = d.puntos || {};
  const votadas = ids.filter(function (id) {
    const n = Number(puntos[id]);
    return n >= 1 && n <= 5 && Math.floor(n) === n;
  });
  if (!votadas.length) throw validacion('Puntúa al menos una lectura.');

  const base = {
    creado_en: new Date().toISOString(),
    sesion: sesion,
    nombre: obligatorio(d.nombre, 'tu nombre', 60),
    apellidos: obligatorio(d.apellidos, 'tus apellidos', 80),
    voto_id: nuevoId(),
  };
  conBloqueo(function () {
    votadas.forEach(function (id) {
      anadirFila(
        'Votos',
        Object.assign({}, base, { candidata_id: id, puntos: String(puntos[id]), id: nuevoId() }),
      );
    });
  });
  return { ok: true };
}

/** Equipo: candidatas y votos de todas las sesiones (el panel calcula los resultados). */
function accionListarVotacion() {
  return {
    ok: true,
    candidatas: leerTabla('Votacion', true).filas.map(sinFila),
    votos: leerTabla('Votos', true).filas.map(sinFila),
  };
}

/** Admin: añade una candidata a la votación de una sesión, o la quita (con `quitar` = id). */
function accionCandidata(p) {
  const d = p.datos || {};
  const sesion = texto(d.sesion, 7);
  if (!/^\d{4}-\d{2}$/.test(sesion)) throw validacion('Sesión no válida.');
  return conBloqueo(function () {
    const tabla = leerTabla('Votacion');
    if (d.quitar) {
      const fila = tabla.filas.find(function (f) {
        return f.id === texto(d.quitar, 40);
      });
      if (!fila) return { ok: false, error: 'no_encontrada' };
      tabla.hoja.deleteRow(fila._fila);
      return { ok: true };
    }
    const abierta = tabla.filas.some(function (f) {
      return f.sesion === sesion && f.abierta.toLowerCase() === 'si';
    });
    const candidata = {
      sesion: sesion,
      titulo: obligatorio(d.titulo, 'el título', LIMITES.corto),
      autor: texto(d.autor, LIMITES.corto),
      abierta: abierta ? 'si' : 'no',
      id: nuevoId(),
    };
    anadirFila('Votacion', candidata);
    return { ok: true, candidata: candidata };
  });
}

/** Admin: abre o cierra la votación de una sesión (al abrir una, se cierran las demás). */
function accionAbrirVotacion(p) {
  const d = p.datos || {};
  const sesion = texto(d.sesion, 7);
  const abrir = !!d.abierta;
  return conBloqueo(function () {
    const tabla = leerTabla('Votacion');
    const delaSesion = tabla.filas.filter(function (f) {
      return f.sesion === sesion;
    });
    if (abrir && !delaSesion.length) throw validacion('Añade antes alguna candidata.');
    tabla.filas.forEach(function (f) {
      const valor = f.sesion === sesion ? (abrir ? 'si' : 'no') : abrir ? 'no' : f.abierta;
      if (valor !== f.abierta) escribirFila(tabla, f._fila, { abierta: valor });
    });
    return { ok: true };
  });
}

function accionListarTintero() {
  return { ok: true, tintero: leerTabla('Tintero', true).filas.map(sinFila) };
}

/** Añade una lectura al tintero (o corrige título y autor si viene con id). */
function accionGuardarTintero(p) {
  const d = p.datos || {};
  const libro = {
    titulo: obligatorio(d.titulo, 'el título', LIMITES.corto),
    autor: obligatorio(d.autor, 'el autor', LIMITES.corto),
  };
  return conBloqueo(function () {
    const id = texto(d.id, 40);
    if (id) {
      const guardado = actualizarFila('Tintero', id, libro);
      return guardado
        ? { ok: true, libro: sinFila(guardado) }
        : { ok: false, error: 'no_encontrada' };
    }
    const nuevo = Object.assign(libro, { recomendada: '', visible: 'si', nota: '', id: nuevoId() });
    anadirFila('Tintero', nuevo);
    return { ok: true, libro: nuevo };
  });
}

/** Solo administradoras: marca o desmarca una lectura del tintero como recomendada. */
function accionRecomendarTintero(p) {
  const d = p.datos || {};
  return conBloqueo(function () {
    const guardada = actualizarFila('Tintero', texto(d.id, 40), {
      recomendada: d.recomendada ? 'si' : '',
    });
    return guardada ? { ok: true } : { ok: false, error: 'no_encontrada' };
  });
}

/** El formulario de propuestas pregunta aquí si el código del club es correcto. */
function accionComprobarCodigo(p) {
  if (!dentroDelLimite('codigo', 40, 600)) return { ok: false, error: 'demasiadas_peticiones' };
  return codigoValido(p.codigo) ? { ok: true } : { ok: false, error: 'codigo_incorrecto' };
}

/** Sin CODIGO_CLUB en las propiedades, el formulario queda abierto. */
function codigoValido(codigo) {
  const esperado = propiedad('CODIGO_CLUB');
  return !esperado || normalizarCodigo(codigo) === normalizarCodigo(esperado);
}

/** Formulario público de propuestas. Comprueba el código del club si está configurado. */
function accionEnviarPropuesta(p) {
  const d = p.datos || {};
  if (!codigoValido(d.codigo)) return { ok: false, error: 'codigo_incorrecto' };
  if (!dentroDelLimite('propuestas', 30, 3600))
    return { ok: false, error: 'demasiadas_peticiones' };

  const mes = texto(d.mes, 12).toLowerCase();
  if (MESES.indexOf(mes) < 0) throw validacion('Elige el mes.');
  const anio = texto(d.anio, 4);
  if (!/^20\d\d$/.test(anio)) throw validacion('Elige el año.');

  const propuesta = {
    creado_en: new Date().toISOString(),
    nombre: obligatorio(d.nombre, 'tu nombre', 60),
    apellidos: obligatorio(d.apellidos, 'tus apellidos', 80),
    grupo: obligatorio(d.grupo, 'tu grupo', 60),
    mes: mes,
    anio: anio,
    lectura_1: obligatorio(d.lectura_1, 'la lectura 1', LIMITES.corto),
    lectura_2: obligatorio(d.lectura_2, 'la lectura 2', LIMITES.corto),
    lectura_3: obligatorio(d.lectura_3, 'la lectura 3', LIMITES.corto),
    tintero: texto(d.tintero, LIMITES.largo),
    motivo: texto(d.motivo, LIMITES.largo),
    estado: 'nueva',
    nota_equipo: '',
    id: nuevoId(),
  };
  conBloqueo(function () {
    anadirFila('Propuestas', propuesta);
  });
  return { ok: true, id: propuesta.id };
}

// ─────────────────────────────── Equipo: lecturas ───────────────────────────────

function accionListarLecturas() {
  return { ok: true, lecturas: leerTabla('Lecturas', true).filas.map(sinFila) };
}

function accionGuardarLectura(p, persona) {
  const d = p.datos || {};
  const estado = texto(d.estado, 20) || 'por_clasificar';
  if (ESTADOS_LECTURA.indexOf(estado) < 0) throw validacion('Estado no válido.');
  const orden = texto(d.orden, 6);
  if (orden && !/^-?\d+$/.test(orden)) throw validacion('El orden debe ser un número entero.');
  const fecha = texto(d.fecha_sesion, 10);
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw validacion('Fecha no válida.');
  const fecha2 = texto(d.fecha_sesion_2, 10);
  if (fecha2 && !/^\d{4}-\d{2}-\d{2}$/.test(fecha2)) throw validacion('Fecha no válida.');
  const portada = texto(d.portada_manual, 500);
  if (portada && !/^https:\/\/\S+$/.test(portada)) {
    throw validacion('La portada debe ser un enlace que empiece por https://');
  }
  const visible = texto(d.visible, 2).toLowerCase() === 'no' ? 'no' : 'si';

  const lectura = {
    titulo: obligatorio(d.titulo, 'el título', LIMITES.corto),
    autor: obligatorio(d.autor, 'el autor', LIMITES.corto),
    estado: estado,
    orden: orden,
    fecha_sesion: fecha,
    fecha_sesion_2: fecha2,
    isbn: texto(d.isbn, 20).replace(/[^0-9Xx]/g, ''),
    google_books_id: idGoogleBooks(d.google_books_id),
    portada_manual: portada,
    descripcion_manual: texto(d.descripcion_manual, LIMITES.largo),
    nota_club: texto(d.nota_club, LIMITES.largo),
    visible: visible,
    revisar: texto(d.revisar, LIMITES.corto),
    actualizado_en: new Date().toISOString(),
    actualizado_por: persona.email,
  };

  return conBloqueo(function () {
    const id = texto(d.id, 40);
    if (id) {
      const guardada = actualizarFila('Lecturas', id, lectura);
      if (!guardada) return { ok: false, error: 'no_encontrada' };
      return { ok: true, lectura: sinFila(guardada) };
    }
    lectura.id = nuevoId();
    anadirFila('Lecturas', lectura);
    return { ok: true, lectura: lectura };
  });
}

// ─────────────────────────────── Equipo: propuestas ───────────────────────────────

function accionListarPropuestas() {
  const propuestas = leerTabla('Propuestas', true).filas.map(sinFila);
  propuestas.reverse(); // las más recientes primero
  return { ok: true, propuestas: propuestas };
}

function accionGuardarPropuesta(p) {
  const d = p.datos || {};
  const estado = texto(d.estado, 20);
  if (ESTADOS_PROPUESTA.indexOf(estado) < 0) throw validacion('Estado no válido.');
  return conBloqueo(function () {
    const guardada = actualizarFila('Propuestas', texto(d.id, 40), {
      estado: estado,
      nota_equipo: texto(d.nota_equipo, LIMITES.largo),
    });
    return guardada
      ? { ok: true, propuesta: sinFila(guardada) }
      : { ok: false, error: 'no_encontrada' };
  });
}

/** Equipo: borra una propuesta enviada por error (la fila entera; queda en el historial). */
function accionEliminarPropuesta(p) {
  const id = texto((p.datos || {}).id, 40);
  return conBloqueo(function () {
    const borradas = borrarFilas('Propuestas', function (f) {
      return f.id === id;
    });
    return borradas ? { ok: true } : { ok: false, error: 'no_encontrada' };
  });
}

/** Equipo: borra uno o varios votos (todas las filas de cada voto_id) de una sesión. */
function accionEliminarVotos(p) {
  const d = p.datos || {};
  const ids = (Array.isArray(d.votoIds) ? d.votoIds : [])
    .map(function (v) {
      return texto(v, 40);
    })
    .filter(Boolean)
    .slice(0, 50);
  if (!ids.length) throw validacion('Falta el voto.');
  return conBloqueo(function () {
    const borradas = borrarFilas('Votos', function (f) {
      return ids.indexOf(f.voto_id) >= 0;
    });
    return borradas ? { ok: true, borradas: borradas } : { ok: false, error: 'no_encontrada' };
  });
}

// ─────────────────────────────── Equipo: inscritas ───────────────────────────────

/** «María José  Pérez» y «maria jose perez» son la misma persona. */
function claveNombre(nombre, apellidos) {
  return (String(nombre || '') + ' ' + String(apellidos || ''))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Sesiones (año-mes) en las que cada persona envió al menos una propuesta. */
function sesionesPorPersona() {
  const mapa = {};
  leerTabla('Propuestas').filas.forEach(function (f) {
    const clave = claveNombre(f.nombre, f.apellidos);
    if (!clave) return;
    const sesion = f.anio + '-' + f.mes;
    const persona =
      mapa[clave] ||
      (mapa[clave] = { nombre: f.nombre, apellidos: f.apellidos, sesiones: {}, club: '' });
    persona.sesiones[sesion] = true;
    persona.club = clubDe(f.grupo) || persona.club;
  });
  return mapa;
}

/** «Club 2», «2», «club2» → «2». Vacío si no es el 1 ni el 2. */
function clubDe(v) {
  const m = /([12])/.exec(String(v || ''));
  return m ? m[1] : '';
}

function numeroAjuste(v) {
  const n = parseInt(String(v || '0').replace(',', '.'), 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Lista las inscritas con sus participaciones (y las escribe en la hoja para que se vean ahí) y
 * las personas que han propuesto pero aún no están inscritas.
 */
function accionListarInscritas() {
  const tabla = leerTabla('Inscritas', true);
  const sesiones = sesionesPorPersona();
  const valoraciones = resumenValoraciones();
  const vistas = {};
  tabla.filas.forEach(function (f) {
    vistas[claveNombre(f.nombre, f.apellidos)] = true;
  });
  conBloqueo(function () {
    sincronizarColumnas(tabla, calculoInscrita(sesiones, valoraciones));
  });
  const inscritas = tabla.filas.map(sinFila);
  const sinInscribir = Object.keys(sesiones)
    .filter(function (k) {
      return !vistas[k];
    })
    .map(function (k) {
      const s = sesiones[k];
      return {
        nombre: s.nombre,
        apellidos: s.apellidos,
        club: s.club,
        participaciones: String(Object.keys(s.sesiones).length),
      };
    });
  return { ok: true, inscritas: inscritas, sinInscribir: sinInscribir };
}

/** Columnas calculadas de cada inscrita: participaciones y valoraciones. */
function calculoInscrita(sesiones, valoraciones) {
  return function (f) {
    const clave = claveNombre(f.nombre, f.apellidos);
    const auto = sesiones[clave] ? Object.keys(sesiones[clave].sesiones).length : 0;
    const v = valoraciones.porInscrita[f.id];
    return {
      participaciones_auto: String(auto),
      participaciones: String(Math.max(0, auto + numeroAjuste(f.ajuste))),
      valoraciones: v ? String(v.n) : '',
      media_valoraciones: v ? formatoNota(v.suma / v.n) : '',
    };
  };
}

/**
 * Escribe en la hoja las columnas calculadas que hayan cambiado (y las deja en cada fila).
 * Llamar dentro de conBloqueo.
 */
function sincronizarColumnas(tabla, calculo) {
  tabla.filas.forEach(function (f) {
    const valores = calculo(f);
    Object.keys(valores).forEach(function (c) {
      const col = tabla.cabecera.indexOf(c) + 1;
      if (col > 0 && f[c] !== valores[c]) {
        tabla.hoja.getRange(f._fila, col).setNumberFormat('@').setValue(valores[c]);
      }
      f[c] = valores[c];
    });
  });
}

/** Da de alta o corrige a una inscrita. Para darla de baja: activa = no (no se borran filas). */
function accionGuardarInscrita(p) {
  const d = p.datos || {};
  const email = texto(d.email, 120).toLowerCase();
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw validacion('El email no es válido.');
  const telefono = texto(d.telefono, 30);
  if (telefono && !/^[0-9+()\-. ]{6,30}$/.test(telefono))
    throw validacion('El teléfono solo puede llevar números, espacios y +.');
  const ajuste = texto(d.ajuste, 4);
  if (ajuste && !/^-?\d{1,3}$/.test(ajuste)) throw validacion('El ajuste es un número entero.');
  const datos = {
    nombre: obligatorio(d.nombre, 'el nombre', 60),
    apellidos: texto(d.apellidos, 80),
    telefono: telefono,
    email: email,
    activa: d.activa === 'no' ? 'no' : 'si',
    club: clubDe(d.club),
    ajuste: ajuste,
    notas: texto(d.notas, LIMITES.largo),
    actualizado_en: new Date().toISOString(),
  };
  return conBloqueo(function () {
    const id = texto(d.id, 40);
    if (id) {
      const guardada = actualizarFila('Inscritas', id, datos);
      return guardada
        ? { ok: true, inscrita: sinFila(guardada) }
        : { ok: false, error: 'no_encontrada' };
    }
    const nueva = Object.assign(datos, {
      alta: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      participaciones_auto: '',
      participaciones: '',
      id: nuevoId(),
    });
    anadirFila('Inscritas', nueva);
    return { ok: true, inscrita: nueva };
  });
}

// ─────────────────────────────── Equipo: valoraciones ───────────────────────────────

/** «7,5», «7.5» o «8» → «7,5» / «8». Vacío si no hay nota; error si no es de 0 a 10. */
function leerNota(v) {
  const t = texto(v, 5).replace(',', '.');
  if (!t) return '';
  const n = Number(t);
  if (isNaN(n) || n < 0 || n > 10 || Math.round(n * 10) !== n * 10)
    throw validacion('Las notas van de 0 a 10 (con un decimal como mucho).');
  return formatoNota(n);
}

function formatoNota(n) {
  return String(Math.round(n * 10) / 10).replace('.', ',');
}

function numeroNota(t) {
  const n = Number(String(t || '').replace(',', '.'));
  return isNaN(n) || String(t || '').trim() === '' ? null : n;
}

/** Suma y número de notas por inscrita y por lectura. */
function resumenValoraciones() {
  const porInscrita = {};
  const porLectura = {};
  leerTabla('Valoraciones').filas.forEach(function (f) {
    const n = numeroNota(f.nota);
    if (n === null) return;
    const club = clubDe(f.club);
    [
      [porInscrita, f.inscrita_id],
      [porLectura, f.lectura_id],
      [porLectura, club ? f.lectura_id + '|' + club : ''],
    ].forEach(function (par) {
      if (!par[1]) return;
      const r = par[0][par[1]] || (par[0][par[1]] = { n: 0, suma: 0 });
      r.n += 1;
      r.suma += n;
    });
  });
  return { porInscrita: porInscrita, porLectura: porLectura };
}

/** Pone al día las medias en Inscritas y Lecturas. Llamar dentro de conBloqueo. */
function actualizarResumenes() {
  const valoraciones = resumenValoraciones();
  sincronizarColumnas(leerTabla('Inscritas'), calculoInscrita(sesionesPorPersona(), valoraciones));
  sincronizarColumnas(leerTabla('Lecturas'), function (f) {
    const v = valoraciones.porLectura[f.id];
    const v1 = valoraciones.porLectura[f.id + '|1'];
    const v2 = valoraciones.porLectura[f.id + '|2'];
    return {
      valoraciones_club: v ? String(v.n) : '',
      media_club: v ? formatoNota(v.suma / v.n) : '',
      media_club_1: v1 ? formatoNota(v1.suma / v1.n) : '',
      media_club_2: v2 ? formatoNota(v2.suma / v2.n) : '',
    };
  });
}

/** Equipo: valoraciones, con las lecturas y las inscritas para apuntarlas. */
function accionListarValoraciones() {
  const lecturas = leerTabla('Lecturas', true)
    .filas.filter(function (f) {
      return f.estado === 'leido' || f.estado === 'proximo';
    })
    .map(function (f) {
      return {
        id: f.id,
        titulo: f.titulo,
        autor: f.autor,
        estado: f.estado,
        fecha_sesion: f.fecha_sesion,
        fecha_sesion_2: f.fecha_sesion_2,
        orden: f.orden,
      };
    });
  const inscritas = leerTabla('Inscritas', true).filas.map(function (f) {
    return {
      id: f.id,
      nombre: f.nombre,
      apellidos: f.apellidos,
      activa: f.activa,
      club: clubDe(f.club),
    };
  });
  return {
    ok: true,
    valoraciones: leerTabla('Valoraciones', true).filas.map(sinFila),
    lecturas: lecturas,
    inscritas: inscritas,
  };
}

/**
 * Equipo: guarda las notas de una lectura (las que Inés apunta en la sesión). Una fila por
 * inscrita y lectura: si ya existe se corrige y, con la nota vacía, se borra.
 */
function accionGuardarValoraciones(p, persona) {
  const d = p.datos || {};
  const lecturaId = texto(d.lectura_id, 40);
  const notas = (Array.isArray(d.notas) ? d.notas : []).slice(0, 300).map(function (n) {
    return { inscrita_id: texto(n && n.inscrita_id, 40), nota: leerNota(n && n.nota) };
  });
  return conBloqueo(function () {
    const lectura = leerTabla('Lecturas').filas.find(function (f) {
      return f.id === lecturaId;
    });
    if (!lectura) return { ok: false, error: 'no_encontrada' };
    const inscritas = {};
    leerTabla('Inscritas').filas.forEach(function (f) {
      inscritas[f.id] = f;
    });
    const tabla = leerTabla('Valoraciones');
    const existentes = {};
    tabla.filas.forEach(function (f) {
      if (f.lectura_id === lecturaId) existentes[f.inscrita_id] = f;
    });
    const ahora = new Date().toISOString();
    const borrar = [];
    notas.forEach(function (n) {
      const inscrita = inscritas[n.inscrita_id];
      if (!inscrita) return;
      const previa = existentes[n.inscrita_id];
      if (!n.nota) {
        if (previa) borrar.push(previa._fila);
        return;
      }
      const datos = {
        titulo: lectura.titulo,
        autor: lectura.autor,
        nombre: inscrita.nombre,
        apellidos: inscrita.apellidos,
        club: clubDe(inscrita.club),
        nota: n.nota,
        actualizado_en: ahora,
        actualizado_por: persona.email,
      };
      if (previa) {
        if (previa.nota !== n.nota || previa.club !== datos.club)
          escribirFila(tabla, previa._fila, datos);
      } else {
        anadirFila(
          'Valoraciones',
          Object.assign(datos, {
            creado_en: ahora,
            lectura_id: lecturaId,
            inscrita_id: n.inscrita_id,
            id: nuevoId(),
          }),
        );
      }
    });
    borrar
      .sort(function (a, b) {
        return b - a;
      })
      .forEach(function (fila) {
        tabla.hoja.deleteRow(fila);
      });
    actualizarResumenes();
    return { ok: true };
  });
}

// ─────────────────────────────── Equipo: publicar ───────────────────────────────

function repoGithub() {
  return propiedad('GH_REPO') || 'vmarhuendaTN/clubdelultimomiercoles';
}

function accionPublicar() {
  const token = propiedad('GH_DISPATCH_TOKEN');
  if (!token) return { ok: false, error: 'sin_configurar' };
  if (!dentroDelLimite('publicar', 6, 600)) return { ok: false, error: 'demasiadas_peticiones' };

  const res = UrlFetchApp.fetch(
    'https://api.github.com/repos/' + repoGithub() + '/actions/workflows/pages.yml/dispatches',
    {
      method: 'post',
      contentType: 'application/json',
      headers: cabecerasGithub(token),
      payload: JSON.stringify({ ref: 'main' }),
      muteHttpExceptions: true,
    },
  );
  if (res.getResponseCode() !== 204) {
    console.warn('GitHub dispatch', res.getResponseCode(), res.getContentText().slice(0, 300));
    return { ok: false, error: 'github_rechaza' };
  }
  return { ok: true };
}

function accionEstadoPublicacion() {
  const token = propiedad('GH_DISPATCH_TOKEN');
  if (!token) return { ok: true, configurado: false };
  const res = UrlFetchApp.fetch(
    'https://api.github.com/repos/' + repoGithub() + '/actions/workflows/pages.yml/runs?per_page=1',
    { headers: cabecerasGithub(token), muteHttpExceptions: true },
  );
  if (res.getResponseCode() !== 200) return { ok: true, configurado: true, ultima: null };
  const run = (JSON.parse(res.getContentText()).workflow_runs || [])[0];
  return {
    ok: true,
    configurado: true,
    ultima: run
      ? {
          estado: run.status,
          resultado: run.conclusion,
          creada_en: run.created_at,
          url: run.html_url,
        }
      : null,
  };
}

function cabecerasGithub(token) {
  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// ─────────────────────────────── Admin: equipo ───────────────────────────────

function accionListarEquipo() {
  return { ok: true, equipo: leerTabla('Equipo').filas.map(sinFila) };
}

function accionGuardarEquipo(p) {
  const d = p.datos || {};
  const email = texto(d.email, 120).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw validacion('Email no válido.');
  const rol = texto(d.rol, 10);
  if (ROLES.indexOf(rol) < 0) throw validacion('Rol no válido.');
  const nombre = texto(d.nombre, 80);

  return conBloqueo(function () {
    const tabla = leerTabla('Equipo');
    const existente = tabla.filas.find(function (f) {
      return f.email.trim().toLowerCase() === email;
    });
    if (existente) {
      if (existente.rol === 'admin' && rol !== 'admin' && contarAdmins(tabla) <= 1) {
        return { ok: false, error: 'ultima_admin' };
      }
      escribirFila(tabla, existente._fila, { email: email, nombre: nombre, rol: rol });
    } else {
      anadirFila('Equipo', { email: email, nombre: nombre, rol: rol });
    }
    return { ok: true };
  });
}

/** Quita a alguien del Equipo (la fila se borra: no son datos de miembros). */
function accionQuitarEquipo(p, persona) {
  const email = texto((p.datos || {}).email, 120).toLowerCase();
  if (email === persona.email) return { ok: false, error: 'no_puedes_quitarte' };
  return conBloqueo(function () {
    const tabla = leerTabla('Equipo');
    const fila = tabla.filas.find(function (f) {
      return f.email.trim().toLowerCase() === email;
    });
    if (!fila) return { ok: false, error: 'no_encontrada' };
    if (fila.rol === 'admin' && contarAdmins(tabla) <= 1)
      return { ok: false, error: 'ultima_admin' };
    tabla.hoja.deleteRow(fila._fila);
    return { ok: true };
  });
}

function contarAdmins(tabla) {
  return tabla.filas.filter(function (f) {
    return f.rol.trim().toLowerCase() === 'admin';
  }).length;
}

// ─────────────────────────────── Hoja ───────────────────────────────

/** Devuelve la pestaña, creándola (o completando sus columnas) si hace falta. */
function hoja(nombre) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(nombre);
  if (!h) {
    h = libro.insertSheet(nombre);
    h.getRange(1, 1, h.getMaxRows(), ESQUEMA[nombre].length).setNumberFormat('@');
  }
  const ultima = h.getLastColumn();
  const cabecera = ultima ? h.getRange(1, 1, 1, ultima).getValues()[0].map(normalizarCabecera) : [];
  const faltan = ESQUEMA[nombre].filter(function (c) {
    return cabecera.indexOf(c) < 0;
  });
  if (faltan.length) {
    const necesarias = cabecera.length + faltan.length;
    if (h.getMaxColumns() < necesarias) {
      h.insertColumnsAfter(h.getMaxColumns(), necesarias - h.getMaxColumns());
    }
    h.getRange(1, cabecera.length + 1, 1, faltan.length).setValues([faltan]);
    h.getRange(1, 1, 1, cabecera.length + faltan.length).setFontWeight('bold');
    h.setFrozenRows(1);
  }
  return h;
}

/**
 * Lee una pestaña como objetos { columna: texto, _fila: número de fila }.
 * Con `asegurarIds`, da un id a las filas que no lo tienen (añadidas a mano en la hoja).
 */
function leerTabla(nombre, asegurarIds) {
  const h = hoja(nombre);
  const valores = h.getDataRange().getValues();
  const cabecera = valores[0].map(normalizarCabecera);
  const zona = Session.getScriptTimeZone();
  const filas = [];
  for (let i = 1; i < valores.length; i++) {
    const obj = { _fila: i + 1 };
    let vacia = true;
    cabecera.forEach(function (c, j) {
      if (!c) return;
      const v = valores[i][j];
      obj[c] = v instanceof Date ? Utilities.formatDate(v, zona, 'yyyy-MM-dd') : String(v).trim();
      if (obj[c]) vacia = false;
    });
    if (vacia) continue;
    ESQUEMA[nombre].forEach(function (c) {
      if (obj[c] === undefined) obj[c] = '';
    });
    filas.push(obj);
  }
  const tabla = { hoja: h, cabecera: cabecera, filas: filas };
  if (asegurarIds && cabecera.indexOf('id') >= 0) {
    const sinId = filas.filter(function (f) {
      return !f.id;
    });
    if (sinId.length) {
      conBloqueo(function () {
        sinId.forEach(function (f) {
          f.id = nuevoId();
          h.getRange(f._fila, cabecera.indexOf('id') + 1).setValue(f.id);
        });
      });
    }
  }
  return tabla;
}

/** Borra las filas que cumplan `cumple`, de abajo arriba para no descolocar los números. */
function borrarFilas(nombre, cumple) {
  const tabla = leerTabla(nombre);
  const filas = tabla.filas
    .filter(cumple)
    .map(function (f) {
      return f._fila;
    })
    .sort(function (a, b) {
      return b - a;
    });
  filas.forEach(function (n) {
    tabla.hoja.deleteRow(n);
  });
  return filas.length;
}

function anadirFila(nombre, obj) {
  const h = hoja(nombre);
  const cabecera = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0].map(normalizarCabecera);
  const fila = h.getLastRow() + 1;
  const rango = h.getRange(fila, 1, 1, cabecera.length);
  rango.setNumberFormat('@');
  rango.setValues([
    cabecera.map(function (c) {
      return celda(obj[c]);
    }),
  ]);
}

/** Actualiza la fila con ese id solo en las columnas que vienen en `cambios`. */
function actualizarFila(nombre, id, cambios) {
  if (!id) return null;
  const tabla = leerTabla(nombre);
  const fila = tabla.filas.find(function (f) {
    return f.id === id;
  });
  if (!fila) return null;
  escribirFila(tabla, fila._fila, cambios);
  return Object.assign({}, fila, cambios);
}

function escribirFila(tabla, numero, cambios) {
  const rango = tabla.hoja.getRange(numero, 1, 1, tabla.cabecera.length);
  const actuales = rango.getValues()[0];
  rango.setNumberFormat('@');
  rango.setValues([
    tabla.cabecera.map(function (c, j) {
      return c && cambios[c] !== undefined ? celda(cambios[c]) : actuales[j];
    }),
  ]);
}

/** Texto que se escribe tal cual: lo que empieza por = o + no se convierte en fórmula. */
function celda(v) {
  const t = v === undefined || v === null ? '' : String(v);
  return /^[=+]/.test(t) ? "'" + t : t;
}

/** Crea las pestañas y columnas que falten. Se puede ejecutar a mano; el script lo hace solo. */
function instalar() {
  Object.keys(ESQUEMA).forEach(hoja);
}

// ─────────────────────────────── Utilidades ───────────────────────────────

function conBloqueo(fn) {
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(15000);
  try {
    const r = fn();
    SpreadsheetApp.flush();
    return r;
  } finally {
    bloqueo.releaseLock();
  }
}

/** Límite sencillo de peticiones por ventana de tiempo (para las acciones públicas). */
function dentroDelLimite(clave, maximo, ventanaS) {
  const cache = CacheService.getScriptCache();
  const k = 'limite:' + clave + ':' + Math.floor(Date.now() / 1000 / ventanaS);
  const n = Number(cache.get(k) || 0) + 1;
  cache.put(k, String(n), ventanaS);
  return n <= maximo;
}

function propiedad(nombre) {
  // Quita espacios, saltos de línea y comillas que se cuelan al pegar el valor.
  return String(PropertiesService.getScriptProperties().getProperty(nombre) || '')
    .trim()
    .replace(/^["'«]+|["'»]+$/g, '')
    .trim();
}

function texto(v, max) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max);
}

function obligatorio(v, nombre, max) {
  const t = texto(v, max);
  if (!t) throw validacion('Falta ' + nombre + '.');
  return t;
}

function idGoogleBooks(v) {
  const t = texto(v, 20);
  return /^[A-Za-z0-9_-]{6,20}$/.test(t) ? t : '';
}

function validacion(mensaje) {
  const e = new Error(mensaje);
  e.esValidacion = true;
  return e;
}

function normalizarCabecera(c) {
  return String(c).trim().toLowerCase();
}

function normalizarCodigo(c) {
  return String(c || '')
    .trim()
    .toLowerCase();
}

function nuevoId() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 10);
}

function sinFila(obj) {
  const copia = Object.assign({}, obj);
  delete copia._fila;
  return copia;
}

function reqIdValido(id) {
  return /^[a-f0-9-]{20,64}$/.test(String(id || ''));
}

function leerJson(textoJson) {
  try {
    return JSON.parse(textoJson);
  } catch (err) {
    return null;
  }
}

function respuesta(obj) {
  // ContentService no permite fijar el código HTTP; el cliente lee el campo ok.
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** JavaScript que llama a la función indicada. El nombre solo admite caracteres seguros. */
function jsonp(obj, callback) {
  const nombre = String(callback || '');
  if (!/^[A-Za-z_][A-Za-z0-9_.]{0,80}$/.test(nombre)) {
    return respuesta({ ok: false, error: 'callback_no_valido' });
  }
  return ContentService.createTextOutput(nombre + '(' + JSON.stringify(obj) + ');').setMimeType(
    ContentService.MimeType.JAVASCRIPT,
  );
}
